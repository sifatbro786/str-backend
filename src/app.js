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

// CORS — reflect only whitelisted origins; allow credentials for cookie auth.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
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
