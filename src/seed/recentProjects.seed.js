import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import mongoose from "mongoose";

import env from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";
import Project from "../models/Project.js";
import { MEDIA, DEMOTE, projects } from "./recentProjects.data.js";

/**
 * Seeds the 4 recent web builds into /projects, with images.
 *
 *   npm run seed:recent                 # capture missing media, insert missing rows
 *   npm run seed:recent -- --force      # recapture all media, overwrite these 4 rows
 *   npm run seed:recent -- --media-only # write files only
 *   npm run seed:recent -- --db-only    # write DB only (files must already exist)
 *
 * ⚑ RUN IT ON THE VPS. Images are written into UPLOAD_DIR/projects on the
 * machine that runs this, and the live API serves /uploads from the VPS disk.
 * Local dev and the VPS share one Atlas DB, so a local run would publish rows
 * pointing at files the VPS does not have.
 * Playwright needs Chromium once on that box:  npx playwright install --with-deps chromium
 *
 * Filenames are sha1(key)-derived, so re-runs land on the same paths and still
 * match upload.controller's SAFE_FILENAME (an editor can delete them from the
 * dashboard). Shot failures are not fatal: a missing gallery frame is dropped,
 * a missing cover falls back to the og image.
 */

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const MEDIA_ONLY = args.includes("--media-only");
const DB_ONLY = args.includes("--db-only");

const FOLDER = "projects";
const OUT_DIR = path.join(env.upload.dir, FOLDER);
const EXT = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const log = (...a) => console.log("[seed:recent]", ...a);
const stem = (key) => `${key}-${crypto.createHash("sha1").update(key).digest("hex").slice(0, 16)}`;

/** Existing file for a key, whatever extension it was saved with. */
async function findFile(key) {
  const prefix = `${stem(key)}.`;
  const files = await fs.readdir(OUT_DIR).catch(() => []);
  return files.find((f) => f.startsWith(prefix) && /\.(jpg|png|webp|avif)$/.test(f)) ?? null;
}

const publicPath = (file) => `${env.upload.publicPath}/${FOLDER}/${file}`;

/* ── Media ──────────────────────────────────────────────────────────────── */

async function download(entry) {
  const res = await fetch(entry.download, { headers: { "user-agent": UA }, redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  const ext = EXT.get(type);
  if (!ext) throw new Error(`unsupported content-type "${type}"`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > env.upload.maxBytes) throw new Error(`${(buf.length / 1048576).toFixed(1)}MB exceeds upload cap`);
  await fs.writeFile(path.join(OUT_DIR, `${stem(entry.key)}.${ext}`), buf);
}

async function capture(ctx, entry) {
  const page = await ctx.newPage();
  try {
    const res = await page.goto(entry.shot.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    const status = res?.status() ?? 0;
    // A 403/404 page screenshots fine and would ship as a case-study image.
    if (status < 200 || status >= 300) throw new Error(`HTTP ${status}, refusing to capture an error page`);

    await page.waitForTimeout(3500);

    // Walk the page once so lazy images and next/image placeholders resolve.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(900);

    await page.evaluate((at) => {
      const max = Math.max(0, document.body.scrollHeight - window.innerHeight);
      window.scrollTo({ top: at >= 1 ? at : max * at, behavior: "instant" });
    }, entry.shot.at ?? 0);
    await page.waitForTimeout(1400);

    await page.addStyleTag({
      content:
        "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}",
    });
    await page.waitForTimeout(300);

    const buf = await page.screenshot({ fullPage: false, type: "jpeg", quality: 84 });
    if (buf.length > env.upload.maxBytes) throw new Error("screenshot exceeds upload cap");
    await fs.writeFile(path.join(OUT_DIR, `${stem(entry.key)}.jpg`), buf);
  } finally {
    await page.close().catch(() => {});
  }
}

async function seedMedia() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const todo = [];
  for (const entry of MEDIA) {
    if (!FORCE && (await findFile(entry.key))) continue;
    todo.push(entry);
  }
  log(`media: ${MEDIA.length} planned, ${MEDIA.length - todo.length} on disk, ${todo.length} to write → ${OUT_DIR}`);
  if (todo.length === 0) return;

  const failures = [];

  for (const entry of todo.filter((e) => e.download)) {
    try {
      await download(entry);
      log(`  ↓ ${entry.key}`);
    } catch (err) {
      failures.push([entry.key, err.message]);
      log(`  ✗ ${entry.key}: ${err.message}`);
    }
  }

  const shots = todo.filter((e) => e.shot);
  if (shots.length) {
    let chromium;
    try {
      ({ chromium } = await import("playwright"));
    } catch {
      throw new Error("playwright not installed. Run: npm i && npx playwright install --with-deps chromium");
    }
    const browser = await chromium.launch();
    const common = { userAgent: UA, locale: "en-GB", reducedMotion: "reduce" };
    const desktop = await browser.newContext({
      ...common,
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const mobile = await browser.newContext({
      ...common,
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    });

    try {
      for (const entry of shots) {
        try {
          await capture(entry.shot.mobile ? mobile : desktop, entry);
          log(`  ◉ ${entry.key}  ← ${entry.shot.url}${entry.shot.mobile ? " (mobile)" : ""}`);
        } catch (err) {
          failures.push([entry.key, err.message.split("\n")[0]]);
          log(`  ✗ ${entry.key}: ${err.message.split("\n")[0]}`);
        }
      }
    } finally {
      await browser.close().catch(() => {});
    }
  }

  if (failures.length) {
    log(`⚠ ${failures.length} media item(s) failed; re-run to retry only those. Seeding continues with what exists.`);
    process.exitCode = 1;
  }
}

/* ── Records ────────────────────────────────────────────────────────────── */

async function resolveImages(p) {
  const ref = async (key) => {
    const f = await findFile(key);
    return f ? publicPath(f) : "";
  };

  const cover = (await ref(p.cover)) || (await ref(p.og));
  const og = (await ref(p.og)) || cover;
  if (!cover) throw new Error(`${p.slug}: neither cover nor og image exists in ${OUT_DIR}. Run without --db-only.`);

  const galleryImages = [];
  for (const [key, caption, layoutType] of p.gallery) {
    const url = await ref(key);
    if (url) galleryImages.push({ url, caption, layoutType });
    else log(`  · ${p.slug}: gallery "${key}" missing on disk, skipped`);
  }

  const { cover: _c, og: _o, gallery: _g, ...rest } = p;
  return { ...rest, coverImage: cover, thumbnailImage: cover, ogImage: og, galleryImages };
}

async function seedRecords() {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const p of projects) {
    const existing = await Project.findOne({ slug: p.slug }).select("_id").lean();
    if (existing && !FORCE) {
      skipped += 1;
      continue;
    }
    const data = await resolveImages(p);

    /* save(), not findOneAndUpdate: Project's pre("findOneAndUpdate") hook
       re-slugs from the title, which would replace the curated slug and make
       the next run insert a duplicate. pre("validate") keeps an explicit slug
       as long as it is marked modified. */
    const doc = existing ? await Project.findById(existing._id) : new Project();
    doc.set(data);
    doc.markModified("slug");
    await doc.save();
    existing ? (updated += 1) : (created += 1);
  }
  log(`projects: ${created} created, ${updated} updated, ${skipped} already present (use --force to overwrite)`);

  for (const rx of DEMOTE) {
    const { modifiedCount } = await Project.updateMany({ slug: rx, featured: true }, { $set: { featured: false } });
    log(`demote ${rx}: ${modifiedCount} row(s) unfeatured`);
  }
}

async function run() {
  if (MEDIA_ONLY && DB_ONLY) throw new Error("--media-only and --db-only together do nothing");
  if (FORCE) log("⚠ --force: media recaptured and these 4 rows overwritten (dashboard edits to them are lost).");

  if (!DB_ONLY) await seedMedia();
  if (MEDIA_ONLY) return log("media only: done.");

  await connectDB();
  await seedRecords();

  const top = await Project.find({})
    .sort("-featured -displayOrder -createdAt")
    .limit(6)
    .select("title featured displayOrder")
    .lean();
  log("list now opens with:");
  top.forEach((d, i) => log(`  ${i + 1}. ${d.featured ? "★" : " "} [${d.displayOrder}] ${d.title}`));
  log("done. Bust the Next cache (revalidate the \"projects\" tag or redeploy) if the page still shows the old list.");
}

run()
  .catch((err) => {
    console.error("[seed:recent] failed:", err.message);
    if (err.errors) for (const [k, e] of Object.entries(err.errors)) console.error(`  · ${k}: ${e.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await disconnectDB().catch(() => {});
  });
