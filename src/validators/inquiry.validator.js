import { body } from "express-validator";

export const createInquiryRules = [
  body("senderName").trim().notEmpty().withMessage("Name required"),
  body("senderEmail").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("message").trim().isLength({ min: 10 }).withMessage("Message must be at least 10 chars"),
  body("phone").optional({ values: "falsy" }).isString().trim().isLength({ max: 40 }),
  /* Checkbox group: the form posts string[]; a bare string (old client, curl)
     is accepted as a one-item list. Normalised to ONE comma-joined string so
     the model, mail templates and admin filter keep their current shape. */
  body("serviceInterested")
    .customSanitizer((v) => (Array.isArray(v) ? v : typeof v === "string" && v ? [v] : []))
    .custom(
      (arr) =>
        arr.length >= 1 &&
        arr.length <= 12 &&
        arr.every((s) => typeof s === "string" && s.trim() && s.length <= 80)
    )
    .withMessage("Pick at least one service")
    .customSanitizer((arr) => [...new Set(arr.map((s) => s.trim()))].join(", ")),
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
