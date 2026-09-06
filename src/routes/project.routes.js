import { Router } from "express";
import * as ctrl from "../controllers/project.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import sanitizeHtml from "../middleware/sanitizeHtml.js";
import { createProjectRules, updateProjectRules } from "../validators/project.validator.js";

const router = Router();

// Public reads.
router.get("/", ctrl.listProjects);

// Literal segment must precede /:slug or "admin" is parsed as a slug.
router.get("/admin/all", protect, checkRole("super_admin", "admin"), ctrl.listProjectsAdmin);
router.get("/admin/id/:id", protect, checkRole("super_admin", "admin"), ctrl.getProjectById);

router.get("/:slug", ctrl.getProject);

// Everything below requires an authenticated admin.
// sanitizeHtml runs before validate so length rules see the sanitized string.
router.use(protect, checkRole("super_admin", "admin"));
router.post("/", sanitizeHtml("fullCaseStudy"), createProjectRules, validate, ctrl.createProject);
router.patch("/:id", sanitizeHtml("fullCaseStudy"), updateProjectRules, validate, ctrl.updateProject);
router.delete("/:id", ctrl.deleteProject);

export default router;
