/**
 * HARSHUU 2.0
 * Environment Configuration Loader
 * --------------------------------
 * - Loads .env variables
 * - Validates required environment variables
 * - Fails fast if configuration is invalid
 * - Production-safe (Render / Railway / AWS)
 */

const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

/**
 * List of REQUIRED environment variables
 * App should NOT start if any of these are missing
 */
const REQUIRED_ENV_VARS = [
  "NODE_ENV",
  "PORT",
  "MONGODB_URI",
  "JWT_SECRET",
  "ADMIN_API_KEY",        // for admin-only access (no login UI if you want)
  "WHATSAPP_NUMBER",      // business WhatsApp number
  "PLATFORM_FEE",         // fixed platform fee
  "HANDLING_CHARGE",      // handling charge
  "GST_PERCENT"           // e.g. 5
];

/**
 * Validate environment variables
 */
function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    process.exit(1); // ❌ FAIL FAST (production rule)
  }
}

// Validate immediately
validateEnv();

/**
 * Export sanitized & typed config
 * (Never use process.env directly elsewhere)
 */
const env = {
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT),

  mongoUri: process.env.MONGODB_URI,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "7d"
  },

  admin: {
    apiKey: process.env.ADMIN_API_KEY
  },

  business: {
    whatsappNumber: process.env.WHATSAPP_NUMBER
  },

  billing: {
    platformFee: Number(process.env.PLATFORM_FEE),
    handlingCharge: Number(process.env.HANDLING_CHARGE),
    gstPercent: Number(process.env.GST_PERCENT)
  }
};

module.exports = env;
