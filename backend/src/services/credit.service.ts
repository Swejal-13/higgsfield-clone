import User from "../models/User";
import CreditTransaction from "../models/CreditTransaction";
import Notification from "../models/Notification";
import { Types } from "mongoose";
import { ApiError } from "../utils/ApiError";

export async function ensureSufficientCredits(userId: string, amount: number) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.credits < amount) {
    throw new ApiError(402, `Not enough credits. This action costs ${amount}, you have ${user.credits}.`);
  }
  return user;
}

export async function deductCredits(userId: string, amount: number, reason: string, generationId?: string) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  user.credits -= amount;
  await user.save();
  await CreditTransaction.create({
    userId: new Types.ObjectId(userId),
    amount: -amount,
    reason,
    generationId: generationId ? new Types.ObjectId(generationId) : undefined,
    balanceAfter: user.credits,
  });

  if (user.credits <= 15 && user.credits > 0) {
    await Notification.create({
      userId: user._id,
      title: "Credits running low",
      message: `You have ${user.credits} credits left. Consider upgrading your plan.`,
      type: "warning",
      link: "/pricing",
    });
  }
  return user.credits;
}

export async function refundCredits(userId: string, amount: number, reason: string, generationId?: string) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  user.credits += amount;
  await user.save();
  await CreditTransaction.create({
    userId: new Types.ObjectId(userId),
    amount,
    reason,
    generationId: generationId ? new Types.ObjectId(generationId) : undefined,
    balanceAfter: user.credits,
  });
  return user.credits;
}
