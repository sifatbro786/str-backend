# Performance audit — str-v2

**Date:** 2026-09-20
**Scope:** `str-backend` (Node/Express/MongoDB) + `str-frontend` (Next.js 15 App Router)
**Method:** static read of both repos. No production profiling — Lighthouse is deliberately the LAST action item, so the baseline is measured after the known fixes land.

---

## Verdict at a glance

| # | Item | Status | Where |
|---|------|--------|-------|
| 3 | Index the database | ✅ **DONE 2026-09-21** — already built; zero measurable gain — ACTION 1 | backend |
| 4 | Compress images | ✅ **DONE 2026-09-21** — 33.9 MB → 8.3 MB — ACTION 2 | frontend |
| 8 | Split code into chunks | ✅ **DONE 2026-09-21** — hero map precomputed — ACTION 3 | frontend |
| — | `API_URL` public-internet hairpin | ❌ Do — ACTION 4 | frontend env |
| 9 | Add CDN | ❌ Do — ACTION 5 | infra |
| 13 | Compress API payloads | ⬇️ Downgraded — payloads are KB-sized. ACTION 6 | backend |
| 12 | Lighthouse audit | ❌ Do LAST — ACTION 7 | infra |
| 1 | Cache API responses | ✅ Already — ISR + tags | frontend |
| 10 | Server-side caching | ✅ Already — same mechanism as #1 | frontend |
| 2 | Load balancer | ✅ Skip — over-engineering at this scale | infra |
| 5 | Loading skeletons | ✅ Skip (public); partial in admin | frontend |
| 6 | Cache expensive queries | ✅ Skip — only admin-only aggregations | backend |
| 7 | Debounce input handlers | ✅ Already — `useDebounced` | frontend |
| 11 | Paginate large lists | ✅ Already — `ApiFeatures.paginate()` | backend |
| 14 | Minify JS/CSS | ✅ Already — Next default | frontend |
| 15 | Add lazy loading | ✅ Already — `next/image` + `priority` on LCP | frontend |
| 16 | Defer non-critical scripts | ✅ Already — GTM `afterInteractive` | frontend |
| 17 | DB connection pooling | ✅ Already — max 20 / min 2 | backend |

Explicitly out of scope per request: N+1 queries, unnecessary re-renders, unused dependencies.

---

## ACTION 1 — Index management ✅ DONE 2026-09-21 (no performance gain, and that is the finding)

**Ran:** `indexes:check` → `indexes:sync` → `indexes:check`. Result: **0 created, 0 dropped.**
`explain()` on the blog list confirms `IXSCAN` on `isPublished_1_publishedAt_-1`, 5 keys → 5 docs, 0 ms.

### ⚑ The document counts reframe this whole audit

What the check actually printed, and the column that matters is not the indexes:

```
Blog 5 · GraphicsQuote 1 · Inquiry 5 · PageMeta 6 · Project 18
Service 10 · SiteContent 5 · Team 12 · Testimonial 5 · User 2
```

**~69 documents in the entire database.** At that size an index changes nothing — a collection
scan of 18 projects costs less than the index lookup that replaces it. The original finding
("every public list query is a collection scan") was technically true and practically irrelevant.

Two consequences, both of which outrank the rest of this section:

1. **The database is not this site's bottleneck and no further time belongs there.** Everything
   costly is bytes over the network: 27 MB in `public/`, a single 1.5 MB PNG — a thousand times
   the whole database.
2. **ACTION 6 (Express compression) is downgraded with it.** Gzipping a JSON list of 18 projects
   saves a few KB. It is three lines, so it can still go in, but it is not a performance action.

### What the work was actually worth

Insurance, not speed:

- if `Project` goes from 18 rows to 5,000, the indexes are already there
- `syncIndexes` belongs in deploy, which ends the reliance on a developer running `npm run dev`
- a duplicate `slug` now fails loudly instead of silently
- an index dropped from a schema now leaves Mongo too

Worth doing. Not worth expecting a faster site from.

### Background — why the indexes already existed



The first read of this concluded the production database had no index beyond `_id`. Wrong, because of a detail in the environment:

- `MONGODB_URI` is Atlas — `cluster0.rt9yqps.mongodb.net/strV2`
- **Dev and the VPS point at that same `strV2` database.**
- Local `.env` has `NODE_ENV=development`, so locally `autoIndex` is **true**.

So every `npm run dev` on a developer machine registers all ten models and builds their declared indexes — on the same database production reads. The indexes are almost certainly present, created as a side effect of someone running the dev server.

### Why the script still matters

Getting the right outcome by accident is not the same as managing it. Three things stay broken:

1. **`autoIndex` never drops.** An index removed from a schema stays in Mongo forever, still written on every insert, still in the working set, with nothing in the codebase explaining it.
2. **`autoIndex` fails silently.** Mongoose builds indexes through `Model.init()`, and nothing awaits it. A `unique` index that cannot build because of duplicate rows logs nothing you will notice — the constraint simply is not enforced, and you find out when a duplicate slug reaches production.
3. **It depends on a developer running `npm run dev`.** A schema index added by someone who only ever runs against a local Mongo, or a deploy to a genuinely separate database later, gets nothing.

`syncIndexes()` fixes all three: it adds, it drops, and it throws loudly.

### Also worth knowing

Dev and prod sharing one database is its own risk, well beyond indexes — a local seed script or a mistaken delete hits live data. Out of scope for a performance audit, but it belongs on a list somewhere.

### Fix

`src/scripts/syncIndexes.js` (written) + `npm run indexes:sync`. Run it as a deploy step, after `npm ci` and before the process restart.

### Caveats

- `syncIndexes()` **drops** any index present in Mongo but absent from the schema. That is the point, but it means the first run is the risky one — it will remove anything created by hand in Compass/Atlas. Check what exists before running.
- If duplicate `slug` / `key` / `email` rows exist, the unique build fails and names the collection. That failure is the correct outcome — it is data that needs cleaning, not an error to route around. Given `autoIndex` has been running in dev, a duplicate would already have blocked the build silently, so this is where you would first learn about it.
- Builds are background/non-blocking on MongoDB 4.2+, but still cost IO. Off-peak for the first run.
- `config/env.js` exits if `MONGODB_URI` or `JWT_SECRET` is missing, so the script has to run from a directory with a populated `.env`.

## ACTION 2 — Images ✅ DONE 2026-09-21

`public/` was **33.9 MB** across 77 photos — website screenshots stored as PNG, topping out at
`the-foxes-website.png` at 1.55 MB. All 77 converted to WebP, originals deleted, 146 code
references rewritten.

**Result: 33.9 MB → 8.3 MB (24%).**

| folder | before | after | |
|---|---|---|---|
| `websites/` | 10.9 MB | 892 KB | **8%** — PNG screenshots were the worst offenders |
| `graphics/` | 12.9 MB | 4.5 MB | 35% |
| `2d-3d/` | 1.9 MB | 1.6 MB | 83% — already-efficient JPEGs |
| `digital/` | 724 KB | 512 KB | 71% |
| `footer.png` | 392 KB | 200 KB | 51% |

### Quality is not uniform, and that is deliberate

`public/graphics` is the before/after gallery for STR's **photo-retouching service**. Visible
compression artifacts there do not just look bad — they argue against the thing being sold. So
it got the most generous setting, and at these file sizes that costs almost nothing.

| target | quality | max dim | why |
|---|---|---|---|
| `graphics/` | 92 | 1920 | the retouching showcase — artifacts here undermine the pitch |
| `2d-3d/`, `digital/` | 90 | 1920 / 1600 | architectural renders; visual quality is the product |
| `websites/` | 88 | 1600 | screenshots shown in cards; contains text, so not lower |
| `footer.png` | 92 | none | payment-logo strip, 5011×587, needs crispness — alpha verified preserved |

1600 px matches the real demand: the widest `sizes` is `760px`/`55vw`, which at 2× DPR asks for
about 1580 px. `graphics/` gets 1920 for headroom on large displays.

### Deliberately NOT converted

- `strshort.png` — favicon and `apple-touch-icon`. iOS does not reliably accept WebP here.
- `logo.png` — 12 KB, also `MEDIA_FALLBACK` in `lib/utils.js`. Nothing to gain.
- `public/logo/` (164 KB), `public/fonts/`, `public/video/` — too small to matter, or not images.

No static Open Graph image exists (`app/api/og` generates them), so no social-preview risk.

### Verified

- 77 originals → 77 valid WebP, **0 missing, 0 corrupt, 0 upscaled**; alpha preserved on `footer`
- 146 references rewritten across `catalogue.js`, `graphics.js`, `data.js`, `site.js`, `utils.js`
- **0 stale `.png`/`.jpg` references** to the converted folders
- every referenced `.webp` resolves to a file on disk; **0 unreferenced** WebP left behind
- `logo.png` / `strshort.png` references confirmed intact
- all five modified files pass `node --check`

⚑ 12 broken image references exist in the repo, all **pre-existing** and confirmed in `git HEAD`
before this change: nine team photos (`/ceo.jpg`, `/arif.jpg`, …) referenced only by the dead
`lib/data.js`, and three `/uploads/...` paths that are doc-comment examples pointing at the API
host rather than `public/`.

⚑ `next build` still needs running on Windows — see ACTION 3's note.

## ACTION 3 — Hero map geometry moved to build time ✅ DONE 2026-09-21

`components/home/GeoWorldMap.jsx` is `"use client"` and imported `lib/heroMap.js`, which imported `world-atlas/countries-110m.json`, `d3-geo` and `topojson-client`. `LAND_PATHS`, `GRATICULE_PATH`, `SPHERE_PATH`, `MARKETS` and `RINGS` were all module-scope constants — a pure function of constants, being shipped to and re-executed by every visitor on the homepage.

### What was done

| File | |
|------|---|
| `lib/heroMapGeometry.js` | the old `heroMap.js`, unchanged logic. Build-only. |
| `scripts/build-hero-map.mjs` | runs it, rounds, writes the JSON, asserts the output is sane |
| `lib/heroMapPaths.json` | generated — 162 land paths, 7 markets |
| `lib/heroMap.js` | now a re-export of that JSON, nothing else |
| `GeoWorldMap.jsx` | `layout()` call → precomputed `LAYOUT` |
| `package.json` | `prebuild` + `predev` hooks |

`heroMapGeometry.js` reads the topology through `createRequire` rather than a static JSON import. That is a guard rail as much as a convenience: a component importing that file now fails the build on `node:module` instead of silently pulling the topology back into the client bundle.

### ⚑ Reverted 2026-09-22: the three build-only packages stay in `dependencies`

They were moved to `devDependencies` on the first pass. That was wrong twice over:

1. **It saved nothing.** What lands in a client bundle is decided by what the code imports, not by
   which `package.json` section a package sits in. The bytes were already gone the moment
   `GeoWorldMap.jsx` stopped importing them.
2. **It could break the deploy.** `prebuild` imports `d3-geo`, `topojson-client` and `world-atlas`
   at build time. Any deploy that runs `npm ci --omit=dev` (or `--production`, or with
   `NODE_ENV=production`) before `npm run build` would install neither, and the build would crash
   on the first import — on the server, at deploy time, which is the worst place to find out.

A deploy that cannot break is worth more than three packages of `node_modules`. They are back in
`dependencies`; the `createRequire` guard in `heroMapGeometry.js` is what actually prevents the
regression, and it is unaffected.

### ⚑ The measurement corrected an assumption

This section originally estimated "~100–140 KB off First Load JS". **That was wrong**, and the first working version of the change made the bundle *bigger*.

Gzipped, what the client used to carry:

| | gzip |
|---|---|
| `countries-110m.json` | 38.5 KB |
| `d3-geo` + `topojson-client`, tree-shaken + minified | 8.8 KB |
| **total** | **47.3 KB** |

And what `heroMapPaths.json` costs, by rounding precision:

| precision | gzip | |
|---|---|---|
| 2 decimals | 65.8 KB | worse than what it replaces |
| 1 decimal | 52.0 KB | still worse |
| **0 decimals (land/graticule)** | **33.9 KB** | the win |

Topology is delta-encoded integers and gzips extremely well; full-precision float path strings do not. So "precompute at build time" is an optimisation *only at the right precision* — which is why the numbers live in the build script's header rather than in a commit message.

Shipped settings: land and graticule at 0 decimals (decorative outlines, ~99% of the bytes, sub-pixel in a 780×620 viewBox), the disc outline at 2 (one stroked circle, the only place rounding could show), pin and label positions at 1.

### Actual result

- **~13.4 KB gzipped** off the homepage
- **all of it** — topology parse, topojson arc decoding, 162 polygons through an azimuthal-equidistant projection with a 138° clip — gone from the browser's main thread at hydration. This is the larger win, and it is the one Lighthouse scores as TBT.

### Verified

- `esbuild` bundle of `GeoWorldMap.jsx`: `"Topology"`, `"arcs"`, `azimuthalRaw`, `clipAntimeridian`, `geoGraticule` all **absent**; 338 SVG path commands **present**
- precomputed `LAYOUT` vs a live `layout()` call: 7/7 markets matched, **max drift 0.048 user units** (a twentieth of a pixel), no data drift on names, distances or disciplines
- 162 land paths, 6 tinted, zero empty `d` strings

⚑ `next build` could not be run from the audit environment (`node_modules/.bin` holds Windows shims). The esbuild check above is the proxy; run `npm run build` on Windows and compare `/`'s **First Load JS** for the final confirmation.

⚑ The map is still deliberately **not** lazy and not `ssr: false` — it is the LCP element on wide viewports.

## ACTION 4 — `API_URL` hairpins through the public internet

`.env`:

```
API_URL=https://global.strsltd.com/api/v1
NEXT_PUBLIC_API_URL=https://global.strsltd.com/api/v1
```

`API_URL` is the **server-only** value used by `lib/apiServer.js` and the admin proxy. If Next and Express run on the same Hostinger VPS, every ISR revalidation and every admin proxy call currently goes DNS → public IP → back to the same box → Nginx TLS handshake → Express.

### Fix

```diff
-API_URL=https://global.strsltd.com/api/v1
+API_URL=http://127.0.0.1:5025/api/v1
 NEXT_PUBLIC_API_URL=https://global.strsltd.com/api/v1
```

Leave `NEXT_PUBLIC_API_URL` alone — `next.config.mjs` derives the `next/image` `remotePattern` from it, and it is what the browser calls. CORS is not a factor: server-side fetches send no `Origin` header.

Only applies if both processes share a host. Verify before changing.

---

## ACTION 5 — CDN (Cloudflare)

Proxy `strsltd.com` and `global.strsltd.com`. Free tier gives Brotli on every response (which covers most of item 13 for free), edge TLS termination, HTTP/3, and static asset caching.

Cache rules:

| Path | Rule |
|------|------|
| `/_next/image*` | Cache, edge TTL 1 month — **the highest-value rule**; it removes the image-optimizer CPU from the VPS |
| `/uploads/*` | Cache — already served `immutable, max-age=30d` by Express |
| `/api/*` | Bypass |
| `/admin/*` | Bypass |

---

## ACTION 6 — `compression` on Express

No compression middleware exists. `src/app.js`, after `helmet()`:

```js
app.use(
  compression({
    filter: (req, res) =>
      !req.path.startsWith(env.upload.publicPath) && compression.filter(req, res),
  })
);
```

`/uploads` is excluded because those are already-compressed formats served via sendfile.

Value drops once ACTION 4 lands (gzip over loopback is mostly wasted CPU), but the admin dashboard still reaches Express over the internet through the Next proxy.

---

## ACTION 7 — Lighthouse, last

Running it before ACTIONS 1–6 produces a baseline that is obsolete the moment they land.

```bash
npx unlighthouse --site https://strsltd.com
```

covers every route in one pass. Watch LCP on `/` (the hero map), and TBT on `/` and `/graphics`.

---

## Skipped items — reasoning

### 1 & 10 — Cache API responses / server-side caching → already solved, at the right layer

`lib/apiServer.js` sets `next: { revalidate: 300, tags }` on every public fetch, and `app/api/revalidate/route.js` calls `revalidateTag()` after an admin write. Public visitors never reach Express — they hit the ISR cache. Adding a second cache inside Express would make the tag-based invalidation lie: an admin edit would bust the Next cache and still be served stale from the Express one. Actively harmful.

### 2 — Load balancer → over-engineering

One marketing site, one VPS. If CPU headroom is ever the issue, PM2 cluster mode is the 80%:

```bash
pm2 start server.js -i max --name str-api
```

⚑ `express-rate-limit`'s default store is per-process memory, so under clustering the effective limit multiplies by worker count. Either accept that, or move to a shared store at the same time.

### 5 — Loading skeletons → mostly nothing to skeleton

Public routes are prerendered/ISR; there is no loading state to fill. Admin routes are `force-dynamic` with client-side fetching, and `components/admin/DataTable.jsx` already has a skeleton. An `app/(admin)/admin/loading.js` would be ~10 lines of polish, low priority.

### 6 — Cache expensive queries → nothing expensive on a hot path

The only aggregations are in `stats.controller.js`, which is admin-only and low-traffic. `utils/serviceTypes.js` already has its own 60-second cache with explicit invalidation from `service.controller.js`.

### 7 — Debounce → done

`hooks/useResource.js` exports `useDebounced`, used in admin blogs, inquiries and graphics-quotes. Inquiry notes additionally save on blur with an 800 ms debounce.

### 11 — Pagination → done

`utils/ApiFeatures.js`: `defaultLimit: 12`, `maxLimit: 100`, `execWithCount()` runs the find and the count in parallel against an identical filter.

One nit worth fixing whenever that file is next touched — `lib/api.js` over-fetches:

```diff
-export const getFeaturedProjects = async (limit = 4) => {
-    const projects = await getProjects({ limit: 50 });
-    return projects.filter((p) => p.featured).slice(0, limit);
-};
+export const getFeaturedProjects = async (limit = 4) =>
+    (await apiFetch(`/projects?featured=true&limit=${limit}`, { tags: ["projects"] })).data;
```

### 14 — Minify → Next does it

Production builds minify JS and CSS. Nothing to configure.

### 15 — Lazy loading → done

`next/image` lazy-loads by default. `priority` is set on exactly the two LCP images (`blogs/[slug]`, `projects/[slug]`). The hero map is deliberately eager — correct.

### 16 — Defer non-critical scripts → done

`components/analytics/GoogleTagManager.jsx` uses `next/script` with `strategy="afterInteractive"`.

### 17 — Connection pooling → done

`src/config/db.js`: `maxPoolSize: 20`, `minPoolSize: 2`, `serverSelectionTimeoutMS: 10_000`, `socketTimeoutMS: 45_000`, `family: 4`.

---

## Known, not worth fixing today

`ApiFeatures.search()` builds an unanchored case-insensitive `$regex` `$or` across `searchFields`. That cannot use an index — it is a collection scan per keystroke-debounce. It is reached only from admin search, and the collections are small. Revisit with a `$text` index if `Project` or `Blog` passes a few thousand rows.
