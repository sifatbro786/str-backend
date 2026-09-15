import { Router } from "express";

import * as ctrl from "../controllers/graphicsQuote.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.js";
import sanitize from "../middleware/sanitize.js";
import { quoteLimiter } from "../middleware/rateLimiters.js";
import { quoteFiles } from "../middleware/quoteUpload.js";
import {
  createGraphicsQuoteRules,
  updateGraphicsQuoteRules,
} from "../validators/graphicsQuote.validator.js";

const router = Router();

/**
 * Public order form — the middleware ORDER on this line is the security
 * boundary, not a style choice. Reading left to right:
 *
 *   quoteLimiter  Three per window per IP, BEFORE multer. An anonymous request
 *                 must cost a 429 before it costs 15MB of buffered upload;
 *                 putting the limiter after the parser means the flood is
 *                 already in memory by the time it is rejected.
 *
 *   quoteFiles    Parses the multipart body. Everything downstream of this
 *                 line depends on it having run, because `req.body` does not
 *                 exist on a multipart request until it has.
 *
 *   sanitize      ⚑ RUN AGAIN HERE, DELIBERATELY. app.js mounts sanitize
 *                 globally, but that runs immediately after express.json(),
 *                 which leaves `req.body` empty on a multipart request — so
 *                 the global pass scrubs nothing and the text fields multer
 *                 later writes have never been through it. Without this second
 *                 call, a field named `$ne` or `a.b` reaches Mongoose from a
 *                 public, unauthenticated endpoint. This is the only route on
 *                 the API that parses multipart with a body worth scrubbing;
 *                 /uploads reads no text fields at all.
 *
 *   rules         express-validator, for the same reason: it reads req.body.
 *
 * Getting any of these in the wrong order fails silently rather than loudly,
 * which is exactly why the reasoning is written down instead of assumed.
 */
router.post(
  "/",
  quoteLimiter,
  quoteFiles("files"),
  sanitize,
  createGraphicsQuoteRules,
  validate,
  ctrl.createGraphicsQuote
);

// Reading and triaging orders is admin-only, from here down.
router.use(protect, checkRole("super_admin", "admin"));
router.get("/", ctrl.listGraphicsQuotes);
router.get("/:id", ctrl.getGraphicsQuote);
router.patch("/:id", updateGraphicsQuoteRules, validate, ctrl.updateGraphicsQuote);
router.delete("/:id", ctrl.deleteGraphicsQuote);

export default router;
