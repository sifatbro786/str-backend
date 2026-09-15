import env from "../../config/env.js";
import {
  C,
  MONO,
  SANS,
  SCRIPT,
  SERIF,
  detailRows,
  escapeHtml,
  escapeMultiline,
  headerSafe,
  masthead,
  rule,
  shell,
} from "./templates.js";

/**
 * The two messages a graphics order sends: the studio's copy, which carries
 * the source files, and the client's receipt, which does not.
 *
 * ── WHY THIS IS A SECOND FILE AND NOT MORE OF templates.js ───────────────
 * Same shell, same palette, same table furniture — all imported, none
 * re-declared, so the two families cannot drift into two different-looking
 * emails from one company. What is different is the CONTENT MODEL: an inquiry
 * is a paragraph, an order is a spec sheet with a file manifest. Rendering
 * both from one parameterised template would mean a template full of
 * `doc.jobTitle ? … : …`, which is how the inquiry email ends up quietly
 * broken by an edit made for the order email.
 *
 * ── WHY THE CLIENT'S COPY DOES NOT RE-ATTACH THE FILES ───────────────────
 * They just uploaded them; they have them. Attaching a second copy doubles the
 * SMTP payload for every order, doubles the chance of hitting Gmail's 25MB
 * message ceiling, and is the difference between an order that lands and one
 * that bounces on the account's daily quota. The receipt lists what arrived
 * instead, which is the part they actually need to check.
 */

/** Human bytes. Kilobytes for anything under a megabyte — nobody reads "0.04MB". */
export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`;
}

/** "Clipping Path, Image Masking and Shadow and Reflection" — read, not parsed. */
function listServices(services = []) {
  const clean = services.map((s) => String(s).trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  return `${clean.slice(0, -1).join(", ")} and ${clean[clean.length - 1]}`;
}

function stamp(value, withTime = true) {
  return new Date(value ?? Date.now()).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {}),
  });
}

/**
 * The file manifest, as a bordered plate.
 *
 * `attached` distinguishes the two messages: the studio's copy says the bytes
 * are on this email, the client's says they reached us. A manifest that claims
 * an attachment the reader cannot find is worse than no manifest.
 */
function fileList(attachments = [], { attached }) {
  if (attachments.length === 0) return "";

  const rows = attachments
    .map(
      (f) => `<tr>
<td valign="top" style="padding:7px 12px 7px 0;font-family:${SANS};font-size:14px;color:${C.ink};line-height:18px;word-break:break-all;">${escapeHtml(f.filename)}</td>
<td valign="top" align="right" style="padding:7px 0;font-family:${MONO};font-size:11px;color:${C.mute};line-height:18px;white-space:nowrap;">${escapeHtml(formatBytes(f.size))}</td>
</tr>`
    )
    .join("");

  const total = attachments.reduce((sum, f) => sum + (Number(f.size) || 0), 0);

  return `<tr><td style="padding:0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="background-color:${C.paper};border-left:3px solid ${C.blue};padding:14px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
<div style="margin-top:12px;padding-top:12px;border-top:1px solid ${C.line};font-family:${MONO};font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${C.mute};">
${attachments.length} file${attachments.length === 1 ? "" : "s"} &middot; ${escapeHtml(formatBytes(total))} &middot; ${attached ? "attached to this email" : "received"}
</div>
</td></tr></table>
</td></tr>`;
}

function sectionLabel(text, padTop = 0) {
  return `<tr><td style="padding:${padTop}px 40px 10px 40px;font-family:${MONO};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${C.mute};">
${escapeHtml(text)}
</td></tr>`;
}

/* ── 1. The studio's copy — carries the source files ─────────────────────── */

export function graphicsQuoteAdminTemplate(doc) {
  const name = headerSafe(doc.senderName);
  const jobTitle = headerSafe(doc.jobTitle, 160);
  const services = listServices(doc.servicesRequired);
  const received = stamp(doc.createdAt);
  const ref = String(doc._id).slice(-6).toUpperCase();

  const mailto = `mailto:${encodeURIComponent(doc.senderEmail)}?subject=${encodeURIComponent(
    `Re: ${jobTitle || "your graphics order"} — STR Solutions`
  )}`;

  const body = `
${masthead(`Order · ${ref}`)}

<tr><td style="padding:26px 40px 0 40px;">
<div style="font-family:${MONO};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${C.orange};">Graphics order</div>
<h1 style="margin:14px 0 0 0;font-family:${SERIF};font-size:28px;line-height:1.2;letter-spacing:-0.015em;color:${C.ink};font-weight:400;">${escapeHtml(jobTitle)}</h1>
<div style="margin:8px 0 0 0;font-family:${SANS};font-size:14px;color:${C.mute};">from <span style="color:${C.ink};">${escapeHtml(name)}</span></div>
</td></tr>

${rule(26, 24)}

${detailRows([
  [
    "Email",
    `<a href="${escapeHtml(mailto)}" style="color:${C.blue};text-decoration:none;border-bottom:1px solid ${C.line};">${escapeHtml(doc.senderEmail)}</a>`,
  ],
  [
    "Phone",
    doc.phone
      ? `<a href="tel:${escapeHtml(String(doc.phone).replace(/[^\d+]/g, ""))}" style="color:${C.ink};text-decoration:none;border-bottom:1px solid ${C.line};">${escapeHtml(doc.phone)}</a>`
      : "",
  ],
  ["Services", escapeHtml(services)],
  ["Delivery type", escapeHtml(doc.deliveryType)],
  // The one field that decides what happens in the next hour, so it is the
  // only one that gets colour.
  [
    "Delivery time",
    doc.deliveryTime
      ? `<span style="color:${C.orange};font-weight:600;">${escapeHtml(doc.deliveryTime)}</span>`
      : "",
  ],
  ["Received", escapeHtml(`${received} (GMT+6)`)],
])}

${rule(26, 22)}

${sectionLabel("Instructions")}
<tr><td style="padding:0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="background-color:${C.paper};border-left:3px solid ${C.orange};padding:18px 20px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.ink};">
${escapeMultiline(doc.instructions)}
</td></tr></table>
</td></tr>

${doc.attachments?.length ? sectionLabel("Files", 26) : ""}
${fileList(doc.attachments, { attached: true })}

${
  doc.fileLink
    ? `${sectionLabel("File drop", 26)}
<tr><td style="padding:0 40px;font-family:${SANS};font-size:15px;line-height:1.6;word-break:break-all;">
<a href="${escapeHtml(doc.fileLink)}" style="color:${C.blue};text-decoration:none;border-bottom:1px solid ${C.blue};">${escapeHtml(doc.fileLink)}</a>
</td></tr>`
    : ""
}

${
  !doc.attachments?.length && !doc.fileLink
    ? `${sectionLabel("Files", 26)}
<tr><td style="padding:0 40px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.mute};">
Nothing was uploaded and no link was given. Ask for the source files on the first reply.
</td></tr>`
    : ""
}

<tr><td style="padding:26px 40px 0 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="background-color:${C.ink};">
<a href="${escapeHtml(mailto)}" style="display:inline-block;padding:13px 26px;font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">Quote ${escapeHtml(headerSafe(String(doc.senderName || "").split(/\s+/)[0] || "client", 24))}</a>
</td>
<td style="padding-left:14px;font-family:${MONO};font-size:10px;letter-spacing:0.1em;text-transform:uppercase;">
<a href="${escapeHtml(env.brand.adminQuotesUrl)}" style="color:${C.mute};text-decoration:none;border-bottom:1px solid ${C.line};">Open in dashboard</a>
</td>
</tr></table>
</td></tr>

<tr><td style="padding:22px 40px 34px 40px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.mute};">
Hitting reply works too — this message's reply-to is set to ${escapeHtml(doc.senderEmail)}.<br>
The attachments above are the only copy the studio holds; nothing was written to the server.<br>
Order ID <span style="font-family:${MONO};">${escapeHtml(doc._id)}</span>
</td></tr>`;

  return {
    subject: `Graphics order — ${jobTitle}${doc.deliveryTime ? ` · ${headerSafe(doc.deliveryTime, 20)}` : ""}`,
    html: shell({
      preheader: `${name} · ${services || "graphics"}${doc.deliveryTime ? ` · ${doc.deliveryTime}` : ""}`,
      body,
    }),
    text: [
      `GRAPHICS ORDER — ${doc.jobTitle}`,
      ``,
      `From:     ${doc.senderName}`,
      `Email:    ${doc.senderEmail}`,
      doc.phone ? `Phone:    ${doc.phone}` : null,
      services ? `Services: ${services}` : null,
      doc.deliveryType ? `Format:   ${doc.deliveryType}` : null,
      doc.deliveryTime ? `Due:      ${doc.deliveryTime}` : null,
      `Received: ${received} (GMT+6)`,
      ``,
      `INSTRUCTIONS`,
      doc.instructions,
      ``,
      doc.attachments?.length
        ? `FILES (attached)\n${doc.attachments
            .map((f) => `  · ${f.filename} (${formatBytes(f.size)})`)
            .join("\n")}`
        : null,
      doc.fileLink ? `FILE DROP\n  ${doc.fileLink}` : null,
      !doc.attachments?.length && !doc.fileLink
        ? `No files and no link — ask for the source images on the first reply.`
        : null,
      ``,
      `Reply directly to this email — reply-to is ${doc.senderEmail}.`,
      `Dashboard: ${env.brand.adminQuotesUrl}`,
      `Order ID: ${doc._id}`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  };
}

/* ── 2. The client's receipt — no attachments ────────────────────────────── */

export function graphicsQuoteAckTemplate(doc) {
  const firstName = headerSafe(String(doc.senderName || "").split(/\s+/)[0] || "there", 40);
  const jobTitle = headerSafe(doc.jobTitle, 160);
  const services = listServices(doc.servicesRequired);
  const ref = String(doc._id).slice(-6).toUpperCase();

  const body = `
${masthead(stamp(doc.createdAt, false))}

<tr><td style="padding:26px 40px 0 40px;">
<div style="font-family:${MONO};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${C.orange};">Order received</div>
<h1 style="margin:14px 0 0 0;font-family:${SERIF};font-size:30px;line-height:1.18;letter-spacing:-0.015em;color:${C.ink};font-weight:400;">Thanks, ${escapeHtml(firstName)} —<br>we have your files.</h1>
</td></tr>

<tr><td style="padding:18px 40px 0 40px;font-family:${SANS};font-size:15px;line-height:1.72;color:${C.body};">
Your batch is on the desk as <strong style="color:${C.ink};">${escapeHtml(jobTitle)}</strong>,
reference <span style="font-family:${MONO};color:${C.ink};">${escapeHtml(ref)}</span>.
An editor looks at the images themselves before quoting, so the price you get
back is against your own photography rather than against a table.
</td></tr>

<tr><td style="padding:16px 40px 0 40px;font-family:${SANS};font-size:15px;line-height:1.72;color:${C.body};">
Expect the quote and the confirmed turnaround
<strong style="color:${C.ink};">within one business day</strong>. Nothing is charged and
nothing starts until you reply to it. If the deadline is tighter than that,
call <a href="${escapeHtml(env.brand.phoneHref)}" style="color:${C.blue};text-decoration:none;border-bottom:1px solid ${C.blue};">${escapeHtml(env.brand.phone)}</a>
during ${escapeHtml(env.brand.hours)}.
</td></tr>

${rule(30, 26)}

${sectionLabel("Copy of your order")}

${detailRows([
  ["Job", escapeHtml(jobTitle)],
  ["Services", escapeHtml(services)],
  ["Delivery type", escapeHtml(doc.deliveryType)],
  ["Delivery time", escapeHtml(doc.deliveryTime)],
])}

<tr><td style="padding:20px 40px 0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="border-left:2px solid ${C.line};padding:2px 0 2px 16px;font-family:${SERIF};font-size:15px;line-height:1.7;color:${C.body};font-style:italic;">
${escapeMultiline(doc.instructions)}
</td></tr></table>
</td></tr>

${doc.attachments?.length ? sectionLabel("Files we received", 26) : ""}
${fileList(doc.attachments, { attached: false })}

${
  doc.fileLink
    ? `${sectionLabel("File drop", 26)}
<tr><td style="padding:0 40px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.body};word-break:break-all;">
${escapeHtml(doc.fileLink)}
</td></tr>`
    : ""
}

${rule(30, 24)}

<tr><td style="padding:0 40px 4px 40px;font-family:${SCRIPT};font-size:21px;color:${C.ink};line-height:1.3;">
— The STR graphics desk
</td></tr>
<tr><td style="padding:2px 40px 34px 40px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.mute};">
Reply to this email to add a file, change the brief or cancel — it reaches the same desk. You are getting this because an order was placed at ${escapeHtml(env.brand.siteUrl.replace(/^https?:\/\//, ""))} using this address. If that was not you, ignore it and nothing will follow.
</td></tr>`;

  return {
    subject: `Order received — ${jobTitle} (${ref})`,
    html: shell({
      preheader: `We have your files. Quote and turnaround back within one business day.`,
      body,
    }),
    text: [
      `Thanks, ${firstName} — we have your files.`,
      ``,
      `Your batch is on the desk as "${doc.jobTitle}", reference ${ref}.`,
      `Expect the quote and confirmed turnaround within one business day.`,
      `Nothing is charged and nothing starts until you reply to it.`,
      ``,
      `Tighter deadline? Call ${env.brand.phone} during ${env.brand.hours}.`,
      ``,
      `— COPY OF YOUR ORDER ————————————`,
      `Job:       ${doc.jobTitle}`,
      services ? `Services:  ${services}` : null,
      doc.deliveryType ? `Format:    ${doc.deliveryType}` : null,
      doc.deliveryTime ? `Turnaround: ${doc.deliveryTime}` : null,
      ``,
      doc.instructions,
      ``,
      doc.attachments?.length
        ? `FILES RECEIVED\n${doc.attachments
            .map((f) => `  · ${f.filename} (${formatBytes(f.size)})`)
            .join("\n")}`
        : null,
      doc.fileLink ? `FILE DROP\n  ${doc.fileLink}` : null,
      ``,
      `— The STR graphics desk`,
      `${env.brand.legalName} · ${env.brand.siteUrl}`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  };
}
