/**
 * HARSHUU 2.0
 * Payment & Platform Settings Model
 * ----------------------------------
 * SINGLE DOCUMENT COLLECTION
 */

import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema(
  {
    /* =========================
       PAYMENT
    ========================= */
    upiQrImage: {
      type: String,
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
   ENSURE SINGLE ACTIVE DOCUMENT
========================= */
paymentSettingsSchema.index(
  { isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

const PaymentSettings = mongoose.model(
  "PaymentSettings",
  paymentSettingsSchema
);

export default PaymentSettings;   // ⭐ MOST IMPORTANT
