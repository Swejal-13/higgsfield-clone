import { Router } from "express";
import { listNotifications, markNotificationRead, markAllRead } from "../controllers/notifications.controller";
import { optionalDemoAuth } from "../middleware/demoAuth";

const router = Router();
router.use(optionalDemoAuth);
router.get("/", listNotifications);
router.put("/:id/read", markNotificationRead);
router.put("/read-all", markAllRead);

export default router;
