import env from "../../config/env.js";

/**
 * Email templates — hand-written table HTML, inline styles only.
 *
 * ── CONSTRAINTS THIS FILE IS WRITTEN AGAINST ─────────────────────────────
 * · Outlook (Word rendering engine) ignores flexbox, grid, padding on <div>,
 *   max-width, and most shorthand. Tables with explicit widths are the only
 *   layout primitive that survives everywhere.
 * · Gmail strips <style> blocks in some clients and rewrites classes in
 *   others, so every rule is inline. No media queries are relied on for
 *   correctness — the 600px shell degrades to full width on its own.
 * · Gmail/Outlook dark mode inverts backgrounds unpredictably. The
 *   color-scheme meta pins these to light so the palette stays intentional.
 * · No web fonts: Gmail drops them. The stacks below fall back cleanly.
 */

const C = {
  paper: "#F4F2EE", // warm off-white page ground
  card: "#FFFFFF",
  line: "#E5E0D6",
  lineSoft: "#F0EDE6",
  ink: "#171614",
  body: "#4A4742",
  mute: "#8A857C",
  blue: env.brand.blue,
  orange: env.brand.orange,
  green: env.brand.green,
};

const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',Times,serif";
const MONO = "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";
const SCRIPT = "'Segoe Script','Bradley Hand','Brush Script MT',Georgia,cursive";

/** Entity-escape anything interpolated into HTML. Non-negotiable: `message` is
 *  attacker-controlled free text arriving from a public, unauthenticated form. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escape, then promote newlines to <br> — used for the free-text message only. */
function escapeMultiline(value) {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
}

/**
 * Strip CR/LF and cap length before any value reaches a mail header.
 * A newline inside `senderName` would otherwise let a submitter inject
 * `Bcc:` into the outgoing message — classic SMTP header injection.
 */
export function headerSafe(value, max = 120) {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, max);
}

/* ── shell ──────────────────────────────────────────────────────────────── */

function shell({ preheader, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(env.brand.legalName)}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.paper};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${C.paper};">${escapeHtml(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.paper};">
<tr><td align="center" style="padding:36px 14px 44px 14px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${C.card};border:1px solid ${C.line};">
${signalBar()}
${body}
</table>
${footerMark()}
</td></tr>
</table>
</body>
</html>`;
}

/** Three brand segments as one 4px rule. A solid divided bar, not a gradient —
 *  gradients band badly in Outlook and read as stock template. */
function signalBar() {
  return `<tr><td style="padding:0;font-size:0;line-height:0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="46%" height="4" style="background-color:${C.blue};font-size:0;line-height:4px;">&nbsp;</td>
<td width="34%" height="4" style="background-color:${C.orange};font-size:0;line-height:4px;">&nbsp;</td>
<td width="20%" height="4" style="background-color:${C.green};font-size:0;line-height:4px;">&nbsp;</td>
</tr></table></td></tr>`;
}

function masthead(eyebrow) {
  return `<tr><td style="padding:30px 40px 0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="left" style="font-family:${MONO};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${C.ink};font-weight:700;">STR&nbsp;SOLUTIONS<span style="color:${C.orange};">.</span></td>
<td align="right" style="font-family:${MONO};font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${C.mute};">${escapeHtml(eyebrow)}</td>
</tr></table></td></tr>`;
}

function rule(top = 28, bottom = 28) {
  return `<tr><td style="padding:${top}px 40px ${bottom}px 40px;font-size:0;line-height:0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td height="1" style="background-color:${C.lineSoft};font-size:0;line-height:1px;">&nbsp;</td>
</tr></table></td></tr>`;
}

/** Definition rows. Empty values are dropped by the caller, never rendered as "—". */
function detailRows(pairs) {
  const rows = pairs
    .filter(([, v]) => String(v ?? "").trim() !== "")
    .map(
      ([label, value], i) => `<tr>
<td width="34%" valign="top" style="padding:${i === 0 ? 0 : 14}px 16px 0 0;font-family:${MONO};font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${C.mute};line-height:20px;">${escapeHtml(label)}</td>
<td valign="top" style="padding:${i === 0 ? 0 : 14}px 0 0 0;font-family:${SANS};font-size:15px;color:${C.ink};line-height:20px;">${value}</td>
</tr>`
    )
    .join("");

  return `<tr><td style="padding:0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
</td></tr>`;
}

function footerMark() {
  return `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
<tr><td align="center" style="padding:20px 24px 0 24px;font-family:${MONO};font-size:10px;letter-spacing:0.1em;color:${C.mute};line-height:18px;">
${escapeHtml(env.brand.legalName)} &middot; Dhaka, Bangladesh<br>
<a href="${escapeHtml(env.brand.siteUrl)}" style="color:${C.mute};text-decoration:underline;">${escapeHtml(env.brand.siteUrl.replace(/^https?:\/\//, ""))}</a>
</td></tr></table>`;
}

/* ── 1. Acknowledgement to the person who filled the form ───────────────── */

export function inquiryAckTemplate(doc) {
  const firstName = headerSafe(String(doc.senderName || "").split(/\s+/)[0] || "there", 40);

  const stamp = new Date(doc.createdAt ?? Date.now()).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
  });

  const body = `
${masthead(stamp)}

<tr><td style="padding:26px 40px 0 40px;">
<div style="font-family:${MONO};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${C.orange};">Received</div>
<h1 style="margin:14px 0 0 0;font-family:${SERIF};font-size:30px;line-height:1.18;letter-spacing:-0.015em;color:${C.ink};font-weight:400;">Thanks, ${escapeHtml(firstName)} —<br>that landed with us.</h1>
</td></tr>

<tr><td style="padding:18px 40px 0 40px;font-family:${SANS};font-size:15px;line-height:1.72;color:${C.body};">
A real person at STR reads every inquiry that comes through the site. Yours is
in the queue now, and you'll hear back from us <strong style="color:${C.ink};">within one business day</strong>.
</td></tr>

<tr><td style="padding:16px 40px 0 40px;font-family:${SANS};font-size:15px;line-height:1.72;color:${C.body};">
If it's time-sensitive, don't wait on us — call
<a href="${escapeHtml(env.brand.phoneHref)}" style="color:${C.blue};text-decoration:none;border-bottom:1px solid ${C.blue};">${escapeHtml(env.brand.phone)}</a>
during ${escapeHtml(env.brand.hours)}.
</td></tr>

${rule(30, 26)}

<tr><td style="padding:0 40px 10px 40px;font-family:${MONO};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${C.mute};">
Copy of what you sent
</td></tr>

${detailRows([
  ["Name", escapeHtml(doc.senderName)],
  ["Email", escapeHtml(doc.senderEmail)],
  ["Phone", escapeHtml(doc.phone)],
  ["Service", escapeHtml(doc.serviceInterested)],
  ["Budget", escapeHtml(doc.budgetRange)],
])}

<tr><td style="padding:20px 40px 0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="border-left:2px solid ${C.line};padding:2px 0 2px 16px;font-family:${SERIF};font-size:15px;line-height:1.7;color:${C.body};font-style:italic;">
${escapeMultiline(doc.message)}
</td></tr></table>
</td></tr>

${rule(30, 24)}

<tr><td style="padding:0 40px 4px 40px;font-family:${SCRIPT};font-size:21px;color:${C.ink};line-height:1.3;">
— The STR team
</td></tr>
<tr><td style="padding:2px 40px 34px 40px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.mute};">
You're getting this because someone submitted the contact form at ${escapeHtml(env.brand.siteUrl.replace(/^https?:\/\//, ""))} using this address. If that wasn't you, just ignore it — nothing else will follow.
</td></tr>`;

  return {
    subject: `We've got your message, ${firstName} — STR Solutions`,
    html: shell({
      preheader: "A real person reads every inquiry. You'll hear back within one business day.",
      body,
    }),
    text: [
      `Thanks, ${firstName} — that landed with us.`,
      ``,
      `A real person at STR reads every inquiry that comes through the site.`,
      `You'll hear back within one business day.`,
      ``,
      `Time-sensitive? Call ${env.brand.phone} during ${env.brand.hours}.`,
      ``,
      `— COPY OF WHAT YOU SENT ————————————`,
      `Name:    ${doc.senderName}`,
      `Email:   ${doc.senderEmail}`,
      doc.phone ? `Phone:   ${doc.phone}` : null,
      doc.serviceInterested ? `Service: ${doc.serviceInterested}` : null,
      doc.budgetRange ? `Budget:  ${doc.budgetRange}` : null,
      ``,
      doc.message,
      ``,
      `— The STR team`,
      `${env.brand.legalName} · ${env.brand.siteUrl}`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  };
}

/* ── 2. Lead notification to the studio ─────────────────────────────────── */

export function inquiryAdminTemplate(doc) {
  const name = headerSafe(doc.senderName);
  const service = headerSafe(doc.serviceInterested, 60);
  const received = new Date(doc.createdAt ?? Date.now()).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const mailto = `mailto:${encodeURIComponent(doc.senderEmail)}?subject=${encodeURIComponent(
    `Re: your inquiry to STR Solutions`
  )}`;

  const body = `
${masthead(`Lead · ${String(doc._id).slice(-6)}`)}

<tr><td style="padding:26px 40px 0 40px;">
<div style="font-family:${MONO};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${C.green};">New inquiry</div>
<h1 style="margin:14px 0 0 0;font-family:${SERIF};font-size:28px;line-height:1.2;letter-spacing:-0.015em;color:${C.ink};font-weight:400;">${escapeHtml(name)}</h1>
${service ? `<div style="margin:8px 0 0 0;font-family:${SANS};font-size:14px;color:${C.mute};">is asking about <span style="color:${C.ink};">${escapeHtml(service)}</span></div>` : ""}
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
  // `serviceInterested` is deliberately absent — it is already the subline
  // under the name. Repeating it four rows later is filler, not information.
  ["Budget", escapeHtml(doc.budgetRange)],
  ["Received", escapeHtml(`${received} (GMT+6)`)],
])}

${rule(26, 22)}

<tr><td style="padding:0 40px 10px 40px;font-family:${MONO};font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${C.mute};">
Message
</td></tr>
<tr><td style="padding:0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="background-color:${C.paper};border-left:3px solid ${C.orange};padding:18px 20px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.ink};">
${escapeMultiline(doc.message)}
</td></tr></table>
</td></tr>

<tr><td style="padding:26px 40px 0 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="background-color:${C.ink};">
<a href="${escapeHtml(mailto)}" style="display:inline-block;padding:13px 26px;font-family:${MONO};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">Reply to ${escapeHtml(headerSafe(String(doc.senderName || "").split(/\s+/)[0] || "sender", 24))}</a>
</td>
<td style="padding-left:14px;font-family:${MONO};font-size:10px;letter-spacing:0.1em;text-transform:uppercase;">
<a href="${escapeHtml(env.brand.adminInquiriesUrl)}" style="color:${C.mute};text-decoration:none;border-bottom:1px solid ${C.line};">Open in dashboard</a>
</td>
</tr></table>
</td></tr>

<tr><td style="padding:22px 40px 34px 40px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.mute};">
Hitting reply works too — this message's reply-to is set to ${escapeHtml(doc.senderEmail)}.<br>
Lead ID <span style="font-family:${MONO};">${escapeHtml(doc._id)}</span>
</td></tr>`;

  return {
    subject: `New inquiry — ${name}${service ? ` · ${service}` : ""}`,
    html: shell({
      preheader: `${name} · ${doc.senderEmail}${service ? ` · ${service}` : ""}`,
      body,
    }),
    text: [
      `NEW INQUIRY — ${doc.senderName}`,
      ``,
      `Email:    ${doc.senderEmail}`,
      doc.phone ? `Phone:    ${doc.phone}` : null,
      doc.serviceInterested ? `Service:  ${doc.serviceInterested}` : null,
      doc.budgetRange ? `Budget:   ${doc.budgetRange}` : null,
      `Received: ${received} (GMT+6)`,
      ``,
      `MESSAGE`,
      doc.message,
      ``,
      `Reply directly to this email — reply-to is ${doc.senderEmail}.`,
      `Dashboard: ${env.brand.adminInquiriesUrl}`,
      `Lead ID: ${doc._id}`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  };
}
