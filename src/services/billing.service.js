/**
 * HARSHUU 2.0 – Billing Service
 * ----------------------------------
 * Centralized, server-side billing logic
 * Calculates FINAL payable amount
 *
 * INDUSTRY STANDARD:
 * - No frontend calculations
 * - GST only on food total
 * - Configurable platform & delivery charges
 */

const PaymentSettings = require("../models/paymentsettings");

/**
 * Calculate bill for an order
 *
 * @param {Array} items - [{ dishId, name, price, quantity }]
 * @param {Number} distanceKm - delivery distance in KM
 *
 * @returns {Object} invoice object
 */
exports.calculateBill = async ({ items, distanceKm = 0 }) => {
  if (!items || items.length === 0) {
    throw new Error("Order items are required");
  }

  /* =====================================
     1️⃣ FETCH ACTIVE SETTINGS FROM DB
  ====================================== */
  const settings = await PaymentSettings.findOne({ isActive: true });

  if (!settings) {
    throw new Error("Payment settings not configured");
  }

  const {
    platformFee,
    handlingCharge,
    deliveryFeePerKm,
    gstPercent
  } = settings;

  /* =====================================
     2️⃣ FOOD TOTAL
  ====================================== */
  const foodTotal = items.reduce((sum, item) => {
    if (item.price < 0 || item.quantity <= 0) {
      throw new Error("Invalid item price or quantity");
    }
    return sum + item.price * item.quantity;
  }, 0);

  /* =====================================
     3️⃣ GST (ONLY ON FOOD)
  ====================================== */
  const gstAmount = Number(
    ((foodTotal * gstPercent) / 100).toFixed(2)
  );

  /* =====================================
     4️⃣ DELIVERY CHARGE
  ====================================== */
  const deliveryCharge = Number(
    (distanceKm * deliveryFeePerKm).toFixed(2)
  );

  /* =====================================
     5️⃣ FINAL TOTAL
  ====================================== */
  const grandTotal = Number(
    (
      foodTotal +
      gstAmount +
      platformFee +
      handlingCharge +
      deliveryCharge
    ).toFixed(2)
  );

  /* =====================================
     6️⃣ STRUCTURED INVOICE OBJECT
  ====================================== */
  return {
    breakdown: {
      foodTotal,
      gstPercent,
      gstAmount,
      platformFee,
      handlingCharge,
      deliveryCharge
    },
    grandTotal,
    currency: "INR"
  };
};
