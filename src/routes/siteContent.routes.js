import { Router } from "express";
import * as ctrl from "../controllers/siteContent.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import stripTags from "../middleware/stripTags.js";
import validate from "../middleware/validate.js";
import { upsertSiteContentRules } from "../validators/siteContent.validator.js";

const router = Router();

/* Both reads are public: this is the copy on the marketing pages, and the
   frontend fetches it during static generation with no session. */
router.get("/", ctrl.listSiteContent);
router.get("/:key", ctrl.getSiteContent);

/**
 * ── WHY stripTags AND NOT sanitizeHtml ───────────────────────────────────
 * Everything in these blocks renders as a text node — FAQ answers included.
 * None of it is rich text and none of it goes through
 * dangerouslySetInnerHTML, so markup in the database is always a paste
 * accident, never intent. sanitizeHtml would keep a prose allow-list we do not
 * want, and it only walks flat req.body fields, so it cannot reach inside
 * `items` at all.
 *
 * ⚑ If a block ever does need rich text — a formatted FAQ answer is the likely
 * first request — this line has to change deliberately, and the frontend has
 * to render that field through the same sanitized-HTML path the blog body
 * uses. Do not simply drop the middleware.
 */
router.put(
  "/:key",
  protect,
  checkRole("super_admin", "admin"),
  stripTags("items"),
  upsertSiteContentRules,
  validate,
  ctrl.upsertSiteContent
);

export default router;
