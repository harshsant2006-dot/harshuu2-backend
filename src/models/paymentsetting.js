/**
 * HARSHUU 2.0
 * Payment & Platform Settings Model
 * ----------------------------------
 * Stores:
 * - UPI QR Image
 * - Platform Fee
 * - Handling Charge
 * - Delivery Fee per KM
 * - GST Percentage
 *
 * SINGLE DOCUMENT COLLECTION
 * (Only one active settings document in DB)
 */

import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema(
  {
    /* =========================
       PAYMENT
    ========================= */
    upiQrImage: {
      type: String, // Cloudinary / S3 / Base64 URL
      required: true
    },

    upiId: {
      type: String,
      required: true,
      trim: true
    },

    /* =========================
       CHARGES
    ========================= */
    platformFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    handlingCharge: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    deliveryFeePerKm: {
      type: Number,
      required: true,
      min: 0,
      default: 10
    },

    gstPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 28,
      default: 5
    },

    /* =========================
       STATUS
    ========================= */
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* =========================
   ENSURE SINGLE DOCUMENT
========================= */
paymentSettingsSchema.index(
  { isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.model(
  "PaymentSettings",
  paymentSettingsSchema
);
