import { body, param } from "express-validator";
import { SITE_CONTENT_KEYS } from "../models/SiteContent.js";

/**
 * SiteContent write rules.
 *
 * ── WHY THE VALIDATION IS HERE AND NOT IN THE SCHEMA ─────────────────────
 * models/SiteContent.js stores `items` as Mixed because the four blocks have
 * four different item shapes and one strict sub-schema would fit none of them.
 * That makes THIS file the only thing standing between an admin form and the
 * homepage. Treat a gap here as a gap in the model.
 *
 * ── WHAT IS ACTUALLY BEING GUARDED ───────────────────────────────────────
 * Not injection — Express sanitizes operators upstream and React escapes text
 * on output. The failures worth catching are the dull ones that reach
 * production and are hard to trace back to a form field:
 *
 *   · `metrics.value` rendered as a counter. A string where a number belongs
 *     gives "NaN+" on the homepage above the fold.
 *   · Enumerated fields such as a row/group number. A value outside the set
 *     silently disappears from the page — no error, just absent content
 *     nobody notices for a month.
 *   · Unbounded arrays. Nothing here is paginated: every item renders. A
 *     hundred FAQ rows is a broken page, so the cap belongs at the write.
 *   · Unknown item keys. `items` is Mixed, so anything extra is persisted
 *     forever, and two years from now nobody knows whether it is load-bearing.
 *     Rejected rather than stripped, so the author sees the typo.
 *
 * ── ⚑ ADDING A KEY ───────────────────────────────────────────────────────
 * A new block needs three edits and they must land together: the enum in
 * models/SiteContent.js, a shape entry in SHAPES below, and the frontend
 * selector in str-frontend/lib/api.js. Miss the middle one and every write
 * to the new key is rejected as an unknown item field.
 */

/**
 * Per-key item contract.
 *   required — must be present and non-empty
 *   optional — may be present
 *   numbers  — must be finite numbers when present
 *   oneOf    — enumerated values, keyed by field
 */
const SHAPES = {
  metrics: {
    required: ["label"],
    optional: ["value", "suffix", "note"],
    numbers: ["value"],
    max: 8,
  },
  faqs: {
    required: ["q", "a"],
    optional: ["category"],
    max: 30,
  },
  process: {
    required: ["index", "title", "body"],
    optional: ["output"],
    max: 8,
  },
  capabilities: {
    required: ["title", "body"],
    optional: [],
    max: 8,
  },
};

/** Longest any single string in any block may be. Bodies are a paragraph. */
const MAX_STRING = 1000;

function validateItems(items, { req }) {
  const key = req.params.key;
  const shape = SHAPES[key];
  if (!shape) throw new Error(`Unknown content key: ${key}`);

  if (!Array.isArray(items)) throw new Error("items must be an array");
  if (items.length > shape.max) {
    throw new Error(`${key} accepts at most ${shape.max} items`);
  }

  const allowed = new Set([...shape.required, ...shape.optional]);

  items.forEach((item, i) => {
    const at = `items[${i}]`;
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`${at} must be an object`);
    }

    for (const field of Object.keys(item)) {
      if (!allowed.has(field)) {
        throw new Error(`${at}.${field} is not a valid field for ${key}`);
      }
    }

    for (const field of shape.required) {
      const v = item[field];
      const empty =
        v === undefined || v === null || (typeof v === "string" && v.trim() === "");
      if (empty) throw new Error(`${at}.${field} is required`);
    }

    for (const field of shape.numbers ?? []) {
      if (item[field] === undefined || item[field] === "") continue;
      if (typeof item[field] !== "number" || !Number.isFinite(item[field])) {
        throw new Error(`${at}.${field} must be a number`);
      }
    }

    for (const [field, values] of Object.entries(shape.oneOf ?? {})) {
      if (item[field] === undefined || item[field] === "") continue;
      if (!values.includes(item[field])) {
        throw new Error(`${at}.${field} must be one of: ${values.join(", ")}`);
      }
    }

    for (const [field, v] of Object.entries(item)) {
      if (typeof v === "string" && v.length > MAX_STRING) {
        throw new Error(`${at}.${field} must be ${MAX_STRING} characters or fewer`);
      }
    }
  });

  return true;
}

export const upsertSiteContentRules = [
  param("key")
    .isIn(SITE_CONTENT_KEYS)
    .withMessage(`key must be one of: ${SITE_CONTENT_KEYS.join(", ")}`),

  body("items").isArray().withMessage("items must be an array").bail().custom(validateItems),
];

/** Exported so the admin form and the seed script can share one source. */
export const SITE_CONTENT_SHAPES = SHAPES;
