import { Router } from "express";
import { listProjects, createProject, getProject, updateProject, deleteProject } from "../controllers/projects.controller";
import { optionalDemoAuth } from "../middleware/demoAuth";

const router = Router();
router.use(optionalDemoAuth);
router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
