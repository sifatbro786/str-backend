import { body } from "express-validator";

/**
 * Validation for /users. The controller's allow-lists and role guards are the
 * real gates; these rules exist so bad input fails as a clean 400 with
 * field-level details instead of a Mongoose ValidationError or a 500.
 *
 * `normalizeEmail` is intentionally configured, not defaulted: the default
 * strips Gmail dots and everything after `+`, so "ops+billing@gmail.com" would
 * be stored — and logged in with — as "ops@gmail.com". For a login identity
 * that is a silent account-merge, not a normalisation.
 */
const EMAIL_NORMALIZE = { gmail_remove_dots: false, gmail_remove_subaddress: false };

const ROLES = ["super_admin", "admin"];
const STATUSES = ["active", "suspended"];

/**
 * 8 chars is the schema minimum, but a dashboard account that can create other
 * super_admins is worth more than the schema floor. 10 + three character
 * classes blocks the passwords people actually pick ("password1", "12345678")
 * without pushing anyone into a password manager they do not have.
 */
const passwordRule = (field) =>
  body(field)
    .isString()
    .isLength({ min: 10 })
    .withMessage("Password must be at least 10 characters")
    .bail()
    .matches(/[a-z]/)
    .withMessage("Include a lowercase letter")
    .bail()
    .matches(/[A-Z]/)
    .withMessage("Include an uppercase letter")
    .bail()
    .matches(/[0-9]/)
    .withMessage("Include a number");

export const createUserRules = [
  body("name").trim().notEmpty().withMessage("Name required").isLength({ max: 80 }),
  body("email")
    .isEmail()
    .withMessage("Valid email required")
    .normalizeEmail(EMAIL_NORMALIZE),
  passwordRule("password"),
  body("role").optional().isIn(ROLES).withMessage("Role must be super_admin or admin"),
  body("status").optional().isIn(STATUSES),
  body("permissions").optional().isArray().withMessage("Permissions must be an array"),
  body("permissions.*").optional().isString().trim().isLength({ max: 64 }),
];

export const updateUserRules = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty").isLength({ max: 80 }),
  body("email").optional().isEmail().withMessage("Valid email required").normalizeEmail(EMAIL_NORMALIZE),
  body("role").optional().isIn(ROLES).withMessage("Role must be super_admin or admin"),
  body("status").optional().isIn(STATUSES).withMessage("Status must be active or suspended"),
  body("permissions").optional().isArray(),
  body("permissions.*").optional().isString().trim().isLength({ max: 64 }),
  // Rejected loudly rather than silently dropped. A password quietly ignored by
  // PATCH is how an admin ends up believing they rotated a credential.
  body("password")
    .not()
    .exists()
    .withMessage("Use PATCH /users/:id/password to set a password"),
];

export const resetPasswordRules = [passwordRule("newPassword")];
