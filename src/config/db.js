/**
 * HARSHUU 2.0
 * MongoDB Connection (Production Ready)
 * -------------------------------------
 * - Uses Mongoose
 * - Uses Environment Variables
 * - Handles connection errors safely
 * - Suitable for real production usage
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("❌ MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: false,              // better for production
      serverSelectionTimeoutMS: 5000 // fail fast if DB unreachable
    });

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error(error.message);

    // Exit process — app should NOT run without DB
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 * Closes DB connection when server stops
 */
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🔌 MongoDB connection closed (App terminated)");
  process.exit(0);
});

module.exports = connectDB;
