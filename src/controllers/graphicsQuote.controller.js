import GraphicsQuote from "../models/GraphicsQuote.js";
import * as factory from "../utils/handlerFactory.js";
import asyncHandler from "../utils/asyncHandler.js";
import { dispatchGraphicsQuoteMails, safeFilename } from "../services/graphicsQuoteMail.service.js";

/**
 * POST /api/graphics-quotes — public order intake (rate limited, validated,
 * multipart).
 *
 * Hand written rather than factory.createOne for two reasons the generic
 * handler has no place knowing about: the files, and the fact that mail
 * dispatch here writes back to the document it just created.
 */

/**
 * ⚑ EXPLICIT PICK, NOT A SPREAD. `req.body` on this route is whatever an
 * anonymous submitter put in a multipart form. Spreading it into create()
 * would let them set `status: "closed"`, write `notes` that an admin would
 * read as internal, or pre-set `mailStatus: "sent"` so a dispatch failure
 * never shows red in the dashboard. Every field a client is allowed to supply
 * is named below and nothing else is read.
 */
function pickSubmitted(body) {
  return {
    senderName: body.senderName,
    senderEmail: body.senderEmail,
    phone: body.phone ?? "",
    jobTitle: body.jobTitle,
    instructions: body.instructions,
    servicesRequired: Array.isArray(body.servicesRequired)
      ? body.servicesRequired
      : [body.servicesRequired].filter(Boolean),
    deliveryType: body.deliveryType ?? "",
    deliveryTime: body.deliveryTime ?? "",
    fileLink: body.fileLink ?? "",
  };
}

export const createGraphicsQuote = asyncHandler(async (req, res) => {
  const files = req.files ?? [];

  /**
   * Server-side honeypot. The form drops this field before it posts, so a
   * filled `company` is a bot that parsed the markup and filled every input.
   *
   * It answers 201 rather than 400 on purpose: a bot that is told it failed
   * retries with the field blank, and the next attempt is indistinguishable
   * from a real order. Nothing is stored and no mail is sent.
   */
  if (String(req.body.company ?? "").trim() !== "") {
    res.status(201).json({ success: true, data: { reference: "PENDING" } });
    return;
  }

  const attachments = files.map((f) => ({
    // The stored manifest and the mail header are normalised the same way, so
    // what the dashboard shows is exactly what arrived in the inbox.
    filename: safeFilename(f.originalname),
    size: f.size,
    mimetype: f.mimetype ?? "",
  }));

  const doc = await GraphicsQuote.create({
    ...pickSubmitted(req.body),
    attachments,
    attachmentBytes: attachments.reduce((sum, a) => sum + a.size, 0),
  });

  /**
   * The public response carries a reference and nothing else. Returning the
   * document would hand an anonymous caller `status`, `notes` and `mailStatus`
   * — three internal fields, on a route with no authentication in front of it.
   */
  res.status(201).json({
    success: true,
    data: {
      reference: String(doc._id).slice(-6).toUpperCase(),
      fileCount: attachments.length,
    },
  });

  /**
   * Response is flushed; now the slow part. `doc.toObject()` is passed rather
   * than the Mongoose document so the templates cannot accidentally trigger a
   * getter or a populate after the request is over.
   */
  dispatchGraphicsQuoteMails(doc.toObject(), files, ({ status, error }) => {
    GraphicsQuote.updateOne({ _id: doc._id }, { mailStatus: status, mailError: error }).catch(
      (err) => {
        // Failing to record a failure is not worth a retry loop. The console
        // line above it already carries the real event.
        // eslint-disable-next-line no-console
        console.error(`[mail] Order ${doc._id} — could not persist mailStatus: ${err.message}`);
      }
    );
  });
});

export const listGraphicsQuotes = factory.getAll(GraphicsQuote, {
  allowedFilters: ["status", "deliveryTime", "mailStatus"],
  allowedSort: ["createdAt", "status"],
  defaultSort: "-createdAt",
  searchFields: ["senderName", "senderEmail", "jobTitle", "instructions"],
});

export const getGraphicsQuote = factory.getOne(GraphicsQuote);

/**
 * An order is a record of what the client sent. Admins triage it; they do not
 * rewrite it. Only the two internal fields are writable — same contract as
 * updateInquiry, and the reason is stronger here: the instructions and the
 * file manifest are what the studio would be judged against if the job is
 * disputed.
 */
export const updateGraphicsQuote = factory.updateOne(GraphicsQuote, {
  allow: ["status", "notes"],
});

export const deleteGraphicsQuote = factory.deleteOne(GraphicsQuote);
