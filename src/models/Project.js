import mongoose from "mongoose";
import slugify from "slugify";

const techStackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "" },
    category: { type: String, default: "" }, // frontend | backend | devops | ...
  },
  { _id: false }
);

const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, default: "" },
    layoutType: { type: String, enum: ["full", "half", "grid"], default: "full" },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 160 },
    slug: { type: String, unique: true, index: true, lowercase: true },
    subtitle: { type: String, trim: true, default: "" },
    shortDescription: { type: String, trim: true, maxlength: 400, default: "" },
    fullCaseStudy: { type: String, default: "" }, // Markdown / HTML
    clientName: { type: String, trim: true, default: "" },
    projectDate: { type: Date },

    serviceType: {
      type: String,
      required: true,
      index: true,
      enum: [
        "web-development",
        "mobile-app",
        "ui-ux-design",
        "custom-software",
        "cloud-devops",
        "cybersecurity",
      ],
    },
    tags: { type: [String], default: [], index: true },

    techStack: { type: [techStackSchema], default: [] },
    deliverables: { type: [String], default: [] },

    liveUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    figmaUrl: { type: String, default: "" },
    appStoreUrl: { type: String, default: "" },
    playStoreUrl: { type: String, default: "" },

    coverImage: { type: String, default: "" },
    thumbnailImage: { type: String, default: "" },
    galleryImages: { type: [galleryImageSchema], default: [] },

    // GSAP / presentation metadata consumed by the frontend case-study page.
    accentColor: {
      type: String,
      default: "#007BFF",
      match: [/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "accentColor must be a hex color"],
    },
    layoutStyle: { type: String, enum: ["full-width", "bento", "split"], default: "full-width" },
    animationTrigger: {
      type: String,
      enum: ["fade-up", "pinned-scroll", "3d-tilt"],
      default: "fade-up",
    },
    featured: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0, index: true },

    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound index backing the default "featured first, then manual order" sort.
projectSchema.index({ featured: 1, displayOrder: 1 });

// Slug is generated once and stays stable across title edits unless the title
// itself changes, so published URLs (and their SEO) survive content edits.
projectSchema.pre("validate", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Project", projectSchema);
