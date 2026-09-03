import { Router } from "express";
import * as ctrl from "../controllers/user.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";

const router = Router();

// Whole resource is super_admin only.
router.use(protect, checkRole("super_admin"));

router.route("/").get(ctrl.listUsers).post(ctrl.createUser);
router.route("/:id").get(ctrl.getUser).patch(ctrl.updateUser).delete(ctrl.deleteUser);

export default router;
