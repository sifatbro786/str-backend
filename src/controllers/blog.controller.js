import Blog from "../models/Blog.js";
import * as factory from "../utils/handlerFactory.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiFeatures from "../utils/ApiFeatures.js";

/** GET /api/blogs — public feed; published posts only. */
export const listBlogs = asyncHandler(async (req, res) => {
  const features = new ApiFeatures(Blog.find({ isPublished: true }), req.query, {
    baseFilter: { isPublished: true }, // keeps the count query in sync
    allowedFilters: ["category", "tags"],
    allowedSort: ["publishedAt", "viewCount", "createdAt"],
    defaultSort: "-publishedAt",
    searchFields: ["title", "excerpt"],
  })
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  features.query = features.query.populate("author", "name avatar");
  const [data, total] = await features.execWithCount();
  res.json({ success: true, meta: features.buildMeta(total), data });
});

/** GET /api/blogs/:slug — public; increments viewCount atomically. */
export const getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug, isPublished: true },
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate("author", "name avatar")
    .lean();
  if (!blog) throw ApiError.notFound("Blog not found");
  res.json({ success: true, data: blog });
});

/** GET /api/blogs/admin/all — admin; includes drafts. */
export const listAllBlogs = factory.getAll(Blog, {
  allowedFilters: ["category", "tags", "isPublished"],
  allowedSort: ["publishedAt", "createdAt", "viewCount", "title"],
  defaultSort: "-createdAt",
  searchFields: ["title", "excerpt"],
  populate: { path: "author", select: "name avatar" },
});

export const createBlog = asyncHandler(async (req, res) => {
  // Author is always the authenticated user; never taken from the body.
  const blog = await Blog.create({ ...req.body, author: req.user._id });
  res.status(201).json({ success: true, data: blog });
});

export const updateBlog = factory.updateOne(Blog);
export const deleteBlog = factory.deleteOne(Blog);
