import asyncHandler from "./asyncHandler.js";
import ApiError from "./ApiError.js";
import ApiFeatures from "./ApiFeatures.js";

/**
 * Generic CRUD handlers. Modules only declare their filter/sort whitelists and
 * any custom logic (blog view-count, inquiry status, page-meta upsert), so the
 * plumbing is written once and behaves identically across resources.
 */

/** Paginated list with whitelisted filter/search/sort + meta. */
export const getAll = (Model, opts = {}) =>
  asyncHandler(async (req, res) => {
    const base = opts.baseFilter ?? {};
    const features = new ApiFeatures(Model.find(base), req.query, opts)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    if (opts.populate) features.query = features.query.populate(opts.populate);

    const [data, total] = await features.execWithCount();
    res.json({ success: true, meta: features.buildMeta(total), data });
  });

/** Single document by _id (default) or slug. */
export const getOne = (Model, { by = "_id", populate } = {}) =>
  asyncHandler(async (req, res) => {
    const q =
      by === "slug"
        ? Model.findOne({ slug: req.params.slug })
        : Model.findById(req.params.id);
    if (populate) q.populate(populate);

    const doc = await q.lean();
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    res.json({ success: true, data: doc });
  });

export const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ success: true, data: doc });
  });

export const updateOne = (Model, { by = "_id" } = {}) =>
  asyncHandler(async (req, res) => {
    const filter = by === "slug" ? { slug: req.params.slug } : { _id: req.params.id };
    const doc = await Model.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    res.json({ success: true, data: doc });
  });

export const deleteOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
    res.json({ success: true, message: `${Model.modelName} deleted` });
  });
