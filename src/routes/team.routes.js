import { Router } from "express";
import * as ctrl from "../controllers/team.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", ctrl.listTeam);
router.get("/:id", ctrl.getMember);

router.use(protect, checkRole("super_admin", "admin"));
router.post("/", ctrl.createMember);
router.patch("/:id", ctrl.updateMember);
router.delete("/:id", ctrl.deleteMember);

export default router;
