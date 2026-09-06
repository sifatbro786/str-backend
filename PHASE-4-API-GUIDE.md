# STR Solutions — Phase 4 Backend Guide (`str-backend`)

Give this file to the VS Code AI assistant as context **before** it touches this
repo. Companion document: `str-frontend/PHASE-4-BUILD-GUIDE.md`.

**Scope of this phase:** the `serviceTypes[]` migration, an admin-safe write
surface, auth hardening for the BFF proxy, and one aggregation endpoint for the
dashboard. Nothing else. No new resources, no GraphQL, no refactor of the
handler factory.

**Rules for the executing assistant**

- ES Modules only (`"type": "module"`). Pure JavaScript. No TypeScript.
- Do **not** rewrite whole files. Apply the diffs below in place.
- New dependencies allowed this phase: `isomorphic-dompurify` only. Nothing else.
- Every new route goes through `protect` + `checkRole`. There are no exceptions
  in this phase.

---

## 0 · Execution order

Steps are dependency-ordered. Do not reorder — step 5 fails if step 1 has not run.

| # | Step | Files |
|---|---|---|
| 1 | API versioning (`/api/v1`) | `src/app.js`, `.env.example` |
| 2 | `serviceType` → `serviceTypes[]` | `src/models/Project.js`, `src/validators/project.validator.js`, `src/controllers/project.controller.js` |
| 3 | `ApiFeatures` array-filter fix | `src/utils/ApiFeatures.js`, `src/app.js` (hpp) |
| 4 | Slug regeneration on `PATCH` | `src/models/Project.js`, `Service.js`, `Blog.js` |
| 5 | Immutable-field guard on updates | `src/utils/handlerFactory.js`, all `*.routes.js` |
| 6 | Auth hardening for the BFF | `src/models/User.js`, `src/utils/token.js`, `src/middleware/auth.middleware.js`, `src/controllers/auth.controller.js`, `src/config/env.js` |
| 7 | Rate-limit keying behind the proxy | `src/middleware/rateLimiters.js`, `src/config/env.js`, `src/app.js` |
| 8 | HTML sanitization on admin writes | `src/middleware/sanitizeHtml.js` (new), 3 route files |
| 9 | Dashboard stats endpoint | `src/controllers/stats.controller.js` (new), `src/routes/stats.routes.js` (new), `src/routes/index.js` |
| 10 | `PageMeta` identifier enum | `src/models/PageMeta.js` |
| 11 | One-shot data migration | `src/scripts/migrateServiceTypes.js` (new), `package.json` |
| 12 | Verification | — |

---

## 1 · API versioning

The frontend guide and every `NEXT_PUBLIC_API_URL` example assume `/api/v1`.
Mount there, and keep `/api` alive as a deprecated alias for one release so
nothing that is already pointed at it breaks.

`src/app.js`:

```diff
 // Rate limiting across the API.
 app.use("/api", globalLimiter);

-// API routes.
-app.use("/api", routes);
+// API routes. v1 is canonical; the unversioned mount is a deprecated alias
+// that will be removed in Phase 6. Both share the limiter above.
+app.use("/api/v1", routes);
+app.use("/api", routes);
```

`.env.example` — add, and mirror into `.env`:

```diff
+# ─── Proxy / BFF ──────────────────────────────────────────
+# Number of proxy hops in front of Express. 1 behind a single load balancer.
+# 2 when the Next.js BFF also forwards (LB → Next route handler → Express).
+TRUST_PROXY_HOPS=1
+
+# Shared secret the Next BFF sends as x-internal-key. Optional but recommended
+# once the API host is publicly reachable — see §7.
+INTERNAL_API_KEY=
```

> ⚠️ `CORS_ORIGINS` still needs `http://localhost:3000` in dev. With the BFF
> pattern, browser→Express requests essentially disappear (only the public
> contact form and public GETs remain if you keep them client-side), but leave
> CORS configured — the public pages are server-rendered and the config costs
> nothing.

---

## 2 · `serviceType` → `serviceTypes[]`

### 2.1 `src/models/Project.js`

```diff
-    serviceType: {
-      type: String,
-      required: true,
-      index: true,
-      enum: [
-        "web-development",
-        "mobile-app",
-        "ui-ux-design",
-        "custom-software",
-        "cloud-devops",
-        "cybersecurity",
-      ],
-    },
+    serviceTypes: {
+      type: [String],
+      required: true,
+      index: true,
+      validate: {
+        validator: (v) => Array.isArray(v) && v.length > 0 && v.length <= 4,
+        message: "A project needs between 1 and 4 service types",
+      },
+      enum: {
+        values: SERVICE_TYPES,
+        message: "{VALUE} is not a supported service type",
+      },
+    },
```

Add the enum as a shared export at the top of the file so the validator and the
migration script import one list instead of three copies drifting apart:

```js
/**
 * Canonical service taxonomy. Mirrors str-frontend/lib/taxonomy.js exactly —
 * slugs on both sides come from slugify(title, { lower: true, strict: true }),
 * so they cannot drift as long as this list and that one match.
 *
 * Phase 3 dropped `cloud-devops` and `cybersecurity` (never sold as standalone
 * engagements) and added the three production disciplines the assets in
 * str-frontend/public/ show STR actually delivers.
 */
export const SERVICE_TYPES = [
  "web-development",
  "custom-software",
  "mobile-applications",
  "product-design",
  "graphics-design",
  "architectural-visualization",
  "digital-marketing",
];
```

Then the compat virtual, immediately after the existing compound index:

```diff
 // Compound index backing the default "featured first, then manual order" sort.
 projectSchema.index({ featured: 1, displayOrder: 1 });
+
+// Backs the filtered public list: equality on serviceTypes, then the sort keys.
+// Without this, `?serviceTypes=x` + `sort(-featured -displayOrder)` does an
+// in-memory sort that hard-fails at the 32MB blocking-sort limit.
+projectSchema.index({ serviceTypes: 1, featured: -1, displayOrder: 1 });
+
+// Read-compat for any consumer still expecting the scalar field.
+projectSchema.virtual("serviceType").get(function () {
+  return this.serviceTypes?.[0] ?? null;
+});
+projectSchema.set("toJSON", { virtuals: true });
+projectSchema.set("toObject", { virtuals: true });
```

> **Edge case the assistant must not miss.** `handlerFactory.getAll` and
> `getOne` both end in `.lean()`, and **virtuals do not run on lean documents**.
> So `serviceType` will appear on `POST`/`PATCH` responses (real documents) and
> will be *absent* from `GET` list/detail responses. That asymmetry is
> acceptable — the frontend is already written to read `serviceTypes[0]` — but
> it means **the virtual is a safety net for internal code, not a public API
> guarantee**. Do not add `mongoose-lean-virtuals` to paper over it; do not drop
> `.lean()` (it roughly halves list-endpoint latency). Just never rely on
> `serviceType` in a response body.

### 2.2 `src/validators/project.validator.js`

Replace the whole local `SERVICES` array with the model's export, and validate
the array shape properly:

```js
import { body } from "express-validator";
import { SERVICE_TYPES } from "../models/Project.js";

const URL_OPTS = { require_protocol: true };

/** Field rules shared by create and update; `required` differs per verb. */
const serviceTypesRule = (chain) =>
  chain
    .isArray({ min: 1, max: 4 })
    .withMessage("serviceTypes must contain 1–4 values")
    .bail()
    .custom((arr) => arr.every((v) => SERVICE_TYPES.includes(v)))
    .withMessage(`serviceTypes must be a subset of: ${SERVICE_TYPES.join(", ")}`);

export const createProjectRules = [
  body("title").trim().notEmpty().withMessage("Title required").isLength({ max: 160 }),
  serviceTypesRule(body("serviceTypes")),
  body("accentColor")
    .optional()
    .matches(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .withMessage("accentColor must be hex"),
  body("layoutStyle").optional().isIn(["full-width", "bento", "split"]),
  body("animationTrigger").optional().isIn(["fade-up", "pinned-scroll", "3d-tilt"]),
  body("displayOrder").optional().isInt({ min: 0, max: 9999 }).toInt(),
  body("featured").optional().isBoolean().toBoolean(),
  body("tags").optional().isArray({ max: 24 }),
  body("techStack").optional().isArray({ max: 32 }),
  body("galleryImages").optional().isArray({ max: 40 }),
  body("galleryImages.*.url").optional().isString().notEmpty(),
  body("galleryImages.*.layoutType").optional().isIn(["full", "half", "grid"]),
  ...["liveUrl", "githubUrl", "figmaUrl", "appStoreUrl", "playStoreUrl"].map((f) =>
    body(f).optional({ values: "falsy" }).isURL(URL_OPTS).withMessage(`${f} must be an absolute URL`)
  ),
];

/** PATCH is partial — every rule becomes optional, constraints stay identical. */
export const updateProjectRules = [
  body("title").optional().trim().notEmpty().isLength({ max: 160 }),
  serviceTypesRule(body("serviceTypes").optional()),
  ...createProjectRules.slice(2),
];
```

### 2.3 `src/controllers/project.controller.js`

```diff
 export const listProjects = factory.getAll(Project, {
-  allowedFilters: ["serviceType", "featured", "tags"],
+  allowedFilters: ["serviceTypes", "featured", "tags"],
+  arrayFilters: ["serviceTypes", "tags"],
   allowedSort: ["displayOrder", "projectDate", "createdAt", "title"],
   defaultSort: "-featured -displayOrder -createdAt",
   searchFields: ["title", "subtitle", "shortDescription", "clientName"],
 });
```

Add an admin list that can page past the public defaults and is not competing
with the public cache. Projects have no draft state, so the only differences are
limits and sort freedom:

```js
/** GET /api/v1/projects/admin/all — admin table feed. */
export const listProjectsAdmin = factory.getAll(Project, {
  allowedFilters: ["serviceTypes", "featured", "tags"],
  arrayFilters: ["serviceTypes", "tags"],
  allowedSort: ["displayOrder", "projectDate", "createdAt", "updatedAt", "title"],
  defaultSort: "-updatedAt",
  searchFields: ["title", "subtitle", "shortDescription", "clientName", "slug"],
  defaultLimit: 20,
  maxLimit: 100,
});
```

`src/routes/project.routes.js`:

```diff
 // Public reads.
 router.get("/", ctrl.listProjects);
+
+// Literal segment must precede /:slug or "admin" is parsed as a slug.
+router.get("/admin/all", protect, checkRole("super_admin", "admin"), ctrl.listProjectsAdmin);
+router.get("/admin/id/:id", protect, checkRole("super_admin", "admin"), ctrl.getProjectById);
+
 router.get("/:slug", ctrl.getProject);

 // Everything below requires an authenticated admin.
 router.use(protect, checkRole("super_admin", "admin"));
 router.post("/", createProjectRules, validate, ctrl.createProject);
-router.patch("/:id", ctrl.updateProject);
+router.patch("/:id", updateProjectRules, validate, ctrl.updateProject);
 router.delete("/:id", ctrl.deleteProject);
```

`getProjectById` is required because the edit form loads by `_id`, and the
public `getProject` looks up by slug — which breaks the moment an admin renames
a project:

```js
export const getProjectById = factory.getOne(Project); // defaults to by: "_id"
```

Apply the same `admin/id/:id` route to **Service** and **Blog** (both are
slug-addressed publicly). Testimonials and Team are already `_id`-addressed.

---

## 3 · `ApiFeatures` — array fields and repeated params

Two real defects, both silent:

1. `?tags=react&tags=node` arrives as `["react","node"]`. The `Array.isArray`
   case is not handled, so it falls through to `castValue(raw)` and produces
   `{ tags: ["react","node"] }` — which Mongo reads as **exact array equality**,
   not "contains any". It matches a project whose `tags` is *exactly* those two
   in that order, and nothing else.
2. `hpp` currently collapses repeats for anything outside its whitelist, so
   `serviceTypes` repeats are silently reduced to one value before the query
   builder ever sees them.

### 3.1 `src/utils/ApiFeatures.js`

```diff
     this.options = {
       allowedFilters: options.allowedFilters ?? [],
+      // Schema fields that are arrays. A scalar filter on one of these is
+      // normalized to $in so single- and multi-value filters behave identically.
+      arrayFilters: options.arrayFilters ?? [],
       allowedSort: options.allowedSort ?? [],
```

Replace the body of `filter()`:

```js
  /** Whitelisted equality + range filtering (gte|gt|lte|lt|in) + array $in. */
  filter() {
    const src = { ...this.queryString };
    const filter = {};

    for (const field of this.options.allowedFilters) {
      if (src[field] === undefined) continue;
      const raw = src[field];
      const isArrayField = this.options.arrayFilters.includes(field);

      // ?tags=react&tags=node → ["react","node"] (repeat params survive hpp
      // only for whitelisted keys; see app.js). Must become $in, never an
      // exact-array-equality match.
      if (Array.isArray(raw)) {
        const values = raw
          .flatMap((v) => String(v).split(","))
          .map((v) => castValue(v.trim()))
          .filter((v) => v !== "");
        if (values.length) filter[field] = { $in: values };
        continue;
      }

      // Range/set operators come in as objects: ?rating[gte]=4
      if (raw !== null && typeof raw === "object") {
        const ops = {};
        for (const [op, val] of Object.entries(raw)) {
          if (["gte", "gt", "lte", "lt"].includes(op)) {
            ops[`$${op}`] = castValue(val);
          } else if (op === "in") {
            ops.$in = String(val).split(",").map((v) => castValue(v.trim()));
          }
        }
        if (Object.keys(ops).length) filter[field] = ops;
        continue;
      }

      // Comma list → $in (e.g. ?serviceTypes=web-development,graphics-design)
      if (typeof raw === "string" && raw.includes(",")) {
        filter[field] = { $in: raw.split(",").map((v) => castValue(v.trim())) };
        continue;
      }

      // Single scalar. On an array field this is normalized to $in so the
      // shape of the query is stable regardless of how many values arrived.
      filter[field] = isArrayField ? { $in: [castValue(raw)] } : castValue(raw);
    }

    this._filter = filter;
    this.query = this.query.find(filter);
    return this;
  }
```

> **Note on `castValue` and slugs.** `castValue("2d-3d")` returns the string
> (`Number("2d-3d")` is `NaN`), which is correct. But a hypothetical slug like
> `"2024"` would be cast to the number `2024` and never match. None of the
> current taxonomy slugs are numeric; if a numeric-looking slug is ever added,
> add the field to a `stringFilters` list and skip the cast. Do not "fix" this
> speculatively.

### 3.2 `src/app.js` — hpp whitelist

```diff
-app.use(hpp({ whitelist: ["tags", "sort", "fields"] }));
+// Keys that are legitimately repeatable. Anything not listed here is collapsed
+// to its last value, which is the desired anti-pollution default.
+app.use(hpp({ whitelist: ["tags", "serviceTypes", "status", "category", "sort", "fields"] }));
```

---

## 4 · Slug regeneration on `PATCH`

`projectSchema.pre("validate")` runs on `.save()` only. `handlerFactory.updateOne`
uses `findOneAndUpdate`, so **renaming a project's title through the admin panel
leaves the old slug in place** — the public URL and the admin table then
disagree, permanently.

Add to `Project.js`, `Service.js` and `Blog.js` (identical block in each,
directly under the existing `pre("validate")`):

```js
/**
 * findOneAndUpdate does not fire pre('validate'), so a title change coming
 * from the admin PATCH would otherwise keep the stale slug forever.
 *
 * Regenerating changes the public URL. That is the correct trade for an agency
 * site where slugs are corrected shortly after publishing; if a redirect table
 * is ever added, emit the old slug here instead of dropping it.
 */
schemaName.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};
  const title = update.title ?? update.$set?.title;
  if (!title) return next();

  const slug = slugify(title, { lower: true, strict: true });
  if (update.$set) update.$set.slug = slug;
  else update.slug = slug;
  this.setUpdate(update);
  next();
});
```

Blog already has a `pre("findOneAndUpdate")` for `publishedAt` — **merge the
slug logic into that existing hook rather than registering a second one**, so
the ordering is explicit.

Duplicate slugs still surface as a `11000` and are already rendered as a clean
409 by `errorHandler`. No extra handling needed.

---

## 5 · Immutable-field guard on updates

`factory.updateOne` passes `req.body` straight into `findOneAndUpdate`. Today an
authenticated admin (or anything with a stolen token) can `PATCH` `_id`,
`createdAt`, `viewCount`, `author`, or a `Blog.slug` that collides with another
post. `runValidators: true` does not help — Mongoose does not validate fields
that are not in the update, and `_id`/timestamps are not schema-validated.

`src/utils/handlerFactory.js`:

```diff
+/**
+ * Fields no client may ever set directly, regardless of role. Stripped before
+ * the update reaches Mongo. `slug` is here because it is derived from `title`
+ * by the pre-hooks — a hand-supplied slug would be silently overwritten on the
+ * next title edit, which is worse than rejecting it.
+ */
+const ALWAYS_IMMUTABLE = ["_id", "id", "__v", "createdAt", "updatedAt", "slug"];
+
+/** Shallow strip. Nested $-operators are already removed by middleware/sanitize. */
+function stripImmutable(body, extra = []) {
+  const blocked = new Set([...ALWAYS_IMMUTABLE, ...extra]);
+  const out = {};
+  for (const [k, v] of Object.entries(body ?? {})) {
+    if (!blocked.has(k)) out[k] = v;
+  }
+  return out;
+}
+
-export const updateOne = (Model, { by = "_id" } = {}) =>
+export const updateOne = (Model, { by = "_id", immutable = [], allow = null } = {}) =>
   asyncHandler(async (req, res) => {
     const filter = by === "slug" ? { slug: req.params.slug } : { _id: req.params.id };
-    const doc = await Model.findOneAndUpdate(filter, req.body, {
+
+    // `allow` is an explicit allow-list for resources where the writable
+    // surface is much smaller than the schema (inquiries). Everything else
+    // uses the deny-list.
+    const payload = allow
+      ? Object.fromEntries(Object.entries(req.body ?? {}).filter(([k]) => allow.includes(k)))
+      : stripImmutable(req.body, immutable);
+
+    if (Object.keys(payload).length === 0) {
+      throw ApiError.badRequest("No updatable fields supplied");
+    }
+
+    const doc = await Model.findOneAndUpdate(filter, payload, {
       new: true,
       runValidators: true,
     });
     if (!doc) throw ApiError.notFound(`${Model.modelName} not found`);
     res.json({ success: true, data: doc });
   });
```

Then tighten the two resources with a genuinely narrow write surface:

`src/controllers/blog.controller.js`:

```diff
-export const updateBlog = factory.updateOne(Blog);
+// author and viewCount are server-owned. A rename still re-slugs via the hook.
+export const updateBlog = factory.updateOne(Blog, { immutable: ["author", "viewCount"] });
```

`src/controllers/inquiry.controller.js`:

```diff
-export const updateInquiry = factory.updateOne(Inquiry); // status + internal notes
+// A lead is a record of what the client sent. Admins triage it; they do not
+// edit it. Only the two internal fields are writable.
+export const updateInquiry = factory.updateOne(Inquiry, { allow: ["status", "notes"] });
```

Add the missing validator and wire it in `src/routes/inquiry.routes.js`:

```js
// src/validators/inquiry.validator.js — append
export const updateInquiryRules = [
  body("status").optional().isIn(["new", "contacted", "closed"]),
  body("notes").optional().isString().isLength({ max: 4000 }),
];
```

```diff
-router.patch("/:id", ctrl.updateInquiry);
+router.patch("/:id", updateInquiryRules, validate, ctrl.updateInquiry);
```

Also add `updateOne` guards for Service (`immutable: []`), Testimonial, Team and
PageMeta — the defaults are sufficient there, so only the `updateOne(Model)` call
signature stays unchanged. No edit required for those three.

---

## 6 · Auth hardening for the BFF

The frontend now holds the JWT in an httpOnly cookie on **its own** origin and
forwards it to Express as `Authorization: Bearer …`. Three consequences.

### 6.1 `protect` should not load the password hash

```diff
-  const user = await User.findById(decoded.sub).select("+password").lean();
+  // No +password: the hash is never needed here, and pulling it into every
+  // authenticated request is one accidental res.json away from a leak.
+  const user = await User.findById(decoded.sub).lean();
   if (!user) throw ApiError.unauthorized("User no longer exists");
   if (user.status !== "active") throw ApiError.forbidden("Account is suspended");
-
-  delete user.password;
   req.user = user;
   next();
```

### 6.2 Password change must invalidate outstanding tokens

Right now `updatePassword` issues a *new* token but the old ones stay valid for
their full 7 days. Add `passwordChangedAt` and check it.

`src/models/User.js`:

```diff
     status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
+    // Any token issued before this instant is rejected by `protect`. Set on
+    // every password change; select:false so it never rides along in payloads.
+    passwordChangedAt: { type: Date, select: false },
   },
   { timestamps: true }
 );

 userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) return next();
   this.password = await bcrypt.hash(this.password, 12);
+  // 1s back-date: the JWT `iat` is second-resolution and can otherwise land in
+  // the same second as the write, invalidating the token we are about to issue.
+  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
   next();
 });
```

`src/middleware/auth.middleware.js` — this replaces the §6.1 diff above, so apply
this version and not both. One query, not two:

```js
  // +passwordChangedAt only; the hash is never needed here.
  const user = await User.findById(decoded.sub).select("+passwordChangedAt").lean();
  if (!user) throw ApiError.unauthorized("User no longer exists");
  if (user.status !== "active") throw ApiError.forbidden("Account is suspended");

  // Reject tokens minted before the last password change. `iat` is in seconds.
  if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw ApiError.unauthorized("Session expired, please sign in again");
  }

  delete user.passwordChangedAt; // internal; never travels in req.user
  req.user = user;
  next();
```

### 6.3 Cookie flag parity on logout

`res.clearCookie` only clears a cookie when the flags match the ones it was set
with. In production the cookie is `sameSite: "none", secure: true`; clearing it
with `{ path: "/" }` alone leaves it in the jar on Chrome and Safari.

`src/controllers/auth.controller.js`:

```diff
 export const logout = asyncHandler(async (req, res) => {
-  res.clearCookie(env.jwt.cookieName, { path: "/" });
+  // Flags must match sendTokenResponse exactly or the browser keeps the cookie.
+  res.clearCookie(env.jwt.cookieName, {
+    httpOnly: true,
+    secure: env.isProd,
+    sameSite: env.isProd ? "none" : "lax",
+    path: "/",
+  });
   res.json({ success: true, message: "Logged out" });
 });
```

Extract those four flags into a `cookieOptions()` helper in `src/utils/token.js`
and use it from both `sendTokenResponse` and `logout`, so they cannot drift.

---

## 7 · Rate limiting behind the BFF

**This is the failure mode that will bite in production.** With the BFF, every
login attempt reaches Express from the Next.js server's IP. `express-rate-limit`
keys on `req.ip`, so `AUTH_RATE_LIMIT_MAX=10` becomes *ten attempts for the
entire internet, shared*, and the eleventh legitimate admin is locked out.

Two changes.

**a) Trust the right number of hops.** `src/config/env.js`:

```diff
   nodeEnv: process.env.NODE_ENV ?? "development",
   port: toInt(process.env.PORT, 5025),
+  trustProxyHops: toInt(process.env.TRUST_PROXY_HOPS, 1),
```

`src/app.js`:

```diff
-app.set("trust proxy", 1);
+// LB → (BFF) → Express. Each forwarding hop that appends to X-Forwarded-For
+// must be counted, or req.ip resolves to the proxy and every client shares
+// one rate-limit bucket. Never set this to `true` on a public host — it lets
+// a client spoof its own IP by sending X-Forwarded-For.
+app.set("trust proxy", env.trustProxyHops);
```

**b) Key the auth limiter on the submitted email, not just the IP.** This is the
correct key for a credential endpoint regardless of proxying:

```diff
 export const authLimiter = rateLimit({
   windowMs: env.rateLimit.windowMs,
   max: env.rateLimit.authMax,
   standardHeaders: true,
   legacyHeaders: false,
   skipSuccessfulRequests: true,
+  // Per-identity, not per-IP: behind the BFF every request shares one IP, and
+  // an attacker on a botnet defeats IP keying anyway. IP is kept in the key so
+  // a single host cannot enumerate accounts either.
+  keyGenerator: (req) => {
+    const email = String(req.body?.email ?? "").toLowerCase().trim();
+    return `${req.ip}:${email}`;
+  },
   message: { success: false, message: "Too many attempts, please try again later." },
 });
```

The same reasoning applies to `contactLimiter`, but the public contact form
still posts **browser → Express directly** (it is a public endpoint and does not
need the BFF), so IP keying stays correct there. Leave it.

**c) Optional shared secret.** Once the API host is publicly reachable, have the
BFF send `x-internal-key: <INTERNAL_API_KEY>` and reject admin mutations without
it. Add as middleware in front of `protect` on the admin sub-routers. Cheap
defence-in-depth; skip if the API stays on a private network.

---

## 8 · HTML sanitization on admin writes

`Blog.content`, `Project.fullCaseStudy` and `Service.detailedOverview` are
rendered with `dangerouslySetInnerHTML` on three public pages. The moment those
strings come from a form instead of a source file, that is stored XSS — and it
executes on **public visitors**, in a session that includes nothing sensitive
today but will include the admin cookie the day someone previews a draft while
signed in.

Sanitize on write, on the server, once.

```bash
npm i isomorphic-dompurify
```

New file `src/middleware/sanitizeHtml.js`:

```js
import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes rich-text fields on admin writes. Server-side and on write, not on
 * read: the database should never hold a string we would not render.
 *
 * The allow-list matches what .prose-str in str-frontend/app/globals.css can
 * actually style. Anything else — <script>, <style>, <iframe>, event handlers,
 * javascript: URLs — is stripped by DOMPurify's default config; the config here
 * only narrows it further.
 *
 *   router.post("/", protect, sanitizeHtml("content"), validate, ctrl.create);
 */
const CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "em", "u", "s", "blockquote", "code", "pre",
    "h2", "h3", "h4", "ul", "ol", "li", "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td", "hr", "span",
  ],
  ALLOWED_ATTR: ["href", "title", "target", "rel", "src", "alt", "width", "height", "colspan", "rowspan"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
  FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
};

export default function sanitizeHtml(...fields) {
  return function sanitizeHtmlMiddleware(req, _res, next) {
    for (const field of fields) {
      if (typeof req.body?.[field] === "string") {
        req.body[field] = DOMPurify.sanitize(req.body[field], CONFIG);
      }
    }
    next();
  };
}
```

Wire it into the three write paths, **before** `validate` so length rules run on
the sanitized string:

| Route file | Change |
|---|---|
| `blog.routes.js` | `router.post("/", sanitizeHtml("content", "excerpt"), createBlogRules, validate, ctrl.createBlog)` and the same on `PATCH /:id` |
| `project.routes.js` | `sanitizeHtml("fullCaseStudy")` on `POST /` and `PATCH /:id` |
| `service.routes.js` | `sanitizeHtml("detailedOverview")` on `POST /` and `PATCH /:id` |

> Once this ships, the three `dangerouslySetInnerHTML` call sites in
> `str-frontend` are safe **and must stay unsanitized on the client** — double
> sanitizing with different allow-lists is how content silently loses markup
> that nobody can explain six months later.

---

## 9 · Dashboard stats endpoint

The overview page needs seven numbers plus a recent-leads list. Doing that as
seven client fetches is seven round trips through the BFF; do it as one endpoint.

New file `src/controllers/stats.controller.js`:

```js
import Project from "../models/Project.js";
import Service from "../models/Service.js";
import Blog from "../models/Blog.js";
import Inquiry from "../models/Inquiry.js";
import Team from "../models/Team.js";
import Testimonial from "../models/Testimonial.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * GET /api/v1/stats/overview — everything the admin landing page renders,
 * in one round trip.
 *
 * Shape is deliberately flat and stable; the dashboard cards read it directly
 * with no client-side reshaping.
 */
export const getOverview = asyncHandler(async (_req, res) => {
  const [inquiryFacet, projectsByService, blogCounts, counts] = await Promise.all([
    // One pass over inquiries yields the status breakdown AND the recent list.
    // $facet re-scans the input for each sub-pipeline and cannot use an index
    // for the inner $sort — fine at agency lead volume (< ~50k docs). If the
    // collection ever passes that, split `recent` into its own indexed find().
    Inquiry.aggregate([
      {
        $facet: {
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 6 },
            {
              $project: {
                senderName: 1, senderEmail: 1, serviceInterested: 1,
                budgetRange: 1, status: 1, createdAt: 1,
              },
            },
          ],
          total: [{ $count: "value" }],
        },
      },
    ]),

    Project.aggregate([
      { $unwind: "$serviceTypes" },
      { $group: { _id: "$serviceTypes", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    Blog.aggregate([{ $group: { _id: "$isPublished", count: { $sum: 1 } } }]),

    Promise.all([
      Project.estimatedDocumentCount(),
      Project.countDocuments({ featured: true }),
      Service.countDocuments({ isActive: true }),
      Team.countDocuments({ isActive: true }),
      Testimonial.estimatedDocumentCount(),
    ]),
  ]);

  const facet = inquiryFacet[0] ?? {};
  const statusMap = Object.fromEntries((facet.byStatus ?? []).map((r) => [r._id, r.count]));
  const publishMap = Object.fromEntries((blogCounts ?? []).map((r) => [String(r._id), r.count]));
  const [projectsTotal, projectsFeatured, servicesActive, teamActive, testimonialsTotal] = counts;

  res.json({
    success: true,
    data: {
      projects: {
        total: projectsTotal,
        featured: projectsFeatured,
        byService: projectsByService.map((r) => ({ serviceType: r._id, count: r.count })),
      },
      blogs: {
        published: publishMap.true ?? 0,
        drafts: publishMap.false ?? 0,
      },
      inquiries: {
        total: facet.total?.[0]?.value ?? 0,
        new: statusMap.new ?? 0,
        contacted: statusMap.contacted ?? 0,
        closed: statusMap.closed ?? 0,
      },
      services: { active: servicesActive },
      team: { active: teamActive },
      testimonials: { total: testimonialsTotal },
      recentInquiries: facet.recent ?? [],
      generatedAt: new Date().toISOString(),
    },
  });
});
```

> `estimatedDocumentCount()` reads collection metadata (O(1)); `countDocuments()`
> with a filter scans an index. Use the estimate for unfiltered totals, the exact
> count where a filter exists. On a dashboard that refreshes on every page load
> this is the difference between 1ms and 40ms.

New file `src/routes/stats.routes.js`:

```js
import { Router } from "express";
import * as ctrl from "../controllers/stats.controller.js";
import { protect, checkRole } from "../middleware/auth.middleware.js";

const router = Router();

// Entire resource is admin-only. No public shape of this exists.
router.use(protect, checkRole("super_admin", "admin"));
router.get("/overview", ctrl.getOverview);

export default router;
```

`src/routes/index.js`:

```diff
 import pageMetaRoutes from "./pageMeta.routes.js";
+import statsRoutes from "./stats.routes.js";
@@
 router.use("/page-meta", pageMetaRoutes);
+router.use("/stats", statsRoutes);
```

---

## 10 · `PageMeta` identifier enum

The public site has a `/blogs` route with no meta row available for it.

`src/models/PageMeta.js`:

```diff
-      enum: ["home", "about", "services", "projects", "contact"],
+      enum: ["home", "about", "services", "projects", "blogs", "contact"],
```

The admin editor renders one tab per value in this enum, read from
`GET /api/v1/page-meta`. Because `upsertPageMeta` is an upsert, no seeding is
required — a page with no row yet simply renders empty fields.

---

## 11 · One-shot data migration

New file `src/scripts/migrateServiceTypes.js`:

```js
/**
 * One-shot: Project.serviceType (String) → Project.serviceTypes ([String]).
 *
 *   npm run migrate:service-types            # dry run, prints the plan
 *   npm run migrate:service-types -- --apply # writes
 *
 * Idempotent. Safe to re-run: documents that already have serviceTypes and no
 * serviceType are skipped.
 */
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db.js";
import Project, { SERVICE_TYPES } from "../models/Project.js";

// Old enum → new taxonomy. The two dropped values are folded into their nearest
// surviving discipline rather than deleted, so no project loses its category.
const REMAP = {
  "web-development": "web-development",
  "custom-software": "custom-software",
  "mobile-app": "mobile-applications",
  "ui-ux-design": "product-design",
  "cloud-devops": "custom-software",
  "cybersecurity": "custom-software",
};

const apply = process.argv.includes("--apply");

async function run() {
  await connectDB();
  const col = mongoose.connection.collection("projects");

  const legacy = await col.find({ serviceType: { $exists: true } }).toArray();
  console.log(`[migrate] ${legacy.length} document(s) still carry serviceType.`);

  const plan = legacy.map((doc) => {
    const mapped = REMAP[doc.serviceType];
    return { _id: doc._id, title: doc.title, from: doc.serviceType, to: mapped ?? null };
  });

  const unmapped = plan.filter((p) => !p.to);
  for (const p of plan) {
    console.log(`  ${p.from.padEnd(24)} → ${p.to ?? "!! NO MAPPING"}   ${p.title}`);
  }
  if (unmapped.length) {
    console.error(`[migrate] ${unmapped.length} document(s) have no mapping. Fix REMAP first.`);
    await disconnectDB();
    process.exit(1);
  }

  if (!apply) {
    console.log("[migrate] Dry run. Re-run with --apply to write.");
    await disconnectDB();
    process.exit(0);
  }

  // Written one-by-one rather than as an aggregation-pipeline update so the
  // remap table applies. Volume here is tens of documents, not millions.
  let n = 0;
  for (const p of plan) {
    await col.updateOne(
      { _id: p._id },
      { $set: { serviceTypes: [p.to] }, $unset: { serviceType: "" } }
    );
    n += 1;
  }
  console.log(`[migrate] Updated ${n} document(s).`);

  // Any document that predates the field entirely.
  const orphans = await col.countDocuments({ serviceTypes: { $exists: false } });
  if (orphans) console.warn(`[migrate] ${orphans} document(s) have no serviceTypes at all.`);

  await col.createIndex({ serviceTypes: 1, featured: -1, displayOrder: 1 });
  await col.dropIndex("serviceType_1").catch(() => {});
  console.log("[migrate] Indexes reconciled.");

  await disconnectDB();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("[migrate] Failed:", err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
```

`package.json`:

```diff
-    "seed:admin": "node src/scripts/seedAdmin.js"
+    "seed:admin": "node src/scripts/seedAdmin.js",
+    "migrate:service-types": "node src/scripts/migrateServiceTypes.js"
```

(The existing line has no trailing comma — it is currently the last entry in
`scripts`. Add the comma when appending.)

Run order on any environment that already has data:

```bash
npm run migrate:service-types            # read the plan
npm run migrate:service-types -- --apply
```

If the database is empty (likely — Phase 3 ran entirely on `lib/data.js`), the
script prints `0 documents` and exits cleanly. Run it anyway; it also creates
the compound index.

---

## 12 · Endpoint contract (frozen for Phase 4)

Base: `${NEXT_PUBLIC_API_URL}` = `http://localhost:5025/api/v1` in dev.
Every response is `{ success, data }`, lists add `meta`, errors are
`{ success: false, message, details? }`.

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/auth/login` | public | rate limited, `{ email, password }` → `{ token, data: user }` |
| `GET` | `/auth/me` | bearer | |
| `POST` | `/auth/logout` | bearer | |
| `PATCH` | `/auth/update-password` | bearer | re-issues token |
| `GET` | `/stats/overview` | admin | §9 |
| `GET` | `/projects` | public | `?serviceTypes= &tags= &featured= &search= &sort= &page= &limit=` |
| `GET` | `/projects/admin/all` | admin | `defaultSort: -updatedAt` |
| `GET` | `/projects/admin/id/:id` | admin | edit-form load |
| `GET` | `/projects/:slug` | public | |
| `POST` `PATCH` `DELETE` | `/projects`, `/projects/:id` | admin | |
| `GET` | `/services` | public | `?isActive=true` |
| `GET` | `/services/admin/id/:id` | admin | |
| `GET` | `/services/:slug` | public | |
| `POST` `PATCH` `DELETE` | `/services`, `/services/:id` | admin | |
| `GET` | `/blogs` | public | published only |
| `GET` | `/blogs/admin/all` | admin | includes drafts |
| `GET` | `/blogs/admin/id/:id` | admin | |
| `GET` | `/blogs/:slug` | public | increments `viewCount` |
| `POST` `PATCH` `DELETE` | `/blogs`, `/blogs/:id` | admin | `author` is server-set |
| `GET` | `/testimonials`, `/testimonials/:id` | public | |
| `POST` `PATCH` `DELETE` | `/testimonials`, `/testimonials/:id` | admin | |
| `GET` | `/team`, `/team/:id` | public | |
| `POST` `PATCH` `DELETE` | `/team`, `/team/:id` | admin | |
| `POST` | `/inquiries` | public | rate limited 5/window |
| `GET` | `/inquiries`, `/inquiries/:id` | admin | `?status=new` |
| `PATCH` | `/inquiries/:id` | admin | **only** `status`, `notes` |
| `DELETE` | `/inquiries/:id` | admin | |
| `GET` | `/page-meta` | admin | all rows |
| `GET` | `/page-meta/:identifier` | public | |
| `PUT` | `/page-meta/:identifier` | admin | upsert |
| `GET` | `/users`, `/users/:id` | **super_admin** | |
| `POST` `PATCH` `DELETE` | `/users`, `/users/:id` | **super_admin** | |

---

## 13 · Verification

```bash
npm run dev
npm run seed:admin          # if not already seeded
```

```bash
API=http://localhost:5025/api/v1

# 1 — login, capture the token
TOKEN=$(curl -s -X POST $API/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"solaimanislamsifat@gmail.com","password":"111111"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

# 2 — create a multi-service project
curl -s -X POST $API/projects -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Migration Smoke Test","serviceTypes":["web-development","graphics-design"]}' | jq .

# 3 — the two filter shapes must return the SAME document
curl -s "$API/projects?serviceTypes=graphics-design" | jq '.meta.total'
curl -s "$API/projects?serviceTypes=graphics-design,digital-marketing" | jq '.meta.total'
curl -s "$API/projects?serviceTypes=graphics-design&serviceTypes=digital-marketing" | jq '.meta.total'

# 4 — immutable guard: _id and slug must be ignored, title change must re-slug
ID=$(curl -s "$API/projects?search=Migration" | jq -r '.data[0]._id')
curl -s -X PATCH $API/projects/$ID -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Migration Smoke Test Renamed","slug":"hijacked","createdAt":"1999-01-01"}' \
  | jq '{slug:.data.slug, createdAt:.data.createdAt}'
# expect slug "migration-smoke-test-renamed", createdAt unchanged

# 5 — invalid enum must 400 with details
curl -s -X POST $API/projects -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"Bad","serviceTypes":["cybersecurity"]}' | jq .

# 6 — inquiry write surface
IID=$(curl -s $API/inquiries -H "Authorization: Bearer $TOKEN" | jq -r '.data[0]._id')
curl -s -X PATCH $API/inquiries/$IID -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"contacted","senderEmail":"attacker@evil.com"}' \
  | jq '{status:.data.status, email:.data.senderEmail}'
# expect status "contacted", senderEmail unchanged

# 7 — stats
curl -s $API/stats/overview -H "Authorization: Bearer $TOKEN" | jq .

# 8 — XSS stripped on write
curl -s -X POST $API/blogs -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"XSS Probe","content":"<p>ok</p><script>alert(1)</script><img src=x onerror=alert(1)>"}' \
  | jq -r '.data.content'
# expect: <p>ok</p><img src="x"> — no <script>, no onerror

# 9 — password change invalidates the old token
curl -s -X PATCH $API/auth/update-password -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"currentPassword":"111111","newPassword":"111111new"}' > /dev/null
curl -s $API/auth/me -H "Authorization: Bearer $TOKEN" | jq -r '.message'
# expect "Session expired, please sign in again"
```

Checklist:

- [ ] `/api/v1/health` and `/api/health` both answer
- [ ] No occurrence of `serviceType` remains outside the compat virtual and the
      migration script — `grep -rn "serviceType\b" src/ | grep -v serviceTypes`
- [ ] `explain("executionStats")` on the filtered list shows `IXSCAN` on
      `serviceTypes_1_featured_-1_displayOrder_1`, not `COLLSCAN` + `SORT`
- [ ] Eleven failed logins for one email lock that email, not the whole IP
- [ ] `SEED_ADMIN_PASSWORD=111111` is changed before anything is deployed —
      it is currently in `.env.example`, which is committed

---

## 14 · Explicitly out of scope for Phase 4

Do not implement these now, and do not scaffold them "for later":

- File uploads. All image fields stay `String` URLs; the admin form takes a
  path or absolute URL. Cloudinary lands in Phase 6 if it is still wanted.
- Refresh-token rotation. Seven-day access tokens plus `passwordChangedAt`
  revocation is the agreed posture for a single-digit-admin panel.
- Soft deletes / audit log / revision history.
- Redis-backed rate limiting. The in-memory store is correct for one instance;
  revisit only when the API is horizontally scaled.
- Any GSAP-related backend work. `animationTrigger` and `layoutStyle` are
  stored and returned; nothing reads them until Phase 5.
