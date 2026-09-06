/**
 * One-shot: Project.serviceType (String) → Project.serviceTypes ([String]).
 *
 *   npm run migrate:service-types            # dry run, prints the plan
 *   npm run migrate:service-types -- --apply # writes
 *
 * Idempotent. Safe to re-run: documents that already have serviceTypes and no
 * serviceType are skipped.
 */
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db.js";
import Project, { SERVICE_TYPES } from "../models/Project.js";

// Old enum → new taxonomy. The two dropped values are folded into their nearest
// surviving discipline rather than deleted, so no project loses its category.
const REMAP = {
  "web-development": "web-development",
  "custom-software": "custom-software",
  "mobile-app": "mobile-applications",
  "ui-ux-design": "product-design",
  "cloud-devops": "custom-software",
  "cybersecurity": "custom-software",
};

const apply = process.argv.includes("--apply");

async function run() {
  await connectDB();
  const col = mongoose.connection.collection("projects");

  const legacy = await col.find({ serviceType: { $exists: true } }).toArray();
  console.log(`[migrate] ${legacy.length} document(s) still carry serviceType.`);

  const plan = legacy.map((doc) => {
    const mapped = REMAP[doc.serviceType];
    return { _id: doc._id, title: doc.title, from: doc.serviceType, to: mapped ?? null };
  });

  const unmapped = plan.filter((p) => !p.to);
  for (const p of plan) {
    console.log(`  ${p.from.padEnd(24)} → ${p.to ?? "!! NO MAPPING"}   ${p.title}`);
  }
  if (unmapped.length) {
    console.error(`[migrate] ${unmapped.length} document(s) have no mapping. Fix REMAP first.`);
    await disconnectDB();
    process.exit(1);
  }

  if (!apply) {
    console.log("[migrate] Dry run. Re-run with --apply to write.");
    await disconnectDB();
    process.exit(0);
  }

  // Written one-by-one rather than as an aggregation-pipeline update so the
  // remap table applies. Volume here is tens of documents, not millions.
  let n = 0;
  for (const p of plan) {
    await col.updateOne(
      { _id: p._id },
      { $set: { serviceTypes: [p.to] }, $unset: { serviceType: "" } }
    );
    n += 1;
  }
  console.log(`[migrate] Updated ${n} document(s).`);

  // Any document that predates the field entirely.
  const orphans = await col.countDocuments({ serviceTypes: { $exists: false } });
  if (orphans) console.warn(`[migrate] ${orphans} document(s) have no serviceTypes at all.`);

  await col.createIndex({ serviceTypes: 1, featured: -1, displayOrder: 1 });
  await col.dropIndex("serviceType_1").catch(() => {});
  console.log("[migrate] Indexes reconciled.");

  await disconnectDB();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("[migrate] Failed:", err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
