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
const router = express.Router();

const Restaurant = require("../models/restaurant");
const Dish = require("../models/dish");
const Order = require("../models/order");
const Invoice = require("../models/invoice");
const PaymentSettings = require("../models/paymentsettings");

const {
  GST_PERCENTAGE,
  DEFAULT_PLATFORM_FEE,
  DEFAULT_HANDLING_CHARGE,
  DELIVERY_FEE_PER_KM
} = require("../config/constants");

/* =====================================================
   GET ALL RESTAURANTS (CUSTOMER)
===================================================== */

/**
 * @route   GET /restaurants
 * @desc    Get all restaurants (open + closed)
 */
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

/**
 * @route   GET /menu/:restaurantId
 * @desc    Get restaurant menu
 */
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
      restaurantId: restaurant._id,
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

/**
 * @route   GET /settings/qr
 * @desc    Get QR + charges for order page
 */
router.get("/settings/qr", async (req, res) => {
  try {
    const settings = await PaymentSettings.findOne();

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
   CREATE ORDER + BILLING (CORE LOGIC)
===================================================== */

/**
 * @route   POST /order
 * @desc    Place order & generate invoice
 */
router.post("/order", async (req, res) => {
  try {
    const {
      restaurantId,
      items, // [{ dishId, quantity }]
      customer
    } = req.body;

    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order data"
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is not accepting orders"
      });
    }

    /* -------------------------------
       CALCULATE FOOD TOTAL
    -------------------------------- */
    let foodTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const dish = await Dish.findById(item.dishId);
      if (!dish) continue;

      const itemTotal = dish.price * item.quantity;
      foodTotal += itemTotal;

      orderItems.push({
        dishId: dish._id,
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

    /* -------------------------------
       FETCH CHARGES
    -------------------------------- */
    const settings = await PaymentSettings.findOne();

    const platformFee =
      settings?.platformFee ?? DEFAULT_PLATFORM_FEE;

    const handlingCharge =
      settings?.handlingCharge ?? DEFAULT_HANDLING_CHARGE;

    const deliveryCharge =
      settings?.deliveryChargePerKm
        ? settings.deliveryChargePerKm * (customer.distanceKm || 1)
        : DELIVERY_FEE_PER_KM;

    const gstAmount =
      (foodTotal * (settings?.gstPercentage ?? GST_PERCENTAGE)) / 100;

    const grandTotal =
      foodTotal +
      platformFee +
      handlingCharge +
      deliveryCharge +
      gstAmount;

    /* -------------------------------
       CREATE ORDER
    -------------------------------- */
    const order = await Order.create({
      restaurantId,
      items: orderItems,
      customer,
      foodTotal,
      status: "PLACED"
    });

    /* -------------------------------
       CREATE INVOICE
    -------------------------------- */
    const invoice = await Invoice.create({
      orderId: order._id,
      foodTotal,
      platformFee,
      handlingCharge,
      deliveryCharge,
      gstAmount,
      grandTotal
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

module.exports = router;
