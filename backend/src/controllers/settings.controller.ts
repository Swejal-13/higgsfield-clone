import { Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";

const profileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  avatar: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100),
});

export const updateProfile = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid profile data");
  const user = await User.findByIdAndUpdate(req.user!.userId, parsed.data, { new: true }).select("-passwordHash");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: { user } });
});

export const changePassword = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Invalid password data");
  const user = await User.findById(req.user!.userId);
  if (!user) throw new ApiError(404, "User not found");
  const match = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!match) throw new ApiError(401, "Current password is incorrect");
  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await user.save();
  res.json({ success: true, message: "Password updated" });
});
