import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db.js";
import PackageCategory from "../models/PackageCategory.js";
import Package from "../models/Package.js";
import PackagePage from "../models/PackagePage.js";
import { categories, tiers, page } from "./packages.data.js";

/**
 * Seeds /packages from the static dataset the page was built on.
 *
 *   npm run seed:packages          # fill empty collections, refuse to overwrite
 *   npm run seed:packages -- --force   # overwrite existing rows
 *
 * ── WHY IT REFUSES BY DEFAULT ────────────────────────────────────────────
 * Every row here is editable at /admin/packages, and this file is a snapshot
 * of the copy as it stood the day the route was built. Running it against a
 * database an editor has been working in silently replaces their prices with
 * these ones — no error, no diff, and nobody finds out until a client quotes a
 * number back. So the default is: seed what is missing, leave what exists, and
 * say which is which. `--force` is the deliberate act.
 *
 * ── WHY IT IS UPSERTS AND NOT insertMany ─────────────────────────────────
 * Idempotence. `key` and `code` are unique, so a re-run against a partially
 * seeded database completes it rather than failing on the first duplicate —
 * which matters because the most common reason to re-run a seeder is that the
 * last run died halfway.
 *
 * ── WHY IT NEVER DELETES ─────────────────────────────────────────────────
 * There is no --fresh and there should not be. A track this file does not know
 * about is one somebody added from the dashboard, and dropping the collection
 * to "clean up" is how that work disappears. Retiring a track is `isActive:
 * false` in the admin screen.
 */

const FORCE = process.argv.includes("--force");

const log = (...args) => console.log("[seed:packages]", ...args);

async function seedCategories() {
  const ids = new Map(); // key → _id, for the tier pass
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const category of categories) {
    const existing = await PackageCategory.findOne({ key: category.key }).select("_id").lean();

    if (existing && !FORCE) {
      ids.set(category.key, existing._id);
      skipped += 1;
      continue;
    }

    /* `isActive` and `order` are set on insert only: an editor who deactivated
       a track or reordered the tabs has made a decision, and a non-forced
       re-run must not undo it. Under --force the whole document is replaced,
       which is what --force means. */
    const doc = await PackageCategory.findOneAndUpdate(
      { key: category.key },
      { ...category, isActive: true },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    ids.set(category.key, doc._id);
    existing ? (updated += 1) : (created += 1);
  }

  log(`categories: ${created} created, ${updated} updated, ${skipped} left alone`);
  return ids;
}

async function seedTiers(categoryIds) {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const { categoryKey, ...tier } of tiers) {
    const category = categoryIds.get(categoryKey);
    if (!category) {
      // Cannot happen with the shipped data; it can the moment somebody adds a
      // tier row and forgets the matching category. Loud, and not fatal —
      // the remaining tiers are still worth seeding.
      log(`⚠ ${tier.code}: no category "${categoryKey}", skipped`);
      continue;
    }

    const existing = await Package.findOne({ code: tier.code }).select("_id").lean();
    if (existing && !FORCE) {
      skipped += 1;
      continue;
    }

    await Package.findOneAndUpdate(
      { code: tier.code },
      { ...tier, category, isActive: true },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    existing ? (updated += 1) : (created += 1);
  }

  log(`packages: ${created} created, ${updated} updated, ${skipped} left alone`);
}

async function seedPage() {
  const existing = await PackagePage.findOne({ key: "default" }).select("_id").lean();
  if (existing && !FORCE) {
    log("page copy: already present, left alone");
    return;
  }

  await PackagePage.findOneAndUpdate(
    { key: "default" },
    { key: "default", ...page },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  log(existing ? "page copy: overwritten" : "page copy: created");
}

async function run() {
  await connectDB();

  if (FORCE) log("⚠ --force: existing rows WILL be overwritten with the file's copy.");

  /* Sequential, not Promise.all: the tier pass needs the category ids the
     first pass produces, and the page write is a single document. There is
     nothing here worth parallelising — this runs once per environment. */
  const ids = await seedCategories();
  await seedTiers(ids);
  await seedPage();

  log("done.");
}

run()
  .catch((err) => {
    console.error("[seed:packages] failed:", err.message);
    if (err.errors) {
      for (const [path, e] of Object.entries(err.errors)) console.error(`  · ${path}: ${e.message}`);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    // disconnectDB is a no-op if connectDB threw before opening the pool.
    if (mongoose.connection.readyState !== 0) await disconnectDB().catch(() => {});
  });
