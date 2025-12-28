/**
 * HARSHUU 2.0 – Express App Configuration
 * --------------------------------------
 * Production-grade Express app setup
 */

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Load env variables
dotenv.config();

// Internal imports
import connectDB from "./config/db.js";
import logger from "./utils/logger.util.js";
import errorHandler from "./middlewares/error.middleware.js";

// Routes
import adminRoutes from "./routes/admin.routes.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
import dishRoutes from "./routes/dish.routes.js";
import orderRoutes from "./routes/order.routes.js";
import settingsRoutes from "./routes/setting.routes.js";
import publicRoutes from "./routes/public.routes.js";

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

// Enable CORS
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

// HTTP request logging
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
// API ROUTES (ORDER IS IMPORTANT)
// ===============================

app.use("/api/admin", adminRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/settings", settingsRoutes);

// ⚠️ ALWAYS LAST – generic routes
app.use("/api", publicRoutes);

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
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
export default app;
