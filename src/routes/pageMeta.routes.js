import { Router } from "express";
import * as ctrl from "../controllers/pageMeta.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, checkRole("super_admin", "admin"), ctrl.listPageMeta); // admin: all
router.get("/:identifier", ctrl.getPageMeta); // public: one page
router.put("/:identifier", protect, checkRole("super_admin", "admin"), ctrl.upsertPageMeta);

export default router;
