import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";

import env from "./config/env.js";
import routes from "./routes/index.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimiters.js";

/**
 * Builds and configures the Express application. Kept separate from server.js
 * so the app can be imported directly in tests without binding a port.
 */
const app = express();

// Behind a proxy/load balancer (Render, Nginx) so rate-limit + secure cookies
// see the real client IP and protocol.
app.set("trust proxy", 1);
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
app.use(mongoSanitize());
app.use(hpp({ whitelist: ["tags", "sort", "fields"] }));

// Request logging (concise in prod).
app.use(morgan(env.isProd ? "combined" : "dev"));

// Rate limiting across the API.
app.use("/api", globalLimiter);

// API routes.
app.use("/api", routes);

// Fallbacks.
app.use(notFound);
app.use(errorHandler);

export default app;
