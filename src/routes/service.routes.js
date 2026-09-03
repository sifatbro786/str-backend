import { Router } from "express";
import * as ctrl from "../controllers/service.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", ctrl.listServices);
router.get("/:slug", ctrl.getService);

router.use(protect, checkRole("super_admin", "admin"));
router.post("/", ctrl.createService);
router.patch("/:id", ctrl.updateService);
router.delete("/:id", ctrl.deleteService);

export default router;
