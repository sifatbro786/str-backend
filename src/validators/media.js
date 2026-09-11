import { body } from "express-validator";

/**
 * Shared rule for every field that stores a picture.
 *
 * ── WHY ONE HELPER AND NOT A RULE PER VALIDATOR ──────────────────────────
 * There are eight of these fields across four models (Service.image,
 * Project.coverImage / thumbnailImage / ogImage / galleryImages[].url,
 * Blog.coverImage, Team.image, PageMeta.ogImage). Written out eight times they
 * drift, and the drift is invisible: a field with a slightly looser regex
 * accepts a value that renders as a broken image on exactly one page.
 *
 * ── WHAT IS ACCEPTED, AND WHY THE REST IS NOT ────────────────────────────
 * Two shapes only: a rooted path ("/uploads/projects/x.webp" from the upload
 * endpoint, or "/logo.png" from the Next app's own /public), and an absolute
 * https URL for artwork that lives on a CDN.
 *
 * Everything else is rejected rather than normalised, because guessing at what
 * an author meant is how a bad value survives into production looking
 * deliberate:
 *
 *   · "hero.webp" — a bare filename resolves against whatever route is
 *     rendering, so it works on /about and 404s on /projects/some-slug.
 *   · "//evil.tld/x.png" — protocol-relative. next/image fetches it from a
 *     host no remotePattern ever allowed.
 *   · "C:\\Users\\..." — what a file picker puts in a text field.
 *   · "javascript:" and "data:" — inert inside a meta tag, but served to every
 *     crawler and social scraper that reads the page, and some of them flag
 *     the domain for it.
 *   · Plain http — mixed content on an https site, so the browser blocks it.
 *
 * `optional({ values: "falsy" })` is deliberate: clearing the field in the
 * admin form sends "", and that has to pass. An empty image is a valid state.
 */

const ROOTED_PATH = /^\/[A-Za-z0-9._~\-/]+$/;
const HTTPS_URL = /^https:\/\/[^\s]+$/i;

export const isMediaRef = (value) => ROOTED_PATH.test(value) || HTTPS_URL.test(value);

export const mediaField = (field, { max = 400 } = {}) =>
  body(field)
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max })
    .withMessage(`${field} must be ${max} characters or fewer`)
    .bail()
    .custom(isMediaRef)
    .withMessage(
      `${field} must be an uploaded path such as /uploads/projects/file.webp, or an https URL`
    );

export default mediaField;
