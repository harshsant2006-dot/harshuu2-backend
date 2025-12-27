/**
 * HARSHUU 2.0 – Invoice Service
 * ------------------------------------
 * Generates FINAL invoice object
 * Uses billing.service for calculations
 *
 * Invoice is:
 * - Auditable
 * - Printable
 * - Stored in MongoDB
 * - Safe for real money transactions
 */

const Invoice = require("../models/invoice");
const { calculateBill } = require("./billing.service");

/**
 * Generate & Save Invoice
 *
 * @param {Object} params
 * @param {String} params.orderId
 * @param {String} params.restaurantId
 * @param {Object} params.customer
 * @param {Array}  params.items
 * @param {Number} params.distanceKm
 *
 * @returns {Object} saved invoice document
 */
exports.generateInvoice = async ({
  orderId,
  restaurantId,
  customer,
  items,
  distanceKm
}) => {
  if (!orderId || !restaurantId) {
    throw new Error("Order ID and Restaurant ID are required");
  }

  if (!customer || !customer.name || !customer.mobile) {
    throw new Error("Valid customer details are required");
  }

  /* =====================================
     1️⃣ CALCULATE BILL (SERVER-SIDE)
  ====================================== */
  const bill = await calculateBill({
    items,
    distanceKm
  });

  /* =====================================
     2️⃣ GENERATE INVOICE NUMBER
     Format: HARSHUU-INV-YYYYMMDD-XXXX
  ====================================== */
  const today = new Date();
  const datePart = today
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const randomPart = Math.floor(1000 + Math.random() * 9000);

  const invoiceNumber = `HARSHUU-INV-${datePart}-${randomPart}`;

  /* =====================================
     3️⃣ CREATE INVOICE DOCUMENT
  ====================================== */
  const invoice = new Invoice({
    invoiceNumber,
    orderId,
    restaurantId,

    customer: {
      name: customer.name,
      mobile: customer.mobile,
      address: customer.address || ""
    },

    items: items.map(item => ({
      dishId: item.dishId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity
    })),

    charges: {
      foodTotal: bill.breakdown.foodTotal,
      gstPercent: bill.breakdown.gstPercent,
      gstAmount: bill.breakdown.gstAmount,
      platformFee: bill.breakdown.platformFee,
      handlingCharge: bill.breakdown.handlingCharge,
      deliveryCharge: bill.breakdown.deliveryCharge
    },

    grandTotal: bill.grandTotal,
    currency: bill.currency,

    paymentStatus: "PENDING",
    createdAt: new Date()
  });

  /* =====================================
     4️⃣ SAVE INVOICE TO DB
  ====================================== */
  const savedInvoice = await invoice.save();

  return savedInvoice;
};
