/**
 * HARSHUU 2.0
 * Invoice Model
 * ----------------------------------
 * Generated AFTER order confirmation
 * Immutable billing record
 * Used for:
 * - Customer invoice
 * - Admin accounting
 * - GST reporting
 */

const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    /* =========================
       REFERENCES
    ========================= */
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },

    /* =========================
       CUSTOMER DETAILS
    ========================= */
    customer: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      mobile: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      }
    },

    /* =========================
       ITEMS SNAPSHOT
       (Price frozen at order time)
    ========================= */
    items: [
      {
        dishId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true
        },
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number, // price per unit
          required: true
        },
        total: {
          type: Number, // quantity * price
          required: true
        }
      }
    ],

    /* =========================
       BILL BREAKDOWN
    ========================= */
    foodTotal: {
      type: Number,
      required: true,
      min: 0
    },

    platformFee: {
      type: Number,
      required: true,
      min: 0
    },

    handlingCharge: {
      type: Number,
      required: true,
      min: 0
    },

    deliveryCharge: {
      type: Number,
      required: true,
      min: 0
    },

    gstPercentage: {
      type: Number,
      required: true
    },

    gstAmount: {
      type: Number,
      required: true
    },

    /* =========================
       GRAND TOTAL
    ========================= */
    grandTotal: {
      type: Number,
      required: true,
      min: 0
    },

    /* =========================
       PAYMENT
    ========================= */
    paymentMethod: {
      type: String,
      enum: ["UPI", "COD"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING"],
      required: true
    },

    /* =========================
       INVOICE META
    ========================= */
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },

    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
