/**
 * HARSHUU 2.0 – Central Error Handling Middleware
 * ----------------------------------------------
 * Handles:
 * - Application errors
 * - Mongoose validation errors
 * - MongoDB duplicate key errors
 * - JWT errors
 * - Unknown server errors
 *
 * PRODUCTION-GRADE & DEPLOYABLE
 */

/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  console.error("❌ ERROR:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  /**
   * ===============================
   * MONGOOSE VALIDATION ERROR
   * ===============================
   */
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(", ");
  }

  /**
   * ===============================
   * MONGODB DUPLICATE KEY ERROR
   * ===============================
   */
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
  }

  /**
   * ===============================
   * JWT ERRORS
   * ===============================
   */
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired";
  }

  /**
   * ===============================
   * FINAL RESPONSE
   * ===============================
   */
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack
    })
  });
};

export default errorHandler;   // ⭐ THIS FIXES THE ERROR
