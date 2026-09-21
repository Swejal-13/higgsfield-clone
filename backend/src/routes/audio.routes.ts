import { Router } from "express";
import { generateAudio } from "../controllers/audio.controller";
import { optionalDemoAuth } from "../middleware/demoAuth";
import { generationRateLimiter } from "../middleware/rateLimit";

const router = Router();
router.post(
  "/generate",
  optionalDemoAuth,
  generationRateLimiter,
  generateAudio
);
export default router;
