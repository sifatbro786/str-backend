import { Router } from "express";
import * as ctrl from "../controllers/inquiry.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { contactLimiter } from "../middleware/rateLimiters.js";
import { createInquiryRules } from "../validators/inquiry.validator.js";

const router = Router();

// Public contact form — rate limited and validated.
router.post("/", contactLimiter, createInquiryRules, validate, ctrl.createInquiry);

// Reading and managing leads is admin-only.
router.use(protect, checkRole("super_admin", "admin"));
router.get("/", ctrl.listInquiries);
router.get("/:id", ctrl.getInquiry);
router.patch("/:id", ctrl.updateInquiry);
router.delete("/:id", ctrl.deleteInquiry);

export default router;
