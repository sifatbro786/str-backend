import app from "./src/app.js";
import env from "./src/config/env.js";
import { connectDB, disconnectDB } from "./src/config/db.js";
import { verifyMailer, closeMailer } from "./src/utils/mail/transporter.js";

let server;

/** Connect to MongoDB first, then bind the port — never serve without a DB. */
async function start() {
  try {
    await connectDB();
    server = app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(
        `[str-backend] ${env.nodeEnv} server running on http://localhost:${env.port}`
      );
    });

    // Non-blocking and non-fatal. Mail is a notification channel, not a
    // prerequisite for serving — but a dead SMTP credential should be visible
    // in the deploy log, not discovered through a lead that never arrived.
    verifyMailer().catch(() => {});
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[str-backend] Failed to start:", err.message);
    process.exit(1);
  }
}

/** Drain in-flight requests, then close the connection pool. */
async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n[str-backend] ${signal} received — shutting down.`);
  if (server) await new Promise((resolve) => server.close(resolve));
  closeMailer();
  await disconnectDB().catch(() => {});
  process.exit(0);
}

["SIGINT", "SIGTERM"].forEach((sig) => process.on(sig, () => shutdown(sig)));

process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("[str-backend] Unhandled rejection:", reason);
  shutdown("unhandledRejection");
});

start();
