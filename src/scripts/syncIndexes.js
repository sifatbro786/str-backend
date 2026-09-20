import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db.js";

/**
 * Deploy-time index build.
 *
 * ── WHY THIS SCRIPT EXISTS ───────────────────────────────────────────────
 * config/db.js sets `autoIndex: !env.isProd`, which is the correct setting:
 * letting Mongoose build indexes during app boot races the first requests and
 * makes a restart under load unpredictable. But "manage explicitly in prod"
 * only works if something actually does it, and until this file nothing did.
 * The result was a production database with no index beyond _id — every
 * public list query a collection scan, and every `unique: true` in the schemas
 * (slug, key, email) not enforced at all.
 *
 * So this is the other half of that setting. Run it as a deploy step, after
 * `npm ci` and before the process restart.
 *
 * ── WHY syncIndexes() AND NOT ensureIndexes() ────────────────────────────
 * ensureIndexes() only ever adds. An index dropped from a schema six months
 * ago stays in Mongo forever, still being written to on every insert and still
 * costing RAM in the working set, with nothing in the codebase to explain it.
 * syncIndexes() makes the schema the single source of truth in both
 * directions, which is the point.
 *
 * ⚑ THAT MEANS IT DROPS. Any index in the collection that is not declared on
 * the schema is removed. Two consequences worth knowing before the first run:
 *
 *   1. An index created by hand in Compass/Atlas — for a one-off report, or
 *      by a previous developer — disappears. If one should be kept, declare
 *      it on the schema first, then run this.
 *   2. The first run builds the `unique` indexes for real, and if duplicate
 *      rows already exist the build FAILS. That failure is the correct
 *      outcome: it names the collection and the duplicate key, which is data
 *      that needs cleaning rather than an error to route around.
 *
 * Builds are background/non-blocking on MongoDB 4.2+, but still cost IO on a
 * small VPS. Prefer off-peak for the first run.
 */

/* Side-effect imports. Each model file calls mongoose.model() at module scope,
   which is what registers the schema — so importing for the side effect is
   enough and there is nothing to bind. A model missing from this list is
   simply never synced, silently, so it is kept in the same order as
   src/models/ and should be extended whenever a model is added. */
import "../models/Blog.js";
import "../models/GraphicsQuote.js";
import "../models/Inquiry.js";
import "../models/PageMeta.js";
import "../models/Project.js";
import "../models/Service.js";
import "../models/SiteContent.js";
import "../models/Team.js";
import "../models/Testimonial.js";
import "../models/User.js";

/** Models that exist on disk but were not imported above — a loud reminder. */
const EXPECTED = [
  "Blog",
  "GraphicsQuote",
  "Inquiry",
  "PageMeta",
  "Project",
  "Service",
  "SiteContent",
  "Team",
  "Testimonial",
  "User",
];

async function main() {
  await connectDB();

  const registered = mongoose.modelNames();
  const unregistered = EXPECTED.filter((m) => !registered.includes(m));
  if (unregistered.length) {
    throw new Error(
      `Models declared in EXPECTED but not registered: ${unregistered.join(", ")}. ` +
        `Check the side-effect imports at the top of this file.`
    );
  }

  let failed = 0;

  for (const name of registered) {
    const Model = mongoose.model(name);
    try {
      // Returns the names of indexes it removed. Resolves once the build is
      // complete, so the loop is genuinely sequential — one collection at a
      // time keeps the IO burst off a shared VPS disk.
      const dropped = await Model.syncIndexes();
      const kept = Object.keys(await Model.collection.indexInformation()).length;

      // eslint-disable-next-line no-console
      console.log(
        `[indexes] ${name.padEnd(14)} ok — ${kept} index(es)` +
          (dropped.length ? `, dropped: ${dropped.join(", ")}` : "")
      );
    } catch (err) {
      failed += 1;
      // A duplicate-key failure here is the useful case, so surface the whole
      // message rather than a summary: it names the offending value.
      // eslint-disable-next-line no-console
      console.error(`[indexes] ${name.padEnd(14)} FAILED — ${err.message}`);
    }
  }

  await disconnectDB();

  if (failed > 0) {
    throw new Error(
      `${failed} collection(s) failed to sync. ` +
        `A duplicate-key error means real duplicate rows — clean them, then re-run.`
    );
  }

  // eslint-disable-next-line no-console
  console.log(`[indexes] Done. ${registered.length} model(s) in sync.`);
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(`[indexes] ${err.message}`);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
