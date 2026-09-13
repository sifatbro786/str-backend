import { Router } from "express";
import * as ctrl from "../controllers/package.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";
import stripDeep from "../middleware/stripDeep.js";
import validate from "../middleware/validate.js";
import {
  createCategoryRules,
  updateCategoryRules,
  categoryIdRules,
  createTierRules,
  updateTierRules,
  listTierRules,
  tierIdRules,
  upsertPackagePageRules,
} from "../validators/package.validator.js";

const router = Router();

/**
 * ── ROUTE ORDER MATTERS HERE ⚑ ───────────────────────────────────────────
 * There is no "/:slug" on this router, and there must not be one. Every admin
 * path below starts with a literal segment — /categories, /tiers, /page — and
 * adding a public "/:something" later would swallow all three. If a per-tier
 * public detail route is ever needed, mount it under /tiers/:code so the
 * literal prefix keeps doing that work.
 *
 * ── WHY THE PUBLIC READ IS THE BARE ROOT ─────────────────────────────────
 * str-frontend/lib/api.js calls it once per ISR revalidation with the
 * "packages" cache tag, and the response is the whole page. See the header of
 * the controller for why it is shaped rather than generic.
 */
router.get("/", ctrl.getPackagesPage);

/* Everything below is the dashboard. Same gate as site-content: signed in and
   an admin role. This is published pricing — the surface that decides what a
   client is told a project costs — so there is no delegated permission for it
   and no editor-level bypass. */
router.use(protect, checkRole("super_admin", "admin"));

/* ── Page copy ────────────────────────────────────────────────────────────
   Declared before /categories and /tiers only for readability; "page" cannot
   collide with either.

   stripDeep, not stripTags: this payload nests objects inside objects inside
   arrays, and stripTags stops one level into an array — it would reach `en`,
   find it is neither a string nor an array, and silently strip nothing. See
   the header of middleware/stripDeep.js.

   It runs BEFORE the rules so the length caps measure the stripped string. */
router.get("/page", ctrl.getPackagePage);
router.put("/page", stripDeep("en", "bn", "showcase"), upsertPackagePageRules, validate, ctrl.upsertPackagePage);

/* ── Categories ───────────────────────────────────────────────────────── */
router.get("/categories", ctrl.listCategories);
router.post("/categories", stripDeep("en", "bn"), createCategoryRules, validate, ctrl.createCategory);
router.patch("/categories/:id", stripDeep("en", "bn"), updateCategoryRules, validate, ctrl.updateCategory);
router.delete("/categories/:id", categoryIdRules, validate, ctrl.deleteCategory);

/* ── Tiers ────────────────────────────────────────────────────────────── */
router.get("/tiers", listTierRules, validate, ctrl.listTiers);
router.post("/tiers", stripDeep("en", "bn"), createTierRules, validate, ctrl.createTier);
router.patch("/tiers/:id", stripDeep("en", "bn"), updateTierRules, validate, ctrl.updateTier);
router.delete("/tiers/:id", tierIdRules, validate, ctrl.deleteTier);

export default router;
