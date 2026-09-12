import { Router } from "express";
import * as ctrl from "../controllers/user.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiters.js";
import {
  createUserRules,
  updateUserRules,
  resetPasswordRules,
} from "../validators/user.validator.js";

const router = Router();

// Whole resource is super_admin only.
router.use(protect, checkRole("super_admin"));

router
  .route("/")
  .get(ctrl.listUsers)
  .post(createUserRules, validate, ctrl.createUser);

// Password writes sit behind the auth limiter, not the global one. Creating
// accounts and resetting credentials are the two endpoints worth brute-forcing
// if a super_admin token ever leaks, and they are low-frequency by nature.
router.patch(
  "/:id/password",
  authLimiter,
  resetPasswordRules,
  validate,
  ctrl.resetUserPassword
);

router
  .route("/:id")
  .get(ctrl.getUser)
  .patch(updateUserRules, validate, ctrl.updateUser)
  .delete(ctrl.deleteUser);

export default router;
