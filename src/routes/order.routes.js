/**
 * HARSHUU 2.0 – Order Routes
 * Production-grade Order + Billing Flow
 */

import express from "express";
import Order from "../models/order.js";
import Dish from "../models/dish.js";
import Restaurant from "../models/restaurant.js";
import Invoice from "../models/invoice.js";
import PaymentSettings from "../models/paymentsettings.js";
import CONSTANTS from "../config/constant.js";

const router = express.Router();

/* ======================================================
   CREATE ORDER + GENERATE BILL (CORE FLOW)
====================================================== */
router.post("/", async (req, res) => {
  try {
    const { restaurantId, items, customer } = req.body;

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

    const platformFee = CONSTANTS.PLATFORM_FEE;
    const handlingCharge = CONSTANTS.HANDLING_CHARGE;
    const deliveryCharge = CONSTANTS.DELIVERY_FEE_PER_KM;
    const gst = Number(((foodTotal * CONSTANTS.GST_PERCENT) / 100).toFixed(2));

    const grandTotal =
      foodTotal +
      platformFee +
      handlingCharge +
      deliveryCharge +
      gst;

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
   GET ORDER DETAILS
====================================================== */
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
   UPDATE ORDER STATUS
====================================================== */
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

export default router;   // ⭐ MOST IMPORTANT
