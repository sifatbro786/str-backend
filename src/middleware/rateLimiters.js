import rateLimit from "express-rate-limit";
import env from "../config/env.js";

/** Broad limiter applied to the whole /api surface. */
export const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

/** Strict limiter for credential endpoints (login/register) to blunt brute force. */
export const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  // Per-identity, not per-IP: behind the BFF every request shares one IP, and
  // an attacker on a botnet defeats IP keying anyway. IP is kept in the key so
  // a single host cannot enumerate accounts either.
  keyGenerator: (req) => {
    const email = String(req.body?.email ?? "").toLowerCase().trim();
    return `${req.ip}:${email}`;
  },
  message: { success: false, message: "Too many attempts, please try again later." },
});

/**
 * Upload limiter. Authenticated already, so this is not about abuse by
 * strangers — it is about a stuck retry loop in the admin panel writing a few
 * hundred files to a disk nobody is watching. Generous enough that a real
 * editing session (nine services, a few re-crops each) never sees it.
 */
export const uploadLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many uploads, please try again in a few minutes." },
});

/** Anti-spam limiter for the public contact form (POST /api/inquiries). */
export const contactLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many submissions, please try again later." },
});
