import { body } from "express-validator";

import { DELIVERY_TIMES, DELIVERY_TYPES, QUOTE_STATUSES } from "../models/GraphicsQuote.js";

/**
 * POST /graphics-quotes — public, unauthenticated, multipart.
 *
 * ⚑ THESE RULES RUN AFTER multer, NEVER BEFORE IT. On a multipart request
 * `req.body` does not exist until busboy has finished parsing, so a chain
 * mounted ahead of the upload middleware validates an empty object and passes
 * everything. See routes/graphicsQuote.routes.js for the ordering and why it
 * is a security boundary rather than a preference.
 *
 * ── WHY servicesRequired IS NOT AN ENUM ──────────────────────────────────
 * Same call as Inquiry.serviceInterested. The passes are published from
 * lib/graphics.js on the frontend and will move behind the dashboard; an enum
 * duplicated here would have to be edited in lockstep with a file in another
 * repo, and the failure mode is a 400 on a form the client filled in
 * correctly. Bounded free text instead: ten entries, 80 characters each.
 *
 * ⚑ THE CEILING IS A COUNT OF CHECKBOXES, NOT A ROUND NUMBER. The order desk
 * offers the eight published passes plus EXTRA_PASSES from
 * str-frontend/lib/graphicsQuote.js, which is ten today. A client who ticks
 * every box has to land inside `max`, so raise this first when a pass is added
 * over there — the enum this avoids is gone, but the arithmetic is not.
 */

/** FormData sends one field per checked box; a single box arrives as a scalar. */
const toArray = (value) => {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
};

export const createGraphicsQuoteRules = [
  body("senderName")
    .trim()
    .notEmpty()
    .withMessage("Tell us who this is from.")
    .bail()
    .isLength({ max: 120 })
    .withMessage("Name must be 120 characters or fewer"),

  body("senderEmail")
    .isEmail()
    .withMessage("That email does not look right.")
    .bail()
    .normalizeEmail(),

  body("phone").optional({ values: "falsy" }).trim().isLength({ max: 40 }),

  body("jobTitle")
    .trim()
    .notEmpty()
    .withMessage("Give the batch a name so we can both refer to it.")
    .bail()
    .isLength({ max: 160 })
    .withMessage("Job title must be 160 characters or fewer"),

  body("instructions")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Say what should happen to the images, even in one line.")
    .bail()
    .isLength({ max: 4000 })
    .withMessage("Instructions must be 4,000 characters or fewer"),

  body("servicesRequired")
    .customSanitizer(toArray)
    .isArray({ min: 1, max: 10 })
    .withMessage("Pick at least one pass.")
    .bail()
    .custom((arr) => arr.every((s) => typeof s === "string" && s.trim() && s.length <= 80))
    .withMessage("Unrecognised service selection."),

  body("deliveryType")
    .optional({ values: "falsy" })
    .isIn(DELIVERY_TYPES)
    .withMessage("Choose one of the listed delivery formats."),

  body("deliveryTime")
    .optional({ values: "falsy" })
    .isIn(DELIVERY_TIMES)
    .withMessage("Choose one of the listed turnarounds."),

  /**
   * https only, and rejected rather than normalised — same reasoning as
   * validators/media.js. This string is rendered as a clickable anchor in an
   * email that lands in the studio's inbox, so "javascript:" and a
   * protocol-relative "//host/x" are both live vectors, and a plain http link
   * to a file drop is a link someone will paste into a browser and be warned
   * about.
   */
  body("fileLink")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 400 })
    .withMessage("That link is too long.")
    .bail()
    .matches(/^https:\/\/[^\s]+$/i)
    .withMessage("Paste the full https link to your file drop."),
];

/**
 * PATCH /graphics-quotes/:id — the controller's `allow` list is the real gate.
 * These rules exist so a bad status or an oversized note answers as a clean
 * 400 with a field name instead of a Mongoose ValidationError.
 */
export const updateGraphicsQuoteRules = [
  body("status").optional().isIn(QUOTE_STATUSES),
  body("notes").optional().isString().isLength({ max: 4000 }),
];
