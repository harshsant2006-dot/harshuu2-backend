/**
 * HARSHUU 2.0 – Logger Utility
 * ----------------------------
 * Centralized logging with Winston
 * ES Module compatible
 * Production ready (Render / Cloud)
 */

import winston from "winston";

/**
 * ===============================
 * Log Format
 * ===============================
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * ===============================
 * Transports
 * ===============================
 */
const transports = [
  new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  }),
];

// File logging only in production
if (process.env.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    })
  );
}

/**
 * ===============================
 * Logger Instance
 * ===============================
 */
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports,
  exitOnError: false,
});

/**
 * ===============================
 * Morgan Stream Support
 * ===============================
 */
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

export default logger;   // ⭐ THIS FIXES THE ERROR
