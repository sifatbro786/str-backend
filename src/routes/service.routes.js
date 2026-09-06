import { Router } from "express";
import * as ctrl from "../controllers/service.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import sanitizeHtml from "../middleware/sanitizeHtml.js";

const router = Router();

router.get("/", ctrl.listServices);

// Literal segment must precede /:slug or "admin" is parsed as a slug.
router.get("/admin/id/:id", protect, checkRole("super_admin", "admin"), ctrl.getServiceById);

router.get("/:slug", ctrl.getService);

router.use(protect, checkRole("super_admin", "admin"));
router.post("/", sanitizeHtml("detailedOverview"), ctrl.createService);
router.patch("/:id", sanitizeHtml("detailedOverview"), ctrl.updateService);
router.delete("/:id", ctrl.deleteService);

export default router;
