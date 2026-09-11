import { body } from "express-validator";
import { mediaField } from "./media.js";

/**
 * Service write rules.
 *
 * ── WHY THIS FILE DID NOT EXIST ──────────────────────────────────────────
 * Services were the only admin-writable resource with no express-validator
 * layer at all: the routes ran sanitizeHtml and went straight to the handler
 * factory. Mongoose strict mode and the factory's immutable deny-list meant
 * nothing catastrophic got through, but "the ORM happens to drop unknown
 * keys" is not input validation. It gives no error messages the admin form
 * can show, and it enforces none of the rules that are actually about the
 * product rather than about the database — a 4,000-character short
 * description is a valid string and a broken card.
 *
 * ── `icon` IS GONE ───────────────────────────────────────────────────────
 * It held a lucide key that nothing on the frontend ever rendered, and it is
 * replaced by `image` + `imageAlt` now that artwork is owned by the record
 * instead of by SERVICE_MEDIA. A payload still carrying `icon` is not
 * rejected here — Mongoose strict mode drops it — because the only sender
 * would be a stale admin bundle mid-deploy, and 400ing that is a worse
 * failure than ignoring one dead field.
 *
 * ── WHY MAXLENGTHS ARE STRICTER THAN THE SCHEMA ──────────────────────────
 * The schema caps `title` at 120 because that is the point past which Mongo
 * should refuse. These caps are the point past which the DESIGN breaks:
 * shortDescription is rendered in a card on /services and under the homepage
 * preview frame, and past ~240 characters it pushes the row height out of the
 * grid. Validation is the right place to encode that, because it is the only
 * layer that can tell the author before they save.
 *
 * ── ORDER MATTERS ON THE ROUTE ───────────────────────────────────────────
 * These run AFTER sanitizeHtml, so length rules measure the string that will
 * actually be stored. Validating first and sanitising second means an author
 * can pass a 4,000-character check with markup that sanitises down to 200 and
 * a rejected 300-character edit that would have been fine.
 */

/** Shared between create and update; only `required` differs. */
const SHARED = [
  body("shortDescription")
    .optional()
    .trim()
    .isLength({ max: 240 })
    .withMessage("Short description must be 240 characters or fewer"),

  // No max on the overview: it is the long-form body, and sanitizeHtml has
  // already removed anything dangerous. A cap here would only ever surprise
  // someone mid-edit.
  body("detailedOverview").optional().isString(),

  // Shape rules live in validators/media.js — see the note there on why the
  // accepted set is exactly "rooted path" or "https URL".
  mediaField("image"),

  body("imageAlt")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 160 })
    .withMessage("Image alt text must be 160 characters or fewer"),

  body("deliverableTimeline")
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage("Timeline must be 60 characters or fewer"),

  body("featuresList")
    .optional()
    .isArray({ max: 20 })
    .withMessage("featuresList accepts at most 20 entries"),
  body("featuresList.*")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Feature entries cannot be blank")
    .isLength({ max: 160 })
    .withMessage("Each feature must be 160 characters or fewer"),

  body("order").optional().isInt({ min: 0, max: 9999 }).toInt(),
  body("isActive").optional().isBoolean().toBoolean(),

  /* `slug` is derived from `title` by the model's pre-hooks and stripped by
     the handler factory's immutable list. Rejecting it explicitly turns a
     silent no-op into a message, which is the difference between an admin
     thinking they renamed a URL and knowing they did not. */
  body("slug")
    .not()
    .exists()
    .withMessage("slug is derived from title and cannot be set directly"),
];

export const createServiceRules = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title required")
    .isLength({ max: 120 })
    .withMessage("Title must be 120 characters or fewer"),
  ...SHARED,
];

/** PATCH is partial: title becomes optional, every constraint stays identical. */
export const updateServiceRules = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be blank")
    .isLength({ max: 120 }),
  ...SHARED,
];
