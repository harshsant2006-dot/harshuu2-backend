/**
 * HARSHUU 2.0
 * Admin Routes
 * ----------------------------------
 * Controls:
 * - Restaurants
 * - Dishes
 * - Payment / QR settings
 */

import express from "express";
import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";
import PaymentSettings from "../models/paymentsettings.js";

const router = express.Router();

/* =====================================================
   AUTH (TEMP BASIC – controller नंतर वेगळं कर)
===================================================== */
router.post("/login", async (req, res) => {
  res.json({ success: true, message: "Admin login placeholder" });
});

router.get("/me", async (req, res) => {
  res.json({ success: true, admin: { role: "ADMIN" } });
});

/* =====================================================
   RESTAURANTS
===================================================== */
router.post("/restaurant", async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name and image are required"
      });
    }

    const restaurant = await Restaurant.create({ name, image });

    res.status(201).json({
      success: true,
      message: "Restaurant added successfully",
      data: restaurant
    });
  } catch (error) {
    console.error("ADD RESTAURANT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/restaurant/:id/status", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();

    res.json({
      success: true,
      message: `Restaurant ${
        restaurant.isActive ? "ACTIVATED" : "DEACTIVATED"
      }`,
      isActive: restaurant.isActive
    });
  } catch (error) {
    console.error("TOGGLE RESTAURANT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/restaurant/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    await Dish.deleteMany({ restaurant: restaurant._id });
    await restaurant.deleteOne();

    res.json({
      success: true,
      message: "Restaurant and dishes removed"
    });
  } catch (error) {
    console.error("REMOVE RESTAURANT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   DISHES
===================================================== */
router.post("/dish", async (req, res) => {
  try {
    const { restaurantId, name, price, type, image } = req.body;

    if (!restaurantId || !name || !price || !type || !image) {
      return res.status(400).json({
        success: false,
        message: "All dish fields are required"
      });
    }

    const dish = await Dish.create({
      restaurant: restaurantId,
      name,
      price,
      type,
      image
    });

    res.status(201).json({
      success: true,
      message: "Dish added successfully",
      data: dish
    });
  } catch (error) {
    console.error("ADD DISH ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/dish/:id/price", async (req, res) => {
  try {
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid price required"
      });
    }

    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Dish not found"
      });
    }

    dish.price = price;
    await dish.save();

    res.json({
      success: true,
      message: "Dish price updated",
      price: dish.price
    });
  } catch (error) {
    console.error("UPDATE PRICE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/dish/:id", async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Dish not found"
      });
    }

    await dish.deleteOne();

    res.json({
      success: true,
      message: "Dish removed successfully"
    });
  } catch (error) {
    console.error("REMOVE DISH ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   PAYMENT / QR SETTINGS
===================================================== */
router.post("/settings/qr", async (req, res) => {
  try {
    const {
      upiQrImage,
      platformFee,
      handlingCharge,
      deliveryFeePerKm,
      gstPercentage
    } = req.body;

    if (!upiQrImage) {
      return res.status(400).json({
        success: false,
        message: "QR image required"
      });
    }

    let settings = await PaymentSettings.findOne({ isActive: true });

    if (!settings) {
      settings = await PaymentSettings.create({
        upiQrImage,
        platformFee,
        handlingCharge,
        deliveryFeePerKm,
        gstPercentage
      });
    } else {
      Object.assign(settings, {
        upiQrImage,
        platformFee,
        handlingCharge,
        deliveryFeePerKm,
        gstPercentage
      });
      await settings.save();
    }

    res.json({
      success: true,
      message: "Payment settings updated",
      data: settings
    });
  } catch (error) {
    console.error("QR SETTINGS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;   // ⭐ ONLY export, ONLY at end
