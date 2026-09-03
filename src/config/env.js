import dotenv from "dotenv";

dotenv.config();

/**
 * Centralized, validated environment configuration.
 * Import `env` everywhere instead of reading `process.env` directly so that
 * missing/invalid values fail fast at boot rather than at request time.
 */
const required = ["MONGODB_URI", "JWT_SECRET"];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`[config] Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const toInt = (value, fallback) => {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isNaN(n) ? fallback : n;
};

const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toInt(process.env.PORT, 5025),

  // Comma-separated whitelist, e.g. "http://localhost:3000,https://strsltd.com"
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  // Database
  mongoUri: process.env.MONGODB_URI,

  // Auth
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    cookieName: process.env.JWT_COOKIE_NAME ?? "str_token",
    // Cookie lifetime in days (kept in sync with expiresIn for the cookie path).
    cookieExpiresDays: toInt(process.env.JWT_COOKIE_EXPIRES_DAYS, 7),
  },

  // Rate limiting (global + auth-specific).
  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toInt(process.env.RATE_LIMIT_MAX, 300),
    authMax: toInt(process.env.AUTH_RATE_LIMIT_MAX, 10),
  },
};

env.isProd = env.nodeEnv === "production";
env.isTest = env.nodeEnv === "test";

export default env;
