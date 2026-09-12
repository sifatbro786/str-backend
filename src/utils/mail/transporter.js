import nodemailer from "nodemailer";
import env from "../../config/env.js";

/**
 * Single pooled SMTP transport for the whole process.
 *
 * ── WHY POOLED ───────────────────────────────────────────────────────────
 * Every `createTransport` without `pool` opens a fresh TCP + TLS + AUTH
 * handshake per message. Gmail throttles on connection rate long before it
 * throttles on message count, so a burst of form submissions starts failing
 * with 421 while the daily quota is barely touched. One pooled transport with
 * a small connection ceiling keeps the handshake cost amortised and the
 * concurrency bounded.
 *
 * ── WHY THE TIMEOUTS ARE EXPLICIT ────────────────────────────────────────
 * Nodemailer's defaults let a socket hang for minutes. Mail here is dispatched
 * off the request path, so a hang does not stall a visitor — but it does pin a
 * pool connection and leak an open handle across a deploy. These three bound
 * the worst case to ~20s.
 */

let cached = null;

export function getTransporter() {
  if (!env.mail.enabled) return null;
  if (cached) return cached;

  cached = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    // 465 → implicit TLS. 587 → plaintext connect, then STARTTLS (below).
    secure: env.mail.secure,
    // On 587 this makes STARTTLS mandatory: without it nodemailer will happily
    // fall back to an unencrypted session if the server hides its capability,
    // and the app password goes over the wire in the clear.
    requireTLS: !env.mail.secure,
    auth: { user: env.mail.user, pass: env.mail.pass },
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return cached;
}

/**
 * Boot-time credential check. Deliberately non-fatal: a bad SMTP password must
 * not stop the site from serving pages or the dashboard from reading leads.
 * It logs loudly instead, so the failure is visible at deploy time rather than
 * discovered weeks later through a lead that never arrived.
 */
export async function verifyMailer() {
  if (!env.mail.enabled) {
    // eslint-disable-next-line no-console
    console.warn(
      "[mail] Disabled — SMTP_HOST / SMTP_USER / SMTP_PASS not all set. Inquiries will be stored but no email will be sent."
    );
    return false;
  }

  try {
    await getTransporter().verify();
    // eslint-disable-next-line no-console
    console.log(
      `[mail] SMTP ready — ${env.mail.host}:${env.mail.port} (${env.mail.secure ? "TLS" : "STARTTLS"}) as ${env.mail.user}`
    );
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[mail] SMTP verify failed: ${err.message}`);
    return false;
  }
}

/** Drain the pool on shutdown so the process can exit cleanly. */
export function closeMailer() {
  if (cached) {
    cached.close();
    cached = null;
  }
}
