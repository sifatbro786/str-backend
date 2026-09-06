import { Router } from "express";
import * as ctrl from "../controllers/stats.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";

const router = Router();

// Entire resource is admin-only. No public shape of this exists.
router.use(protect, checkRole("super_admin", "admin"));
router.get("/overview", ctrl.getOverview);

export default router;
