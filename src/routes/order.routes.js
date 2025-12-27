/**
 * HARSHUU 2.0 – Order Routes
 * Production-grade Order + Billing Flow
 */

const express = require("express");
const router = express.Router();

const Order = require("../models/order");
const Dish = require("../models/dish");
const Restaurant = require("../models/restaurant");
const Invoice = require("../models/invoice");
const PaymentSettings = require("../models/paymentsettings");

const CONSTANTS = require("../config/constant");

/* ======================================================
   CREATE ORDER + GENERATE BILL (CORE FLOW)
====================================================== */
/**
 * @route   POST /order
 * @desc    Create order, calculate bill, generate invoice
 */
router.post("/", async (req, res) => {
  try {
    const {
      restaurantId,
      items, // [{ dishId, quantity }]
      customer
    } = req.body;

    if (!restaurantId || !items || !items.length || !customer) {
      return res.status(400).json({
        success: false,
        message: "restaurantId, items and customer details are required"
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is closed or not found"
      });
    }

    /* -------------------------
       FETCH DISHES & CALCULATE
    -------------------------- */
    let foodTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const dish = await Dish.findById(item.dishId);

      if (!dish || !dish.isAvailable) {
        return res.status(400).json({
          success: false,
          message: "One or more dishes unavailable"
        });
      }

      const lineTotal = dish.price * item.quantity;
      foodTotal += lineTotal;

      orderItems.push({
        dishId: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: item.quantity,
        total: lineTotal
      });
    }

    /* -------------------------
       BILLING LOGIC (SERVER)
    -------------------------- */
    const platformFee = CONSTANTS.PLATFORM_FEE;
    const handlingCharge = CONSTANTS.HANDLING_CHARGE;
    const deliveryCharge = CONSTANTS.DELIVERY_FEE_PER_KM; // flat or km-based
    const gst = Number(((foodTotal * CONSTANTS.GST_PERCENT) / 100).toFixed(2));

    const grandTotal =
      foodTotal +
      platformFee +
      handlingCharge +
      deliveryCharge +
      gst;

    /* -------------------------
       CREATE ORDER
    -------------------------- */
    const order = await Order.create({
      restaurantId,
      items: orderItems,
      customer,
      foodTotal,
      platformFee,
      handlingCharge,
      deliveryCharge,
      gst,
      grandTotal,
      status: "PLACED"
    });

    /* -------------------------
       CREATE INVOICE
    -------------------------- */
    const invoice = await Invoice.create({
      orderId: order._id,
      breakdown: {
        foodTotal,
        platformFee,
        handlingCharge,
        deliveryCharge,
        gst
      },
      grandTotal
    });

    order.invoiceId = invoice._id;
    await order.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        orderId: order._id,
        invoice
      }
    });
  } catch (error) {
    console.error("ORDER CREATE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ======================================================
   GET ORDER DETAILS (FOR ADMIN / TRACKING)
====================================================== */
/**
 * @route   GET /order/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurantId", "name")
      .populate("invoiceId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ======================================================
   UPDATE ORDER STATUS (ADMIN / RESTAURANT)
====================================================== */
/**
 * @route   PATCH /order/:id/status
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = [
      "PLACED",
      "ACCEPTED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED"
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order status updated",
      data: order
    });
  } catch (error) {
    console.error("ORDER STATUS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
