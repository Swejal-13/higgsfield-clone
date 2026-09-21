import { Router } from "express";
import { generateAudio } from "../controllers/audio.controller";
import { requireAuth } from "../middleware/auth";
import { generationRateLimiter } from "../middleware/rateLimit";

const router = Router();
router.post("/generate", requireAuth, generationRateLimiter, generateAudio);

export default router;
