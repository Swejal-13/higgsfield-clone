import { Response } from "express";
import Asset from "../models/Asset";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";

export const listAssets = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { type, favorite, projectId, search, page = "1", limit = "40" } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = { userId: req.user!.userId };
  if (type && type !== "all") filter.type = type;
  if (favorite === "true") filter.favorite = true;
  if (projectId) filter.projectId = projectId;
  if (search) filter.filename = { $regex: search, $options: "i" };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 40));

  const assets = await Asset.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);
  const total = await Asset.countDocuments(filter);

  res.json({ success: true, data: { assets, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

export const uploadAsset = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) throw new ApiError(400, "No file uploaded");

  const type = file.mimetype.startsWith("image")
    ? "image"
    : file.mimetype.startsWith("video")
    ? "video"
    : "audio";

  const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  const asset = await Asset.create({
    userId: req.user!.userId,
    type,
    url: dataUrl,
    thumbnailUrl: type === "image" ? dataUrl : undefined,
    filename: file.originalname,
    size: file.size,
    metadata: {
      uploaded: true,
      mimetype: file.mimetype,
    },
  });

  res.status(201).json({ success: true, data: { asset } });
});

export const deleteAsset = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const asset = await Asset.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
  if (!asset) throw new ApiError(404, "Asset not found");
  res.json({ success: true, message: "Asset deleted" });
});

export const updateAsset = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const allowed = ["favorite", "filename", "projectId"] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) if (key in req.body) updates[key] = req.body[key];

  const asset = await Asset.findOneAndUpdate({ _id: req.params.id, userId: req.user!.userId }, updates, { new: true });
  if (!asset) throw new ApiError(404, "Asset not found");
  res.json({ success: true, data: { asset } });
});
