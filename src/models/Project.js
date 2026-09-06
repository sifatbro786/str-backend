import mongoose from "mongoose";
import slugify from "slugify";

/**
 * Canonical service taxonomy. Mirrors str-frontend/lib/taxonomy.js exactly —
 * slugs on both sides come from slugify(title, { lower: true, strict: true }),
 * so they cannot drift as long as this list and that one match.
 *
 * Phase 3 dropped `cloud-devops` and `cybersecurity` (never sold as standalone
 * engagements) and added the three production disciplines the assets in
 * str-frontend/public/ show STR actually delivers.
 */
export const SERVICE_TYPES = [
  "web-development",
  "custom-software",
  "mobile-applications",
  "product-design",
  "graphics-design",
  "architectural-visualization",
  "digital-marketing",
];

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

    serviceTypes: {
      type: [String],
      required: true,
      index: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0 && v.length <= 4,
        message: "A project needs between 1 and 4 service types",
      },
      enum: {
        values: SERVICE_TYPES,
        message: "{VALUE} is not a supported service type",
      },
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

// Backs the filtered public list: equality on serviceTypes, then the sort keys.
// Without this, `?serviceTypes=x` + `sort(-featured -displayOrder)` does an
// in-memory sort that hard-fails at the 32MB blocking-sort limit.
projectSchema.index({ serviceTypes: 1, featured: -1, displayOrder: 1 });

// Read-compat for any consumer still expecting the scalar field.
//
// NOTE: handlerFactory.getAll/getOne end in .lean(), and virtuals do not run on
// lean documents — so `serviceType` appears on POST/PATCH responses and is
// absent from GET responses. That asymmetry is deliberate: this virtual is a
// safety net for internal code, not a public API guarantee. Never rely on
// `serviceType` in a response body; read serviceTypes[0].
projectSchema.virtual("serviceType").get(function () {
  return this.serviceTypes?.[0] ?? null;
});
projectSchema.set("toJSON", { virtuals: true });
projectSchema.set("toObject", { virtuals: true });

// Slug is generated once and stays stable across title edits unless the title
// itself changes, so published URLs (and their SEO) survive content edits.
projectSchema.pre("validate", function (next) {
  if (this.isModified("title") || !this.slug) {
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
projectSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};
  const title = update.title ?? update.$set?.title;
  if (!title) return next();

  const slug = slugify(title, { lower: true, strict: true });
  if (update.$set) update.$set.slug = slug;
  else update.slug = slug;
  this.setUpdate(update);
  next();
});

export default mongoose.model("Project", projectSchema);
