import env from "../config/env.js";
import { getTransporter } from "../utils/mail/transporter.js";
import { headerSafe } from "../utils/mail/templates.js";
import {
  graphicsQuoteAckTemplate,
  graphicsQuoteAdminTemplate,
} from "../utils/mail/graphicsQuoteTemplates.js";

/**
 * Graphics order mail dispatch.
 *
 * ── HOW THIS DIFFERS FROM inquiryMail.service.js, AND WHY IT MATTERS ──────
 * That one is a notification about a record that is already durable: if the
 * SMTP call fails, the lead is still in Mongo and an admin reads it in the
 * dashboard. Here the email carries the ONLY copy of the client's source files
 * — quoteUpload.js keeps them in memory and never writes them to disk — so a
 * failed send is not a missed notification, it is lost payload.
 *
 * Two consequences, both deliberate:
 *
 *   1. The response is still sent first. A visitor who has just uploaded 15MB
 *      must not sit on a spinner through an SMTP handshake, and a transient
 *      SMTP failure must not turn a stored order into a 500 that makes them
 *      submit the whole batch again.
 *   2. The outcome is written back to the document as `mailStatus`. The
 *      dashboard can then show, in the list, that an order arrived but its
 *      files never left — which is the one failure the studio has to hear
 *      about within the hour, because the recovery is "ask the client to send
 *      them again" and that only works while they still remember ordering.
 *
 * The write-back is best effort: a failure to record a failure is logged and
 * dropped, never retried into a loop.
 *
 * ── WHY THE BUFFERS ARE PASSED IN RATHER THAN READ OFF THE DOC ───────────
 * The Mongo document holds a manifest (filename, size, mimetype); the bytes
 * live only on `req.files` for the life of the request. Passing them
 * explicitly is what keeps that distinction honest — nothing here can be
 * mistaken for something that could be re-read later from the database.
 */

const MAX_ATTACHMENT_NAME = 120;

/**
 * `originalname` is attacker controlled and reaches a MIME header.
 *
 * A CR or LF inside it terminates the Content-Disposition line and lets the
 * submitter write their own headers into the outgoing message — the same
 * injection the `headerSafe` call on `senderName` prevents, one header lower.
 * Path separators are stripped too: not because anything here writes to disk,
 * but because the studio will drag these attachments straight out of Gmail
 * onto a desktop, and a name carrying "../" is a name no one should hand to a
 * file system.
 */
export function safeFilename(value, fallback = "file") {
  const flat = String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[\\/]+/g, "-")
    .replace(/^\.+/, "")
    .trim();

  if (!flat) return fallback;
  if (flat.length <= MAX_ATTACHMENT_NAME) return flat;

  // Truncate the stem, never the extension — Gmail picks its preview and the
  // OS picks its default application off the suffix.
  const dot = flat.lastIndexOf(".");
  const ext = dot > 0 ? flat.slice(dot, dot + 12) : "";
  return `${flat.slice(0, MAX_ATTACHMENT_NAME - ext.length)}${ext}`;
}

function fromHeader() {
  return `"${headerSafe(env.mail.fromName, 60)}" <${env.mail.fromEmail}>`;
}

/** nodemailer attachments, straight from multer's in-memory files. */
function toAttachments(files = []) {
  return files.map((f) => ({
    filename: safeFilename(f.originalname),
    content: f.buffer,
    contentType: f.mimetype || "application/octet-stream",
  }));
}

async function sendStudioCopy(order, files) {
  if (!env.mail.adminEmail) {
    throw new Error("ADMIN_EMAIL is not set — nowhere to deliver the order");
  }

  const { subject, html, text } = graphicsQuoteAdminTemplate(order);

  return getTransporter().sendMail({
    from: fromHeader(),
    to: env.mail.adminEmail,
    // Replies go to the client. headerSafe() has already stripped CR/LF from
    // the name — an unescaped newline here is a Bcc injection vector on a
    // public, unauthenticated endpoint.
    replyTo: `"${headerSafe(order.senderName, 60)}" <${order.senderEmail}>`,
    subject: headerSafe(subject, 160),
    html,
    text,
    attachments: toAttachments(files),
    headers: { "X-STR-Quote-Id": String(order._id) },
  });
}

async function sendClientReceipt(order) {
  const { subject, html, text } = graphicsQuoteAckTemplate(order);

  return getTransporter().sendMail({
    from: fromHeader(),
    to: order.senderEmail,
    replyTo: env.mail.replyTo,
    subject: headerSafe(subject, 160),
    html,
    text,
    headers: {
      "X-STR-Quote-Id": String(order._id),
      "Auto-Submitted": "auto-replied",
    },
  });
}

/**
 * Fire both messages without blocking the caller. Never throws.
 *
 * @param {object}   order   Plain snapshot of the stored document
 * @param {Array}    files   multer in-memory files for this request
 * @param {Function} onResult  ({ status, error }) → void. Persists mailStatus.
 */
export function dispatchGraphicsQuoteMails(order, files = [], onResult = () => {}) {
  if (!getTransporter()) {
    // eslint-disable-next-line no-console
    console.warn(
      `[mail] Order ${order._id} stored but NOT sent — mail is disabled (check SMTP_* env). ` +
        `${files.length} file(s) were dropped with the request.`
    );
    onResult({
      status: "failed",
      error: "Mail is disabled on this deployment (SMTP_* not configured).",
    });
    return;
  }

  // Detached from the response cycle. setImmediate guarantees the 201 has been
  // flushed before the SMTP handshake starts.
  setImmediate(async () => {
    // allSettled, not all: a bounced receipt (client typo'd their own address)
    // must never suppress the studio's copy, which is the one carrying the
    // files, and vice versa.
    const [studio, receipt] = await Promise.allSettled([
      sendStudioCopy(order, files),
      sendClientReceipt(order),
    ]);

    if (studio.status === "rejected") {
      // eslint-disable-next-line no-console
      console.error(
        `[mail] Order ${order._id} — STUDIO COPY FAILED, source files are lost: ${studio.reason?.message}`
      );
    } else {
      // eslint-disable-next-line no-console
      console.log(
        `[mail] Order ${order._id} — studio notified with ${files.length} file(s) (${studio.value.messageId}).`
      );
    }

    if (receipt.status === "rejected") {
      // eslint-disable-next-line no-console
      console.error(
        `[mail] Order ${order._id} — receipt to ${order.senderEmail} FAILED: ${receipt.reason?.message}`
      );
    }

    // Only the studio copy decides mailStatus. A receipt that bounces is a
    // typo in the client's own address; the order itself arrived intact and
    // flagging it red would send someone chasing a problem that is not one.
    onResult({
      status: studio.status === "fulfilled" ? "sent" : "failed",
      error: studio.status === "rejected" ? String(studio.reason?.message ?? "").slice(0, 300) : "",
    });
  });
}

export default dispatchGraphicsQuoteMails;
