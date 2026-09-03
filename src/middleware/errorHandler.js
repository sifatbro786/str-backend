import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

/**
 * Normalizes framework/driver errors (Mongoose, JWT) into consistent JSON and
 * hides internals in production. Keep the 4-arg signature so Express treats it
 * as error middleware.
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  let error = err;

  // Mongoose: malformed ObjectId / cast failure
  if (err.name === "CastError") {
    error = ApiError.badRequest(`Invalid value for '${err.path}': ${err.value}`);
  }

  // Mongoose: duplicate unique key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    error = ApiError.conflict(`Duplicate value for '${field}'`);
  }

  // Mongoose: schema validation
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest("Validation failed", details);
  }

  // JWT
  if (err.name === "JsonWebTokenError") error = ApiError.unauthorized("Invalid token");
  if (err.name === "TokenExpiredError") error = ApiError.unauthorized("Token expired");

  const statusCode = error.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  const payload = {
    success: false,
    message: error.message || "Internal Server Error",
  };
  if (error.details) payload.details = error.details;
  if (!env.isProd) payload.stack = err.stack;

  // Log server-side faults (5xx) and non-operational errors.
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
  }

  res.status(statusCode).json(payload);
}
