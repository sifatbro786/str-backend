/**
 * Chainable query builder for public list endpoints. Wraps a Mongoose Query and
 * applies filtering, full-text-ish search, sorting, field projection, and
 * pagination from the request's query string.
 *
 * Security: only whitelisted fields are allowed through the filter to prevent
 * clients from querying/sorting arbitrary internal fields. Combine with
 * the app-level sanitize middleware to neutralize operator injection.
 *
 * Usage:
 *   const features = new ApiFeatures(Project.find(), req.query, {
 *     allowedFilters: ["serviceTypes", "featured", "tags"],
 *     arrayFilters: ["serviceTypes", "tags"],
 *     allowedSort: ["displayOrder", "projectDate", "createdAt"],
 *     defaultSort: "-displayOrder -createdAt",
 *     searchFields: ["title", "shortDescription", "clientName"],
 *   })
 *     .filter().search().sort().limitFields().paginate();
 *   const [docs, total] = await features.execWithCount();
 */
export default class ApiFeatures {
  constructor(query, queryString = {}, options = {}) {
    this.query = query;
    this.model = query.model;
    this.queryString = queryString;
    this.options = {
      allowedFilters: options.allowedFilters ?? [],
      // Schema fields that are arrays. A scalar filter on one of these is
      // normalized to $in so single- and multi-value filters behave identically.
      arrayFilters: options.arrayFilters ?? [],
      allowedSort: options.allowedSort ?? [],
      defaultSort: options.defaultSort ?? "-createdAt",
      searchFields: options.searchFields ?? [],
      // Schema paths a client may never project, whatever ?fields= says.
      // See limitFields() for why this is a drop-list and not an exclusion.
      deniedFields: options.deniedFields ?? [],
      maxLimit: options.maxLimit ?? 100,
      defaultLimit: options.defaultLimit ?? 12,
    };
    // Filter already baked into the query by the caller (e.g. { isPublished: true }).
    // Kept separately so the count query matches the find query exactly.
    this.baseFilter = options.baseFilter ?? {};
    // Filled by paginate() so the caller can build pagination metadata.
    this.pagination = { page: 1, limit: this.options.defaultLimit, skip: 0 };
    this._filter = {};
  }

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
            ops.$in = String(val)
              .split(",")
              .map((v) => castValue(v.trim()));
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

  /** Case-insensitive regex OR across configured searchFields via ?search= */
  search() {
    const term = this.queryString.search;
    if (term && this.options.searchFields.length) {
      const safe = String(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const or = this.options.searchFields.map((f) => ({
        [f]: { $regex: safe, $options: "i" },
      }));
      this._filter = { ...this._filter, $or: or };
      this.query = this.query.find({ $or: or });
    }
    return this;
  }

  /** Sort by whitelisted fields only; falls back to defaultSort. */
  sort() {
    const requested = this.queryString.sort;
    let sortBy = this.options.defaultSort;

    if (requested) {
      const allowed = requested
        .split(",")
        .map((s) => s.trim())
        .filter((s) => this.options.allowedSort.includes(s.replace(/^-/, "")))
        .join(" ");
      if (allowed) sortBy = allowed;
    }

    this.query = this.query.sort(sortBy);
    return this;
  }

  /**
   * Projection via ?fields=title,slug ; always drops __v.
   *
   * ── WHY THE TOKENS ARE FILTERED ──────────────────────────────────────────
   * Mongoose's `+field` syntax is the ONE thing that overrides `select: false`
   * on a schema path. Passing ?fields= straight into .select() therefore hands
   * the client a switch for every hidden field the model has — on User that is
   * `?fields=+password`, which returns every bcrypt hash in the collection.
   * `select: false` is not a projection default here, it is the protection, so
   * nothing arriving from the query string may re-enable it.
   *
   * Denied names are dropped rather than appended as `-field` exclusions on
   * purpose: Mongo rejects a projection that mixes inclusion and exclusion
   * (`{name: 1, password: 0}` is an error, not a narrower projection). Dropping
   * the token is enough — in an inclusion projection the field is simply never
   * asked for, and in an exclusion projection `select: false` still hides it.
   */
  limitFields() {
    const denied = this.options.deniedFields ?? [];

    if (this.queryString.fields) {
      const fields = String(this.queryString.fields)
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
        .filter((f) => !f.startsWith("+"))
        .filter((f) => !denied.includes(f.replace(/^-/, "")))
        .join(" ");
      // An all-denied ?fields= list must not collapse to select("") — that is
      // "project everything", the opposite of what was asked for.
      this.query = this.query.select(fields || "-__v");
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = Math.max(1, Number.parseInt(this.queryString.page ?? "1", 10) || 1);
    const limit = Math.min(
      this.options.maxLimit,
      Math.max(1, Number.parseInt(this.queryString.limit ?? "", 10) || this.options.defaultLimit)
    );
    const skip = (page - 1) * limit;

    this.pagination = { page, limit, skip };
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  /** Runs the built query and a matching countDocuments in parallel. */
  async execWithCount() {
    const countFilter = { ...this.baseFilter, ...this._filter };
    const [docs, total] = await Promise.all([
      this.query.lean().exec(),
      this.model.countDocuments(countFilter).exec(),
    ]);
    return [docs, total];
  }

  buildMeta(total) {
    const { page, limit } = this.pagination;
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}

/**
 * Coerce query-string primitives to boolean/number where unambiguous.
 *
 * Note on slugs: castValue("2d-3d") returns the string (Number("2d-3d") is
 * NaN), which is correct. A hypothetical numeric-looking slug such as "2024"
 * would be cast to a Number and never match — none of the current taxonomy
 * slugs are numeric, so this is not worth a stringFilters escape hatch today.
 */
function castValue(v) {
  if (v === "true") return true;
  if (v === "false") return false;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return v;
}
