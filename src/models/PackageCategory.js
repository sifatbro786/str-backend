import mongoose from "mongoose";

/**
 * PackageCategory — one tab on /packages ("Business & Corporate", "Custom
 * E-Commerce", "WordPress Store", "Shopify Store").
 *
 * ── WHY THIS IS A COLLECTION AND NOT A SiteContent BLOCK ─────────────────
 * SiteContent stores flat, single-language rows validated by shape. Everything
 * on /packages is bilingual and two levels deep (category → tier → feature),
 * so a Mixed `items` array would push the entire contract into the validator
 * and leave Mongo with no opinion at all about a document that drives a
 * pricing page. Prices in particular should never be able to arrive as a
 * string.
 *
 * ── WHY en/bn ARE SUB-DOCUMENTS AND NOT A `translations` MAP ─────────────
 * The page renders exactly two locales and the switch is a hard requirement of
 * the route, not a growth plan. Two named paths mean Mongoose validates both,
 * a projection can ask for one, and the admin form is two columns. A Map keyed
 * by locale code buys a third language nobody has asked for at the cost of
 * every one of those.
 *
 * ⚑ `key` is the public identity of the tab: the frontend restores the open
 * category from it and the seed upserts on it. Renaming one silently changes
 * nothing on the page but breaks any link that carried it. Treat it as a slug.
 */

/** The icon set drawn in str-frontend/components/packages/PackageTiers.jsx. */
export const PACKAGE_CATEGORY_ICONS = ["business", "custom", "wordpress", "shopify", "seo", "mobile"];

const localeSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 80 },
    /* "Custom MERN / Next.js". Rendered beside the title as quiet type, so it
       is a platform note rather than a second heading. */
    platform: { type: String, trim: true, default: "", maxlength: 80 },
    bestFor: { type: String, trim: true, default: "", maxlength: 500 },
  },
  { _id: false }
);

const packageCategorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Key is required"],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Key must be lowercase letters, digits and hyphens"],
      maxlength: 40,
    },
    icon: { type: String, enum: PACKAGE_CATEGORY_ICONS, default: "custom" },

    /* Display order. Ties break on createdAt in the controller's sort so two
       categories left at 0 do not swap position between requests. */
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },

    en: { type: localeSchema, required: true },
    bn: { type: localeSchema, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("PackageCategory", packageCategorySchema);
