import { Response } from "express";
import { z } from "zod";
import Project from "../models/Project";
import Asset from "../models/Asset";
import Generation from "../models/Generation";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
});

export const listProjects = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const projects = await Project.find({ userId: req.user!.userId }).sort({ updatedAt: -1 });
  res.json({ success: true, data: { projects } });
});

export const createProject = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid input");
  const project = await Project.create({ userId: req.user!.userId, ...parsed.data });
  res.status(201).json({ success: true, data: { project } });
});

export const getProject = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const project = await Project.findOne({ _id: req.params.id, userId: req.user!.userId });
  if (!project) throw new ApiError(404, "Project not found");
  const assets = await Asset.find({ projectId: project._id }).sort({ createdAt: -1 });
  const generations = await Generation.find({ projectId: project._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: { project, assets, generations } });
});

export const updateProject = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const allowed = ["name", "description", "coverImage"] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) if (key in req.body) updates[key] = req.body[key];
  const project = await Project.findOneAndUpdate({ _id: req.params.id, userId: req.user!.userId }, updates, { new: true });
  if (!project) throw new ApiError(404, "Project not found");
  res.json({ success: true, data: { project } });
});

export const deleteProject = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  if (!project) throw new ApiError(404, "Project not found");
  res.json({ success: true, message: "Project deleted" });
});
