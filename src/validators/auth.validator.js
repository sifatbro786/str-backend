import { body } from "express-validator";

export const loginRules = [
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password required"),
];

export const registerRules = [
  body("name").trim().notEmpty().withMessage("Name required"),
  body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 chars"),
  body("role").optional().isIn(["super_admin", "admin"]),
];
