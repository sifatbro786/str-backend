import mongoose from "mongoose";

/**
 * PackagePage — the copy around the pricing grid on /packages: the masthead,
 * the "included in every pro package" band, the closing CTA, and the selected
 * work links.
 *
 * ── WHY THIS IS A SINGLETON DOCUMENT ─────────────────────────────────────
 * There is one /packages route and there will be one. A collection with a
 * `key` enum would be a collection of exactly one document forever, so `key`
 * exists only to give findOneAndUpdate an upsert filter — it is not a growth
 * path. If a second bilingual landing page is ever built, it gets its own
 * model rather than a second row here, because none of the field names below
 * would fit it.
 *
 * ── WHAT IS DELIBERATELY NOT STORED HERE ─────────────────────────────────
 *   · UI chrome — "From", "You save", "Visit site", "Recommended". Those are
 *     interface strings, not content. They live in
 *     str-frontend/lib/packagesUi.js, where an admin cannot empty one and
 *     leave a price with no unit next to it.
 *   · <title>, meta description, OG image. That is PageMeta's job, and
 *     "packages" is in its enum. Two places editing the same <head> is how a
 *     dashboard field silently stops taking effect.
 *   · The WhatsApp number and contact email. Those are in
 *     str-frontend/lib/site.js, once, for the whole site.
 *
 * ── WHY `showcase` SITS HERE AND NOT IN THE Project COLLECTION ───────────
 * These are live external sites — a name and a URL, most of which will never
 * get a case study because the deliverable was a launch and not a story.
 * /projects is the written-up work and /portfolio is the sample library; a
 * link list is neither, and filing it in either would mean a row that renders
 * as a case study with no case study behind it. Locale-independent on purpose:
 * a brand name and a hostname do not translate. The two group labels do, and
 * they are in packagesUi.js with the rest of the chrome.
 */

const essentialItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 120 },
    value: { type: String, required: [true, "Value is required"], trim: true, maxlength: 400 },
  },
  { _id: false }
);

const heroSchema = new mongoose.Schema(
  {
    eyebrow: { type: String, trim: true, default: "", maxlength: 60 },
    /* Plain string, no markup and no highlighted span. PageMasthead runs this
       through useSplitReveal, which splits the heading into word nodes — an
       inline <span> inside it would be destroyed by the split, so the accent
       on this page is carried by the section index rather than by a coloured
       word inside the headline. */
    title: { type: String, trim: true, default: "", maxlength: 160 },
    lede: { type: String, trim: true, default: "", maxlength: 600 },
    /* The one-line proof under the lede: "Selected from 18 launched projects…" */
    trust: { type: String, trim: true, default: "", maxlength: 300 },
  },
  { _id: false }
);

const essentialsSchema = new mongoose.Schema(
  {
    kicker: { type: String, trim: true, default: "", maxlength: 80 },
    title: { type: String, trim: true, default: "", maxlength: 160 },
    items: { type: [essentialItemSchema], default: [] },
  },
  { _id: false }
);

const closingSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "", maxlength: 160 },
    body: { type: String, trim: true, default: "", maxlength: 600 },
    primaryCta: { type: String, trim: true, default: "", maxlength: 60 },
    secondaryCta: { type: String, trim: true, default: "", maxlength: 60 },
  },
  { _id: false }
);

const localeSchema = new mongoose.Schema(
  {
    hero: { type: heroSchema, default: () => ({}) },
    essentials: { type: essentialsSchema, default: () => ({}) },
    closing: { type: closingSchema, default: () => ({}) },
  },
  { _id: false }
);

export const SHOWCASE_GROUPS = ["custom", "wp-shopify"];

const showcaseItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 120 },
    /* https only. The card renders it as an outbound link and derives the
       hostname from it, so a value new URL() cannot parse would throw inside
       the render rather than degrade. The validator enforces the protocol; the
       frontend still guards the parse. */
    url: { type: String, required: [true, "URL is required"], trim: true, maxlength: 300 },
    group: { type: String, enum: SHOWCASE_GROUPS, default: "custom" },
  },
  { _id: false }
);

const packagePageSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true, index: true },
    en: { type: localeSchema, default: () => ({}) },
    bn: { type: localeSchema, default: () => ({}) },
    showcase: { type: [showcaseItemSchema], default: [] },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model("PackagePage", packagePageSchema);
