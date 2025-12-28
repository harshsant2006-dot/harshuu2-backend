/**
 * HARSHUU 2.0 – Order Routes
 * Production-grade Order + Billing Flow
 */

import express from "express";
import Order from "../models/order.js";
import Dish from "../models/dish.js";
import Restaurant from "../models/restaurant.js";
import Invoice from "../models/invoice.js";
import CONSTANTS from "../config/constant.js";

const router = express.Router();

/* ================= CONSTANTS ================= */
const { BILLING_DEFAULTS, ORDER_STATUS } = CONSTANTS;

const {
  PLATFORM_FEE,
  HANDLING_CHARGE,
  GST_PERCENT,
  DELIVERY_PER_KM
} = BILLING_DEFAULTS;

/* ======================================================
   CREATE ORDER + GENERATE BILL
====================================================== */
router.post("/", async (req, res) => {
  try {
    const { restaurantId, items, customer, distanceKm = 1 } = req.body;

    if (!restaurantId || !items?.length || !customer) {
      return res.status(400).json({
        success: false,
        message: "restaurantId, items and customer are required"
      });
    }

    /* -------- Restaurant check -------- */
    const restaurant = await Restaurant.findById(restaurantId);

    if (
      !restaurant ||
      restaurant.status !== "OPEN" ||
      !restaurant.isActive
    ) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is closed or inactive"
      });
    }

    /* -------- Calculate food total -------- */
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
        dish: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: item.quantity,
        total: lineTotal
      });
    }

    /* -------- Billing -------- */
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

    /* -------- Create Order -------- */
    const order = await Order.create({
      restaurant: restaurantId,
      customer,
      items: orderItems,
      distanceKm,
      bill: {
        foodTotal,
        gstAmount,
        platformFee: PLATFORM_FEE,
        handlingCharge: HANDLING_CHARGE,
        deliveryCharge,
        grandTotal
      },
      status: ORDER_STATUS.CREATED
    });

    /* -------- Create Invoice -------- */
    const invoice = await Invoice.create({
      orderId: order._id,
      restaurantId,
      customer,
      items: orderItems,
      foodTotal,
      platformFee: PLATFORM_FEE,
      handlingCharge: HANDLING_CHARGE,
      deliveryCharge,
      gstPercentage: GST_PERCENT,
      gstAmount,
      grandTotal,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      invoiceNumber: `INV-${Date.now()}`
    });

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
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ======================================================
   GET ORDER DETAILS
====================================================== */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("restaurant", "name")
      .populate("items.dish");

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
   UPDATE ORDER STATUS
====================================================== */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!Object.values(ORDER_STATUS).includes(status)) {
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

export default router;
