import { Router } from "express";
import { updateProfile, changePassword } from "../controllers/settings.controller";
import { listApiKeys, createApiKey, revokeApiKey } from "../controllers/apiKeys.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
router.put("/profile", updateProfile);
router.put("/password", changePassword);
router.get("/api-keys", listApiKeys);
router.post("/api-keys", createApiKey);
router.delete("/api-keys/:id", revokeApiKey);

export default router;
