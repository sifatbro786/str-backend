import mongoose from "mongoose";
import env from "./env.js";

/**
 * Establishes the Mongoose connection with a production-grade connection pool
 * and resilient error handling.
 *
 * Pooling notes:
 *  - maxPoolSize caps concurrent sockets; tune against your Atlas tier / CPU.
 *  - minPoolSize keeps warm sockets to avoid cold-start latency on bursts.
 *  - serverSelectionTimeoutMS fails fast when the cluster is unreachable.
 */
export async function connectDB() {
  // Fail fast on undefined-field queries instead of writing loose documents.
  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(env.mongoUri, {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
    family: 4, // prefer IPv4; avoids slow IPv6 lookups on some hosts
    autoIndex: !env.isProd, // build indexes in dev; manage explicitly in prod
  });

  // eslint-disable-next-line no-console
  console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  // Runtime connection events (after the initial connect resolves).
  mongoose.connection.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("[db] connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    // eslint-disable-next-line no-console
    console.warn("[db] disconnected");
  });

  return conn;
}

/** Graceful pool teardown, invoked from the server shutdown handler. */
export async function disconnectDB() {
  await mongoose.connection.close(false);
  // eslint-disable-next-line no-console
  console.log("[db] connection closed");
}

export default connectDB;
