import { Router } from "express";
import { generateImage, editImage, inpaintImage, upscaleImage, variationImage } from "../controllers/images.controller";
import { requireAuth } from "../middleware/auth";
import { generationRateLimiter } from "../middleware/rateLimit";

const router = Router();
router.use(requireAuth, generationRateLimiter);
router.post("/generate", generateImage);
router.post("/edit", editImage);
router.post("/inpaint", inpaintImage);
router.post("/upscale", upscaleImage);
router.post("/variation", variationImage);

export default router;
