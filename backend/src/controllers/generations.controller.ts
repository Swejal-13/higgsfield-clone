import { Response } from "express";
import { z } from "zod";
import Generation from "../models/Generation";
import Asset from "../models/Asset";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";
import { startGeneration, cancelGeneration } from "../services/generation.service";
import { getModelById } from "../config/models.config";

const createSchema = z.object({
  type: z.enum(["image", "video", "audio"]),
  action: z.string().default("generate"),
  prompt: z.string().min(1, "Prompt is required").max(2000),
  negativePrompt: z.string().max(2000).optional(),
  model: z.string().min(1, "Model is required"),
  settings: z.record(z.any()).optional(),
  inputAssets: z.array(z.string()).optional(),
  projectId: z.string().optional(),
});

export const createGeneration = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid input");

  const modelConfig = getModelById(parsed.data.model);
  if (!modelConfig || !modelConfig.enabled) throw new ApiError(400, "Selected model is not available");

  const { model, ...rest } = parsed.data;
  const generation = await startGeneration({ userId: req.user!.userId, modelId: model, ...rest });
  res.status(202).json({ success: true, data: { generation } });
});

export const listGenerations = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { type, status, sort = "newest", page = "1", limit = "20" } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = { userId: req.user!.userId };
  if (type && type !== "all") filter.type = type;
  if (status && status !== "all") filter.status = status.toUpperCase();

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

  const generations = await Generation.find(filter)
    .sort({ createdAt: sort === "oldest" ? 1 : -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const total = await Generation.countDocuments(filter);

  res.json({ success: true, data: { generations, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

export const getGeneration = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const generation = await Generation.findOne({ _id: req.params.id, userId: req.user!.userId });
  if (!generation) throw new ApiError(404, "Generation not found");

  let outputAssets: unknown[] = [];
  if (generation.outputAssets.length) {
    outputAssets = await Asset.find({ _id: { $in: generation.outputAssets } });
  }
  res.json({ success: true, data: { generation, outputAssets } });
});

export const getGenerationStatus = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const generation = await Generation.findOne({ _id: req.params.id, userId: req.user!.userId }).select(
    "status progress statusMessage outputAssets error type action"
  );
  if (!generation) throw new ApiError(404, "Generation not found");

  let outputAssets: unknown[] = [];
  if (generation.status === "COMPLETED" && generation.outputAssets.length) {
    outputAssets = await Asset.find({ _id: { $in: generation.outputAssets } });
  }
  res.json({ success: true, data: { ...generation.toObject(), outputAssets } });
});

export const deleteGeneration = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const generation = await Generation.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  if (!generation) throw new ApiError(404, "Generation not found");
  res.json({ success: true, message: "Generation deleted" });
});

export const cancelGenerationHandler = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const generation = await cancelGeneration(req.params.id, req.user!.userId);
  if (!generation) throw new ApiError(404, "Generation not found");
  res.json({ success: true, data: { generation } });
});
