import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { sendTokenResponse } from "../utils/token.js";
import env from "../config/env.js";

/** POST /api/auth/login — public (rate limited). */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Same generic message for unknown email and wrong password: no user enumeration.
  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid credentials");
  }
  if (user.status !== "active") throw ApiError.forbidden("Account is suspended");

  sendTokenResponse(user, 200, res, "Logged in");
});

/** POST /api/auth/register — protected; super_admin only (enforced in route). */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, permissions } = req.body;
  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw ApiError.conflict("Email already registered");

  const user = await User.create({ name, email, password, role, permissions });
  const safe = user.toObject();
  delete safe.password;
  res.status(201).json({ success: true, data: safe });
});

/** GET /api/auth/me */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

/** PATCH /api/auth/update-password — re-issues the token so old ones lose value. */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized("Current password is incorrect");
  }
  user.password = newPassword; // hashed by the pre-save hook
  await user.save();
  sendTokenResponse(user, 200, res, "Password updated");
});

/** POST /api/auth/logout — clears the auth cookie. */
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(env.jwt.cookieName, { path: "/" });
  res.json({ success: true, message: "Logged out" });
});
