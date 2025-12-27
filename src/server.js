/**
 * HARSHUU 2.0 – Server Entry Point
 * --------------------------------
 * Production-grade server bootstrap
 * - Express app start
 * - Env validation
 * - Graceful shutdown
 * - Crash safety
 */

import dotenv from "dotenv";
import http from "http";

import app from "./app.js";
import logger from "./utils/logger.util.js";

// Load env
dotenv.config();

// ===============================
// ENV VALIDATION (FAIL FAST)
// ===============================
const REQUIRED_ENV = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET"
];

REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    logger.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
});

// ===============================
// SERVER CONFIG
// ===============================
const PORT = Number(process.env.PORT) || 5000;
const server = http.createServer(app);

// ===============================
// START SERVER
// ===============================
server.listen(PORT, () => {
  logger.info(`🚀 HARSHUU 2.0 Backend running on port ${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// ===============================
// GRACEFUL SHUTDOWN
// ===============================
const shutdown = (signal) => {
  logger.warn(`⚠️ Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    logger.info("✅ HTTP server closed");
    process.exit(0);
  });

  // Force shutdown safeguard
  setTimeout(() => {
    logger.error("❌ Force shutdown due to timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// ===============================
// GLOBAL ERROR HANDLERS
// ===============================
process.on("unhandledRejection", (reason) => {
  logger.error("🔥 Unhandled Promise Rejection", reason);
  shutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (err) => {
  logger.error("🔥 Uncaught Exception", err);
  shutdown("UNCAUGHT_EXCEPTION");
});
