/**
 * HARSHUU 2.0 – Logger Utility
 * ----------------------------
 * Purpose:
 * - Centralized application logging
 * - Different log levels (info, warn, error)
 * - Production safe (no console spam)
 * - Ready for cloud logging (Datadog / ELK / CloudWatch)
 */

const winston = require("winston");

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
 * Console → dev + production
 * File → production debugging
 */
const transports = [
  new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "info" : "debug"
  })
];

// In production, store error logs to file
if (process.env.NODE_ENV === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error"
    }),
    new winston.transports.File({
      filename: "logs/combined.log"
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
  exitOnError: false
});

/**
 * ===============================
 * Stream for Morgan (HTTP logs)
 * ===============================
 */
logger.stream = {
  write: message => {
    logger.info(message.trim());
  }
};

module.exports = logger;
