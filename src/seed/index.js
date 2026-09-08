/**
 * Seed data — one module per collection.
 *
 * Content is schema-faithful: every object matches its Mongoose model
 * field-for-field, apart from two documented join keys that the runner resolves
 * (testimonials.projectSlug → projectRef, blogs.authorKey → author).
 *
 * Sources:
 *   · Real names, designations, biographies and contact facts — the legacy
 *     STR Solutions project.
 *   · Portfolio, service copy and article bodies — the Phase 3 content layer in
 *     str-frontend/lib/data.js, which was written against these exact models.
 *
 * Run with:  npm run seed
 */

export { default as services } from "./services.js";
export { default as projects } from "./projects.js";
export { default as team } from "./team.js";
export { default as testimonials } from "./testimonials.js";
export { default as authors } from "./authors.js";
export { default as blogs } from "./blogs.js";
export { default as pageMeta } from "./pageMeta.js";
export { default as siteContent } from "./siteContent.js";
export { default as inquiries } from "./inquiries.js";
