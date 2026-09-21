# Performance work — progress & handoff

**Last updated:** 2026-09-21 (rev 3)
**Full reasoning:** `docs/performance-audit.md`. This file is only *where we are* and *what is next*.

---

## Read this first — setup facts

Things that are not obvious from the code and that changed the advice once they were known:

| Fact | Consequence |
|------|-------------|
| Mongo is **Atlas**, `cluster0.rt9yqps.mongodb.net/strV2` | Index work can run from any machine with the prod URI. Not a VPS-only job. |
| **Dev and the VPS share that same `strV2` database** | Local `NODE_ENV=development` → `autoIndex: true` → dev runs have been building prod indexes as a side effect. Also: a local seed or delete hits live data. |
| Frontend is on a **Hostinger VPS**, not Vercel | `NEXT_PUBLIC_*` must be set on the box *before* `npm run build` — they are inlined at build time, not read at runtime. |
| **~69 documents in the whole database** (Project 18, Team 12, Service 10, the rest ≤6) | The database is not a bottleneck and no more time belongs there. Everything costly is bytes over the network. Measured 2026-09-21. |
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
- [x] **ACTION 1 — indexes DONE 2026-09-21.** `indexes:check` → `indexes:sync` → `indexes:check`,
      all three run against Atlas by Sifat. **0 created, 0 dropped** — they were already built by
      local `npm run dev` (dev has `autoIndex` on and shares the database). `explain()` confirms
      `IXSCAN` on `isPublished_1_publishedAt_-1`.
      **No performance gain, and that is the real finding** — see the next bullet. The work bought
      insurance: indexes in deploy rather than by accident, loud failure on duplicates, drift removed.
- [x] **Audit re-prioritised 2026-09-21** — the check printed document counts: ~69 rows across all
      ten collections. At that size indexes change nothing, so ACTION 1 was never going to speed
      anything up, and ACTION 6 (Express compression, a few KB of JSON) is downgraded with it.
      Everything left that matters is image bytes and network.
- [x] **Audit corrected (1)** — ACTION 1 downgraded high → medium once the shared-database setup was confirmed.
- [x] **ACTION 3 — hero map precomputed** (str-frontend, 2026-09-21). Details in the audit. Files:
      `lib/heroMapGeometry.js` (build-only), `scripts/build-hero-map.mjs`, `lib/heroMapPaths.json` (generated),
      `lib/heroMap.js` (now a re-export), `GeoWorldMap.jsx`, `package.json` (`prebuild`/`predev`, three deps → dev).
      **~13.4 KB gzipped saved, and the whole projection pass is off the browser's main thread.**
- [x] **Audit corrected (2)** — ACTION 3's "~100–140 KB" estimate was wrong; replaced with measured numbers.
      Worth reading that section: the first working version of the change made the bundle *bigger*, and
      rounding precision is what decides whether it is a win at all.

### Still owed on ACTION 3

`next build` could not run in the audit environment (Windows shims in `node_modules/.bin`). On Windows:

```bash
npm run build          # prebuild regenerates the JSON automatically
```

Compare `/`'s **First Load JS** against the previous build, and eyeball the homepage map — pin
positions moved by at most 0.05 user units, so nothing should look different.

## Next up, in order

### 1. Images ← START HERE — `str-frontend`
27 MB in `public/`, single PNGs to 1.5 MB. The browser never sees these bytes (`next/image` converts), so the cost is **VPS CPU on first optimize** and deploy weight, not user download. Pre-convert to WebP, max 1600px, q82.

Also confirm sharp exists on the box: `node -e "require('sharp');console.log('ok')"`

**Verify:** `du -sh public` (27M → ~4M), then cold vs warm `curl -w "%{time_total}"` against a `/_next/image?...` URL.

---

### 2. `API_URL` → loopback — VPS `.env` only
```diff
-API_URL=https://global.strsltd.com/api/v1
+API_URL=http://127.0.0.1:5025/api/v1
 NEXT_PUBLIC_API_URL=https://global.strsltd.com/api/v1
```
Leave `NEXT_PUBLIC_API_URL` alone — `next.config.mjs` derives the `next/image` `remotePattern` from it.

First confirm from inside the VPS: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5025/api/v1/health` → 200.

---

### 3. Cloudflare — dashboard, no code
Proxy `strsltd.com` + `global.strsltd.com`. Cache `/_next/image*` (highest value — takes the optimizer off the VPS) and `/uploads/*`; bypass `/api/*` and `/admin/*`.

**Verify:** `curl -sI` twice, want `cf-cache-status: HIT` and `content-encoding: br`.

---

### 4. `compression` on Express — `str-backend` (optional now)
Three lines after `helmet()`, filter excluding `env.upload.publicPath`. Diff in the audit under ACTION 6. ⬇️ Downgraded 2026-09-21: the API returns a few KB, so this saves a few KB. Three lines, so it can go in with something else, but do not expect it to show up in a measurement.

---

### 5. Lighthouse — last
```bash
npx unlighthouse --site https://strsltd.com
```
Running it before 1–4 produces a baseline that is stale on arrival. Watch LCP on `/` and TBT on `/` and `/graphics`.

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
- **`Project` carries 8 indexes for 18 rows.** `featured_1` and `displayOrder_1` are both covered
  by the `featured_1_displayOrder_1` prefix, and `serviceTypes_1` by the three-field compound.
  Indexes cost write throughput and RAM, so this is redundant — but at 18 rows it is redundant by
  a rounding error. Worth trimming only if these collections ever get large.
