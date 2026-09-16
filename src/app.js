import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import env from "./config/env.js";
import routes from "./routes/index.js";
import sanitize from "./middleware/sanitize.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimiters.js";

/**
 * Builds and configures the Express application. Kept separate from server.js
 * so the app can be imported directly in tests without binding a port.
 */
const app = express();

// LB → (BFF) → Express. Each forwarding hop that appends to X-Forwarded-For
// must be counted, or req.ip resolves to the proxy and every client shares
// one rate-limit bucket. Never set this to `true` on a public host — it lets
// a client spoof its own IP by sending X-Forwarded-For.
app.set("trust proxy", env.trustProxyHops);
app.disable("x-powered-by");

// Security headers.
app.use(helmet());

/**
 * CORS — reflect only whitelisted origins; allow credentials for cookie auth.
 *
 * ── WHY A REJECTED ORIGIN RETURNS false AND DOES NOT THROW ───────────────
 * Throwing here hands the error to errorHandler, which answers 500 with a JSON
 * body and — because the cors middleware never got to add them — no CORS
 * headers at all. The browser then reports:
 *
 *   "No 'Access-Control-Allow-Origin' header is present on the requested
 *    resource"
 *
 * which reads like the API is broken, when the actual cause is one missing
 * entry in CORS_ORIGINS. That message sent a real afternoon down the wrong
 * path. `callback(null, false)` fails the request in exactly the same way for
 * the browser, but leaves a line in the server log naming the origin that was
 * refused AND the list it was checked against, so the next person reads the
 * cause instead of guessing it.
 *
 * ⚑ CORS_ORIGINS IS PER-DEPLOYMENT. The value in the repo's .env is the local
 * one; the API host has its own. Adding a domain here without adding it on the
 * host fixes nothing, and the symptom is silent on the server and cryptic in
 * the browser.
 */
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: same-origin, curl, or a server-to-server call.
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);

      // eslint-disable-next-line no-console
      console.warn(
        `[cors] Refused origin "${origin}". CORS_ORIGINS allows: ${
          env.corsOrigins.join(", ") || "(empty)"
        }`
      );
      return callback(null, false);
    },
    credentials: true,
  })
);

/* Printed once at boot for the same reason verifyMailer() logs loudly: a CORS
   allow-list that is wrong is invisible until a visitor's form fails, and by
   then nobody is looking at this process's output. */
// eslint-disable-next-line no-console
console.log(`[cors] Allowed origins: ${env.corsOrigins.join(", ") || "(none)"}`);

/**
 * Uploaded media, served straight off disk.
 *
 * ── WHY THE CORP HEADER IS SET EXPLICITLY ────────────────────────────────
 * helmet() above sets Cross-Origin-Resource-Policy: same-origin on everything.
 * The site runs on a different origin from this API, so with that header the
 * browser fetches each image, gets a 200, and then refuses to paint it. There
 * is no console error worth the name and no network failure — the picture is
 * simply blank, which is a genuinely slow bug to find. These are public
 * marketing images; cross-origin is the correct policy for them, and it is
 * scoped to this mount rather than relaxed globally.
 *
 * `nosniff` matters here specifically because the stored extension is derived
 * from a client-declared mime type (see middleware/upload.js). Without it a
 * file that sniffs as HTML would render as HTML on this origin.
 *
 * Mounted BEFORE the body parsers and outside the /api limiter: a static file
 * has no body to parse, and image traffic must not consume an admin's request
 * budget.
 */
app.use(
  env.upload.publicPath,
  express.static(env.upload.dir, {
    index: false,
    dotfiles: "ignore",
    // Left to fall through so a deleted file lands on the shared notFound
    // handler and answers the same JSON envelope as every other 404, rather
    // than express.static's own HTML error page.
    // Filenames carry 16 random hex characters and are never rewritten in
    // place, so the bytes at a URL cannot change. `immutable` is honest here.
    maxAge: "30d",
    immutable: true,
    setHeaders(res) {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

// Body + cookie parsing with sane payload limits.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Sanitization against NoSQL operator injection ($, .) and HTTP param pollution.
app.use(sanitize);
// Keys that are legitimately repeatable. Anything not listed here is collapsed
// to its last value, which is the desired anti-pollution default.
app.use(hpp({ whitelist: ["tags", "serviceTypes", "status", "category", "sort", "fields"] }));

// Request logging (concise in prod).
app.use(morgan(env.isProd ? "combined" : "dev"));

// Rate limiting across the API.
app.use("/api", globalLimiter);

// API routes. v1 is canonical; the unversioned mount is a deprecated alias
// that will be removed in Phase 6. Both share the limiter above.
app.use("/api/v1", routes);
app.use("/api", routes);

// Fallbacks.
app.use(notFound);
app.use(errorHandler);

export default app;
