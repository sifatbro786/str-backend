import mongoose from "mongoose";

/**
 * A graphics order placed from /graphics — not a lead.
 *
 * ── WHY THIS IS NOT AN Inquiry ───────────────────────────────────────────
 * An Inquiry is "someone might want to work with us": a name, a service they
 * pointed at, and a paragraph. This is a work order: a named job, per-image
 * instructions, a delivery format, a deadline and the source files. Folding it
 * into Inquiry.message means jobTitle, deliveryTime and the file manifest all
 * become prose inside one free-text column — unsortable, unfilterable, and
 * invisible in the leads table. Two shapes of record, two collections.
 *
 * ── WHY THE FILES ARE NOT REFERENCED HERE ────────────────────────────────
 * `attachments` is a MANIFEST, not a pointer. The uploaded bytes are held in
 * memory for the length of one request, attached to the studio's notification
 * email and then dropped; nothing is written to disk. See middleware/
 * quoteUpload.js for the full argument, but the short version is that
 * env.upload.dir is wiped on every deploy of the current host, so a stored path
 * here would resolve to a 404 within days while looking perfectly healthy in
 * the database. The email is the durable copy. This manifest exists so the
 * dashboard can still say what arrived, and so a failed dispatch is diagnosable
 * rather than silent.
 *
 * ── WHY mailStatus IS A COLUMN AND NOT A LOG LINE ────────────────────────
 * It follows from the above: if the notification never leaves, the client's
 * files are gone and nobody knows. services/inquiryMail.service.js notes this
 * exact upgrade path ("a `mailedAt` field plus a sweeper"). An order carries
 * payload the studio cannot ask twice for without looking incompetent, so it
 * gets the field now rather than later.
 */

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    mimetype: { type: String, default: "" },
  },
  { _id: false }
);

/**
 * Enumerated because they are picked from a fixed <select>, unlike
 * `servicesRequired` which stores whatever titles the page happens to publish.
 * Exported so the validator rejects a bad value as a clean 400 with a field
 * name rather than as a Mongoose ValidationError thrown from inside create().
 *
 * ⚑ These strings are rendered verbatim in the email and in the dashboard. They
 * are also the option values in components/graphics/GraphicsQuoteForm.jsx via
 * lib/graphicsQuote.js. Change one side and a submission starts 400ing.
 */
export const DELIVERY_TYPES = [
  "Save with original file/format",
  "JPEG (flattened)",
  "PNG with transparency",
  "TIFF with clipping path",
  "PSD, layered",
];

export const DELIVERY_TIMES = [
  "6 Hour",
  "12 Hour",
  "24 Hour",
  "48 Hour",
  "3+ Days",
];

export const QUOTE_STATUSES = ["new", "quoted", "in_progress", "delivered", "closed"];

const graphicsQuoteSchema = new mongoose.Schema(
  {
    senderName: { type: String, required: true, trim: true },
    senderEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    phone: { type: String, default: "", trim: true },

    /** What the client calls this batch, e.g. "IDL - Span 15.09". */
    jobTitle: { type: String, required: true, trim: true },

    /** Per-image instructions: "Clip image save as Path 1". Free text, newlines kept. */
    instructions: { type: String, required: true },

    /**
     * Titles, not slugs — same contract as Inquiry.serviceInterested, and for
     * the same reason: the public page publishes titles and the admin filter
     * is built from the values that actually arrived.
     */
    servicesRequired: { type: [String], default: [] },

    deliveryType: { type: String, enum: [...DELIVERY_TYPES, ""], default: "" },
    deliveryTime: { type: String, enum: [...DELIVERY_TIMES, ""], default: "" },

    /** WeTransfer / Drive / Dropbox, for batches past the attachment ceiling. */
    fileLink: { type: String, default: "" },

    attachments: { type: [attachmentSchema], default: [] },

    /** Sum of attachment sizes, denormalised so the list view needs no $unwind. */
    attachmentBytes: { type: Number, default: 0 },

    mailStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    /** Truncated SMTP failure reason. Read by whoever asks "did this arrive?" */
    mailError: { type: String, default: "" },

    status: { type: String, enum: QUOTE_STATUSES, default: "new", index: true },
    notes: { type: String, default: "" }, // internal admin notes
  },
  { timestamps: true }
);

/** The list view is always "newest first, optionally filtered by status". */
graphicsQuoteSchema.index({ createdAt: -1 });

export default mongoose.model("GraphicsQuote", graphicsQuoteSchema);
