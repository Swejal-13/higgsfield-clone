import { Router } from "express";
import {
  generateImage,
  editImage,
  inpaintImage,
  upscaleImage,
  variationImage,
} from "../controllers/images.controller";
import { optionalDemoAuth } from "../middleware/demoAuth";
import { generationRateLimiter } from "../middleware/rateLimit";

const router = Router();

router.use(optionalDemoAuth, generationRateLimiter);

router.post("/generate", generateImage);
router.post("/edit", editImage);
router.post("/inpaint", inpaintImage);
router.post("/upscale", upscaleImage);
router.post("/variation", variationImage);

export default router;