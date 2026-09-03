import { Router } from "express";
import * as ctrl from "../controllers/project.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { createProjectRules } from "../validators/project.validator.js";

const router = Router();

// Public reads.
router.get("/", ctrl.listProjects);
router.get("/:slug", ctrl.getProject);

// Everything below requires an authenticated admin.
router.use(protect, checkRole("super_admin", "admin"));
router.post("/", createProjectRules, validate, ctrl.createProject);
router.patch("/:id", ctrl.updateProject);
router.delete("/:id", ctrl.deleteProject);

export default router;
