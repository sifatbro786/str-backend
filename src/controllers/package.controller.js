import mongoose from "mongoose";
import Package from "../models/Package.js";
import PackageCategory from "../models/PackageCategory.js";
import PackagePage from "../models/PackagePage.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

/**
 * /packages — the bilingual pricing route.
 *
 * ── WHY THE PUBLIC READ IS ONE HAND-SHAPED ENDPOINT ──────────────────────
 * handlerFactory.getAll is the right tool for a paginated, filterable,
 * sortable list that a client narrows down. This is the opposite: one page
 * renders the whole dataset, always, in a fixed nesting, and it renders it on
 * the server during ISR. Exposing /packages/categories and /packages/tiers
 * publicly and joining them in the frontend would be three round trips from
 * the Next server to build one page, plus the grouping logic living in the
 * consumer where a second consumer would have to repeat it.
 *
 * So the public contract is the page's shape:
 *
 *   { page: {…} | null, categories: [ { key, icon, en, bn, tiers: [ … ] } ] }
 *
 * ── WHY BOTH LOCALES ARE ALWAYS SENT ─────────────────────────────────────
 * The language switch on the page is instant and client-side; it does not
 * refetch. Sending one locale would make every toggle a network round trip on
 * a page whose entire payload is a few kilobytes of text. The whole thing is
 * cheaper than the request that would fetch half of it.
 *
 * ── WHY EMPTY CATEGORIES ARE DROPPED ─────────────────────────────────────
 * A tab that opens onto nothing is worse than an absent tab: the reader clicks
 * it, sees a blank grid, and concludes the page is broken. Deactivating every
 * tier under a category is therefore the same thing as retiring the category,
 * which is what an editor means when they do it.
 */

/* Sent to the browser. Timestamps, __v and the category ObjectId are read by
   nothing on the page and are bytes crossing the boundary on every request. */
const TIER_FIELDS = "code order highlighted price en bn category";
const CATEGORY_FIELDS = "key icon order en bn";

/** GET /api/v1/packages — public. The whole page in one call. */
export const getPackagesPage = asyncHandler(async (_req, res) => {
  const [page, categories, tiers] = await Promise.all([
    PackagePage.findOne({ key: "default" }).select("-_id en bn showcase updatedAt").lean(),
    /* createdAt is the tiebreaker on both sorts. Without it two rows left at
       order 0 can swap places between requests — Mongo makes no promise about
       the order of equal sort keys — and a pricing page that reshuffles itself
       on refresh reads as a bug to anyone who notices. */
    PackageCategory.find({ isActive: true })
      .select(CATEGORY_FIELDS)
      .sort({ order: 1, createdAt: 1 })
      .lean(),
    Package.find({ isActive: true }).select(TIER_FIELDS).sort({ order: 1, createdAt: 1 }).lean(),
  ]);

  const byCategory = new Map();
  for (const tier of tiers) {
    const id = String(tier.category);
    if (!byCategory.has(id)) byCategory.set(id, []);
    const { _id, category, ...rest } = tier;
    byCategory.get(id).push(rest);
  }

  const data = categories
    .map((category) => ({
      key: category.key,
      icon: category.icon,
      en: category.en,
      bn: category.bn,
      tiers: byCategory.get(String(category._id)) ?? [],
    }))
    .filter((category) => category.tiers.length > 0);

  res.json({ success: true, data: { page: page ?? null, categories: data } });
});

/* ── Categories (admin) ───────────────────────────────────────────────── */

/**
 * GET /api/v1/packages/categories — admin.
 *
 * Unpaginated and unfiltered, inactive rows included. There are four of these
 * and there will never be twenty; the editor needs to see the deactivated ones
 * precisely because deactivating is how a track is retired, and a screen that
 * hides them makes that irreversible from the dashboard.
 */
export const listCategories = asyncHandler(async (_req, res) => {
  const data = await PackageCategory.find().sort({ order: 1, createdAt: 1 }).lean();
  res.json({ success: true, data });
});

export const createCategory = asyncHandler(async (req, res) => {
  const doc = await PackageCategory.create(req.body);
  res.status(201).json({ success: true, data: doc });
});

export const updateCategory = asyncHandler(async (req, res) => {
  /* `key` is intentionally updatable, unlike the slugs elsewhere in this API:
     it is not a public URL, only the id the page uses to restore the open tab,
     and an editor who typed "buisness" has no other way to fix it. */
  const doc = await PackageCategory.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw ApiError.notFound("Package category not found");
  res.json({ success: true, data: doc });
});

/**
 * DELETE /api/v1/packages/categories/:id — admin.
 *
 * Refuses while tiers still point at it. Cascading instead would delete priced
 * packages as a side effect of tidying a tab, from a screen whose delete
 * confirmation says nothing about them. The 409 names the count so the editor
 * knows what they are actually being asked to decide.
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const tiers = await Package.countDocuments({ category: req.params.id });
  if (tiers > 0) {
    throw ApiError.conflict(
      `This track still has ${tiers} package${tiers === 1 ? "" : "s"}. Move or delete them first.`
    );
  }

  const doc = await PackageCategory.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound("Package category not found");
  res.json({ success: true, message: "Package category deleted" });
});

/* ── Tiers (admin) ────────────────────────────────────────────────────── */

/**
 * GET /api/v1/packages/tiers — admin. Optional ?category=<id> filter.
 *
 * The category is returned populated down to key and title only. The admin
 * table shows which track a tier belongs to, and a second request per row to
 * resolve twelve ObjectIds into four names is the n+1 this avoids.
 */
export const listTiers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) {
    if (!mongoose.isValidObjectId(req.query.category)) {
      throw ApiError.badRequest("category must be a valid id");
    }
    filter.category = req.query.category;
  }

  const data = await Package.find(filter)
    .populate("category", "key en.title")
    .sort({ order: 1, createdAt: 1 })
    .lean();

  res.json({ success: true, data });
});

/** Rejects a tier pointed at a category that does not exist. */
async function assertCategoryExists(id) {
  if (!id) return;
  const exists = await PackageCategory.exists({ _id: id });
  if (!exists) throw ApiError.badRequest("That package track no longer exists");
}

export const createTier = asyncHandler(async (req, res) => {
  await assertCategoryExists(req.body.category);
  const doc = await Package.create(req.body);
  res.status(201).json({ success: true, data: doc });
});

export const updateTier = asyncHandler(async (req, res) => {
  await assertCategoryExists(req.body.category);
  const doc = await Package.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw ApiError.notFound("Package not found");
  res.json({ success: true, data: doc });
});

export const deleteTier = asyncHandler(async (req, res) => {
  const doc = await Package.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound("Package not found");
  res.json({ success: true, message: "Package deleted" });
});

/* ── Page copy (admin) ────────────────────────────────────────────────── */

/**
 * GET /api/v1/packages/page — admin.
 *
 * An unseeded database answers 200 with an empty document rather than 404. The
 * editor is an upsert form: "nobody has filled this in yet" is its normal
 * first state, not an error, and a 404 here would make the screen render its
 * error branch on a perfectly healthy install.
 */
export const getPackagePage = asyncHandler(async (_req, res) => {
  const doc = await PackagePage.findOne({ key: "default" }).lean();
  res.json({
    success: true,
    data: doc ?? { key: "default", en: {}, bn: {}, showcase: [] },
  });
});

/**
 * PUT /api/v1/packages/page — admin. Replaces the copy wholesale.
 *
 * Replace, not merge: `showcase` and `essentials.items` are ordered lists
 * edited as a unit in one form. A merge would make deleting the last row
 * impossible and reordering ambiguous.
 */
export const upsertPackagePage = asyncHandler(async (req, res) => {
  const doc = await PackagePage.findOneAndUpdate(
    { key: "default" },
    {
      key: "default",
      en: req.body.en,
      bn: req.body.bn,
      showcase: req.body.showcase ?? [],
      updatedBy: req.user?._id ?? null,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  res.json({ success: true, data: doc });
});
