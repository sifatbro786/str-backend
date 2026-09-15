import mongoose from "mongoose";

const pageMetaSchema = new mongoose.Schema(
  {
    pageIdentifier: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // ⚑ Mirrored in validators/pageMeta.validator.js (IDENTIFIERS) and in
      // str-frontend/app/(admin)/admin/page-meta/page.js. All three move
      // together: this one alone rejects the write at the schema, the
      // validator alone rejects it with a 400, and the admin list alone means
      // nobody can reach the editor for it.
      enum: [
        "home",
        "about",
        "services",
        "projects",
        "portfolio",
        // The image production line. Not in the navbar, same as portfolio.
        "graphics",
        "packages",
        "blogs",
        "contact",
      ],
    },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    ogImage: { type: String, default: "" },
    dynamicHeroHeadline: { type: String, default: "" },
    dynamicHeroSubtitle: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("PageMeta", pageMetaSchema);
