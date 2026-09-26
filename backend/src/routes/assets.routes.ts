import { Router } from "express";
import { listAssets, uploadAsset, deleteAsset, updateAsset } from "../controllers/assets.controller";
import { optionalDemoAuth } from "../middleware/demoAuth";
import { upload } from "../middleware/upload";

const router = Router();
router.use(optionalDemoAuth);
router.get("/", listAssets);
router.post("/upload", upload.single("file"), uploadAsset);
router.put("/:id", updateAsset);
router.delete("/:id", deleteAsset);

export default router;
