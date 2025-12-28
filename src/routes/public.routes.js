/**
 * HARSHUU 2.0
 * Public / Customer Routes
 * ----------------------------------
 * Used by:
 * - index.html
 * - menu.html
 * - order.html
 */

import express from "express";
import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";
import Order from "../models/order.js";
import Invoice from "../models/invoice.js";
import PaymentSettings from "../models/paymentsettings.js";
import CONSTANTS from "../config/constant.js";

const router = express.Router();

const {
  BILLING_DEFAULTS
} = CONSTANTS;

const {
  GST_PERCENT,
  PLATFORM_FEE,
  HANDLING_CHARGE,
  DELIVERY_PER_KM
} = BILLING_DEFAULTS;

/* =====================================================
   GET ALL RESTAURANTS (CUSTOMER)
===================================================== */
router.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: restaurants
    });
  } catch (error) {
    console.error("GET RESTAURANTS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   GET MENU BY RESTAURANT
===================================================== */
router.get("/menu/:restaurantId", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    const dishes = await Dish.find({
      restaurant: restaurant._id,
      isAvailable: true
    });

    res.json({
      success: true,
      restaurant,
      dishes
    });
  } catch (error) {
    console.error("GET MENU ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   GET PAYMENT / QR SETTINGS
===================================================== */
router.get("/settings/qr", async (req, res) => {
  try {
    const settings = await PaymentSettings.findOne({ isActive: true });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Payment settings not configured"
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("GET QR ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   CREATE ORDER + BILLING
===================================================== */
router.post("/order", async (req, res) => {
  try {
    const { restaurantId, items, customer } = req.body;

    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order data"
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is not accepting orders"
      });
    }

    let foodTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const dish = await Dish.findById(item.dishId);
      if (!dish) continue;

      const itemTotal = dish.price * item.quantity;
      foodTotal += itemTotal;

      orderItems.push({
        dish: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    if (foodTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order has no valid items"
      });
    }

    const settings = await PaymentSettings.findOne({ isActive: true });

    const platformFee = settings?.platformFee ?? PLATFORM_FEE;
    const handlingCharge = settings?.handlingCharge ?? HANDLING_CHARGE;
    const deliveryCharge =
      (settings?.deliveryFeePerKm ?? DELIVERY_PER_KM) *
      (customer?.distanceKm || 1);

    const gstAmount =
      (foodTotal * (settings?.gstPercentage ?? GST_PERCENT)) / 100;

    const grandTotal =
      foodTotal +
      platformFee +
      handlingCharge +
      deliveryCharge +
      gstAmount;

    const order = await Order.create({
      restaurant: restaurantId,
      items: orderItems,
      customer,
      bill: {
        foodTotal,
        gstAmount,
        platformFee,
        handlingCharge,
        deliveryCharge,
        grandTotal
      },
      payment: {
        method: "COD",
        status: "PENDING"
      }
    });

    const invoice = await Invoice.create({
      orderId: order._id,
      restaurantId,
      customer,
      items: orderItems,
      foodTotal,
      platformFee,
      handlingCharge,
      deliveryCharge,
      gstPercentage: settings?.gstPercentage ?? GST_PERCENT,
      gstAmount,
      grandTotal,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      invoiceNumber: `INV-${Date.now()}`
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      invoice
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;   // ⭐ MOST IMPORTANT
