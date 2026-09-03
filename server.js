import app from "./src/app.js";
import env from "./src/config/env.js";

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[str-backend] ${env.nodeEnv} server running on http://localhost:${env.port}`
  );
});

// Graceful shutdown so in-flight requests drain before the process exits.
const shutdown = (signal) => {
  // eslint-disable-next-line no-console
  console.log(`\n[str-backend] ${signal} received — shutting down.`);
  server.close(() => process.exit(0));
  // Force-exit if connections hang.
  setTimeout(() => process.exit(1), 10_000).unref();
};

["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));

process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("[str-backend] Unhandled rejection:", reason);
  shutdown("unhandledRejection");
});
