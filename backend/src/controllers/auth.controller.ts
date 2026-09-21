import { Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User";
import { signToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";

const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function toPublicUser(user: any) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    credits: user.credits,
    plan: user.plan,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const register = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid input");
  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, credits: 150, plan: "free" });

  const token = signToken({ userId: String(user._id), role: user.role });
  res.status(201).json({ success: true, data: { user: toPublicUser(user), token } });
});

export const login = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Email and password are required");
  const { email, password } = parsed.data;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new ApiError(401, "Invalid email or password");

  const token = signToken({ userId: String(user._id), role: user.role });
  res.json({ success: true, data: { user: toPublicUser(user), token } });
});

export const me = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: { user: toPublicUser(user) } });
});

export const logout = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  // JWT is stateless; logout is handled client-side by discarding the token.
  res.json({ success: true, message: "Logged out" });
});
