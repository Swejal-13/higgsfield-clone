import { Request, Response } from "express";
import { EFFECTS } from "../config/effects.config";
import { asyncHandler } from "../utils/asyncHandler";

export const listEffects = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.query as { category?: string };
  const effects = category && category !== "all" ? EFFECTS.filter((e) => e.category === category) : EFFECTS;
  res.json({ success: true, data: { effects } });
});
