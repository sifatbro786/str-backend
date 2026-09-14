import Service from "../models/Service.js";

/**
 * The live service taxonomy, read from the Service collection.
 *
 * ── WHY THIS REPLACED A HARDCODED LIST ───────────────────────────────────
 * `Project.serviceTypes` used to validate against an array literal in
 * models/Project.js, mirrored by a second array literal in
 * str-frontend/lib/taxonomy.js. That made "add a service" a code change in two
 * repos plus a deploy, and until both shipped the new discipline was invisible
 * in the admin project form and rejected with a 400 by the API — which is
 * exactly what happened the first time somebody added one from the dashboard.
 *
 * The Service collection already IS the list. A project's serviceTypes are
 * foreign keys into it: the case-study page links each one to
 * /services/<slug>, so a value with no Service behind it renders a dead link.
 * Validating against the collection makes that impossible by construction,
 * and makes the dashboard the only place a discipline is defined.
 *
 * ── WHY IT IS CACHED ─────────────────────────────────────────────────────
 * This runs inside document validation, so without a cache every project save
 * — and every bulk seed — costs a round trip to fetch a list of ten short
 * strings that changes a few times a year. Sixty seconds is long enough to
 * make the query disappear from any realistic write burst and short enough
 * that a newly added service works before anyone can switch browser tabs.
 * `invalidate()` makes it immediate on the write paths that change it.
 *
 * ── WHY INACTIVE SERVICES STILL COUNT ────────────────────────────────────
 * `isActive: false` retires a service from the public /services list; it does
 * not retract the history. Projects delivered under it keep their tag, and
 * filtering those out here would fail validation on the next unrelated edit to
 * an old case study — a 400 on a field the editor never touched.
 */

const TTL_MS = 60_000;

let cache = { at: 0, slugs: null };

/** Live slugs as a Set. Cached for TTL_MS. */
export async function serviceSlugs({ force = false } = {}) {
  const now = Date.now();
  if (!force && cache.slugs && now - cache.at < TTL_MS) return cache.slugs;

  const docs = await Service.find({}).select("slug").lean();
  cache = { at: now, slugs: new Set(docs.map((d) => d.slug).filter(Boolean)) };
  return cache.slugs;
}

/** Call after any write that adds, renames or removes a service. */
export function invalidateServiceTypes() {
  cache = { at: 0, slugs: null };
}

/**
 * Are all of these real services?
 *
 * An EMPTY collection passes. That is deliberate and it is the one case worth
 * spelling out: a fresh database seeded projects-first would otherwise fail
 * every insert, and "there are no services defined" is a setup state, not a
 * bad value from a client. Once one service exists the check is real.
 */
export async function areServiceTypes(values) {
  if (!Array.isArray(values)) return false;
  const slugs = await serviceSlugs();
  if (slugs.size === 0) return true;
  return values.every((v) => slugs.has(v));
}

/** The ones that are not real services, for an error message worth reading. */
export async function unknownServiceTypes(values) {
  const slugs = await serviceSlugs();
  if (slugs.size === 0) return [];
  return (values ?? []).filter((v) => !slugs.has(v));
}

export default serviceSlugs;
