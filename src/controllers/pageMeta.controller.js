import PageMeta from "../models/PageMeta.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

/** GET /api/page-meta/:identifier — public SEO + hero copy for one page. */
export const getPageMeta = asyncHandler(async (req, res) => {
  const doc = await PageMeta.findOne({ pageIdentifier: req.params.identifier }).lean();
  if (!doc) throw ApiError.notFound("Page meta not found");
  res.json({ success: true, data: doc });
});

/** GET /api/page-meta — admin; every page's meta in one call. */
export const listPageMeta = asyncHandler(async (req, res) => {
  const data = await PageMeta.find().lean();
  res.json({ success: true, data });
});

/** PUT /api/page-meta/:identifier — admin upsert; one row per page. */
export const upsertPageMeta = asyncHandler(async (req, res) => {
  const doc = await PageMeta.findOneAndUpdate(
    { pageIdentifier: req.params.identifier },
    { ...req.body, pageIdentifier: req.params.identifier },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: doc });
});
