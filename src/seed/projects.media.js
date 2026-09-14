import crypto from "node:crypto";

import env from "../config/env.js";

/**
 * The picture plan for /projects — one entry per image, and the only place a
 * project image path is ever spelled out.
 *
 * ── WHY THE PLAN AND THE RECORDS ARE NOT THE SAME FILE ───────────────────
 * Two things have to agree about every image: the script that WRITES the file
 * into uploads/projects, and the seed record that POINTS at it. Written twice
 * they drift, and the drift is silent — the seeder succeeds, the API returns
 * the record, and the page renders MEDIA_FALLBACK (the STR logo) where the
 * screenshot should be. Nothing in the stack treats a missing image as an
 * error, which is exactly why the filename cannot be a string literal in two
 * files.
 *
 * So: this file owns the keys, `mediaRef()` resolves a key to the stored path,
 * and both sides go through it. A typo in projects.data.js throws on import
 * instead of publishing a broken card.
 *
 * ── WHY THE FILENAMES ARE HASHED AND NOT RANDOM ──────────────────────────
 * middleware/upload.js appends 8 random bytes so two uploads of "hero.png"
 * cannot collide. A seeder needs the opposite property: re-running it must
 * land on the SAME filename, or every run leaves the previous set orphaned on
 * disk and the database pointing at the newest. The id is therefore derived
 * from the key — stable across runs, still matching the
 * `slug-<16 hex>.<ext>` shape that controllers/upload.controller.js's
 * SAFE_FILENAME admits, so an editor can still delete one of these from
 * /admin/projects.
 *
 * ── TWO SOURCES, ONE DESTINATION ─────────────────────────────────────────
 *   shot:  captured live from the client's production site by
 *          `npm run seed:projects:media`. Real pages, not mockups.
 *   copy:  lifted from str-frontend/public, where the studio's own render,
 *          retouch and campaign artwork already lives. The non-web
 *          disciplines deliver files rather than URLs, so there is nothing to
 *          screenshot — the deliverable IS the image.
 *
 * ⚑ NO IMAGE IS USED BY TWO PROJECTS. That is the rule this file exists to
 * hold: a key belongs to exactly one case study, and the assertion at the
 * bottom of projects.data.js fails the seed if that ever stops being true.
 * A shared photo makes both case studies read as stock.
 */

/* 1440×900 is the plan's working frame: a 16:10 viewport that crops cleanly
   into the 16:9 cover and 16:10 gallery boxes the case-study page renders,
   and wide enough that desktop layouts do not collapse to their tablet
   breakpoint. deviceScaleFactor 2 is what keeps text sharp on a retina
   screen; anything less looks like a photo of a monitor. */
export const FRAME = { width: 1440, height: 900, deviceScaleFactor: 2 };

/** Stable, filename-safe id for a key. Same key in, same 16 hex chars out. */
const stableId = (key) => crypto.createHash("sha1").update(key).digest("hex").slice(0, 16);

/**
 * Where a captured page is cut.
 *
 *   0            the hero, as it lands
 *   0 < n < 1    a fraction of the scrollable range — adapts to a page whose
 *                length changes between now and the next capture run, which a
 *                pixel offset does not
 *   n >= 1       an exact pixel offset, for the few pages worth pinning
 *   "selector"   scrollIntoView on the first match, for anchored sections
 */
const shot = (url, at = 0, opts = {}) => ({ shot: { url, at, ...opts } });

/**
 * For a single-page app whose server will not serve its own deep links.
 *
 * zuzuva.com answers 403 to a direct GET of /products while routing to it
 * perfectly well in the browser — so the capture loads the homepage and
 * clicks, which is how a real visitor gets there anyway.
 */
const shotVia = (from, click, at = 0) => ({ shot: { url: from, click, at } });

/** Relative to str-frontend/public. See MEDIA_SOURCE_DIR in projects.shots.js. */
const copy = (from) => ({ copy: from });

/**
 * The plan. Grouped by case study, in the order the records are declared.
 *
 * Web work is captured live: the cover is the studio's own full-page shot of
 * the site (the one /portfolio already shows, so a reader who sees the client
 * on both pages sees the same frame), and the gallery is three real inner
 * pages captured at the band worth showing.
 */
const PLAN = [
  /* ── Teads ──────────────────────────────────────────────────────────── */
  { key: "teads-cover", ext: "png", ...copy("websites/teds-website.png") },
  { key: "teads-media-owners", ext: "jpg", ...shot("https://www.teads.com/media-owners/", 0.2) },
  { key: "teads-ad-formats", ext: "jpg", ...shot("https://www.teads.com/ad-formats/", 0.18) },
  { key: "teads-platform", ext: "jpg", ...shot("https://www.teads.com/", 0.3) },

  /* ── London Youth Games ─────────────────────────────────────────────── */
  { key: "lyg-cover", ext: "png", ...copy("websites/london-youth-website.png") },
  { key: "lyg-open-games", ext: "jpg", ...shot("https://www.londonyouthgames.org/open-games/", 0) },
  {
    key: "lyg-school-games",
    ext: "jpg",
    ...shot("https://www.londonyouthgames.org/school-games/", 0.12),
  },
  { key: "lyg-support-us", ext: "jpg", ...shot("https://www.londonyouthgames.org/support-us/", 0) },

  /* ── Australian Cosmetic Institute ──────────────────────────────────── */
  { key: "aci-cover", ext: "png", ...copy("websites/australian-cosmetic-website.png") },
  {
    key: "aci-clinics",
    ext: "jpg",
    ...shot("https://australiancosmeticinstitute.com.au/our-clinics/", 0),
  },
  {
    key: "aci-gallery",
    ext: "jpg",
    ...shot("https://australiancosmeticinstitute.com.au/wrinkle-treatment-gallery/", 0.15),
  },
  {
    key: "aci-pricing",
    ext: "jpg",
    ...shot("https://australiancosmeticinstitute.com.au/treatment-pricing/", 0.12),
  },

  /* ── Torgeson Electric ──────────────────────────────────────────────── */
  { key: "torgeson-cover", ext: "png", ...copy("websites/torgeson-website.png") },
  { key: "torgeson-services", ext: "jpg", ...shot("https://torgesonelectric.com/services", 0) },
  { key: "torgeson-projects", ext: "jpg", ...shot("https://torgesonelectric.com/projects", 0.1) },
  {
    key: "torgeson-emergency",
    ext: "jpg",
    ...shot("https://torgesonelectric.com/services/24-7-service", 0),
  },

  /* ── The Vera Hotel ─────────────────────────────────────────────────── */
  { key: "vera-cover", ext: "png", ...copy("websites/vera-website.png") },
  { key: "vera-rooms", ext: "jpg", ...shot("https://theverahotel.com/rooms/", 0.1) },
  { key: "vera-rooftop", ext: "jpg", ...shot("https://theverahotel.com/rooftop/", 0.12) },
  { key: "vera-magazine", ext: "jpg", ...shot("https://theverahotel.com/tlv-magazine/", 0.1) },

  /* ── Terea Vibe ─────────────────────────────────────────────────────── */
  { key: "terea-cover", ext: "png", ...copy("websites/terea-website.png") },
  { key: "terea-shop", ext: "jpg", ...shot("https://tereavibe.ae/shop", 0.08) },
  { key: "terea-devices", ext: "jpg", ...shot("https://tereavibe.ae/iqos-iluma-device/", 0.08) },
  { key: "terea-product", ext: "jpg", ...shot("https://tereavibe.ae/terea-yellow-swiss/", 0.05) },

  /* ── Riverside Cottages ─────────────────────────────────────────────── */
  { key: "riverside-cover", ext: "png", ...copy("websites/riverside-website.png") },
  {
    key: "riverside-facilities",
    ext: "jpg",
    ...shot("https://riversidecottagesalf.com/facilities-amenities", 0.08),
  },
  { key: "riverside-services", ext: "jpg", ...shot("https://riversidecottagesalf.com/services", 0.08) },
  { key: "riverside-gallery", ext: "jpg", ...shot("https://riversidecottagesalf.com/gallery", 0.1) },

  /* ── Zuzuva ─────────────────────────────────────────────────────────── */
  { key: "zuzuva-cover", ext: "png", ...copy("websites/zuzuva-website.png") },
  /* Deep links are 403 from the server; reached by click instead. See shotVia. */
  { key: "zuzuva-catalogue", ext: "jpg", ...shotVia("https://zuzuva.com/", 'a[href="/products"]') },
  { key: "zuzuva-seller", ext: "jpg", ...shot("https://zuzuva.com/become-a-seller", 0) },
  {
    key: "zuzuva-deals",
    ext: "jpg",
    ...shotVia("https://zuzuva.com/", 'a[href="/products?sortBy=discount"]'),
  },

  /* ── The Foxes Photography ──────────────────────────────────────────────
     Cover only, and deliberately.

     thefoxesphotography.com answers 403 to every request from this network —
     homepage included, with a real browser UA and a full header set. It is
     not a deep-link problem like Zuzuva's and there is no client-side route
     around it; the host simply will not serve us. So this case study runs
     without a gallery rather than with three pictures of an error page, and
     rather than borrowing another project's screenshots, which is the defect
     the whole catalogue was rebuilt to remove.

     To fill it in from a network the site does serve:
       npm run seed:projects:media -- --only=foxes
     after adding the three inner pages back here — /location-guides/,
     /packages/ and /travel-schedule/ are the ones worth having. */
  { key: "foxes-cover", ext: "png", ...copy("websites/the-foxes-website.png") },

  /* ── Tiger Den Tourism ──────────────────────────────────────────────── */
  { key: "tigerden-cover", ext: "png", ...copy("websites/tigerdentourism-website.png") },
  { key: "tigerden-packages", ext: "jpg", ...shot("https://tigerdentourism.com/packages", 0.05) },
  { key: "tigerden-visa", ext: "jpg", ...shot("https://tigerdentourism.com/visa", 0.05) },
  {
    key: "tigerden-package-detail",
    ext: "jpg",
    ...shot("https://tigerdentourism.com/package/nepal/6a5c9530b49de1675d8ac115", 0.05),
  },

  /* ── SKH Sourcing ───────────────────────────────────────────────────── */
  { key: "skh-cover", ext: "png", ...copy("websites/skhsourcing-website.png") },
  { key: "skh-range", ext: "jpg", ...shot("https://www.skhsourcing.com/products", 0.05) },
  { key: "skh-compliance", ext: "jpg", ...shot("https://www.skhsourcing.com/compliance", 0.05) },
  {
    key: "skh-product-detail",
    ext: "jpg",
    ...shot("https://www.skhsourcing.com/products/6a7dc1ed20f5033c5cf48cec", 0.05),
  },

  /* ── Podcast Chart Growth ───────────────────────────────────────────── */
  { key: "podcast-cover", ext: "png", ...copy("websites/podcast-website.png") },
  /* One page, five anchors. Captured by selector rather than by offset: the
     sections are the nav, so they are the honest cut points. */
  { key: "podcast-services", ext: "jpg", ...shot("https://podcast-frontend-pi.vercel.app/", "#services") },
  { key: "podcast-process", ext: "jpg", ...shot("https://podcast-frontend-pi.vercel.app/", "#process") },
  { key: "podcast-booking", ext: "jpg", ...shot("https://podcast-frontend-pi.vercel.app/", "#booking") },

  /* ── Visualisation suite (2D & 3D) ──────────────────────────────────── */
  { key: "viz-exterior-dusk", ext: "jpg", ...copy("2d-3d/exterior-lighting.jpg") },
  { key: "viz-interior-suite", ext: "jpg", ...copy("2d-3d/3d-interior.jpg") },
  { key: "viz-hard-surface", ext: "jpg", ...copy("2d-3d/3d-rendering.jpg") },
  { key: "viz-packaging", ext: "jpg", ...copy("2d-3d/3d-product-render.jpg") },
  { key: "viz-walkthrough", ext: "jpg", ...copy("2d-3d/3d-animation-video.jpg") },
  { key: "viz-library", ext: "jpg", ...copy("2d-3d/all-2d-3d-work.jpg") },

  /* ── Measured floor plans ───────────────────────────────────────────── */
  { key: "plan-3d-furnished", ext: "jpg", ...copy("2d-3d/3d-floor-plan.jpg") },
  { key: "plan-2d-colour", ext: "png", ...copy("2d-3d/2d-floor-plan-colour.png") },
  { key: "plan-2d-mono", ext: "png", ...copy("2d-3d/2d-floor-plan-mono.png") },
  { key: "plan-2d-dual", ext: "png", ...copy("2d-3d/2d-floor-plan-dual-unit.png") },

  /* ── Catalogue cut-out production ───────────────────────────────────── */
  { key: "retouch-ghost-mannequin", ext: "jpg", ...copy("graphics/invisible-mannequin.jpg") },
  { key: "retouch-clipping-path", ext: "jpg", ...copy("graphics/clipping-path.jpg") },
  { key: "retouch-background-removal", ext: "jpg", ...copy("graphics/background-removal.jpg") },
  { key: "retouch-image-masking", ext: "jpg", ...copy("graphics/image-masking.jpg") },
  { key: "retouch-shadow-reflection", ext: "jpg", ...copy("graphics/shadows-reflection.jpg") },

  /* ── Listing image production line ──────────────────────────────────── */
  { key: "production-lifestyle-grade", ext: "jpg", ...copy("graphics/retouching.jpg") },
  { key: "production-colourways", ext: "jpg", ...copy("graphics/color-processing.jpg") },
  { key: "production-marketplace-resize", ext: "jpg", ...copy("graphics/image-resizing.jpg") },
  { key: "production-design-library", ext: "jpg", ...copy("graphics/all-graphics-work.jpg") },

  /* ── Paid social & search programme ─────────────────────────────────── */
  { key: "growth-meta-campaign", ext: "jpg", ...copy("digital/facebook-ads-campaign.jpg") },
  { key: "growth-seo-audit", ext: "jpg", ...copy("digital/seo-audit-report.jpg") },
  { key: "growth-reporting-pack", ext: "jpg", ...copy("digital/all-digital-marketing.jpg") },

  /* ── Video production ───────────────────────────────────────────────── */
  { key: "video-property-promo", ext: "jpg", ...copy("video/real-estate-video.jpg") },
  { key: "video-social-cut", ext: "jpg", ...copy("video/precision-greens-video.jpg") },
  { key: "video-edit-library", ext: "jpg", ...copy("video/all-video.jpg") },
];

/** Upload folder these all land in. One of middleware/upload.js's whitelist. */
export const MEDIA_FOLDER = "projects";

/* key → entry, with the derived filename attached once. */
export const MEDIA = new Map(
  PLAN.map((entry) => {
    const filename = `${entry.key}-${stableId(entry.key)}.${entry.ext}`;
    return [
      entry.key,
      {
        ...entry,
        filename,
        // Stored exactly as the upload controller stores one, so a seeded
        // record and an admin-uploaded one are indistinguishable downstream.
        url: `${env.upload.publicPath}/${MEDIA_FOLDER}/${filename}`,
      },
    ];
  })
);

/* A duplicated key would silently shadow the earlier one in the Map, so two
   case studies would quietly share a file — the one thing this module exists
   to prevent. Checked at import: cheap, and it cannot be forgotten. */
if (MEDIA.size !== PLAN.length) {
  const seen = new Set();
  const dupes = PLAN.map((e) => e.key).filter((k) => (seen.has(k) ? true : (seen.add(k), false)));
  throw new Error(`projects.media.js: duplicate keys — ${[...new Set(dupes)].join(", ")}`);
}

/**
 * key → stored path, e.g. "/uploads/projects/teads-cover-a1b2….png".
 *
 * Throws on an unknown key rather than returning undefined. An undefined image
 * path is accepted by the model (the field defaults to ""), survives
 * validation, and only shows up as a fallback logo on a published page — so it
 * has to fail here, at import time, where the typo is visible.
 */
export function mediaRef(key) {
  const entry = MEDIA.get(key);
  if (!entry) throw new Error(`projects.media.js: no media entry for key "${key}"`);
  return entry.url;
}

export default MEDIA;
