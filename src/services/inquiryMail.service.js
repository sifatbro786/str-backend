import env from "../config/env.js";
import { getTransporter } from "../utils/mail/transporter.js";
import {
  inquiryAckTemplate,
  inquiryAdminTemplate,
  headerSafe,
} from "../utils/mail/templates.js";

/**
 * Inquiry mail dispatch.
 *
 * ── WHY THIS IS NOT AWAITED BY THE CONTROLLER ────────────────────────────
 * SMTP to Gmail costs 300ms–3s and occasionally times out. Awaiting it inside
 * POST /inquiries buys nothing and costs two real things: the visitor stares
 * at a spinner for the length of a third-party handshake, and a transient SMTP
 * failure turns a successfully-stored lead into a 500, which the form renders
 * as "something went wrong" — so the visitor submits again and the studio gets
 * duplicate leads for a mail problem.
 *
 * The lead is already durable in Mongo before this runs. Mail is a
 * notification about that record, not part of writing it, so it is dispatched
 * after the response and failures are logged, never surfaced.
 *
 * If this ever needs at-least-once delivery, the upgrade path is a `mailedAt`
 * field on Inquiry plus a sweeper — not moving the await back into the route.
 */

function fromHeader() {
  return `"${headerSafe(env.mail.fromName, 60)}" <${env.mail.fromEmail}>`;
}

async function sendAdminNotification(doc) {
  if (!env.mail.adminEmail) {
    throw new Error("ADMIN_EMAIL is not set — nowhere to deliver the lead");
  }

  const { subject, html, text } = inquiryAdminTemplate(doc);

  return getTransporter().sendMail({
    from: fromHeader(),
    to: env.mail.adminEmail,
    // Reply goes to the client, not to our own inbox. headerSafe() has already
    // stripped CR/LF from the name — an unescaped newline here is a Bcc
    // injection vector on a public, unauthenticated endpoint.
    replyTo: `"${headerSafe(doc.senderName, 60)}" <${doc.senderEmail}>`,
    subject: headerSafe(subject, 160),
    html,
    text,
    headers: { "X-STR-Inquiry-Id": String(doc._id) },
  });
}

async function sendClientAcknowledgement(doc) {
  const { subject, html, text } = inquiryAckTemplate(doc);

  return getTransporter().sendMail({
    from: fromHeader(),
    to: doc.senderEmail,
    replyTo: env.mail.replyTo,
    subject: headerSafe(subject, 160),
    html,
    text,
    headers: {
      // Transactional, not marketing — but List-Unsubscribe still improves
      // Gmail's read of the sender and costs nothing.
      "X-STR-Inquiry-Id": String(doc._id),
      "Auto-Submitted": "auto-replied",
    },
  });
}

/**
 * Fire both messages without blocking the caller.
 * Never throws — call it and move on.
 */
export function dispatchInquiryMails(doc) {
  const transporter = getTransporter();

  if (!transporter) {
    // eslint-disable-next-line no-console
    console.warn(`[mail] Skipped inquiry ${doc._id} — mail is disabled (check SMTP_* env).`);
    return;
  }

  // Detached from the response cycle on purpose. `setImmediate` guarantees the
  // 201 has been flushed before the SMTP handshake starts.
  setImmediate(async () => {
    const lead = {
      _id: doc._id,
      senderName: doc.senderName,
      senderEmail: doc.senderEmail,
      phone: doc.phone,
      serviceInterested: doc.serviceInterested,
      budgetRange: doc.budgetRange,
      message: doc.message,
      createdAt: doc.createdAt,
    };

    // allSettled, not all: a bounced acknowledgement (typo'd client address)
    // must never suppress the studio's copy of the lead, and vice versa.
    const [admin, ack] = await Promise.allSettled([
      sendAdminNotification(lead),
      sendClientAcknowledgement(lead),
    ]);

    if (admin.status === "rejected") {
      // eslint-disable-next-line no-console
      console.error(`[mail] Lead ${lead._id} — admin notification FAILED: ${admin.reason?.message}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`[mail] Lead ${lead._id} — admin notified (${admin.value.messageId}).`);
    }

    if (ack.status === "rejected") {
      // eslint-disable-next-line no-console
      console.error(
        `[mail] Lead ${lead._id} — acknowledgement to ${lead.senderEmail} FAILED: ${ack.reason?.message}`
      );
    } else {
      // eslint-disable-next-line no-console
      console.log(`[mail] Lead ${lead._id} — acknowledged to ${lead.senderEmail}.`);
    }
  });
}

export default dispatchInquiryMails;
