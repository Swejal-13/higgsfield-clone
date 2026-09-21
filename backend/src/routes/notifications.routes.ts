import { Router } from "express";
import { listNotifications, markNotificationRead, markAllRead } from "../controllers/notifications.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
router.get("/", listNotifications);
router.put("/:id/read", markNotificationRead);
router.put("/read-all", markAllRead);

export default router;
