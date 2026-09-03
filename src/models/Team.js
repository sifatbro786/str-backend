import mongoose from "mongoose";

const socialSchema = new mongoose.Schema(
  {
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    twitter: { type: String, default: "" },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, default: "" },
    bio: { type: String, default: "" },
    image: { type: String, default: "" },
    socialLinks: { type: socialSchema, default: () => ({}) },
    displayOrder: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
