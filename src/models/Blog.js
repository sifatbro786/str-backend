import mongoose from "mongoose";
import slugify from "slugify";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, unique: true, index: true, lowercase: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true, maxlength: 400, default: "" },
    coverImage: { type: String, default: "" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, trim: true, default: "", index: true },
    tags: { type: [String], default: [], index: true },
    viewCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

// Backs the public feed: published posts, newest first.
blogSchema.index({ isPublished: 1, publishedAt: -1 });

blogSchema.pre("validate", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Keep publishedAt in sync on document .save()
blogSchema.pre("save", function (next) {
  if (this.isModified("isPublished")) {
    this.publishedAt = this.isPublished ? this.publishedAt || new Date() : null;
  }
  next();
});

// ...and on findOneAndUpdate (admin PATCH toggling publish).
blogSchema.pre("findOneAndUpdate", function (next) {
  const u = this.getUpdate() || {};
  if (u.isPublished === true) u.publishedAt = u.publishedAt || new Date();
  else if (u.isPublished === false) u.publishedAt = null;
  this.setUpdate(u);
  next();
});

export default mongoose.model("Blog", blogSchema);
