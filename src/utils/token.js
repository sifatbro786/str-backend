import jwt from "jsonwebtoken";
import env from "../config/env.js";

/** Signs a short, minimal JWT payload. Keep claims lean — no PII. */
export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret);
}

/**
 * Sets the auth cookie (httpOnly, sameSite, secure in prod) and returns the
 * sanitized user + token in the JSON body so SPA and cookie flows both work.
 */
export function sendTokenResponse(user, statusCode, res, message = "Success") {
  const token = signToken(user);
  const maxAge = env.jwt.cookieExpiresDays * 24 * 60 * 60 * 1000;

  res.cookie(env.jwt.cookieName, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    maxAge,
    path: "/",
  });

  const safe = user.toObject ? user.toObject() : user;
  delete safe.password;

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    data: safe,
  });
}
