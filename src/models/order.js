/**
 * HARSHUU 2.0
 * Order Model
 * -----------------------
 * Handles:
 * - Order lifecycle
 * - Billing & GST
 * - Platform & delivery charges
 * - Restaurant & customer linkage
 */

import mongoose from "mongoose";
import CONSTANTS from "../config/constant.js";

const {
  ORDER_STATUS,
  BILLING_DEFAULTS
} = CONSTANTS;

const {
  GST_PERCENT,
  PLATFORM_FEE,
  HANDLING_CHARGE,
  DELIVERY_PER_KM
} = BILLING_DEFAULTS;

/* =========================
   ORDER ITEM (SUB-DOCUMENT)
========================= */
const orderItemSchema = new mongoose.Schema(
  {
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 1
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    total: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

/* =========================
   ORDER SCHEMA
========================= */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    customer: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      address: { type: String, required: true }
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: v => v.length > 0
    },

    /* =========================
       BILLING
    ========================= */
    bill: {
      foodTotal: { type: Number, required: true },
      gstAmount: { type: Number, required: true },
      platformFee: { type: Number, required: true },
      handlingCharge: { type: Number, required: true },
      deliveryCharge: { type: Number, required: true },
      grandTotal: { type: Number, required: true }
    },

    distanceKm: {
      type: Number,
      default: 0
    },

    payment: {
      method: {
        type: String,
        enum: ["UPI", "COD"],
        required: true
      },
      status: {
        type: String,
        enum: ["PENDING", "PAID"],
        default: "PENDING"
      }
    },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.CREATED,
      index: true
    },

    cancelled: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* =========================
   BILL CALCULATION (STATIC)
========================= */
orderSchema.statics.calculateBill = function ({
  items,
  distanceKm = 0
}) {
  const foodTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const gstAmount = Number(
    ((foodTotal * GST_PERCENT) / 100).toFixed(2)
  );

  const deliveryCharge = Number(
    (distanceKm * DELIVERY_PER_KM).toFixed(2)
  );

  const grandTotal =
    foodTotal +
    gstAmount +
    PLATFORM_FEE +
    HANDLING_CHARGE +
    deliveryCharge;

  return {
    foodTotal,
    gstAmount,
    platformFee: PLATFORM_FEE,
    handlingCharge: HANDLING_CHARGE,
    deliveryCharge,
    grandTotal: Number(grandTotal.toFixed(2))
  };
};

/* =========================
   STATUS TRANSITION SAFETY
========================= */
orderSchema.methods.canTransitionTo = function (nextStatus) {
  const allowedTransitions = {
    CREATED: ["ACCEPTED", "CANCELLED"],
    ACCEPTED: ["PREPARING", "CANCELLED"],
    PREPARING: ["OUT_FOR_DELIVERY"],
    OUT_FOR_DELIVERY: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: []
  };

  return allowedTransitions[this.status]?.includes(nextStatus);
};

const Order = mongoose.model("Order", orderSchema);

export default Order;   // ⭐ MOST IMPORTANT
