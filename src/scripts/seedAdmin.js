/**
 * Bootstraps the first super_admin so the dashboard has a way in.
 *
 *   npm run seed:admin
 *
 * Reads SEED_ADMIN_NAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from .env.
 * Idempotent: if the email already exists the script reports and exits without
 * touching the account (it will not silently reset a live password).
 */
import env from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";
import User from "../models/User.js";

const name = process.env.SEED_ADMIN_NAME ?? "Super Admin";
const email = (process.env.SEED_ADMIN_EMAIL ?? "").toLowerCase().trim();
const password = process.env.SEED_ADMIN_PASSWORD ?? "";

async function run() {
  if (!email || !password) {
    console.error("[seed] SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required in .env");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("[seed] SEED_ADMIN_PASSWORD must be at least 8 characters");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[seed] User already exists: ${email} (role: ${existing.role}) — no changes made.`);
  } else {
    // Password is hashed by the User pre-save hook.
    const user = await User.create({ name, email, password, role: "super_admin" });
    console.log(`[seed] Created super_admin: ${user.email}`);
    if (!env.isProd) console.log("[seed] Log in at POST /api/auth/login with that email + password.");
  }

  await disconnectDB();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("[seed] Failed:", err.message);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
