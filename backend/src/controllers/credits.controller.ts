import { Response } from "express";
import User from "../models/User";
import CreditTransaction from "../models/CreditTransaction";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";

export const getCredits = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const user = await User.findById(req.user!.userId).select("credits plan");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: { credits: user.credits, plan: user.plan } });
});

export const getCreditTransactions = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const transactions = await CreditTransaction.find({ userId: req.user!.userId }).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: { transactions } });
});
