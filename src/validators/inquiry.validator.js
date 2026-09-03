import { body } from "express-validator";

export const createInquiryRules = [
  body("senderName").trim().notEmpty().withMessage("Name required"),
  body("senderEmail").isEmail().withMessage("Valid email required").normalizeEmail(),
  body("message").trim().isLength({ min: 10 }).withMessage("Message must be at least 10 chars"),
];
