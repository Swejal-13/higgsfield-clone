import { Response } from "express";
import User from "../models/User";
import Generation from "../models/Generation";
import { ALL_MODELS } from "../config/models.config";
import { EFFECTS } from "../config/effects.config";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthedRequest } from "../middleware/auth";

export const adminStats = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  const [userCount, generationCount, failedCount] = await Promise.all([
    User.countDocuments(),
    Generation.countDocuments(),
    Generation.countDocuments({ status: "FAILED" }),
  ]);
  res.json({ success: true, data: { userCount, generationCount, failedCount, modelCount: ALL_MODELS.length, effectCount: EFFECTS.length } });
});

export const adminListUsers = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, data: { users } });
});

export const adminListGenerations = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  const generations = await Generation.find().sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, data: { generations } });
});

export const adminListModels = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  res.json({ success: true, data: { models: ALL_MODELS } });
});

export const adminListEffects = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  res.json({ success: true, data: { effects: EFFECTS } });
});
