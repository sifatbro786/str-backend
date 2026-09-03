import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    senderName: { type: String, required: true, trim: true },
    senderEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    phone: { type: String, default: "" },
    serviceInterested: { type: String, default: "" },
    // Client-stated lead budget, not one of our prices. No pricing or
    // package-cost fields exist anywhere in this schema set, by design.
    budgetRange: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new", index: true },
    notes: { type: String, default: "" }, // internal admin notes
  },
  { timestamps: true }
);

export default mongoose.model("Inquiry", inquirySchema);
