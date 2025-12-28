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

const router = express.Router();

router.post("/login", adminLogin);
router.get("/me", adminProfile);

export default router;   // ⭐ MUST

const Restaurant = require("../models/restaurant");
const Dish = require("../models/dish");
const PaymentSettings = require("../models/paymentsettings");

/* =====================================================
   RESTAURANTS
===================================================== */

/**
 * @route   POST /admin/restaurant
 * @desc    Add new restaurant
 */
router.post("/restaurant", async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name and image are required"
      });
    }

    const restaurant = await Restaurant.create({
      name,
      image
    });

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

/**
 * @route   PATCH /admin/restaurant/:id/status
 * @desc    Open / Close restaurant
 */
router.patch("/restaurant/:id/status", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    restaurant.isOpen = !restaurant.isOpen;
    await restaurant.save();

    res.json({
      success: true,
      message: `Restaurant ${
        restaurant.isOpen ? "OPENED" : "CLOSED"
      } successfully`,
      isOpen: restaurant.isOpen
    });
  } catch (error) {
    console.error("TOGGLE RESTAURANT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route   DELETE /admin/restaurant/:id
 * @desc    Remove restaurant
 */
router.delete("/restaurant/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Remove all dishes under this restaurant
    await Dish.deleteMany({ restaurantId: restaurant._id });

    await restaurant.deleteOne();

    res.json({
      success: true,
      message: "Restaurant and its dishes removed successfully"
    });
  } catch (error) {
    console.error("REMOVE RESTAURANT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   DISHES
===================================================== */

/**
 * @route   POST /admin/dish
 * @desc    Add dish under restaurant
 */
router.post("/dish", async (req, res) => {
  try {
    const { restaurantId, name, price, type, image } = req.body;

    if (!restaurantId || !name || !price || !type || !image) {
      return res.status(400).json({
        success: false,
        message: "All dish fields are required"
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    const dish = await Dish.create({
      restaurantId,
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

/**
 * @route   PATCH /admin/dish/:id/price
 * @desc    Update dish price
 */
router.patch("/dish/:id/price", async (req, res) => {
  try {
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required"
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

/**
 * @route   DELETE /admin/dish/:id
 * @desc    Remove dish
 */
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

/**
 * @route   POST /admin/settings/qr
 * @desc    Upload / update QR & charges
 */
router.post("/settings/qr", async (req, res) => {
  try {
    const {
      qrImage,
      platformFee,
      handlingCharge,
      deliveryChargePerKm,
      gstPercentage
    } = req.body;

    if (!qrImage) {
      return res.status(400).json({
        success: false,
        message: "QR image is required"
      });
    }

    let settings = await PaymentSettings.findOne();

    if (!settings) {
      settings = await PaymentSettings.create({
        qrImage,
        platformFee,
        handlingCharge,
        deliveryChargePerKm,
        gstPercentage
      });
    } else {
      settings.qrImage = qrImage;
      if (platformFee !== undefined) settings.platformFee = platformFee;
      if (handlingCharge !== undefined)
        settings.handlingCharge = handlingCharge;
      if (deliveryChargePerKm !== undefined)
        settings.deliveryChargePerKm = deliveryChargePerKm;
      if (gstPercentage !== undefined)
        settings.gstPercentage = gstPercentage;

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

module.exports = router;
