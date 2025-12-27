/**
 * HARSHUU 2.0 – Order Controller
 * Real production-grade order & billing logic
 */

const Order = require("../models/order");
const Restaurant = require("../models/restaurant");
const Dish = require("../models/dish");
const Invoice = require("../models/invoice");
const PaymentSettings = require("../models/paymentsettings");
const CONSTANTS = require("../config/constants");

/* ======================================================
   BILL CALCULATION (SERVER SIDE ONLY)
====================================================== */

function calculateBill(items, settings) {
  /**
   * items = [{ dish, quantity }]
   */

  let foodTotal = 0;

  items.forEach(item => {
    foodTotal += item.dish.price * item.quantity;
  });

  const platformFee = settings.platformFee;
  const handlingCharge = settings.handlingCharge;
  const deliveryCharge = settings.deliveryFeePerKm * settings.distanceKm;

  const gst = (foodTotal * settings.gstPercent) / 100;

  const grandTotal =
    foodTotal +
    platformFee +
    handlingCharge +
    deliveryCharge +
    gst;

  return {
    foodTotal,
    platformFee,
    handlingCharge,
    deliveryCharge,
    gst,
    grandTotal
  };
}

/* ======================================================
   CREATE ORDER
====================================================== */

/**
 * POST /order
 * Creates order + invoice (NO PAYMENT GATEWAY HERE)
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      items,
      customer,
      distanceKm
    } = req.body;

    // ---------- VALIDATION ----------
    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order data"
      });
    }

    if (!customer?.name || !customer?.mobile || !customer?.address) {
      return res.status(400).json({
        success: false,
        message: "Customer details missing"
      });
    }

    // ---------- RESTAURANT ----------
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is closed or not found"
      });
    }

    // ---------- LOAD DISHES ----------
    const populatedItems = [];
    for (const item of items) {
      const dish = await Dish.findById(item.dishId);
      if (!dish || !dish.isAvailable) {
        return res.status(400).json({
          success: false,
          message: "Dish unavailable"
        });
      }
      populatedItems.push({
        dish,
        quantity: item.quantity
      });
    }

    // ---------- PAYMENT SETTINGS ----------
    const paymentSettings = await PaymentSettings.findOne();
    if (!paymentSettings) {
      return res.status(500).json({
        success: false,
        message: "Payment settings not configured"
      });
    }

    // ---------- BILL CALCULATION ----------
    const bill = calculateBill(populatedItems, {
      platformFee: paymentSettings.platformFee,
      handlingCharge: paymentSettings.handlingCharge,
      deliveryFeePerKm: paymentSettings.deliveryFeePerKm,
      gstPercent: paymentSettings.gstPercent,
      distanceKm: distanceKm || 0
    });

    // ---------- CREATE ORDER ----------
    const order = await Order.create({
      restaurant: restaurantId,
      items: populatedItems.map(i => ({
        dish: i.dish._id,
        name: i.dish.name,
        price: i.dish.price,
        quantity: i.quantity
      })),
      customer,
      bill,
      status: "PLACED"
    });

    // ---------- CREATE INVOICE ----------
    const invoice = await Invoice.create({
      order: order._id,
      restaurant: restaurantId,
      customer,
      bill,
      issuedAt: new Date()
    });

    order.invoice = invoice._id;
    await order.save();

    // ---------- RESPONSE ----------
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        orderId: order._id,
        invoice,
        whatsappPayload: generateWhatsAppMessage(order, invoice)
      }
    });

  } catch (error) {
    console.error("ORDER CREATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ======================================================
   WHATSAPP MESSAGE BUILDER
====================================================== */

function generateWhatsAppMessage(order, invoice) {
  let message = `🛒 *NEW ORDER – HARSHUU 2.0*\n\n`;

  order.items.forEach(item => {
    message += `• ${item.name} x${item.quantity} – ₹${item.price * item.quantity}\n`;
  });

  message += `\n----------------------\n`;
  message += `Food Total: ₹${invoice.bill.foodTotal}\n`;
  message += `Platform Fee: ₹${invoice.bill.platformFee}\n`;
  message += `Handling: ₹${invoice.bill.handlingCharge}\n`;
  message += `Delivery: ₹${invoice.bill.deliveryCharge}\n`;
  message += `GST (5%): ₹${invoice.bill.gst}\n`;
  message += `\n*Grand Total: ₹${invoice.bill.grandTotal}*\n\n`;

  message += `👤 ${order.customer.name}\n`;
  message += `📞 ${order.customer.mobile}\n`;
  message += `📍 ${order.customer.address}\n`;

  return message;
}

/* ======================================================
   ADMIN – VIEW ORDERS
====================================================== */

/**
 * GET /admin/orders
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
