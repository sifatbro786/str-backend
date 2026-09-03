import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    clientDesignation: { type: String, default: "" },
    companyName: { type: String, default: "" },
    clientAvatar: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    reviewText: { type: String, required: true },
    projectRef: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", testimonialSchema);
