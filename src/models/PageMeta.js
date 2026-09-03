import mongoose from "mongoose";

const pageMetaSchema = new mongoose.Schema(
  {
    pageIdentifier: {
      type: String,
      required: true,
      unique: true,
      index: true,
      enum: ["home", "about", "services", "projects", "contact"],
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
