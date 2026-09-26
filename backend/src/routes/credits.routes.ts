import { Router } from "express";
import { getCredits, getCreditTransactions } from "../controllers/credits.controller";
import { optionalDemoAuth } from "../middleware/demoAuth";

const router = Router();
router.use(optionalDemoAuth);
router.get("/", getCredits);
router.get("/transactions", getCreditTransactions);

export default router;
