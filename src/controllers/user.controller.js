import User from "../models/User.js";
import * as factory from "../utils/handlerFactory.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

/**
 * Admin user management. Every route here is super_admin only (user.routes.js).
 *
 * ── THE THREE WAYS THIS PANEL CAN BRICK ITSELF ───────────────────────────
 * Role editing is the one admin screen whose failure mode is losing access to
 * the admin screen. Three moves do it, and all three look reasonable at the
 * moment someone makes them:
 *
 *   1. Demoting yourself. You are super_admin, you set your own role to admin
 *      to "test what an admin sees", and the next request 403s on this very
 *      controller. Nobody can undo it but a super_admin, and you were the one.
 *   2. Suspending yourself. Same shape — `protect` rejects a suspended account
 *      on the next request.
 *   3. Removing the LAST super_admin — by demotion, suspension or deletion.
 *      Self-checks do not catch this: an owner demoting the only other
 *      super_admin is fine, right up until it is the only one left.
 *
 * Guarded below rather than left to the UI. The UI can hide a button; it
 * cannot stop a curl.
 *
 * ── WHAT IS NOT GUARDED, DELIBERATELY ────────────────────────────────────
 * A super_admin can demote or suspend ANOTHER super_admin while one remains.
 * That is a real power, and it is the point of the role — a co-owner removing
 * a departing co-owner must not need a third party.
 */

/** Fields a super_admin may write through PATCH /users/:id. */
const UPDATABLE = ["name", "email", "role", "permissions", "status", "avatar"];

/**
 * Active super_admins other than `excludeId`.
 *
 * Read-then-write, so two concurrent demotions of the last two super_admins
 * could in principle both see a count of 1 and both succeed. Closing that
 * needs a transaction against a replica set for a panel with single-digit
 * admins who are not clicking simultaneously — noted rather than built. If it
 * ever matters, the fix is a `findOneAndUpdate` guarded on a computed count,
 * not a lock.
 */
function countOtherActiveSuperAdmins(excludeId) {
  return User.countDocuments({
    role: "super_admin",
    status: "active",
    _id: { $ne: excludeId },
  });
}

export const listUsers = factory.getAll(User, {
  allowedFilters: ["role", "status"],
  allowedSort: ["createdAt", "name"],
  defaultSort: "-createdAt",
  searchFields: ["name", "email"],
  // `select: false` on the schema is the protection, and ?fields=+password
  // overrides it. See ApiFeatures.limitFields().
  deniedFields: ["password", "passwordChangedAt"],
});

export const getUser = factory.getOne(User);

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, permissions, status } = req.body;

  const normalizedEmail = String(email).toLowerCase().trim();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw ApiError.conflict("Email already registered");

  // Explicit field list: `req.body` is never spread into User.create, or a
  // crafted payload sets passwordChangedAt and invalidates nothing while
  // looking like it did.
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role,
    permissions,
    status,
  });

  const safe = user.toObject();
  delete safe.password;
  delete safe.passwordChangedAt;
  res.status(201).json({ success: true, data: safe });
});

export const updateUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) throw ApiError.notFound("User not found");

  const payload = Object.fromEntries(
    Object.entries(req.body ?? {}).filter(([k]) => UPDATABLE.includes(k))
  );
  if (Object.keys(payload).length === 0) {
    throw ApiError.badRequest("No updatable fields supplied");
  }
  if (payload.email) payload.email = String(payload.email).toLowerCase().trim();

  const isSelf = String(target._id) === String(req.user._id);
  const demoting = payload.role !== undefined && payload.role !== target.role;
  const suspending = payload.status === "suspended" && target.status !== "suspended";

  if (isSelf && demoting) {
    throw ApiError.badRequest(
      "You cannot change your own role. Ask another super admin to do it."
    );
  }
  if (isSelf && suspending) {
    throw ApiError.badRequest("You cannot suspend your own account.");
  }

  // Losing the last active super_admin leaves nobody who can restore one.
  const losingSuperAdmin =
    target.role === "super_admin" &&
    target.status === "active" &&
    ((demoting && payload.role !== "super_admin") || suspending);

  if (losingSuperAdmin && (await countOtherActiveSuperAdmins(target._id)) === 0) {
    throw ApiError.badRequest(
      "This is the last active super admin. Promote another account first."
    );
  }

  // runValidators so the role/status enums and the email regex are enforced on
  // update, not just on create. Setters (lowercase, trim) run on update in
  // Mongoose 6+, so the normalisation above is belt-and-braces for the
  // duplicate check rather than the only place it happens.
  const user = await User.findByIdAndUpdate(target._id, payload, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: user });
});

/**
 * PATCH /users/:id/password — super_admin sets another account's password.
 *
 * Uses .save() rather than findByIdAndUpdate for two reasons, both required:
 * the pre-save hook is what bcrypt-hashes the value (an update query would
 * store it in plain text), and the same hook stamps `passwordChangedAt`, which
 * `protect` compares against every JWT's `iat`. So a reset here does not just
 * change the password — it kills every session that account currently has,
 * which is the entire point of resetting a credential you suspect is burned.
 */
export const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  // Your own password goes through /auth/update-password, which demands the
  // current one. Allowing it here would also invalidate the cookie you are
  // holding and log you out mid-request, with no obvious cause.
  if (String(req.user._id) === req.params.id) {
    throw ApiError.badRequest(
      "Use /auth/update-password to change your own password."
    );
  }

  const user = await User.findById(req.params.id).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  user.password = newPassword; // hashed by the pre-save hook
  await user.save();

  res.json({
    success: true,
    message: `Password updated. ${user.name} has been signed out everywhere.`,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    throw ApiError.badRequest("You cannot delete your own account");
  }

  const target = await User.findById(req.params.id);
  if (!target) throw ApiError.notFound("User not found");

  if (
    target.role === "super_admin" &&
    target.status === "active" &&
    (await countOtherActiveSuperAdmins(target._id)) === 0
  ) {
    throw ApiError.badRequest(
      "This is the last active super admin. Promote another account first."
    );
  }

  await User.findByIdAndDelete(target._id);
  res.json({ success: true, message: "User deleted" });
});
