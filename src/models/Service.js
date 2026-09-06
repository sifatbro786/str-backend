import mongoose from "mongoose";
import slugify from "slugify";

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 120 },
    slug: { type: String, unique: true, index: true, lowercase: true },
    shortDescription: { type: String, trim: true, default: "" },
    detailedOverview: { type: String, default: "" },
    icon: { type: String, default: "" },
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
    this.slug = slugify(this.title, { lower: true, strict: true });
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

  const slug = slugify(title, { lower: true, strict: true });
  if (update.$set) update.$set.slug = slug;
  else update.slug = slug;
  this.setUpdate(update);
  next();
});

export default mongoose.model("Service", serviceSchema);
