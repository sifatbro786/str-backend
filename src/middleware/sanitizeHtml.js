import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes rich-text fields on admin writes. Server-side and on write, not on
 * read: the database should never hold a string we would not render.
 *
 * The allow-list matches what .prose-str in str-frontend/app/globals.css can
 * actually style. Anything else — <script>, <style>, <iframe>, event handlers,
 * javascript: URLs — is stripped by DOMPurify's default config; the config here
 * only narrows it further.
 *
 *   router.post("/", protect, sanitizeHtml("content"), validate, ctrl.create);
 *
 * Wire it BEFORE `validate` so length rules run on the sanitized string. Once
 * this ships, the three dangerouslySetInnerHTML call sites in str-frontend are
 * safe and must stay unsanitized on the client — double sanitizing with two
 * different allow-lists is how content silently loses markup that nobody can
 * explain six months later.
 */
const CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "u", "s", "blockquote", "code", "pre",
    "h2", "h3", "h4", "ul", "ol", "li", "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td", "hr", "span",
  ],
  ALLOWED_ATTR: ["href", "title", "target", "rel", "src", "alt", "width", "height", "colspan", "rowspan"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
  FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
};

export default function sanitizeHtml(...fields) {
  return function sanitizeHtmlMiddleware(req, _res, next) {
    for (const field of fields) {
      if (typeof req.body?.[field] === "string") {
        req.body[field] = DOMPurify.sanitize(req.body[field], CONFIG);
      }
    }
    next();
  };
}
