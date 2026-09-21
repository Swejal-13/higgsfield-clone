import { Router } from "express";
import { listProjects, createProject, getProject, updateProject, deleteProject } from "../controllers/projects.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);
router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
