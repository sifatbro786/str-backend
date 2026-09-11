import slugify from "slugify";

/**
 * Canonical slug generator.
 *
 * ── WHY THIS IS NOT A BARE slugify() CALL ────────────────────────────────
 * slugify's `strict` mode DELETES every character it does not recognise
 * instead of treating it as a separator, and "/" is one of them. So the title
 * "2D/3D Design & Animation" collapses to "2d3d-design-and-animation" — two
 * distinct tokens fused into a nonsense one. Ampersands are fine (the charmap
 * turns them into "and"); slashes and backslashes are not.
 *
 * Normalising separators to a space BEFORE slugify is the whole fix, and it
 * has to live in one place because the value is derived in three: the model's
 * pre-validate hook, the model's pre-findOneAndUpdate hook, and the seeder's
 * slug-stability assertion. Three copies of this rule is three chances for a
 * title to produce one slug on create and a different one on rename, which
 * silently duplicates the row on the next seed run.
 */
export function toSlug(value) {
  return slugify(String(value ?? "").replace(/[/\\|]+/g, " "), {
    lower: true,
    strict: true,
  });
}

export default toSlug;
