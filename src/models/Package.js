import mongoose from "mongoose";

/**
 * Package — one priced tier inside a PackageCategory.
 *
 * ── WHY THE PRICE IS A SUB-DOCUMENT AND NOT FOUR FLAT FIELDS ─────────────
 * `amount`, `original`, `from` and `custom` are only ever read together and
 * only ever mean anything together: `original` without `amount` cannot render
 * a discount, and `from` without `amount` cannot render at all. Grouping them
 * means the whole price is one object in the admin payload and one validator
 * block, and it leaves room for `currency` if a EUR track is ever added
 * alongside the BDT one without touching the top level of the schema.
 *
 * ── WHY THE AMOUNTS ARE WHOLE TAKA AND NOT PAISA ─────────────────────────
 * Nothing here is charged by this system. These are published headline rates
 * on a marketing page, quoted to the nearest thousand taka, and the invoice is
 * written by a human afterwards. Integer minor units are the right call for
 * money that moves; they are needless ceremony for money that is only ever
 * displayed. `min: 0` and the `original > amount` rule in the validator are
 * what actually keep this field honest.
 *
 * ── WHY `category` IS A REF AND NOT THE CATEGORY KEY ─────────────────────
 * The key is editable copy. A string reference would turn renaming a tab into
 * silently orphaning every tier under it — the tab keeps rendering, empty, and
 * the tiers are simply gone from the page with nothing reporting it. With a
 * ref, the delete handler can refuse to remove a category that still has
 * tiers, which is the only moment anyone can act on it.
 */

const featureSchema = new mongoose.Schema(
  {
    /* "UI / UX", "Payment & Courier". Rendered as the <dt> of a spec row, so
       it is a short noun phrase, never a sentence. */
    label: { type: String, required: [true, "Feature label is required"], trim: true, maxlength: 60 },
    value: { type: String, required: [true, "Feature value is required"], trim: true, maxlength: 400 },
  },
  { _id: false }
);

const localeSchema = new mongoose.Schema(
  {
    segment: { type: String, required: [true, "Segment is required"], trim: true, maxlength: 40 },
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 80 },
    badge: { type: String, trim: true, default: "", maxlength: 120 },
    features: { type: [featureSchema], default: [] },
  },
  { _id: false }
);

const priceSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: [true, "Amount is required"], min: 0 },
    /* Struck-through pre-discount figure. null, not 0 — 0 is a real number
       that would render a 100% discount badge. */
    original: { type: Number, default: null, min: 0 },
    /* Renders the "From" prefix: the tier is an entry point, not a fixed fee. */
    from: { type: Boolean, default: false },
    /* Renders "custom scope" instead of "one-time project" under the figure. */
    custom: { type: Boolean, default: false },
    /* Present so a second currency track never needs a migration. Everything
       on /packages today is BDT and the frontend formats the ৳ sign itself. */
    currency: { type: String, enum: ["BDT"], default: "BDT" },
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    /* "BIZ-02", "MERN-01". The public identity of a tier: it travels to
       /contact on the CTA and it is what the seed upserts on. Uppercased so
       "biz-02" and "BIZ-02" cannot become two rows. */
    code: {
      type: String,
      required: [true, "Code is required"],
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, "Code must be uppercase letters, digits and hyphens"],
      maxlength: 24,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PackageCategory",
      required: [true, "Category is required"],
      index: true,
    },

    order: { type: Number, default: 0 },
    /* The "Recommended" tier. Marked by a 2px brand rule along the top edge of
       the cell, matching PricingGrid on /portfolio — not a floating pill. */
    highlighted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },

    price: { type: priceSchema, required: true },

    en: { type: localeSchema, required: true },
    bn: { type: localeSchema, required: true },
  },
  { timestamps: true }
);

/* The only query the public route runs: every active tier, grouped by category
   in memory. A compound index on both keys means that read is covered without
   a sort stage. */
packageSchema.index({ category: 1, order: 1 });

export default mongoose.model("Package", packageSchema);
