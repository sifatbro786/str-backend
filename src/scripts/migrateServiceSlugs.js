/**
 * Phase 6 re-slug: seven legacy service slugs → the nine the company sells.
 *
 *   npm run migrate:service-slugs             # dry run, prints the plan
 *   npm run migrate:service-slugs -- --apply  # writes
 *
 * Run this BEFORE `npm run seed`, and before deploying the frontend build that
 * ships the new lib/taxonomy.js. What it touches:
 *
 *   1. projects.serviceTypes[]  — remapped in place. Any document left holding
 *      a legacy value fails Project's enum on its next save, which shows up as
 *      a 400 on an unrelated admin edit and is genuinely slow to trace back.
 *   2. services                 — legacy rows are renamed to their new slug so
 *      the seeder updates them instead of creating a second copy beside them,
 *      and the dropped `icon` field is unset.
 *
 * Idempotent. Re-running after a successful pass finds nothing to do.
 */
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db.js";
import { SERVICE_TYPES } from "../models/Project.js";

/**
 * Legacy slug → new slug.
 *
 * `product-design` has no direct successor: the new catalogue sells design as
 * "Graphic Design", so product design work folds into it rather than being
 * deleted. Everything else is a straight rename. The three genuinely new
 * disciplines (consultancy, data, dashboards) have no legacy source and are
 * simply absent from this table.
 */
const REMAP = {
  "web-development": "website-development",
  "custom-software": "software-development",
  "mobile-applications": "mobile-app-development",
  "product-design": "graphic-design",
  "graphics-design": "graphic-design",
  "architectural-visualization": "2d-3d-design-and-animation",
  "digital-marketing": "digital-marketing",
};

const apply = process.argv.includes("--apply");
const log = (...a) => console.log("[migrate:slugs]", ...a);

/** Remap, drop anything unmapped, and de-duplicate (two old values can merge). */
function remapList(list = []) {
  const mapped = list.map((v) => REMAP[v] ?? (SERVICE_TYPES.includes(v) ? v : null));
  return [...new Set(mapped.filter(Boolean))];
}

async function run() {
  await connectDB();
  const projects = mongoose.connection.collection("projects");
  const services = mongoose.connection.collection("services");

  /* ── 1. projects.serviceTypes ──────────────────────────────────────── */

  const stale = await projects
    .find({ serviceTypes: { $in: Object.keys(REMAP).filter((k) => REMAP[k] !== k) } })
    .toArray();

  log(`${stale.length} project document(s) carry a legacy service slug.`);

  const plan = stale.map((doc) => ({
    _id: doc._id,
    title: doc.title,
    from: doc.serviceTypes ?? [],
    to: remapList(doc.serviceTypes),
  }));

  for (const p of plan) {
    console.log(`  ${p.from.join(", ").padEnd(46)} → ${p.to.join(", ") || "!! EMPTY"}   ${p.title}`);
  }

  /* A project with no serviceTypes fails the model's 1..4 validator, so an
     empty result is a blocker rather than a warning. It can only happen if
     REMAP loses a value that is not in the new enum either. */
  const emptied = plan.filter((p) => p.to.length === 0);
  if (emptied.length) {
    console.error(
      `[migrate:slugs] ${emptied.length} document(s) would end up with no serviceTypes. Fix REMAP first.`
    );
    await disconnectDB();
    process.exit(1);
  }

  /* ── 2. services rows ──────────────────────────────────────────────── */

  const legacyServices = await services
    .find({ slug: { $in: Object.keys(REMAP).filter((k) => REMAP[k] !== k) } })
    .toArray();

  log(`${legacyServices.length} service row(s) carry a legacy slug.`);

  /* graphics-design and product-design both map to graphic-design, so the
     second rename would violate the unique index on slug. Keep the first and
     delete the rest: the seeder rewrites the survivor's content anyway, and
     the content on a row about to be replaced is not worth a merge strategy. */
  const claimed = new Set(await services.distinct("slug"));
  const renames = [];
  const drops = [];
  for (const row of legacyServices) {
    const to = REMAP[row.slug];
    if (claimed.has(to)) drops.push({ _id: row._id, slug: row.slug, reason: `${to} already exists` });
    else {
      renames.push({ _id: row._id, from: row.slug, to });
      claimed.add(to);
    }
  }
  for (const r of renames) console.log(`  service ${r.from.padEnd(30)} → ${r.to}`);
  for (const d of drops) console.log(`  service ${d.slug.padEnd(30)} → delete (${d.reason})`);

  if (!apply) {
    log("Dry run. Re-run with --apply to write.");
    await disconnectDB();
    process.exit(0);
  }

  /* ── write ─────────────────────────────────────────────────────────── */

  for (const p of plan) {
    await projects.updateOne({ _id: p._id }, { $set: { serviceTypes: p.to } });
  }
  log(`Updated ${plan.length} project document(s).`);

  for (const r of renames) {
    await services.updateOne({ _id: r._id }, { $set: { slug: r.to } });
  }
  if (drops.length) {
    await services.deleteMany({ _id: { $in: drops.map((d) => d._id) } });
  }
  log(`Renamed ${renames.length} service row(s), removed ${drops.length}.`);

  // `icon` left the Service schema. Mongoose stops returning it on hydrated
  // documents but .lean() reads raw Mongo, so the dead field would keep
  // shipping in every public /services response until it is unset.
  const { modifiedCount } = await services.updateMany(
    { icon: { $exists: true } },
    { $unset: { icon: "" } }
  );
  log(`Dropped the dead \`icon\` field from ${modifiedCount} service row(s).`);

  await disconnectDB();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("[migrate:slugs] Failed:", err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
