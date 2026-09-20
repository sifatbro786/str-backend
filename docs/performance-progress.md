# Performance work — progress & handoff

**Last updated:** 2026-09-20
**Full reasoning:** `docs/performance-audit.md`. This file is only *where we are* and *what is next*.

---

## Read this first — setup facts

Things that are not obvious from the code and that changed the advice once they were known:

| Fact | Consequence |
|------|-------------|
| Mongo is **Atlas**, `cluster0.rt9yqps.mongodb.net/strV2` | Index work can run from any machine with the prod URI. Not a VPS-only job. |
| **Dev and the VPS share that same `strV2` database** | Local `NODE_ENV=development` → `autoIndex: true` → dev runs have been building prod indexes as a side effect. Also: a local seed or delete hits live data. |
| Frontend is on a **Hostinger VPS**, not Vercel | `NEXT_PUBLIC_*` must be set on the box *before* `npm run build` — they are inlined at build time, not read at runtime. |
| Backend listens on **5025** | Loopback target for ACTION 4 is `http://127.0.0.1:5025/api/v1`. |
| `.env` is gitignored | A fresh clone needs it copied across. `str-frontend/.env.example` is current; str-backend has no example file. |

⚑ **`str-backend` had ~40 uncommitted modified files** when this work started — pre-existing, unrelated. Stage selectively; do not `git add -A`.

---

## Where to run what — the rule

**Code changes are always local.** Never edit files on the VPS. Local → commit → push → `git pull` on the box.

**Verification happens twice:**
- **Local** — "does the change work" (builds, bundle shrank, script parses)
- **Live** — "is the site actually faster" (TTFB, CDN hits, Lighthouse)

Local proof alone is not proof. A 100 KB bundle saving means nothing until it is deployed.

**The two exceptions:**
- **ACTION 4** (`API_URL` → loopback) is a VPS `.env` edit only, by hand, once. It must NOT go in git, and it must not be set locally.
- **ACTION 5** (CDN) is entirely in the Cloudflare dashboard. No code.

---

## Done

- [x] **Audit** — `docs/performance-audit.md`. 17 items triaged: 7 actions, 10 already handled or deliberately skipped.
- [x] **ACTION 1 code** — `src/scripts/syncIndexes.js` + `"indexes:sync"` in `package.json`.
      Syntax-checked, model coverage verified against `src/models/` (all 10, no drift).
      **Not yet run against Atlas.** ← this is the next thing to do
- [x] **Audit corrected** — ACTION 1 downgraded high → medium once the shared-database setup was confirmed.

---

## Next up, in order

### 1. Run the index sync ← START HERE
Cheap, and it answers a question rather than guessing at it.

**Before running**, see what is actually there (Compass or mongosh, prod URI):
```js
db.projects.getIndexes().map(i => i.name)
```
- Full list (`slug_1`, `featured_1_displayOrder_1`, `serviceTypes_1_featured_-1_displayOrder_1`, …) → dev runs already built them. Script becomes a drift guard; run it anyway, expect zero drops.
- Only `["_id_"]` → they were never built. Run it now.

Then, from a directory with a populated `.env`:
```bash
npm run indexes:sync
```
Expect 10 lines, no `FAILED`, ending `Done. 10 model(s) in sync.`

A duplicate-key failure is a real finding, not a script bug — clean the rows, re-run.

**Proof it worked:**
```js
db.blogs.find({ isPublished: true }).sort({ publishedAt: -1 })
  .explain("executionStats").executionStats
```
`executionStages.stage` should be `IXSCAN`/`FETCH`, not `COLLSCAN`, and `totalDocsExamined` ≈ `nReturned`.

**Then wire it into deploy** — after `npm ci`, before the process restart.

---

### 2. Hero map bundle — `str-frontend` (biggest frontend win)
`components/home/GeoWorldMap.jsx` is `"use client"` and pulls `lib/heroMap.js`, which imports `world-atlas/countries-110m.json` (105 KB) plus `d3-geo` and `topojson-client` — all to compute SVG path strings that are identical on every build.

Steps are in the audit under ACTION 3. Summary:
1. `lib/heroMap.js` → `lib/heroMapGeometry.js` (unchanged)
2. new `scripts/build-hero-map.mjs` writes `lib/heroMapPaths.json`
3. `lib/heroMap.js` becomes a re-export of that JSON
4. `GeoWorldMap.jsx`: `layout()` call → precomputed `LAYOUT`
5. `"prebuild": "node scripts/build-hero-map.mjs"`
6. `d3-geo`, `topojson-client`, `world-atlas` → `devDependencies`

⚑ Do **not** make the map lazy or `ssr: false`. It is the LCP element on wide viewports — the comment in `Hero.jsx` is right.

**Verify (local):**
```bash
npm run build
grep -rl '"type":"Topology"' .next/static/chunks/   # must print nothing
```
Also note `/`'s **First Load JS** in the build output, before vs after.

---

### 3. Images — `str-frontend`
27 MB in `public/`, single PNGs to 1.5 MB. The browser never sees these bytes (`next/image` converts), so the cost is **VPS CPU on first optimize** and deploy weight, not user download. Pre-convert to WebP, max 1600px, q82.

Also confirm sharp exists on the box: `node -e "require('sharp');console.log('ok')"`

**Verify:** `du -sh public` (27M → ~4M), then cold vs warm `curl -w "%{time_total}"` against a `/_next/image?...` URL.

---

### 4. `API_URL` → loopback — VPS `.env` only
```diff
-API_URL=https://global.strsltd.com/api/v1
+API_URL=http://127.0.0.1:5025/api/v1
 NEXT_PUBLIC_API_URL=https://global.strsltd.com/api/v1
```
Leave `NEXT_PUBLIC_API_URL` alone — `next.config.mjs` derives the `next/image` `remotePattern` from it.

First confirm from inside the VPS: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5025/api/v1/health` → 200.

---

### 5. Cloudflare — dashboard, no code
Proxy `strsltd.com` + `global.strsltd.com`. Cache `/_next/image*` (highest value — takes the optimizer off the VPS) and `/uploads/*`; bypass `/api/*` and `/admin/*`.

**Verify:** `curl -sI` twice, want `cf-cache-status: HIT` and `content-encoding: br`.

---

### 6. `compression` on Express — `str-backend`
Three lines after `helmet()`, filter excluding `env.upload.publicPath`. Diff in the audit under ACTION 6. Lower value once step 4 lands, but the admin dashboard still reaches Express over the internet.

---

### 7. Lighthouse — last
```bash
npx unlighthouse --site https://strsltd.com
```
Running it before 1–6 produces a baseline that is stale on arrival. Watch LCP on `/` and TBT on `/` and `/graphics`.

---

## Deliberately not doing

Short version — reasoning is in the audit:

- **Load balancer** — one marketing site, one VPS. PM2 cluster mode if CPU is ever the issue (but `express-rate-limit`'s memory store goes per-worker).
- **API response caching in Express** — already solved at the right layer by Next ISR + `revalidateTag`. A second cache would make the tag invalidation lie.
- **Public loading skeletons** — routes are prerendered, nothing to skeleton.
- **Query caching** — the only aggregations are admin-only `/stats`.
- Already done, no work needed: debounce, pagination, minification, lazy loading, script deferral, connection pooling.

---

## Loose ends noticed, not acted on

- `str-backend/.env` `CORS_ORIGINS` still lists `str-frontend-rho.vercel.app` — leftover from the Vercel deploy. Harmless, but stale.
- `lib/api.js` `getFeaturedProjects()` fetches 50 projects and filters `featured` in JS. Two-line fix, diff in the audit.
- `ApiFeatures.search()` uses an unanchored case-insensitive `$regex` — cannot use an index. Admin-only, small collections. Revisit with a `$text` index past a few thousand rows.
- **Dev and prod share one Atlas database.** Not a performance issue; is a real risk.
