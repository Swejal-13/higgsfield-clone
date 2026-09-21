import { Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";
import { startGeneration } from "../services/generation.service";
import { getModelById } from "../config/models.config";

const schema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(2000),
  model: z.string().min(1, "Model is required"),
  settings: z.record(z.any()).optional(),
  projectId: z.string().optional(),
});

export const generateAudio = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid input");

  const modelConfig = getModelById(parsed.data.model);
  if (!modelConfig || !modelConfig.enabled) throw new ApiError(400, "Selected model is not available");

  const generation = await startGeneration({
    userId: req.user!.userId,
    type: "audio",
    action: "generate",
    prompt: parsed.data.prompt,
    modelId: parsed.data.model,
    settings: parsed.data.settings,
    projectId: parsed.data.projectId,
  });
  res.status(202).json({ success: true, data: { generation } });
});
