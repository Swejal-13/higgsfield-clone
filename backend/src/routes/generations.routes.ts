import { Router } from "express";
import {
  createGeneration, listGenerations, getGeneration, getGenerationStatus, deleteGeneration, cancelGenerationHandler,
} from "../controllers/generations.controller";
import { requireAuth } from "../middleware/auth";
import { generationRateLimiter } from "../middleware/rateLimit";

const router = Router();
router.use(requireAuth);
router.post("/", generationRateLimiter, createGeneration);
router.get("/", listGenerations);
router.get("/:id", getGeneration);
router.get("/:id/status", getGenerationStatus);
router.post("/:id/cancel", cancelGenerationHandler);
router.delete("/:id", deleteGeneration);

export default router;
