import SiteContent, { SITE_CONTENT_KEYS } from "../models/SiteContent.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

/**
 * GET /api/v1/site-content — public. Every block in one call.
 *
 * Returned as a keyed object rather than an array because that is how it is
 * consumed: the frontend wants `data.metrics`, never a scan. A key with no row
 * yet is present and empty, so a caller can rely on the shape existing.
 */
export const listSiteContent = asyncHandler(async (_req, res) => {
  const rows = await SiteContent.find().select("key items updatedAt").lean();

  const data = Object.fromEntries(SITE_CONTENT_KEYS.map((k) => [k, { items: [], updatedAt: null }]));
  for (const row of rows) {
    data[row.key] = { items: row.items ?? [], updatedAt: row.updatedAt };
  }

  res.json({ success: true, data });
});

/**
 * GET /api/v1/site-content/:key — public, one block.
 *
 * A key that exists in the enum but has no row yet returns an empty list, not
 * a 404. The frontend falls back to static content on any thrown error, and an
 * intentionally-empty block is not an error — 404 here would mean "the API is
 * broken" to lib/api.js when the truth is "nobody has filled this in".
 */
export const getSiteContent = asyncHandler(async (req, res) => {
  const { key } = req.params;
  if (!SITE_CONTENT_KEYS.includes(key)) throw ApiError.notFound("Unknown content key");

  const row = await SiteContent.findOne({ key }).select("key items updatedAt").lean();
  res.json({
    success: true,
    data: { key, items: row?.items ?? [], updatedAt: row?.updatedAt ?? null },
  });
});

/**
 * PUT /api/v1/site-content/:key — admin. Replaces the block wholesale.
 *
 * Replace, not merge: these are ordered lists edited as a unit in one form,
 * and order is meaningful (process steps, marquee rows). A merge would make
 * deleting the last item impossible and reordering ambiguous.
 *
 * Reaching this handler means upsertSiteContentRules already checked every
 * item against the shape for this key — see the note in the validator about
 * why that is the only guard `items` has.
 */
export const upsertSiteContent = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const doc = await SiteContent.findOneAndUpdate(
    { key },
    { key, items: req.body.items, updatedBy: req.user?._id ?? null },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  res.json({ success: true, data: { key: doc.key, items: doc.items, updatedAt: doc.updatedAt } });
});
