import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

/**
 * Terminal middleware for express-validator chains. Collects validation errors
 * into a single 400 with a normalized `details` array.
 *
 *   router.post("/", createProjectRules, validate, controller.create);
 */
export default function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  next(ApiError.badRequest("Validation failed", details));
}
