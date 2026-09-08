/**
 * Database seeder.
 *
 *   npm run seed                          # create or refresh everything
 *   npm run seed -- --fresh               # wipe the seeded collections first
 *   npm run seed -- --skip-inquiries      # leave the demo leads out
 *   npm run seed -- --dry                 # validate every document, write nothing
 *
 * Idempotent by design. Each document is matched on a natural key — slug,
 * email, name, pageIdentifier — then assigned and `.save()`d, so re-running is
 * a refresh rather than a duplication. `.save()` and not `updateOne` on purpose:
 * it is the only path that fires the pre-save and pre-validate hooks that own
 * slug generation, publishedAt, and password hashing.
 *
 * Write order is a dependency order, not a preference:
 *   users → services → projects → team → testimonials → blogs → meta → leads
 * Testimonials reference a Project; blogs reference a User.
 */
import crypto from "node:crypto";
import mongoose from "mongoose";
import slugify from "slugify";

import env from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";

import User from "../models/User.js";
import Service from "../models/Service.js";
import Project from "../models/Project.js";
import Team from "../models/Team.js";
import Testimonial from "../models/Testimonial.js";
import Blog from "../models/Blog.js";
import PageMeta from "../models/PageMeta.js";
import SiteContent from "../models/SiteContent.js";
import Inquiry from "../models/Inquiry.js";

import {
  services as servicesSeed,
  projects as projectsSeed,
  team as teamSeed,
  testimonials as testimonialsSeed,
  authors as authorsSeed,
  blogs as blogsSeed,
  pageMeta as pageMetaSeed,
  siteContent as siteContentSeed,
  inquiries as inquiriesSeed,
} from "../seed/index.js";

/* ── flags ─────────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);

const FRESH = flag("fresh");
const DRY = flag("dry");
const SKIP_INQUIRIES = flag("skip-inquiries");
const FORCE = flag("force");

const summary = [];
const record = (label, r) => summary.push({ label, ...r });

/* ── helpers ───────────────────────────────────────────────────────────── */

const log = (...args) => console.log("[seed]", ...args);

/**
 * The seed carries curated slugs — "terea-brand-growth-campaign" rather than
 * the generated "terea-brand-and-growth-campaign", and short article slugs
 * instead of a whole sentence — and they must match str-frontend/lib/data.js
 * exactly, or the static fallback and the live site serve different URLs.
 *
 * The models honour an explicitly-set slug (see the pre-validate hook in
 * Project.js), so the value in the seed file IS the value that lands in Mongo,
 * which makes it a safe lookup key on the second run.
 *
 * Kept for the assertion below: a curated slug still has to be a legal slug.
 */
const slugOf = (title) => slugify(title, { lower: true, strict: true });

/**
 * Guards against a hand-edited slug that slugify would rewrite — a trailing
 * space, an uppercase letter, an em dash. Such a value would be silently
 * normalised on save and then never match this script's lookup again,
 * duplicating the row on every subsequent run.
 */
function assertStableSlug(entity, doc) {
  if (!doc.slug) throw new Error(`${entity} "${doc.title}" has no slug in the seed file`);
  if (slugOf(doc.slug) !== doc.slug) {
    throw new Error(
      `${entity} slug "${doc.slug}" is not slug-stable — it would be rewritten to "${slugOf(doc.slug)}"`
    );
  }
}

/**
 * Find-or-create by natural key, then assign and save.
 *
 * `Object.assign` on a hydrated document marks the changed paths as modified,
 * which is exactly what the hooks key off. Fields absent from the seed are
 * left alone — an admin's manual edit to a field this file does not manage
 * survives a re-seed.
 */
async function upsertAll(Model, docs, { key, label, transform, keepSlug = false }) {
  let created = 0;
  let updated = 0;

  for (const raw of docs) {
    const payload = transform ? await transform(raw) : { ...raw };
    if (payload === null) continue;

    const filter = key(payload);
    let doc = await Model.findOne(filter);

    if (doc) {
      doc.set(payload);

      // The pre-validate hook re-derives the slug whenever `title` is modified
      // and `slug` is not. On a re-seed after a title edit that would silently
      // replace the curated slug — and since the slug is this script's lookup
      // key, the NEXT run would then find nothing and insert a duplicate.
      // Marking the path modified tells the hook the slug was set deliberately.
      if (keepSlug && payload.slug) doc.markModified("slug");

      if (!DRY) await doc.save();
      else await doc.validate();
      updated += 1;
    } else {
      // A new document has every path modified, so the hook already defers to
      // the supplied slug.
      doc = new Model(payload);
      if (!DRY) await doc.save();
      else await doc.validate();
      created += 1;
    }
  }

  record(label, { created, updated, total: docs.length });
  log(`${label.padEnd(13)} created ${created}, updated ${updated}`);
}

/* ── steps ─────────────────────────────────────────────────────────────── */

/** The account that owns the panel. Never touched if it already exists. */
async function seedSuperAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";
  const name = process.env.SEED_ADMIN_NAME ?? "Super Admin";

  const existing = await User.findOne({ role: "super_admin" });
  if (existing) {
    log(`super admin   present (${existing.email}) — untouched`);
    return existing;
  }

  if (!email || password.length < 8) {
    throw new Error(
      "No super_admin exists and SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (min 8 chars) are not set in .env"
    );
  }

  if (DRY) {
    log(`super admin   would be created: ${email}`);
    return null;
  }

  const user = await User.create({ name, email, password, role: "super_admin" });
  log(`super admin   created: ${user.email}`);
  return user;
}

/**
 * Byline accounts. Suspended and given a throwaway password that is generated
 * here and never printed — a byline is not a login, and both `protect` and
 * `login` reject a non-active account. Existing accounts keep their password
 * and status, so activating one from /admin is not undone by a re-seed.
 */
async function seedAuthors() {
  const byKey = new Map();
  let created = 0;

  for (const author of authorsSeed) {
    const email = author.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: author.name,
        email,
        password: crypto.randomBytes(36).toString("base64url"),
        role: author.role,
        status: author.status,
        avatar: author.avatar,
      });
      if (!DRY) await user.save();
      else await user.validate();
      created += 1;
    } else {
      // Refresh only the display fields. Never re-touch password or status.
      user.set({ name: author.name, avatar: author.avatar });
      if (!DRY) await user.save();
    }

    byKey.set(author.key, user);
  }

  record("authors", { created, updated: authorsSeed.length - created, total: authorsSeed.length });
  log(`authors       created ${created}, updated ${authorsSeed.length - created}`);
  return byKey;
}

/** Collections this script owns end to end. Users are never in this list. */
const OWNED = [
  ["Services", Service],
  ["Projects", Project],
  ["Team", Team],
  ["Testimonials", Testimonial],
  ["Blogs", Blog],
  ["PageMeta", PageMeta],
  ["SiteContent", SiteContent],
];

async function wipe() {
  if (env.isProd && !FORCE) {
    throw new Error("--fresh refuses to run with NODE_ENV=production. Add --force if you mean it.");
  }

  for (const [name, Model] of OWNED) {
    const { deletedCount } = await Model.deleteMany({});
    log(`wiped ${name}: ${deletedCount}`);
  }

  // Only the demo leads. A real submission from the public form is never
  // touched, even by --fresh — losing a live lead is not recoverable.
  const { deletedCount } = await Inquiry.deleteMany({ notes: /^DEMO LEAD/ });
  log(`wiped Inquiries (demo only): ${deletedCount}`);
}

/* ── run ───────────────────────────────────────────────────────────────── */

async function run() {
  log(`env: ${env.nodeEnv}${DRY ? " · DRY RUN (nothing will be written)" : ""}`);
  await connectDB();
  log(`db:  ${mongoose.connection.name}`);

  if (FRESH) {
    if (DRY) log("--fresh ignored during a dry run");
    else await wipe();
  }

  await seedSuperAdmin();
  const authorsByKey = await seedAuthors();

  await upsertAll(Service, servicesSeed, {
    label: "services",
    keepSlug: true,
    key: (d) => ({ slug: d.slug }),
    transform: (raw) => {
      assertStableSlug("Service", raw);
      return { ...raw };
    },
  });

  await upsertAll(Project, projectsSeed, {
    label: "projects",
    keepSlug: true,
    key: (d) => ({ slug: d.slug }),
    transform: (raw) => {
      assertStableSlug("Project", raw);
      return { ...raw };
    },
  });

  await upsertAll(Team, teamSeed, {
    label: "team",
    key: (d) => ({ name: d.name }),
  });

  await upsertAll(Testimonial, testimonialsSeed, {
    label: "testimonials",
    key: (d) => ({ clientName: d.clientName, companyName: d.companyName }),
    transform: async (raw) => {
      const { projectSlug, ...rest } = raw;
      if (!projectSlug) return { ...rest, projectRef: null };
      // A missing project must not abort the run — the testimonial is still
      // valid content, it simply loses its link.
      const project = await Project.findOne({ slug: projectSlug }).select("_id").lean();
      if (!project) log(`  ! testimonial "${raw.clientName}": no project "${projectSlug}"`);
      return { ...rest, projectRef: project?._id ?? null };
    },
  });

  await upsertAll(Blog, blogsSeed, {
    label: "blogs",
    keepSlug: true,
    key: (d) => ({ slug: d.slug }),
    transform: (raw) => {
      assertStableSlug("Blog", raw);
      const { authorKey, ...rest } = raw;
      const author = authorsByKey.get(authorKey);
      if (!author) {
        log(`  ! blog "${raw.slug}": unknown authorKey "${authorKey}" — skipped`);
        return null;
      }
      return { ...rest, author: author._id };
    },
  });

  await upsertAll(PageMeta, pageMetaSeed, {
    label: "page meta",
    key: (d) => ({ pageIdentifier: d.pageIdentifier }),
  });

  await upsertAll(SiteContent, siteContentSeed, {
    label: "site content",
    key: (d) => ({ key: d.key }),
  });

  if (SKIP_INQUIRIES) {
    log("inquiries     skipped (--skip-inquiries)");
  } else {
    await upsertAll(Inquiry, inquiriesSeed, {
      label: "inquiries",
      key: (d) => ({ senderEmail: d.senderEmail.toLowerCase() }),
    });
  }

  console.log("\n[seed] ─────────────────────────────────────────");
  for (const row of summary) {
    console.log(
      `[seed] ${row.label.padEnd(14)} ${String(row.created).padStart(3)} created  ${String(
        row.updated
      ).padStart(3)} updated`
    );
  }
  console.log("[seed] ─────────────────────────────────────────");

  if (DRY) {
    log("dry run complete — every document passed schema validation, nothing written.");
  } else {
    log("done. Sign in at /login and open /admin.");
  }

  await disconnectDB();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("\n[seed] FAILED:", err.message);
  if (err.errors) {
    for (const [path, e] of Object.entries(err.errors)) {
      console.error(`[seed]   ${path}: ${e.message}`);
    }
  }
  await disconnectDB().catch(() => {});
  process.exit(1);
});
