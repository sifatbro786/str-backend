import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";

import env from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";
import Project from "../models/Project.js";
import Service from "../models/Service.js";
import MEDIA, { MEDIA_FOLDER } from "./projects.media.js";
import { projects } from "./projects.data.js";

/**
 * Seeds /projects with the real case-study catalogue.
 *
 *   npm run seed:projects              # write what is missing, touch nothing else
 *   npm run seed:projects -- --force   # overwrite the seeded rows with this file
 *   npm run seed:projects -- --prune   # also delete rows this file does not know
 *
 * Run `npm run seed:projects:media` FIRST. This script writes image paths
 * whether or not the files behind them exist, and a record pointing at a
 * missing file is not an error anywhere in the stack — the page just renders
 * the STR logo where a screenshot should be. The preflight below refuses to
 * seed when the files are absent rather than letting that ship.
 *
 * ── WHY IT REFUSES TO OVERWRITE BY DEFAULT ───────────────────────────────
 * Same reason as packages.seed.js: every field here is editable at
 * /admin/projects, and this file is a snapshot of the copy as it stood the day
 * it was written. Re-running it against a database an editor has been working
 * in would silently replace their edits with these — no error, no diff, and
 * nobody finds out until a client reads their own case study and it has
 * reverted. Seeding what is missing is safe; replacing what exists is a
 * deliberate act and needs the flag.
 *
 * ── WHY --prune EXISTS, AND WHY IT IS NOT THE DEFAULT ────────────────────
 * The rows this replaced were placeholders with invented clients and shared
 * screenshots, and leaving them in place means the real catalogue is published
 * mixed in with them. So there has to be a way to remove them. It is not the
 * default and it never should be: a project this file does not know about is
 * usually one somebody published from the dashboard, and dropping the
 * collection to "clean up" is how that work disappears. --prune writes every
 * document it is about to delete to a timestamped JSON file first, so the
 * decision is reversible by hand.
 */

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const PRUNE = args.includes("--prune");

const log = (...a) => console.log("[seed:projects]", ...a);

/**
 * Every image path in the file must exist on disk before anything is written.
 *
 * This is the check that makes the two-script setup safe. Without it the
 * failure mode is a fully seeded catalogue of fallback logos, which looks like
 * a CSS bug and sends whoever debugs it into the frontend for an afternoon.
 */
async function preflightMedia() {
  const dir = path.join(env.upload.dir, MEDIA_FOLDER);
  const missing = [];

  for (const entry of MEDIA.values()) {
    const ok = await fs.access(path.join(dir, entry.filename)).then(() => true, () => false);
    if (!ok) missing.push(entry.key);
  }

  if (missing.length === 0) {
    log(`media: all ${MEDIA.size} files present in ${dir}`);
    return;
  }

  throw new Error(
    `${missing.length} of ${MEDIA.size} images are missing from ${dir}.\n` +
      `  Run: npm run seed:projects:media\n` +
      `  Missing: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? `, +${missing.length - 8} more` : ""}`
  );
}

/**
 * Warns about serviceTypes with no Service document behind them.
 *
 * Not fatal, and deliberately so: the case study still reads correctly, it is
 * one link in the tag row that 404s, and refusing to seed a whole catalogue
 * over it would be the wrong trade. But it is invisible from the admin panel,
 * so it has to be said out loud here.
 */
async function checkServiceLinks() {
  const slugs = new Set((await Service.find({}).select("slug").lean()).map((s) => s.slug));
  const used = new Set(projects.flatMap((p) => p.serviceTypes));
  const orphans = [...used].filter((s) => !slugs.has(s));

  if (orphans.length > 0) {
    log(`⚠ serviceTypes with no Service document: ${orphans.join(", ")}`);
    log("  /services/<slug> will 404 from the tag row on those case studies.");
  } else {
    log(`serviceTypes: all ${used.size} in use resolve to a seeded service`);
  }
}

async function seedProjects() {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const project of projects) {
    const existing = await Project.findOne({ slug: project.slug }).select("_id").lean();

    if (existing && !FORCE) {
      skipped += 1;
      continue;
    }

    /* findOneAndUpdate, not insertMany: a re-run after a half-finished run
       completes it instead of dying on the first duplicate slug, which is the
       most common reason anyone runs a seeder twice.

       The slug is passed in the body on purpose. Project's pre('validate')
       hook derives a slug from the title UNLESS one is set explicitly, and the
       curated slugs here read better than the generated form
       ("teads-global-advertising-platform" rather than the full title
       slugified) — and, more importantly, they are the published URLs. */
    await Project.findOneAndUpdate({ slug: project.slug }, project, {
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    existing ? (updated += 1) : (created += 1);
  }

  log(`projects: ${created} created, ${updated} updated, ${skipped} left alone`);
}

async function prune() {
  const keep = projects.map((p) => p.slug);
  const doomed = await Project.find({ slug: { $nin: keep } }).lean();

  if (doomed.length === 0) {
    log("prune: nothing outside this file. Collection is clean.");
    return;
  }

  /* Backed up before deletion, not after, and outside the upload directory so
     a UPLOAD_DIR that is a mounted volume does not take it with the images.
     Reversible by hand is the whole point — these are documents somebody may
     have written from the dashboard. */
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = path.resolve(process.cwd(), `projects-pruned-${stamp}.json`);
  await fs.writeFile(backup, JSON.stringify(doomed, null, 2));

  const { deletedCount } = await Project.deleteMany({ slug: { $nin: keep } });

  log(`prune: removed ${deletedCount} project(s) this file does not know:`);
  for (const d of doomed) log(`   · ${d.slug}`);
  log(`   backup written to ${backup}`);
}

async function run() {
  await preflightMedia();
  await connectDB();

  if (FORCE) log("⚠ --force: existing seeded rows WILL be overwritten with this file's copy.");
  if (PRUNE) log("⚠ --prune: rows outside this file WILL be deleted (backed up first).");

  await checkServiceLinks();
  await seedProjects();
  if (PRUNE) await prune();

  const total = await Project.countDocuments();
  const featured = await Project.countDocuments({ featured: true });
  log(`collection now holds ${total} project(s), ${featured} featured.`);
  log("done.");
}

run()
  .catch((err) => {
    console.error("[seed:projects] failed:", err.message);
    if (err.errors) {
      for (const [p, e] of Object.entries(err.errors)) console.error(`  · ${p}: ${e.message}`);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await disconnectDB().catch(() => {});
  });
