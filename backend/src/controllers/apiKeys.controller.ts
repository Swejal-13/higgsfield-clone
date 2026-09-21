import { Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import ApiKey from "../models/ApiKey";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";

export const listApiKeys = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const keys = await ApiKey.find({ userId: req.user!.userId }).select("-keyHash").sort({ createdAt: -1 });
  res.json({ success: true, data: { keys } });
});

export const createApiKey = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const label = (req.body.label as string) || "Default key";
  const raw = `hf_demo_${crypto.randomBytes(18).toString("hex")}`;
  const keyHash = await bcrypt.hash(raw, 10);
  const keyPrefix = raw.slice(0, 12) + "...";

  const key = await ApiKey.create({ userId: req.user!.userId, label, keyPrefix, keyHash });
  // Full key only ever returned once, at creation time.
  res.status(201).json({ success: true, data: { key: { id: key._id, label, keyPrefix, rawKey: raw } } });
});

export const revokeApiKey = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const key = await ApiKey.findOneAndUpdate({ _id: req.params.id, userId: req.user!.userId }, { revoked: true }, { new: true });
  if (!key) throw new ApiError(404, "API key not found");
  res.json({ success: true, data: { key } });
});
