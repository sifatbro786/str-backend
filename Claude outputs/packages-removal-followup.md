# Delete list — packages stack + portfolio rename

Everything below is already unreferenced. Nothing imports it, so deleting is
safe; *not* deleting leaves dead code that still compiles. The device shell
wasn't available, so these are for you to remove by hand.

Verified by grep across `app/`, `components/`, `lib/` and `src/` on a
reconstructed post-delete tree: no unresolved imports, and the word `portfolio`
appears nowhere except a client case-study record in `lib/data.js` (The Foxes —
a studio whose deliverable *was* a portfolio site) and one package feature line
("Pages: Home, Services, Portfolio, Blog, Team, Careers, Contact"), which
describes the customer's own site. Both are content, not our routes.

## 1. Delete — frontend (`E:\Works\str-v2\str-frontend`)

Old packages stack:

```
components\packages\PackagesView.jsx
components\packages\PackageTiers.jsx
components\admin\packages\TracksEditor.jsx
components\admin\packages\TiersEditor.jsx
components\admin\packages\PageCopyEditor.jsx
components\admin\packages\            (now-empty folder)
app\(admin)\admin\packages\page.js
app\(admin)\admin\packages\           (now-empty folder)
lib\packagesUi.js
```

Renamed away from `portfolio` — delete the originals:

```
lib\portfolio.js                        → replaced by lib\disciplines.js
lib\portfolioData.js                    → replaced by lib\catalogue.js
components\portfolio\PortfolioGrid.jsx  → replaced by components\packages\CatalogueGrid.jsx
components\portfolio\DisciplineBand.jsx → moved to components\packages\DisciplineBand.jsx
components\portfolio\PricingGrid.jsx    → moved to components\packages\PricingGrid.jsx
components\portfolio\                   (now-empty folder)
```

⚠ **Keep** everything else in `components\packages\` — that's the new home.

## 2. Delete — backend (`E:\Works\str-v2\str-backend`)

```
src\models\Package.js
src\models\PackageCategory.js
src\models\PackagePage.js
src\controllers\package.controller.js
src\routes\package.routes.js
src\validators\package.validator.js
src\seed\packages.data.js
src\seed\packages.seed.js
```

Optional: `src\middleware\stripDeep.js` is now unused — `package.routes.js` was
its only caller. Generic middleware, so keep it if you expect another
deeply-nested payload; otherwise it's dead.

## 3. Rename map (for reference / grep)

| was | now |
| --- | --- |
| `lib/portfolio.js` | `lib/disciplines.js` |
| `lib/portfolioData.js` | `lib/catalogue.js` |
| `components/portfolio/*` | `components/packages/*` |
| `PortfolioGrid` | `CatalogueGrid` |
| `PortfolioCard` | `CatalogueCard` |
| `PORTFOLIO_DISCIPLINES` | `DISCIPLINES` |
| `getPortfolioItems()` | `getCatalogueItems()` |
| `portfolioCounts()` | `catalogueCounts()` |
| `portfolioStats()` | `catalogueStats()` |

`DISCIPLINE_IDS` and `DISCIPLINE_BY_ID` kept their names.

## 4. Mongo — one-time migration

`overview` was dropped from the `PageMeta` enum, so its stored row is orphaned.
Dropping the enum value does **not** move the document. Pick one:

```js
// (a) the overview copy is the copy you want on /packages
db.pagemetas.deleteOne({ pageIdentifier: "packages" });
db.pagemetas.updateOne(
  { pageIdentifier: "overview" },
  { $set: { pageIdentifier: "packages" } }
);

// (b) you'll rewrite the Packages row by hand in the dashboard
db.pagemetas.deleteOne({ pageIdentifier: "overview" });
```

Drop the old collections whenever you're sure the BDT copy isn't coming back:

```js
db.packages.drop();
db.packagecategories.drop();
db.packagepages.drop();
```

## 5. After deploy — check

- `/packages` renders the catalogue + EUR pricing, 200.
- `/overview` renders the same page, 200, canonical → `/packages`.
- `/portfolio` → **404** (the 301 was removed on purpose).
- `/sitemap.xml` has `/packages`; no `/overview`, no `/portfolio`.
- Admin sidebar has no Packages entry; Page meta dropdown has no Overview.
- `GET /api/v1/packages` → 404.
- Rewrite the Packages row at **/admin/page-meta → Packages** — whatever is
  stored there was written for the old BDT catalogue and it still overrides the
  code fallbacks.
