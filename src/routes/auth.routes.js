import { Router } from "express";
import * as ctrl from "../controllers/auth.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiters.js";
import { loginRules, registerRules } from "../validators/auth.validator.js";

const router = Router();

router.post("/login", authLimiter, loginRules, validate, ctrl.login);
router.post("/register", protect, checkRole("super_admin"), registerRules, validate, ctrl.register);
router.get("/me", protect, ctrl.getMe);
router.patch("/update-password", protect, ctrl.updatePassword);
router.post("/logout", protect, ctrl.logout);

export default router;
