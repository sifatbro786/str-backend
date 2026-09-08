import { Router } from "express";
import * as ctrl from "../controllers/service.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import sanitizeHtml from "../middleware/sanitizeHtml.js";
import validate from "../middleware/validate.js";
import { createServiceRules, updateServiceRules } from "../validators/service.validator.js";

const router = Router();

router.get("/", ctrl.listServices);

// Literal segment must precede /:slug or "admin" is parsed as a slug.
router.get("/admin/id/:id", protect, checkRole("super_admin", "admin"), ctrl.getServiceById);

router.get("/:slug", ctrl.getService);

router.use(protect, checkRole("super_admin", "admin"));

/* sanitizeHtml runs BEFORE validate, matching blog.routes and project.routes.
   Length rules must measure the string that will actually be stored: validate
   first and an author can pass a length check with markup that sanitises down
   to a fraction of it, or be rejected for an edit that would have fitted. */
router.post(
  "/",
  sanitizeHtml("detailedOverview"),
  createServiceRules,
  validate,
  ctrl.createService
);
router.patch(
  "/:id",
  sanitizeHtml("detailedOverview"),
  updateServiceRules,
  validate,
  ctrl.updateService
);
router.delete("/:id", ctrl.deleteService);

export default router;
