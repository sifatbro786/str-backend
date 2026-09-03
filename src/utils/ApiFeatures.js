/**
 * Chainable query builder for public list endpoints. Wraps a Mongoose Query and
 * applies filtering, full-text-ish search, sorting, field projection, and
 * pagination from the request's query string.
 *
 * Security: only whitelisted fields are allowed through the filter to prevent
 * clients from querying/sorting arbitrary internal fields. Combine with
 * express-mongo-sanitize (app-level) to neutralize operator injection.
 *
 * Usage:
 *   const features = new ApiFeatures(Project.find(), req.query, {
 *     allowedFilters: ["serviceType", "featured", "tags"],
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
      allowedSort: options.allowedSort ?? [],
      defaultSort: options.defaultSort ?? "-createdAt",
      searchFields: options.searchFields ?? [],
      maxLimit: options.maxLimit ?? 100,
      defaultLimit: options.defaultLimit ?? 12,
    };
    // Filled by paginate() so the caller can build pagination metadata.
    this.pagination = { page: 1, limit: this.options.defaultLimit, skip: 0 };
    this._filter = {};
  }

  /** Whitelisted equality + range filtering (gte|gt|lte|lt|in). */
  filter() {
    const src = { ...this.queryString };
    const filter = {};

    for (const field of this.options.allowedFilters) {
      if (src[field] === undefined) continue;
      const raw = src[field];

      // Range/set operators come in as objects: ?rating[gte]=4
      if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
        const ops = {};
        for (const [op, val] of Object.entries(raw)) {
          if (["gte", "gt", "lte", "lt"].includes(op)) {
            ops[`$${op}`] = castValue(val);
          } else if (op === "in") {
            ops.$in = String(val).split(",").map(castValue);
          }
        }
        if (Object.keys(ops).length) filter[field] = ops;
      } else if (typeof raw === "string" && raw.includes(",")) {
        // Comma list → $in (e.g. ?tags=react,node)
        filter[field] = { $in: raw.split(",").map((v) => castValue(v.trim())) };
      } else {
        filter[field] = castValue(raw);
      }
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

  /** Projection via ?fields=title,slug ; always drops __v. */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").map((f) => f.trim()).join(" ");
      this.query = this.query.select(fields);
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
    const [docs, total] = await Promise.all([
      this.query.lean().exec(),
      this.model.countDocuments(this._filter).exec(),
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

/** Coerce query-string primitives to boolean/number where unambiguous. */
function castValue(v) {
  if (v === "true") return true;
  if (v === "false") return false;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
    return Number(v);
  }
  return v;
}
