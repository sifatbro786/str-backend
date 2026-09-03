/**
 * Strips MongoDB operator injection ($-prefixed keys, dotted keys) from
 * body/params/query.
 *
 * Mutates the objects in place rather than reassigning them, so it works on
 * Express 4 AND Express 5 (where `req.query` is a getter-only property).
 * Replaces express-mongo-sanitize, which throws on Express 5.
 */
function scrub(obj) {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }
    const val = obj[key];
    if (val && typeof val === "object") scrub(val);
  }
}

export default function sanitize(req, _res, next) {
  scrub(req.body);
  scrub(req.params);
  scrub(req.query); // in-place; never reassign req.query
  next();
}
