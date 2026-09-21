import { Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";
import { startGeneration } from "../services/generation.service";
import { getModelById } from "../config/models.config";

const baseSchema = z.object({
  prompt: z.string().max(2000).optional().default(""),
  negativePrompt: z.string().max(2000).optional(),
  model: z.string().min(1, "Model is required"),
  settings: z.record(z.any()).optional(),
  inputAssets: z.array(z.string()).optional(),
  projectId: z.string().optional(),
});

function makeHandler(action: string) {
  return asyncHandler(async (req: AuthedRequest, res: Response) => {
    const parsed = baseSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid input");

    const modelConfig = getModelById(parsed.data.model);
    if (!modelConfig || !modelConfig.enabled) throw new ApiError(400, "Selected model is not available");

    const generation = await startGeneration({
      userId: req.user!.userId,
      type: "video",
      action,
      prompt: parsed.data.prompt || "",
      negativePrompt: parsed.data.negativePrompt,
      modelId: parsed.data.model,
      settings: parsed.data.settings,
      inputAssets: parsed.data.inputAssets,
      projectId: parsed.data.projectId,
    });
    res.status(202).json({ success: true, data: { generation } });
  });
}

export const generateVideo = makeHandler("generate");
export const imageToVideo = makeHandler("image-to-video");
export const editVideo = makeHandler("edit");
export const motionControlVideo = makeHandler("motion-control");
export const extendVideo = makeHandler("extend");
