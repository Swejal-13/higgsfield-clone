// Real image-generation backend using Google's Gemini API ("Nano Banana",
// model id gemini-2.5-flash-image). Activated automatically once
// AI_IMAGE_API_KEY is set to a Gemini API key (see config/env.ts).
// Implements the same ImageGenerationProvider interface as MockImageProvider
// so the rest of the app never needs to change.
import fs from "fs";
import path from "path";
//import { randomUUID } from "crypto";
import { ImageGenerationProvider, BaseGenerationInput, GenerationResult, GenerationOutput } from "../ProviderTypes";
import { ApiError } from "../../utils/ApiError";
import { env } from "../../config/env";
import { buildFallbackOutputs } from "../local/LocalImageFallback";

const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Generated images are written here, next to user uploads, and served
// statically by app.ts under /uploads.
const PUBLIC_DIR = path.join(__dirname, "..", "..", "..", "public");
//const OUTPUT_DIR = path.join(PUBLIC_DIR, "uploads");
//if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

function mimeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return "image/png";
  }
}

// inputAssets are app-relative URLs like "/uploads/xxx.png" or "/demo/images/xxx.svg".
// Resolve them to a file under public/ and inline as base64 for Gemini.
function loadAssetAsInlinePart(assetUrl: string): GeminiPart | null {
  try {
    const relative = assetUrl.replace(/^\//, "");
    const filePath = path.join(PUBLIC_DIR, relative);
    if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) return null;
    const ext = path.extname(filePath);
    if (ext.toLowerCase() === ".svg") return null; // Gemini needs a raster image
    const data = fs.readFileSync(filePath).toString("base64");
    return { inlineData: { mimeType: mimeFromExt(ext), data } };
  } catch {
    return null;
  }
}

function buildParts(input: BaseGenerationInput, instructionPrefix?: string): GeminiPart[] {
  const parts: GeminiPart[] = [];
  const promptText = [instructionPrefix, input.prompt, input.negativePrompt ? `Avoid: ${input.negativePrompt}` : undefined]
    .filter(Boolean)
    .join("\n");
  if (promptText) parts.push({ text: promptText });

  for (const assetUrl of input.inputAssets || []) {
    const part = loadAssetAsInlinePart(assetUrl);
    if (part) parts.push(part);
  }
  return parts;
}

function countFromSettings(settings: Record<string, unknown>, fallback: number, max = 4): number {
  const n = Number(settings?.numImages);
  return Number.isFinite(n) && n > 0 ? Math.min(Math.floor(n), max) : fallback;
}

async function callGemini(parts: GeminiPart[]): Promise<GenerationOutput[]> {
  if (!env.aiImageApiKey) {
    throw new ApiError(501, "External image provider not configured. Set AI_IMAGE_API_KEY to a Gemini API key.");
  }

  let response: Response;
  try {
    response = await fetch(`${GEMINI_ENDPOINT}?key=${env.aiImageApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });
  } catch (err) {
    throw new ApiError(502, `Could not reach Gemini API: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new ApiError(502, `Gemini image generation failed (${response.status}): ${errText.slice(0, 300)}`);
  }

  const json: any = await response.json();
  const candidateParts: any[] = json?.candidates?.[0]?.content?.parts || [];
  const imageParts = candidateParts.filter((p) => p?.inlineData?.data);

  if (imageParts.length === 0) {
    const textPart = candidateParts.find((p) => p.text)?.text;
    const blockReason = json?.promptFeedback?.blockReason;
    throw new ApiError(
      502,
      `Gemini returned no image output.${blockReason ? ` Blocked: ${blockReason}.` : ""}${textPart ? ` ${textPart.slice(0, 200)}` : ""}`
    );
  }

  return imageParts.map((p) => {
  const mimeType = p.inlineData.mimeType || "image/png";
  const dataUrl = `data:${mimeType};base64,${p.inlineData.data}`;

  return {
    url: dataUrl,
    thumbnailUrl: dataUrl,
    type: "image" as const,
    metadata: {
      generatedAt: new Date().toISOString(),
      provider: "gemini",
      model: GEMINI_MODEL,
    },
  };
});
}
// Runs the real Gemini call(s) and, if ANY of them throw (missing/invalid key,
// network error, quota exceeded, safety block, etc.), falls back to the local
// keyword-based SVG generator instead of failing the generation outright.
// This is a demo-reliability net: it never calls out to the network.
async function generateWithFallback(
  parts: GeminiPart[],
  prompt: string,
  count: number
): Promise<{ outputs: GenerationOutput[]; usedFallback: boolean; fallbackReason?: string }> {
  try {
    const batches = await Promise.all(Array.from({ length: count }, () => callGemini(parts)));
    return { outputs: batches.flat(), usedFallback: false };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[ExternalImageProvider] Gemini unavailable, using local fallback illustration instead. Reason: ${reason}`);
    return { outputs: buildFallbackOutputs(prompt, count), usedFallback: true, fallbackReason: reason };
  }
}

export class ExternalImageProvider implements ImageGenerationProvider {
  async generateImage(input: BaseGenerationInput): Promise<GenerationResult> {
    const count = countFromSettings(input.settings, 1);
    const parts = buildParts(input);
    const { outputs, usedFallback, fallbackReason } = await generateWithFallback(parts, input.prompt, count);
    return {
      outputs,
      providerMeta: usedFallback
        ? { provider: "local-fallback", action: "generate", fallbackReason }
        : { provider: "gemini", model: GEMINI_MODEL, action: "generate" },
    };
  }

  async editImage(input: BaseGenerationInput): Promise<GenerationResult> {
    if (!input.inputAssets?.length) throw new ApiError(400, "editImage requires at least one input image");
    const parts = buildParts(
      input,
      "Edit the attached image according to these instructions. Keep everything else in the image unchanged unless the instructions say otherwise:"
    );
    const { outputs, usedFallback, fallbackReason } = await generateWithFallback(parts, input.prompt, 1);
    return {
      outputs,
      providerMeta: usedFallback
        ? { provider: "local-fallback", action: "edit", fallbackReason }
        : { provider: "gemini", model: GEMINI_MODEL, action: "edit" },
    };
  }

  async inpaintImage(input: BaseGenerationInput): Promise<GenerationResult> {
    if (!input.inputAssets?.length) throw new ApiError(400, "inpaintImage requires at least one input image");
    const maskNote =
      input.inputAssets.length > 1
        ? "The second attached image is a mask marking the region to change; only modify the masked region and leave the rest of the image pixel-identical."
        : "Only modify the region implied by the instructions below; leave the rest of the image unchanged.";
    const parts = buildParts(input, `Inpaint the attached image. ${maskNote}`);
    const { outputs, usedFallback, fallbackReason } = await generateWithFallback(parts, input.prompt, 1);
    return {
      outputs,
      providerMeta: usedFallback
        ? { provider: "local-fallback", action: "inpaint", fallbackReason }
        : { provider: "gemini", model: GEMINI_MODEL, action: "inpaint" },
    };
  }

  async upscaleImage(input: BaseGenerationInput): Promise<GenerationResult> {
    if (!input.inputAssets?.length) throw new ApiError(400, "upscaleImage requires an input image");
    const factor = Number(input.settings?.factor) || 2;
    const parts = buildParts(
      input,
      `Upscale the attached image to approximately ${factor}x its resolution, sharpening detail and reducing artifacts without changing the composition, framing, or content.`
    );
    const { outputs, usedFallback, fallbackReason } = await generateWithFallback(parts, input.prompt, 1);
    return {
      outputs,
      providerMeta: usedFallback
        ? { provider: "local-fallback", action: "upscale", factor, fallbackReason }
        : { provider: "gemini", model: GEMINI_MODEL, action: "upscale", factor },
    };
  }

  async variationImage(input: BaseGenerationInput): Promise<GenerationResult> {
    if (!input.inputAssets?.length) throw new ApiError(400, "variationImage requires an input image");
    const count = countFromSettings(input.settings, 4);
    const parts = buildParts(
      input,
      "Create a creative variation of the attached image: keep the same overall subject and style, but vary the composition, pose, or details."
    );
    const { outputs, usedFallback, fallbackReason } = await generateWithFallback(parts, input.prompt, count);
    return {
      outputs,
      providerMeta: usedFallback
        ? { provider: "local-fallback", action: "variation", fallbackReason }
        : { provider: "gemini", model: GEMINI_MODEL, action: "variation" },
    };
  }
}
