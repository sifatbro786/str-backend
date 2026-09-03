import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/token.js";
import env from "../config/env.js";
import User from "../models/User.js";

/** Pull a bearer token from the Authorization header or the auth cookie. */
function extractToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7).trim();
  if (req.cookies && req.cookies[env.jwt.cookieName]) return req.cookies[env.jwt.cookieName];
  return null;
}

/**
 * Authentication gate. Verifies the JWT, loads the current user, and rejects
 * suspended accounts. Attaches `req.user`.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized("Authentication required");

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const user = await User.findById(decoded.sub).select("+password").lean();
  if (!user) throw ApiError.unauthorized("User no longer exists");
  if (user.status !== "active") throw ApiError.forbidden("Account is suspended");

  delete user.password;
  req.user = user;
  next();
});

/**
 * Role-based authorization. Usage: checkRole("super_admin") or
 * checkRole("super_admin", "admin"). Assumes `protect` ran first.
 */
export const checkRole = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized("Authentication required");
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden("You do not have permission to perform this action");
    }
    next();
  });

/**
 * Fine-grained permission check for delegated admins. super_admin bypasses.
 * Usage: checkPermission("blog:write").
 */
export const checkPermission = (permission) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized("Authentication required");
    if (req.user.role === "super_admin") return next();
    if (!req.user.permissions?.includes(permission)) {
      throw ApiError.forbidden(`Missing required permission: ${permission}`);
    }
    next();
  });
