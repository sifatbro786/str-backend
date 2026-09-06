import { body } from "express-validator";

export const createInquiryRules = [
  body("senderName").trim().notEmpty().withMessage("Name required"),
  body("senderEmail").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("message").trim().isLength({ min: 10 }).withMessage("Message must be at least 10 chars"),
];

/**
 * PATCH /inquiries/:id — the controller's `allow` list is the real gate; these
 * rules exist so a bad status or an oversized note fails as a clean 400 with
 * field-level details instead of a Mongoose ValidationError.
 */
export const updateInquiryRules = [
  body("status").optional().isIn(["new", "contacted", "closed"]),
  body("notes").optional().isString().isLength({ max: 4000 }),
];
