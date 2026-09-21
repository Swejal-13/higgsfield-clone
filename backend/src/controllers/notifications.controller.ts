import { Response } from "express";
import Notification from "../models/Notification";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { AuthedRequest } from "../middleware/auth";

export const listNotifications = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const notifications = await Notification.find({ userId: req.user!.userId }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ userId: req.user!.userId, read: false });
  res.json({ success: true, data: { notifications, unreadCount } });
});

export const markNotificationRead = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { read: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, "Notification not found");
  res.json({ success: true, data: { notification } });
});

export const markAllRead = asyncHandler(async (req: AuthedRequest, res: Response) => {
  await Notification.updateMany({ userId: req.user!.userId, read: false }, { read: true });
  res.json({ success: true, message: "All notifications marked read" });
});
