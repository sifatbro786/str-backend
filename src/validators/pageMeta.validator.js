import { body, param } from "express-validator";
import { mediaField } from "./media.js";

/**
 * Page-meta write rules.
 *
 * ── WHY THIS MATTERS MORE THAN IT LOOKS ──────────────────────────────────
 * This is the one collection a non-developer edits that lands directly in
 * <head>. str-frontend/lib/seo.js reads these rows and puts metaTitle into
 * <title>, metaDescription into <meta name="description">, and ogImage into
 * og:image and twitter:image. It had no validator at all.
 *
 * Next.js escapes what it writes into metadata, so this was not an injection
 * hole. The risks are different and duller, and they are the ones that
 * actually cost traffic:
 *
 *   · ogImage is passed to `new URL()` in lib/seo.js. A malformed value
 *     throws at render time and takes the whole route down with it — a
 *     typo in a dashboard field becoming a 500 on a public page.
 *   · A `javascript:` or `data:` ogImage is not executable in a meta tag,
 *     but it is served to every crawler and social scraper that reads the
 *     page, and some of them will flag the domain for it.
 *   · Over-length titles and descriptions get silently truncated by Google
 *     mid-word. Rejecting them at the point of writing is the only moment
 *     anyone can act on it.
 *
 * ── ON THE LENGTH CAPS ⚑ ─────────────────────────────────────────────────
 * 60 and 160 are the conventional SERP display limits and they are advisory,
 * not laws — Google measures pixels, not characters. They are enforced here
 * anyway because a soft guideline nobody enforces is a guideline that drifts,
 * and the admin form should show the counter next to the same numbers.
 */

/* ⚑ Must match the schema enum in models/PageMeta.js and the admin list in
   str-frontend/app/(admin)/admin/page-meta/page.js. See the note on the
   schema field. */
const IDENTIFIERS = [
  "home",
  "about",
  "services",
  "projects",
  // ⚑ "overview" was removed. The route still exists but renders /packages'
  // page and reads the "packages" row, so there is nothing to edit under its
  // own key. The stored row needs a one-time migration — see the note on the
  // schema enum in models/PageMeta.js; dropping the value here does not move
  // the document.
  "graphics",
  "packages",
  "blogs",
  "contact",
];

export const upsertPageMetaRules = [
  /* The route is an upsert keyed on this param, so it is the primary key of
     the write. Validating it against the same enum as the schema turns a
     silently-created junk row into a 400. */
  param("identifier")
    .isIn(IDENTIFIERS)
    .withMessage(`identifier must be one of: ${IDENTIFIERS.join(", ")}`),

  /* ⚑ 44, not 60. The rendered <title> is NOT this field — str-frontend's
     lib/seo.js appends " | STR Solutions" (16 characters) unless the title
     already names the brand. A 60-character value passing this rule produced a
     76-character title, so the form went green and the SERP still truncated.
     44 + 16 = 60, which is the number the guidance actually refers to.

     Keep this in step with TITLE_BRAND in str-frontend/lib/seo.js and with the
     counter in str-frontend/app/(admin)/admin/page-meta/page.js. If the brand
     string changes length, this number changes with it. */
  body("metaTitle")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 44 })
    .withMessage(
      "Meta title should be 44 characters or fewer — the site appends ' | STR Solutions' (16) and Google truncates past 60"
    ),

  body("metaDescription")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 160 })
    .withMessage("Meta description should be 160 characters or fewer"),

  body("keywords").optional().isArray({ max: 20 }).withMessage("At most 20 keywords"),
  body("keywords.*").optional().isString().trim().isLength({ max: 60 }),

  /* Absolute https URL, or a site-relative path. Both are legitimate —
     lib/seo.js resolves relative paths against site.url — but anything else
     (protocol-relative, javascript:, data:) is rejected outright rather than
     normalised, because guessing at what an author meant is how a bad value
     survives into production looking intentional. */
  /* Now the shared rule. The local one accepted /^\/[^\s]*$/, which passes
     "/" and "/../../etc" — harmless in a meta tag, but it is the same field
     the admin form now uploads into, and one definition beats two. */
  mediaField("ogImage"),

  body("dynamicHeroHeadline")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 120 })
    .withMessage("Hero headline must be 120 characters or fewer"),

  body("dynamicHeroSubtitle")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 280 })
    .withMessage("Hero subtitle must be 280 characters or fewer"),

  /* pageIdentifier comes from the URL param, never the body. Accepting it in
     both places means an author can PUT /page-meta/home with a body saying
     "contact" and silently rewrite the wrong row. */
  body("pageIdentifier")
    .not()
    .exists()
    .withMessage("pageIdentifier is taken from the URL and cannot be sent in the body"),
];
