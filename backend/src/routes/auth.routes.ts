import { Router } from "express";
import { register, login, me, logout } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimit";

const router = Router();
router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);

export default router;
