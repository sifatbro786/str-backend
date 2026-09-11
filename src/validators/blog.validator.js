import { body } from "express-validator";
import { mediaField } from "./media.js";

/**
 * ⚑ Only POST runs these. blog.routes mounts no validator on PATCH, so an edit
 * reaches the handler with nothing but sanitizeHtml in front of it. That
 * predates this file and is worth closing, but it is a separate change: adding
 * an updateBlogRules chain means auditing every field the form sends, not just
 * the one below.
 */
export const createBlogRules = [
  body("title").trim().notEmpty().withMessage("Title required"),
  body("content").notEmpty().withMessage("Content required"),
  mediaField("coverImage"),
];
