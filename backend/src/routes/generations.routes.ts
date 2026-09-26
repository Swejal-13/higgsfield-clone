import { Router } from "express";
import {
  createGeneration, listGenerations, getGeneration, getGenerationStatus, deleteGeneration, cancelGenerationHandler,
} from "../controllers/generations.controller";
import { optionalDemoAuth } from "../middleware/demoAuth";
import { generationRateLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/", optionalDemoAuth, generationRateLimiter, createGeneration);

router.get("/", optionalDemoAuth, listGenerations);
router.get("/:id", optionalDemoAuth, getGeneration);

router.get(
  "/:id/status",
  optionalDemoAuth,
  getGenerationStatus
);

router.post("/:id/cancel", optionalDemoAuth, cancelGenerationHandler);
router.delete("/:id", optionalDemoAuth, deleteGeneration);

export default router;