import Generation, { IGeneration, GenerationType } from "../models/Generation";
import Asset from "../models/Asset";
import Notification from "../models/Notification";
import { imageProvider, videoProvider, audioProvider } from "../providers";
import { BaseGenerationInput, GenerationOutput } from "../providers/ProviderTypes";
import { env } from "../config/env";
import { getModelById } from "../config/models.config";
import { ensureSufficientCredits, deductCredits, refundCredits } from "./credit.service";
import { Types } from "mongoose";

interface StartGenerationParams {
  userId: string;
  projectId?: string;
  type: GenerationType;
  action: string;
  prompt: string;
  negativePrompt?: string;
  modelId: string;
  settings?: Record<string, unknown>;
  inputAssets?: string[];
}

const PHASES = ["Preparing prompt...", "Generating...", "Running model...", "Rendering...", "Finalizing..."];

function durationFor(type: GenerationType): number {
  if (type === "image") return env.mockImageDurationMs;
  if (type === "video") return env.mockVideoDurationMs;
  return env.mockAudioDurationMs;
}

export async function startGeneration(params: StartGenerationParams): Promise<IGeneration> {
  const modelConfig = getModelById(params.modelId);
  const creditsCost = modelConfig?.credits ?? 5;

  // Validate credits up front so the user gets immediate feedback.
  await ensureSufficientCredits(params.userId, creditsCost);

  const generation = await Generation.create({
    userId: params.userId,
    projectId: params.projectId,
    type: params.type,
    action: params.action,
    prompt: params.prompt,
    negativePrompt: params.negativePrompt || "",
    modelId: params.modelId,
    settings: params.settings || {},
    inputAssets: params.inputAssets || [],
    outputAssets: [],
    status: "QUEUED",
    progress: 0,
    statusMessage: "Queued...",
    creditsUsed: creditsCost,
  });

  // Run the pipeline within the serverless request so Vercel keeps the function alive until generation completes.
  await runPipeline(generation.id, creditsCost);

  const completedGeneration = await Generation.findById(generation.id);
  return completedGeneration || generation;
}

async function runPipeline(generationId: string, creditsCost: number) {
  const generation = await Generation.findById(generationId);
  if (!generation) return;

  const totalDuration = durationFor(generation.type);
  const perPhase = Math.max(300, Math.floor(totalDuration / PHASES.length));

  try {
    generation.status = "PROCESSING";
    for (let i = 0; i < PHASES.length; i++) {
      generation.statusMessage = PHASES[i];
      generation.progress = Math.round(((i + 1) / PHASES.length) * 90);
      await generation.save();
      await sleep(perPhase);
    }

    const input: BaseGenerationInput = {
      prompt: generation.prompt,
      negativePrompt: generation.negativePrompt,
      modelId: generation.modelId,
      settings: generation.settings || {},
      inputAssets: generation.inputAssets,
    };

    const outputs = await callProvider(generation.type, generation.action, input);

    const assetIds: string[] = [];
    for (const out of outputs) {
      const asset = await Asset.create({
        userId: generation.userId,
        projectId: generation.projectId,
        generationId: generation._id,
        type: out.type,
        url: out.url,
        thumbnailUrl: out.thumbnailUrl || out.url,
        filename: `${generation.type}-${generation.action}-${Date.now()}.${extFor(out.type)}`,
        size: 0,
        metadata: out.metadata || {},
      });
      assetIds.push(String(asset._id));
    }

    generation.outputAssets = assetIds;
    generation.status = "COMPLETED";
    generation.progress = 100;
    generation.statusMessage = "Completed";
    generation.completedAt = new Date();
    await generation.save();

    await deductCredits(String(generation.userId), creditsCost, `${generation.type} ${generation.action}`, String(generation._id));

    await Notification.create({
      userId: generation.userId,
      title: `Your ${generation.type} generation is ready`,
      message: `"${truncate(generation.prompt, 60)}" finished rendering.`,
      type: "success",
      link: "/history",
    });
  } catch (err) {
    generation.status = "FAILED";
    generation.progress = 100;
    generation.statusMessage = "Failed";
    generation.error = err instanceof Error ? err.message : "Generation failed";
    await generation.save();

    await Notification.create({
      userId: generation.userId,
      title: `${capitalize(generation.type)} generation failed`,
      message: generation.error,
      type: "error",
      link: "/history",
    });
  }
}

async function callProvider(type: GenerationType, action: string, input: BaseGenerationInput): Promise<GenerationOutput[]> {
  if (type === "image") {
    switch (action) {
      case "edit": return (await imageProvider.editImage(input)).outputs;
      case "inpaint": return (await imageProvider.inpaintImage(input)).outputs;
      case "upscale": return (await imageProvider.upscaleImage(input)).outputs;
      case "variation": return (await imageProvider.variationImage(input)).outputs;
      default: return (await imageProvider.generateImage(input)).outputs;
    }
  }
  if (type === "video") {
    switch (action) {
      case "image-to-video": return (await videoProvider.imageToVideo(input)).outputs;
      case "edit": return (await videoProvider.editVideo(input)).outputs;
      case "motion-control": return (await videoProvider.motionControl(input)).outputs;
      case "extend": return (await videoProvider.extendVideo(input)).outputs;
      default: return (await videoProvider.generateVideo(input)).outputs;
    }
  }
  return (await audioProvider.generateAudio(input)).outputs;
}

function extFor(type: string) {
  if (type === "image") return "png";
  if (type === "video") return "mp4";
  return "mp3";
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "..." : s;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function cancelGeneration(generationId: string, userId: string) {
  const generation = await Generation.findOne({ _id: generationId, userId });
  if (!generation) return null;
  if (generation.status === "COMPLETED" || generation.status === "FAILED") return generation;
  generation.status = "CANCELLED";
  generation.statusMessage = "Cancelled by user";
  await generation.save();
  return generation;
}


