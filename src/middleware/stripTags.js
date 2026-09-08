import DOMPurify from "isomorphic-dompurify";

/**
 * Strips ALL markup from every string inside an array-of-objects body field.
 *
 * ── HOW THIS DIFFERS FROM sanitizeHtml ───────────────────────────────────
 * sanitizeHtml() keeps a prose allow-list, because the fields it guards are
 * rich text rendered through dangerouslySetInnerHTML. This one keeps nothing.
 * It exists for fields that are plain text by contract — SiteContent's labels,
 * FAQ answers, process bodies — where markup in the database is always a paste
 * accident and never intent. The correct output is the text with the tags
 * gone, not the text with "safe" tags kept.
 *
 * It also walks one level into an array, which sanitizeHtml deliberately does
 * not: sanitizeHtml takes flat field names off req.body and a wildcard path
 * like "items.*.q" silently matches nothing there. Passing such a path to it
 * looks correct in a route file and sanitizes exactly zero fields, which is
 * the specific mistake this middleware exists to make impossible.
 *
 *   router.put("/:key", protect, stripTags("items"), rules, validate, ctrl.x);
 *
 * Wire it BEFORE `validate`, so length rules measure the stripped string.
 * Non-string values (numbers, booleans) pass through untouched — the validator
 * is what enforces their type.
 *
 * ⚑ Escaped entities are decoded by DOMPurify, so "&amp;" becomes "&". That is
 * correct for a value React will escape again on output, and wrong for a value
 * written straight into a non-escaping context. Do not reuse this for one.
 */
const PLAIN = { ALLOWED_TAGS: [], ALLOWED_ATTR: [], KEEP_CONTENT: true };

const strip = (v) => (typeof v === "string" ? DOMPurify.sanitize(v, PLAIN).trim() : v);

export default function stripTags(...fields) {
  return function stripTagsMiddleware(req, _res, next) {
    for (const field of fields) {
      const value = req.body?.[field];

      if (typeof value === "string") {
        req.body[field] = strip(value);
        continue;
      }

      if (!Array.isArray(value)) continue;

      req.body[field] = value.map((item) => {
        // Anything that is not a plain object is left alone; the validator
        // rejects it a moment later with a message naming the index.
        if (item === null || typeof item !== "object" || Array.isArray(item)) return item;
        return Object.fromEntries(Object.entries(item).map(([k, v]) => [k, strip(v)]));
      });
    }
    next();
  };
}
