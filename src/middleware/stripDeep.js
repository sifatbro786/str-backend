import DOMPurify from "isomorphic-dompurify";

/**
 * Strips ALL markup from every string anywhere inside the named body fields,
 * however deeply nested.
 *
 * ── WHY THIS EXISTS ALONGSIDE stripTags ──────────────────────────────────
 * middleware/stripTags.js walks exactly one level into an array, which is
 * everything SiteContent needs: `items` is a flat list of flat objects. The
 * packages payloads are not that shape. A tier write is
 *
 *   { en: { features: [ { label, value } ] }, bn: { … } }
 *
 * — object, object, array, object — so stripTags("en") would reach `en`, find
 * it is neither a string nor an array, and silently strip nothing. That is the
 * exact failure it warns about in its own header, and the reason this is a
 * second middleware rather than a flag on the first: changing stripTags to
 * recurse would quietly change behaviour for every SiteContent block that
 * currently relies on it stopping.
 *
 * Everything in the packages payload renders as a text node — headings, spec
 * values, CTA labels, feature copy. None of it goes through
 * dangerouslySetInnerHTML, so markup in the database is always a paste
 * accident, never intent, and the correct output is the text with the tags
 * gone rather than the text with "safe" tags kept.
 *
 *   router.put("/page", protect, stripDeep("en", "bn", "showcase"), rules, validate, ctrl.x);
 *
 * Wire it BEFORE `validate`, so the length rules measure the string that will
 * actually be stored — otherwise an author can pass a 400-character check with
 * markup that sanitises down to forty, or be rejected for copy that would have
 * fitted.
 *
 * ⚑ DOMPurify decodes escaped entities, so "&amp;" becomes "&". Correct for a
 * value React will escape again on output, wrong for one written into a
 * non-escaping context. Do not reuse this for one.
 *
 * ⚑ MAX_DEPTH is a guard, not a limit on the schema. A body nested deeper than
 * this has already been rejected by express.json's size cap in every realistic
 * case; the cap is here so a hostile payload cannot turn this into an
 * unbounded recursion.
 */

const PLAIN = { ALLOWED_TAGS: [], ALLOWED_ATTR: [], KEEP_CONTENT: true };
const MAX_DEPTH = 8;

function walk(value, depth) {
  if (typeof value === "string") return DOMPurify.sanitize(value, PLAIN).trim();
  if (depth >= MAX_DEPTH) return value;
  if (Array.isArray(value)) return value.map((v) => walk(v, depth + 1));

  // Plain objects only. A Date, a Buffer or anything with a prototype is left
  // alone — rebuilding one from its entries would quietly destroy it.
  if (value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, walk(v, depth + 1)]));
  }

  // Numbers, booleans and null pass through untouched; the validator is what
  // enforces their type.
  return value;
}

export default function stripDeep(...fields) {
  return function stripDeepMiddleware(req, _res, next) {
    if (!req.body || typeof req.body !== "object") return next();
    for (const field of fields) {
      if (!(field in req.body)) continue;
      req.body[field] = walk(req.body[field], 0);
    }
    next();
  };
}
