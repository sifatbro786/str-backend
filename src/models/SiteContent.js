import mongoose from "mongoose";

/**
 * SiteContent — the marketing blocks that were hard-coded in the frontend's
 * lib/data.js and had no way to be edited without a deploy: the metrics band,
 * the FAQ, the process steps and the engagement shapes.
 *
 * ── WHY ONE COLLECTION AND NOT FOUR ──────────────────────────────────────
 * Four collections would mean four models, four controllers, four route files
 * and four admin screens to maintain a total of about twenty short strings.
 * Every one of these blocks is the same shape — an ordered list of small flat
 * objects, edited as a whole, read as a whole, and never queried by anything
 * but its own key. That is one document per block, not one collection each.
 *
 * ── WHY `items` IS Mixed, AND WHERE THE REAL VALIDATION LIVES ────────────
 * The four blocks have genuinely different item shapes, so a single strict
 * sub-schema would either reject valid rows or be so loose it validates
 * nothing. Mongoose therefore stores the array as-is, and the actual per-key
 * field rules live in validators/siteContent.validator.js, which knows which
 * key is being written and checks the item shape for that key specifically.
 *
 * This is a deliberate trade, not an oversight: `items` must NEVER be written
 * from anything but the validated PUT route. A write that bypasses that
 * validator can put any shape into the array, and the frontend renders it.
 *
 * ── WHY THE KEY LIST IS AN ENUM ──────────────────────────────────────────
 * The frontend reads these by key. An enum means a typo in an admin request
 * is a 400 rather than a silently created orphan document that nothing will
 * ever render and nobody will ever notice.
 */

export const SITE_CONTENT_KEYS = [
  "metrics",
  "faqs",
  "process",
  "capabilities",
  // `partners` carries a logo path per row, so it is the first block whose
  // items reference an uploaded file. The shape validator checks that field
  // with the same rule every other image field uses; see validators/media.js.
  "partners",
];

const siteContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      enum: SITE_CONTENT_KEYS,
    },

    // Shape depends on `key`; see validators/siteContent.validator.js.
    items: { type: [mongoose.Schema.Types.Mixed], default: [] },

    // Who last saved this block. Useful the first time a client asks why the
    // homepage numbers changed — cheaper than reconstructing it from logs.
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model("SiteContent", siteContentSchema);
