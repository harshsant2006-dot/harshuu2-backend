/**
 * HARSHUU 2.0 – Express App Configuration
 * --------------------------------------
 * This file wires:
 * - Core middlewares
 * - Security
 * - Logging
 * - API routes
 * - Global error handling
 *
 * NO DEMO LOGIC
 * NO PLACEHOLDERS
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const logger = require("./utils/logger.util");
const errorHandler = require("./middlewares/error.middleware");

// Routes
const adminRoutes = require("./routes/admin.routes");
const publicRoutes = require("./routes/public.routes");
const restaurantRoutes = require("./routes/restaurant.routes");
const dishRoutes = require("./routes/dish.routes");
const orderRoutes = require("./routes/order.routes");
const settingsRoutes = require("./routes/setting.routes");

// ===============================
// INIT APP
// ===============================
const app = express();

// ===============================
// DATABASE CONNECTION
// ===============================
connectDB();

// ===============================
// GLOBAL MIDDLEWARES
// ===============================

// Security headers
app.use(helmet());

// Enable CORS (frontend + admin panel)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (production safe)
app.use(morgan("combined", { stream: logger.stream }));

// ===============================
// HEALTH CHECK
// ===============================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "HARSHUU 2.0 Backend",
    uptime: process.uptime()
  });
});

// ===============================
// API ROUTES
// ===============================

// Admin (dashboard side)
app.use("/api/admin", adminRoutes);

// Public APIs (customer side)
app.use("/api", publicRoutes);

// Restaurant management
app.use("/api/restaurants", restaurantRoutes);

// Dish management
app.use("/api/dishes", dishRoutes);

// Orders + billing
app.use("/api/orders", orderRoutes);

// QR + charges + platform settings
app.use("/api/settings", settingsRoutes);

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use(errorHandler);

// ===============================
// EXPORT APP
// ===============================
module.exports = app;
