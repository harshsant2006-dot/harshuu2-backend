/**
 * HARSHUU 2.0
 * MongoDB Connection (Production Ready)
 * ES Module Compatible
 */

import mongoose from "mongoose";

// Optional but recommended for production
mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(mongoURI, {
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(
      `✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // app should not run without DB
  }
};

// Graceful shutdown (Render / Linux safe)
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed gracefully");
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

export default connectDB;
