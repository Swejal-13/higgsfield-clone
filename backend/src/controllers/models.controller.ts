import { Request, Response } from "express";
import { ALL_MODELS, IMAGE_MODELS, VIDEO_MODELS, AUDIO_MODELS } from "../config/models.config";
import { asyncHandler } from "../utils/asyncHandler";

export const listModels = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.query as { type?: string };
  let models = ALL_MODELS;
  if (type === "image") models = IMAGE_MODELS;
  else if (type === "video") models = VIDEO_MODELS;
  else if (type === "audio") models = AUDIO_MODELS;
  res.json({ success: true, data: { models: models.filter((m) => m.enabled) } });
});
