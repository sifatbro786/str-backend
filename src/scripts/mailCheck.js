/**
 * SMTP smoke test — `npm run mail:check [recipient@example.com]`
 *
 * Runs the exact transport, templates and header logic the live endpoint uses,
 * with a fabricated lead. Verifies credentials first, so a bad App Password
 * surfaces as an auth error in one second instead of a timeout.
 *
 * Does NOT touch MongoDB. Safe to run against production env vars.
 */
import mongoose from "mongoose";
import env from "../config/env.js";
import { getTransporter, verifyMailer, closeMailer } from "../utils/mail/transporter.js";
import { inquiryAckTemplate, inquiryAdminTemplate, headerSafe } from "../utils/mail/templates.js";

const target = process.argv[2] || env.mail.adminEmail || env.mail.user;

const fixture = {
  _id: new mongoose.Types.ObjectId(),
  senderName: "Ayesha Rahman",
  senderEmail: target,
  phone: "+880 1712-345678",
  serviceInterested: "Dashboard Development",
  budgetRange: "$5,000 – $15,000",
  message:
    "We run a logistics operation out of Chattogram and our ops team is living in three spreadsheets.\n\nWe need a single dashboard: live shipment status, driver assignment, and a monthly cost breakdown per client. Roughly 40 internal users. Is that something you take on?",
  createdAt: new Date(),
};

async function main() {
  console.log("─".repeat(62));
  console.log("  STR mail check");
  console.log("─".repeat(62));
  console.log(`  host      ${env.mail.host}:${env.mail.port}`);
  console.log(`  mode      ${env.mail.secure ? "implicit TLS (465)" : "STARTTLS (587)"}`);
  console.log(`  user      ${env.mail.user || "(unset)"}`);
  console.log(`  pass      ${env.mail.pass ? `${env.mail.pass.length} chars` : "(unset)"}`);
  console.log(`  from      "${env.mail.fromName}" <${env.mail.fromEmail || "(unset)"}>`);
  console.log(`  admin     ${env.mail.adminEmail || "(unset)"}`);
  console.log(`  enabled   ${env.mail.enabled}`);
  console.log("─".repeat(62));

  if (!env.mail.enabled) {
    console.error("\n✗ Mail is disabled. Set SMTP_HOST, SMTP_USER and SMTP_PASS in .env\n");
    process.exit(1);
  }

  if (env.mail.pass.length !== 16) {
    console.warn(
      `\n⚠  SMTP_PASS is ${env.mail.pass.length} characters. A Google App Password is exactly 16.`
    );
    console.warn("   If this is the account password, Gmail will reject it with 535-5.7.8.\n");
  }

  const ok = await verifyMailer();
  if (!ok) {
    console.error("\n✗ Credential check failed — see the error above. Nothing was sent.\n");
    closeMailer();
    process.exit(1);
  }

  const t = getTransporter();
  const from = `"${headerSafe(env.mail.fromName, 60)}" <${env.mail.fromEmail}>`;

  const admin = inquiryAdminTemplate(fixture);
  const ack = inquiryAckTemplate(fixture);

  console.log(`\n→ Sending both templates to ${target} …\n`);

  const results = await Promise.allSettled([
    t.sendMail({
      from,
      to: target,
      replyTo: `"${headerSafe(fixture.senderName, 60)}" <${fixture.senderEmail}>`,
      subject: `[TEST] ${admin.subject}`,
      html: admin.html,
      text: admin.text,
    }),
    t.sendMail({
      from,
      to: target,
      replyTo: env.mail.replyTo,
      subject: `[TEST] ${ack.subject}`,
      html: ack.html,
      text: ack.text,
    }),
  ]);

  const labels = ["admin notification", "client acknowledgement"];
  let failed = 0;

  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      console.log(`  ✓ ${labels[i]} — ${r.value.messageId}`);
      console.log(`    accepted: ${r.value.accepted.join(", ") || "none"}`);
      if (r.value.rejected?.length) console.log(`    rejected: ${r.value.rejected.join(", ")}`);
    } else {
      failed += 1;
      console.error(`  ✗ ${labels[i]} — ${r.reason?.message}`);
    }
  });

  closeMailer();
  console.log(failed ? "\nDone, with failures.\n" : "\nBoth messages accepted by the server.\n");
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error("\n✗ mail:check crashed:", err);
  closeMailer();
  process.exit(1);
});
