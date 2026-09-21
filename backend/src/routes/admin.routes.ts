import { Router } from "express";
import { adminStats, adminListUsers, adminListGenerations, adminListModels, adminListEffects } from "../controllers/admin.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();
router.use(requireAuth, requireAdmin);
router.get("/stats", adminStats);
router.get("/users", adminListUsers);
router.get("/generations", adminListGenerations);
router.get("/models", adminListModels);
router.get("/effects", adminListEffects);

export default router;
