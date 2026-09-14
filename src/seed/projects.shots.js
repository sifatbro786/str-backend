import fs from "node:fs/promises";
import path from "node:path";

import env from "../config/env.js";
import MEDIA, { FRAME, MEDIA_FOLDER } from "./projects.media.js";

/**
 * Fills uploads/projects with the pictures projects.data.js points at.
 *
 *   npm run seed:projects:media            # write what is missing
 *   npm run seed:projects:media -- --force # recapture everything
 *   npm run seed:projects:media -- --only=teads,vera   # one client at a time
 *
 * Run this BEFORE `npm run seed:projects`. The seeder writes paths either way
 * — it has no idea whether the file behind a path exists — so seeding first
 * gives a catalogue of fallback logos that looks like a styling bug.
 *
 * ── THE TWO HALVES ───────────────────────────────────────────────────────
 * `copy` entries come from str-frontend/public: the studio's own renders,
 * retouching and campaign reports. Those disciplines hand over files, not
 * URLs, so the artwork IS the deliverable and there is nothing to screenshot.
 *
 * `shot` entries are captured from the client's live production site with
 * Playwright. Real pages on the day it ran — which is the point, and also the
 * liability: a client who redesigns makes this catalogue's gallery stale, and
 * nothing here will tell you. Re-run with --force after a redesign.
 *
 * ── WHY IT WRITES STRAIGHT TO DISK AND NOT THROUGH POST /uploads ─────────
 * The upload route is multipart, authenticated, rate-limited and capped at
 * 5MB. Driving 70 images through it needs a logged-in admin session and turns
 * a one-command setup into a two-service one. The route's real job is
 * validating what a browser hands it; this process is not a browser, and the
 * file it writes is byte-identical to what the route would have stored —
 * same folder, same `slug-<hex>.<ext>` shape, same public path on the record.
 *
 * ── WHY A FAILED CAPTURE IS NOT FATAL ────────────────────────────────────
 * Eleven third-party sites are reachable independently of each other. One
 * timing out, rate-limiting, or sitting behind a bot wall should not cost the
 * other sixty-eight images — so failures are collected, printed as a list at
 * the end, and turned into a non-zero exit code. Re-running picks up exactly
 * what is missing, because existing files are skipped by default.
 */

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const ONLY = (args.find((a) => a.startsWith("--only=")) ?? "").slice(7).split(",").filter(Boolean);

const log = (...a) => console.log("[seed:projects:media]", ...a);

/* str-frontend/public, resolved from this file rather than from cwd so the
   script works from any directory. Overridable for a checkout that does not
   keep the two repos side by side. */
const MEDIA_SOURCE_DIR =
  process.env.FRONTEND_PUBLIC_DIR ??
  path.resolve(import.meta.dirname, "../../../str-frontend/public");

const OUT_DIR = path.join(env.upload.dir, MEDIA_FOLDER);

/** Consent walls and newsletter modals sit over the hero on half the web. */
const DISMISS = [
  "#onetrust-accept-btn-handler",
  "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
  "button:has-text('Accept all')",
  "button:has-text('Accept All')",
  "button:has-text('Allow all')",
  "button:has-text('I agree')",
  "button:has-text('Got it')",
  "[aria-label='Close']",
];

/* ── The copy half ──────────────────────────────────────────────────────── */

async function copyEntry(entry, dest) {
  const src = path.join(MEDIA_SOURCE_DIR, entry.copy);
  try {
    await fs.copyFile(src, dest);
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`source missing: ${path.relative(MEDIA_SOURCE_DIR, src)} (in ${MEDIA_SOURCE_DIR})`);
    }
    throw err;
  }
}

/* ── The screenshot half ────────────────────────────────────────────────── */

/**
 * Puts the requested band of the page under the viewport.
 *
 * Fractions rather than pixels for most entries: a marketing site grows a
 * section every quarter, and a hard-coded 2400px that framed the pricing table
 * in March frames the footer by August. A fraction of the scrollable range
 * degrades gracefully instead.
 */
async function scrollTo(page, at) {
  if (typeof at === "string") {
    const el = page.locator(at).first();
    await el.scrollIntoViewIfNeeded({ timeout: 8000 });
    return;
  }
  await page.evaluate((fraction) => {
    const max = Math.max(0, document.body.scrollHeight - window.innerHeight);
    window.scrollTo({ top: fraction >= 1 ? fraction : max * fraction, behavior: "instant" });
  }, at);
}

async function capture(ctx, entry, dest) {
  const page = await ctx.newPage();
  try {
    /* domcontentloaded, not networkidle: an ad-tech or analytics site keeps a
       socket open forever and networkidle simply never fires. The explicit
       settle below is what actually decides when the page is ready. */
    const res = await page.goto(entry.shot.url, { waitUntil: "domcontentloaded", timeout: 60_000 });

    /* ⚑ THE GUARD THAT MATTERS. A 403 or a 404 is a perfectly renderable page:
       Playwright screenshots it happily, the file lands at the right path, the
       seeder's preflight finds it, and a case study ships with "403 —
       Forbidden" in its gallery. It happened on the first run of this script
       against two of the eleven sites, and nothing anywhere reported it —
       which is the whole argument for checking the status rather than
       trusting that a screenshot exists. */
    const status = res?.status() ?? 0;
    if (status < 200 || status >= 300) {
      throw new Error(`HTTP ${status} — refusing to screenshot an error page`);
    }

    await page.waitForTimeout(3500);

    /* Client-side routing, for SPAs whose deep links the server will not serve
       directly. zuzuva.com answers 403 to a direct GET /products but routes to
       it fine in the browser, which is the only way a real visitor ever
       reaches it — so that is how it is captured. */
    if (entry.shot.click) {
      const link = page.locator(entry.shot.click).first();
      await link.waitFor({ state: "visible", timeout: 15_000 });
      await link.click();
      await page.waitForTimeout(5000);
    }

    for (const selector of DISMISS) {
      const button = page.locator(selector).first();
      if (await button.isVisible().catch(() => false)) {
        await button.click({ timeout: 2500 }).catch(() => {});
        await page.waitForTimeout(400);
        break;
      }
    }

    /* Scroll the whole page once before framing. Lazy-loaded images below the
       fold are the single biggest cause of a screenshot full of grey
       placeholder boxes, and an IntersectionObserver only fires if the element
       has actually been near the viewport. */
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(900);

    await scrollTo(page, entry.shot.at);
    await page.waitForTimeout(1400);

    /* Animations that are mid-flight when the shutter opens produce a
       half-faded heading. Disabling them is more reliable than waiting. */
    await page.addStyleTag({
      content: `*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}`,
    });
    await page.waitForTimeout(300);

    await page.screenshot({
      path: dest,
      // Viewport, not fullPage: the cover and gallery boxes on the case-study
      // page are 16:9 and 16:10 with object-cover, so a 12,000px full-page
      // capture would be cropped down to its top 900px anyway — and the point
      // of these three shots is to show the sections BELOW the hero.
      fullPage: false,
      ...(entry.ext === "jpg" ? { type: "jpeg", quality: 86 } : { type: "png" }),
    });
  } finally {
    await page.close().catch(() => {});
  }
}

/* ── Driver ─────────────────────────────────────────────────────────────── */

async function run() {
  const wanted = [...MEDIA.values()].filter(
    (e) => ONLY.length === 0 || ONLY.some((o) => e.key.includes(o))
  );

  if (wanted.length === 0) {
    log(`--only=${ONLY.join(",")} matched no keys. Nothing to do.`);
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const todo = [];
  let skipped = 0;
  for (const entry of wanted) {
    const dest = path.join(OUT_DIR, entry.filename);
    if (!FORCE && (await fs.access(dest).then(() => true, () => false))) {
      skipped += 1;
      continue;
    }
    todo.push({ entry, dest });
  }

  log(`${wanted.length} planned · ${skipped} already on disk · ${todo.length} to write`);
  log(`out: ${OUT_DIR}`);
  if (todo.length === 0) return;

  const failures = [];

  /* Copies first: they are local, instant, and finishing them before the
     browser starts means a Playwright problem never blocks the half of the
     catalogue that does not need a browser. */
  const copies = todo.filter((t) => t.entry.copy);
  for (const { entry, dest } of copies) {
    try {
      await copyEntry(entry, dest);
      log(`  copied  ${entry.key}`);
    } catch (err) {
      failures.push([entry.key, err.message]);
      log(`  ✗ copy  ${entry.key}: ${err.message}`);
    }
  }

  const shots = todo.filter((t) => t.entry.shot);
  if (shots.length > 0) {
    /* Imported here, not at the top. Playwright pulls in a large module graph
       and, more importantly, a run that is only copying files should not fail
       on a machine where `npx playwright install` was never run. */
    const { chromium } = await import("playwright");
    const browser = await chromium.launch();
    const ctx = await browser.newContext({
      viewport: { width: FRAME.width, height: FRAME.height },
      deviceScaleFactor: FRAME.deviceScaleFactor,
      // A default Playwright UA is fingerprinted and blocked by roughly a
      // third of managed WordPress hosts, which answer 403 to the capture and
      // 200 to a browser. This is the same Chrome it actually is.
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "en-GB",
      // Honoured by well-behaved sites, and it removes the animation that
      // would otherwise be mid-flight when the shutter opens.
      reducedMotion: "reduce",
    });

    for (const { entry, dest } of shots) {
      try {
        await capture(ctx, entry, dest);
        log(`  shot    ${entry.key}  ← ${entry.shot.url}`);
      } catch (err) {
        failures.push([entry.key, err.message.split("\n")[0]]);
        log(`  ✗ shot  ${entry.key}: ${err.message.split("\n")[0]}`);
      }
    }

    await ctx.close();
    await browser.close();
  }

  log(`done — ${todo.length - failures.length}/${todo.length} written`);

  if (failures.length > 0) {
    log(`⚠ ${failures.length} failed. Re-run to retry only these:`);
    for (const [key, message] of failures) log(`   · ${key}: ${message}`);
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error("[seed:projects:media] failed:", err.message);
  process.exitCode = 1;
});
