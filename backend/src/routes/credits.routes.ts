import { Router } from "express";
import { getCredits, getCreditTransactions } from "../controllers/credits.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
router.get("/", getCredits);
router.get("/transactions", getCreditTransactions);

export default router;
