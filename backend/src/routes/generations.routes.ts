import { Router } from "express";
import {
  createGeneration, listGenerations, getGeneration, getGenerationStatus, deleteGeneration, cancelGenerationHandler,
} from "../controllers/generations.controller";
import { requireAuth } from "../middleware/auth";
import { optionalDemoAuth } from "../middleware/demoAuth";
import { generationRateLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/", optionalDemoAuth, generationRateLimiter, createGeneration);

router.get("/", requireAuth, listGenerations);
router.get("/:id", requireAuth, getGeneration);

router.get(
  "/:id/status",
  optionalDemoAuth,
  getGenerationStatus
);

router.post("/:id/cancel", requireAuth, cancelGenerationHandler);
router.delete("/:id", requireAuth, deleteGeneration);

export default router;