import { Router } from "express";
import * as ctrl from "../controllers/testimonial.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", ctrl.listTestimonials);
router.get("/:id", ctrl.getTestimonial);

router.use(protect, checkRole("super_admin", "admin"));
router.post("/", ctrl.createTestimonial);
router.patch("/:id", ctrl.updateTestimonial);
router.delete("/:id", ctrl.deleteTestimonial);

export default router;
