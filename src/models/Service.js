import mongoose from "mongoose";
import toSlug from "../utils/slug.js";

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 120 },
    slug: { type: String, unique: true, index: true, lowercase: true },
    shortDescription: { type: String, trim: true, default: "" },
    detailedOverview: { type: String, default: "" },

    /**
     * Artwork, owned by the record rather than by a hardcoded map on the
     * frontend.
     *
     * ── WHY A STRING AND NOT A SUB-DOCUMENT ──────────────────────────────
     * One image per service, which is what the homepage preview, the /services
     * row and the detail figure all render. A { url, width, height } object
     * would buy intrinsic sizing, but every consumer here uses `fill` inside a
     * fixed aspect-ratio box, so the dimensions would be stored and never read.
     * Project.coverImage is the same shape, and matching it means the admin
     * upload widget is one component, not two.
     *
     * Holds either an uploaded path ("/uploads/services/xyz.webp", served by
     * this API) or an absolute URL if the artwork ever moves to a CDN. The
     * frontend resolves the relative form against the API origin; see
     * str-frontend/lib/utils.js → mediaUrl().
     */
    image: { type: String, trim: true, default: "" },

    /**
     * Alt text is a separate field on purpose. Falling back to the title reads
     * as "Website Development" on a photograph of a team at a desk, which is a
     * description of the link and not of the picture. Empty means the image is
     * rendered decoratively (alt=""), which is the correct default for a
     * card thumbnail that sits next to its own heading.
     */
    imageAlt: { type: String, trim: true, default: "", maxlength: 160 },

    featuresList: { type: [String], default: [] },
    deliverableTimeline: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

serviceSchema.pre("validate", function (next) {
  // An explicitly supplied slug wins over the derived one — see the longer
  // note on the same hook in Project.js. Only the seeder uses that path; the
  // admin API never sends `slug`.
  if (!this.slug || (this.isModified("title") && !this.isModified("slug"))) {
    this.slug = toSlug(this.title);
  }
  next();
});

/**
 * findOneAndUpdate does not fire pre('validate'), so a title change coming
 * from the admin PATCH would otherwise keep the stale slug forever.
 *
 * Regenerating changes the public URL. That is the correct trade for an agency
 * site where slugs are corrected shortly after publishing; if a redirect table
 * is ever added, emit the old slug here instead of dropping it.
 */
serviceSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};
  const title = update.title ?? update.$set?.title;
  if (!title) return next();

  const slug = toSlug(title);
  if (update.$set) update.$set.slug = slug;
  else update.slug = slug;
  this.setUpdate(update);
  next();
});

export default mongoose.model("Service", serviceSchema);
