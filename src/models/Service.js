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
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Service", serviceSchema);
