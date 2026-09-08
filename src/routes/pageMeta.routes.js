import { Router } from "express";
import * as ctrl from "../controllers/pageMeta.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import sanitizeHtml from "../middleware/sanitizeHtml.js";
import validate from "../middleware/validate.js";
import { upsertPageMetaRules } from "../validators/pageMeta.validator.js";

const router = Router();

router.get("/", protect, checkRole("super_admin", "admin"), ctrl.listPageMeta); // admin: all
router.get("/:identifier", ctrl.getPageMeta); // public: one page

/**
 * ── WHY sanitizeHtml RUNS ON PLAIN-TEXT FIELDS ───────────────────────────
 * These four are text, not rich text: they end up in <title>, <meta> and as
 * the hero copy on a page. They should never contain markup at all.
 *
 * Running them through sanitizeHtml with the standard allow-list strips any
 * tag an author pastes in — most often by copying a formatted string out of a
 * document — before it reaches the database. That is defence in depth rather
 * than the primary control: Next.js escapes metadata on output, and
 * dynamicHeroHeadline is rendered as a text node. But the database should
 * never hold a string we would not render, and "this field is safe because of
 * where it currently happens to be used" is a claim that expires the first
 * time someone reuses it somewhere else.
 */
router.put(
  "/:identifier",
  protect,
  checkRole("super_admin", "admin"),
  sanitizeHtml("metaTitle", "metaDescription", "dynamicHeroHeadline", "dynamicHeroSubtitle"),
  upsertPageMetaRules,
  validate,
  ctrl.upsertPageMeta
);

export default router;
