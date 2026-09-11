/**
 * Publish the service catalogue through the live API instead of through Mongo.
 *
 *   npm run push:services                       # dry run against the API in .env
 *   npm run push:services -- --apply
 *   npm run push:services -- --apply --api=https://str-backend-wbpy.onrender.com/api/v1
 *   npm run push:services -- --apply --only=dashboard-development,graphic-design
 *
 * ── WHY THIS EXISTS ALONGSIDE `npm run seed` ─────────────────────────────
 * The seeder connects straight to MongoDB and touches eight collections. That
 * is the right tool locally and the wrong one for a production database you
 * only want to add nine services to: it needs the connection string on the
 * machine running it, and a mistyped flag reaches projects and blogs too.
 *
 * This script holds a session like the admin panel does, so it goes through
 * exactly the middleware a real edit goes through: validators, HTML
 * sanitisation, role check, rate limiter. If the payload would be rejected in
 * the dashboard, it is rejected here, which makes it a genuine test of the
 * write path rather than a way around it.
 *
 * ── WHY `image` IS NEVER SENT ────────────────────────────────────────────
 * Artwork is uploaded per service from /admin/services. Sending "" here would
 * blank an image that somebody already uploaded, every time this runs. The
 * field is deleted from the payload rather than omitted from the seed file,
 * so the seed file stays the single source for everything else.
 *
 * Credentials come from the same SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD pair
 * that `npm run seed:admin` uses, or from ADMIN_EMAIL / ADMIN_PASSWORD.
 */
import process from "node:process";
import env from "../config/env.js";
import services from "../seed/services.js";

/* ── args ──────────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const value = (n) => argv.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");

const APPLY = flag("apply");
const API = (value("api") ?? process.env.API_URL ?? `http://localhost:${env.port}/api/v1`).replace(
  /\/+$/,
  ""
);
const ONLY = value("only")
  ?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const EMAIL = value("email") ?? process.env.SEED_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL;
const PASSWORD = value("password") ?? process.env.SEED_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;

const log = (...a) => console.log("[push:services]", ...a);

/* ── http ──────────────────────────────────────────────────────────────── */

async function call(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    /* express-validator failures arrive as an array under `details`. Printing
       only `message` here turns "shortDescription must be 240 characters or
       fewer" into a bare "Validation failed", which is the single most
       annoying way to debug a seed payload. */
    const detail = Array.isArray(payload.details)
      ? payload.details.map((d) => `${d.field}: ${d.message}`).join("; ")
      : "";
    const err = new Error(
      `${res.status} ${method} ${path} — ${payload.message ?? res.statusText}${detail ? ` (${detail})` : ""}`
    );
    err.status = res.status;
    throw err;
  }
  return payload;
}

/* ── payload ───────────────────────────────────────────────────────────── */

/**
 * The API derives `slug` from `title` and the validator rejects the field
 * outright, so it is stripped here rather than silently ignored. `image` and
 * `imageAlt` are stripped for the reason in the header comment.
 */
function payloadFor(service) {
  const { slug, image, imageAlt, ...rest } = service;
  return rest;
}

/* ── run ───────────────────────────────────────────────────────────────── */

async function run() {
  if (!EMAIL || !PASSWORD) {
    console.error(
      "[push:services] No credentials. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env, or pass --email= and --password=."
    );
    process.exit(1);
  }

  const planned = ONLY ? services.filter((s) => ONLY.includes(s.slug)) : services;
  if (ONLY && planned.length !== ONLY.length) {
    const missing = ONLY.filter((s) => !services.some((x) => x.slug === s));
    console.error(`[push:services] Unknown slug(s) in --only: ${missing.join(", ")}`);
    process.exit(1);
  }

  log(`API      ${API}`);
  log(`Services ${planned.length}`);
  log(`Mode     ${APPLY ? "APPLY" : "dry run"}`);

  const { token } = await call("/auth/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });
  if (!token) throw new Error("Login succeeded but returned no token.");
  log("Authenticated.");

  /* One list call, not one lookup per service. `limit=200` because the default
     page size is smaller than the catalogue will eventually be, and a missed
     row here means a duplicate create rather than an update. */
  const { data: existing } = await call("/services?limit=200&sort=order", { token });
  const bySlug = new Map(existing.map((s) => [s.slug, s]));
  log(`${existing.length} service(s) already published.`);

  const results = [];
  for (const service of planned) {
    const current = bySlug.get(service.slug);
    const action = current ? "update" : "create";

    if (!APPLY) {
      results.push({ slug: service.slug, action: `${action} (dry)` });
      continue;
    }

    try {
      if (current) {
        await call(`/services/${current._id}`, {
          method: "PATCH",
          body: payloadFor(service),
          token,
        });
      } else {
        await call("/services", { method: "POST", body: payloadFor(service), token });
      }
      results.push({ slug: service.slug, action: `${action}d` });
    } catch (err) {
      results.push({ slug: service.slug, action: `FAILED: ${err.message}` });
    }

    /* The global limiter allows 300 requests per window and this loop makes at
       most 18, so the pause is not about the limit. It is about not hammering a
       free tier instance that has just cold started. */
    await new Promise((r) => setTimeout(r, 120));
  }

  console.log("");
  for (const r of results) console.log(`  ${r.slug.padEnd(32)} ${r.action}`);

  const failed = results.filter((r) => r.action.startsWith("FAILED"));
  console.log("");
  log(APPLY ? `Done. ${results.length - failed.length} ok, ${failed.length} failed.` : "Dry run. Re-run with --apply to write.");
  process.exit(failed.length ? 1 : 0);
}

run().catch((err) => {
  console.error("[push:services] Failed:", err.message);
  process.exit(1);
});
