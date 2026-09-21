import { Router } from "express";
import { listEffects } from "../controllers/effects.controller";

const router = Router();
router.get("/", listEffects);

export default router;
