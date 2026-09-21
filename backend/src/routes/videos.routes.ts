import { Router } from "express";
import { generateVideo, imageToVideo, editVideo, motionControlVideo, extendVideo } from "../controllers/videos.controller";
import { requireAuth } from "../middleware/auth";
import { generationRateLimiter } from "../middleware/rateLimit";

const router = Router();
router.use(requireAuth, generationRateLimiter);
router.post("/generate", generateVideo);
router.post("/image-to-video", imageToVideo);
router.post("/edit", editVideo);
router.post("/motion", motionControlVideo);
router.post("/extend", extendVideo);

export default router;
