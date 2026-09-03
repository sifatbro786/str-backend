import User from "../models/User.js";
import * as factory from "../utils/handlerFactory.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

/** Admin user management. Every route here is super_admin only. */

export const listUsers = factory.getAll(User, {
  allowedFilters: ["role", "status"],
  allowedSort: ["createdAt", "name"],
  defaultSort: "-createdAt",
  searchFields: ["name", "email"],
});

export const getUser = factory.getOne(User);

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, permissions } = req.body;
  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw ApiError.conflict("Email already registered");

  const user = await User.create({ name, email, password, role, permissions });
  const safe = user.toObject();
  delete safe.password;
  res.status(201).json({ success: true, data: safe });
});

export const updateUser = asyncHandler(async (req, res) => {
  // Password changes go through auth/update-password so the pre-save hash runs.
  const { password, ...rest } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, rest, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    throw ApiError.badRequest("You cannot delete your own account");
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, message: "User deleted" });
});
