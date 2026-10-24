import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db.js";

/**
 * Read-only dry run for `npm run indexes:sync`. Changes nothing.
 *
 * ── WHY THIS EXISTS SEPARATELY ───────────────────────────────────────────
 * syncIndexes() drops any index that is in Mongo but not in a schema, and a
 * dropped index on a live database is not something to discover afterwards.
 * Mongoose's diffIndexes() answers exactly the question worth asking first —
 * what WOULD be created, what WOULD be dropped — without touching anything.
 *
 * Run this, read it, then run the sync.
 *
 * It is also worth keeping around after that. In this setup dev and the VPS
 * share one Atlas database and local runs have autoIndex on, so indexes can
 * appear without anyone deciding they should. This prints the actual state.
 */

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

async function main() {
  await connectDB();
  // eslint-disable-next-line no-console
  console.log(`\n[check] database: ${mongoose.connection.name}\n`);

  let toCreate = 0;
  let toDrop = 0;

  for (const name of mongoose.modelNames().sort()) {
    const Model = mongoose.model(name);

    let existing = [];
    try {
      existing = (await Model.collection.indexes()).map((i) => i.name);
    } catch {
      // A collection with no documents yet does not exist on disk.
      // eslint-disable-next-line no-console
      console.log(`${name.padEnd(15)} (collection does not exist yet)`);
      continue;
    }

    const count = await Model.estimatedDocumentCount();
    // { toDrop: [names], toCreate: [keyObjects] } — computes nothing on the server.
    const diff = await Model.diffIndexes();

    toCreate += diff.toCreate.length;
    toDrop += diff.toDrop.length;

    // eslint-disable-next-line no-console
    console.log(
      `${name.padEnd(15)} ${String(count).padStart(6)} docs   ${existing.length} index(es): ${existing.join(", ")}`
    );
    if (diff.toCreate.length) {
      // eslint-disable-next-line no-console
      console.log(
        `${" ".repeat(15)}   + would CREATE: ${diff.toCreate.map((k) => JSON.stringify(k)).join(", ")}`
      );
    }
    if (diff.toDrop.length) {
      // eslint-disable-next-line no-console
      console.log(`${" ".repeat(15)}   - would DROP:   ${diff.toDrop.join(", ")}`);
    }
  }

  await disconnectDB();

  // eslint-disable-next-line no-console
  console.log(
    `\n[check] ${toCreate} index(es) would be created, ${toDrop} would be dropped.\n` +
      (toCreate === 0 && toDrop === 0
        ? "[check] Already in sync — running indexes:sync would change nothing.\n"
        : "[check] Read the DROP lines above before running `npm run indexes:sync`.\n" +
          "[check] Anything dropped was created outside the schemas (by hand in Compass,\n" +
          "[check] or left over from a removed field). Keep it by declaring it on the\n" +
          "[check] schema first; otherwise the drop is the intended cleanup.\n")
  );
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(`[check] ${err.message}`);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
