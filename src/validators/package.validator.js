import { body, param, query } from "express-validator";
import { PACKAGE_CATEGORY_ICONS } from "../models/PackageCategory.js";
import { SHOWCASE_GROUPS } from "../models/PackagePage.js";

/**
 * Packages write rules.
 *
 * ── WHAT IS ACTUALLY BEING GUARDED ───────────────────────────────────────
 * Not injection. middleware/sanitize.js removes Mongo operators upstream,
 * middleware/stripDeep.js removes markup, and React escapes text on output.
 * The failures worth catching here are the dull ones that reach a public
 * pricing page and are hard to trace back to a form field:
 *
 *   · A price that is a string. `amount` is formatted through
 *     Intl.NumberFormat and divided into `original` to derive the discount
 *     badge. "40,500" typed with its separator renders "৳NaN" above the fold
 *     and a "NaN% off" badge beside it.
 *   · `original` below `amount`. That is a NEGATIVE discount, and the badge
 *     renders it without complaint: "-12% off" on a live rate card.
 *   · A locale left empty. The page has a hard language switch, so a tier
 *     saved with English only is a blank card for every Bengali reader and
 *     renders perfectly for the person who saved it. Both locales are required
 *     on every write for exactly that reason — this is the one rule here that
 *     will annoy an editor, and it is the one that stops the page shipping
 *     half-translated.
 *   · Unbounded feature lists. Nothing on this page is paginated; every row
 *     renders. Ten specs in a card is a card nobody reads.
 *
 * ── ⚑ WHERE THESE RULES ARE MIRRORED ─────────────────────────────────────
 * The field lists in str-frontend/app/(admin)/admin/packages/* must stay in
 * step with the caps below. The server is the source of truth: a field the
 * form sends and this file does not expect is not silently dropped, because
 * the models use typed sub-documents and Mongoose strips unknown paths — but
 * a cap the form does not show is a save that fails with a message the editor
 * cannot act on.
 */

const MAX_FEATURES = 8;
const MAX_ESSENTIALS = 8;
const MAX_SHOWCASE = 40;

/* Both locales, always. Spelled as a constant so a third locale is one edit
   here rather than a search for every "en"/"bn" pair in the file. */
const LOCALES = ["en", "bn"];

/** Required, trimmed, length-capped string at `path`. */
const text = (path, max, label) =>
  body(path)
    .exists({ checkNull: true })
    .withMessage(`${label} is required`)
    .bail()
    .isString()
    .withMessage(`${label} must be text`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .bail()
    .isLength({ max })
    .withMessage(`${label} must be ${max} characters or fewer`);

/** Optional string; "" clears the field, which is a valid state everywhere. */
const optionalText = (path, max, label) =>
  body(path)
    .optional({ values: "falsy" })
    .isString()
    .withMessage(`${label} must be text`)
    .bail()
    .trim()
    .isLength({ max })
    .withMessage(`${label} must be ${max} characters or fewer`);

/* ── Categories ───────────────────────────────────────────────────────── */

const categoryBody = (required) => {
  const string = required ? text : optionalText;
  return [
    (required ? text("key", 40, "Key") : optionalText("key", 40, "Key"))
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage("Key must be lowercase letters, digits and hyphens, e.g. wordpress"),

    body("icon")
      .optional()
      .isIn(PACKAGE_CATEGORY_ICONS)
      .withMessage(`icon must be one of: ${PACKAGE_CATEGORY_ICONS.join(", ")}`),

    body("order").optional().isInt({ min: -999, max: 999 }).withMessage("Order must be a whole number"),
    body("isActive").optional().isBoolean().withMessage("isActive must be true or false"),

    ...LOCALES.flatMap((l) => [
      string(`${l}.title`, 80, `${l.toUpperCase()} title`),
      optionalText(`${l}.platform`, 80, `${l.toUpperCase()} platform`),
      optionalText(`${l}.bestFor`, 500, `${l.toUpperCase()} "best for"`),
    ]),
  ];
};

export const createCategoryRules = categoryBody(true);
export const updateCategoryRules = [param("id").isMongoId().withMessage("Invalid id"), ...categoryBody(false)];

/* ── Tiers ────────────────────────────────────────────────────────────── */

/**
 * `original` must be a real list price.
 *
 * Runs as a body-level custom rather than on the field itself because it needs
 * both numbers at once, and because `amount` may be absent on a PATCH that
 * only touches `original` — in which case there is nothing to compare and the
 * rule correctly abstains. The schema's `min: 0` covers the rest.
 */
function checkDiscount(value) {
  const amount = value?.amount;
  const original = value?.original;
  if (original === undefined || original === null || original === "") return true;
  if (amount === undefined || amount === null) return true;
  if (Number(original) <= Number(amount)) {
    throw new Error("List price must be higher than the discounted amount");
  }
  return true;
}

const tierBody = (required) => {
  const string = required ? text : optionalText;
  return [
    (required ? text("code", 24, "Code") : optionalText("code", 24, "Code"))
      .matches(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/)
      .withMessage("Code must be letters, digits and hyphens, e.g. BIZ-02"),

    required
      ? body("category").isMongoId().withMessage("Pick a package track")
      : body("category").optional().isMongoId().withMessage("Pick a package track"),

    body("order").optional().isInt({ min: -999, max: 999 }).withMessage("Order must be a whole number"),
    body("highlighted").optional().isBoolean().withMessage("highlighted must be true or false"),
    body("isActive").optional().isBoolean().withMessage("isActive must be true or false"),

    required
      ? body("price").isObject().withMessage("Price is required")
      : body("price").optional().isObject().withMessage("Price must be an object"),

    /* isInt, not isFloat: these are published headline rates in whole taka.
       Accepting 40500.25 would render a decimal on a card that has no room for
       one and imply a precision the quote does not have. */
    required
      ? body("price.amount").isInt({ min: 0, max: 100_000_000 }).withMessage("Amount must be a whole number of taka")
      : body("price.amount")
          .optional()
          .isInt({ min: 0, max: 100_000_000 })
          .withMessage("Amount must be a whole number of taka"),

    /* `values: "falsy"` lets "" and null through: clearing the list price is
       how a discount is removed, and it must not be a validation error. */
    body("price.original")
      .optional({ values: "falsy" })
      .isInt({ min: 0, max: 100_000_000 })
      .withMessage("List price must be a whole number of taka"),

    body("price.from").optional().isBoolean().withMessage("from must be true or false"),
    body("price.custom").optional().isBoolean().withMessage("custom must be true or false"),
    body("price").optional().custom(checkDiscount),

    ...LOCALES.flatMap((l) => {
      const L = l.toUpperCase();
      return [
        string(`${l}.segment`, 40, `${L} segment`),
        string(`${l}.name`, 80, `${L} name`),
        optionalText(`${l}.badge`, 120, `${L} badge`),

        body(`${l}.features`)
          .optional()
          .isArray({ max: MAX_FEATURES })
          .withMessage(`${L} features: at most ${MAX_FEATURES} rows`),
        text(`${l}.features.*.label`, 60, `${L} feature label`),
        text(`${l}.features.*.value`, 400, `${L} feature value`),
      ];
    }),
  ];
};

export const createTierRules = tierBody(true);
export const updateTierRules = [param("id").isMongoId().withMessage("Invalid id"), ...tierBody(false)];

export const listTierRules = [query("category").optional().isMongoId().withMessage("Invalid category id")];

export const tierIdRules = [param("id").isMongoId().withMessage("Invalid id")];
export const categoryIdRules = [param("id").isMongoId().withMessage("Invalid id")];

/* ── Page copy ────────────────────────────────────────────────────────── */

/**
 * Every field here is optional and every one is capped.
 *
 * Optional because this is one form covering two locales and three blocks, and
 * an editor who has only written the English essentials band should be able to
 * save it. The page renders an empty block as an absent section rather than a
 * heading over nothing, so a half-filled document degrades rather than breaks.
 *
 * The exception is a showcase row: a link with no name, or a name with no
 * link, is not a partially-filled row, it is a card that cannot render.
 */
const localeCopyRules = (l) => {
  const L = l.toUpperCase();
  return [
    optionalText(`${l}.hero.eyebrow`, 60, `${L} eyebrow`),
    optionalText(`${l}.hero.title`, 160, `${L} headline`),
    optionalText(`${l}.hero.lede`, 600, `${L} lede`),
    optionalText(`${l}.hero.trust`, 300, `${L} trust line`),

    optionalText(`${l}.essentials.kicker`, 80, `${L} essentials kicker`),
    optionalText(`${l}.essentials.title`, 160, `${L} essentials title`),
    body(`${l}.essentials.items`)
      .optional()
      .isArray({ max: MAX_ESSENTIALS })
      .withMessage(`${L} essentials: at most ${MAX_ESSENTIALS} rows`),
    text(`${l}.essentials.items.*.title`, 120, `${L} essentials row title`),
    text(`${l}.essentials.items.*.value`, 400, `${L} essentials row body`),

    optionalText(`${l}.closing.title`, 160, `${L} closing title`),
    optionalText(`${l}.closing.body`, 600, `${L} closing body`),
    optionalText(`${l}.closing.primaryCta`, 60, `${L} primary CTA`),
    optionalText(`${l}.closing.secondaryCta`, 60, `${L} secondary CTA`),
  ];
};

export const upsertPackagePageRules = [
  body("en").optional().isObject().withMessage("en must be an object"),
  body("bn").optional().isObject().withMessage("bn must be an object"),
  ...LOCALES.flatMap(localeCopyRules),

  body("showcase")
    .optional()
    .isArray({ max: MAX_SHOWCASE })
    .withMessage(`At most ${MAX_SHOWCASE} showcase links`),
  text("showcase.*.name", 120, "Showcase name"),

  /* https only, and `require_protocol` so a pasted "innoelbd.com" is rejected
     rather than stored as a relative link that resolves to /packages/... . The
     card derives its hostname with new URL(), which throws on anything this
     rule would let past. */
  body("showcase.*.url")
    .exists({ checkNull: true })
    .withMessage("Showcase link is required")
    .bail()
    .isString()
    .bail()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Showcase link must be 300 characters or fewer")
    .bail()
    .isURL({ protocols: ["https"], require_protocol: true })
    .withMessage("Showcase link must be a full https:// URL"),

  body("showcase.*.group")
    .optional()
    .isIn(SHOWCASE_GROUPS)
    .withMessage(`group must be one of: ${SHOWCASE_GROUPS.join(", ")}`),

  /* `key` identifies the singleton and comes from the route, never the body —
     otherwise a PUT can create a second document that nothing will ever read. */
  body("key").not().exists().withMessage("key is fixed and cannot be sent in the body"),
];
