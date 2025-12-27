/**
 * HARSHUU 2.0
 * Dish Routes (Production Grade)
 * --------------------------------
 * Handles:
 * - Add dish to restaurant
 * - Update dish price
 * - Remove dish
 * - Fetch dishes by restaurant
 */

const express = require("express");
const router = express.Router();

const Dish = require("../models/dish");
const Restaurant = require("../models/restaurant");

/* =====================================================
   ADD DISH TO RESTAURANT
===================================================== */
/**
 * @route   POST /dish
 * @desc    Add a dish under a restaurant
 */
router.post("/", async (req, res) => {
  try {
    const {
      restaurantId,
      name,
      price,
      isVeg,
      image
    } = req.body;

    if (!restaurantId || !name || !price || !image) {
      return res.status(400).json({
        success: false,
        message: "restaurantId, name, price and image are required"
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
      isVeg,
      image,
      isAvailable: true
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

/* =====================================================
   GET DISHES BY RESTAURANT (PUBLIC)
===================================================== */
/**
 * @route   GET /dish/restaurant/:restaurantId
 * @desc    Get all available dishes for a restaurant
 */
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const dishes = await Dish.find({
      restaurantId,
      isAvailable: true
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      count: dishes.length,
      data: dishes
    });
  } catch (error) {
    console.error("GET DISHES ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   UPDATE DISH PRICE
===================================================== */
/**
 * @route   PATCH /dish/:id/price
 * @desc    Update dish price
 */
router.patch("/:id/price", async (req, res) => {
  try {
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required"
      });
    }

    const dish = await Dish.findByIdAndUpdate(
      req.params.id,
      { price },
      { new: true, runValidators: true }
    );

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Dish not found"
      });
    }

    res.json({
      success: true,
      message: "Dish price updated",
      data: dish
    });
  } catch (error) {
    console.error("UPDATE DISH PRICE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   TOGGLE DISH AVAILABILITY
===================================================== */
/**
 * @route   PATCH /dish/:id/status
 * @desc    Enable / Disable dish
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);

    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Dish not found"
      });
    }

    dish.isAvailable = !dish.isAvailable;
    await dish.save();

    res.json({
      success: true,
      message: `Dish is now ${dish.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}`,
      data: dish
    });
  } catch (error) {
    console.error("TOGGLE DISH STATUS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   DELETE DISH
===================================================== */
/**
 * @route   DELETE /dish/:id
 * @desc    Remove dish permanently
 */
router.delete("/:id", async (req, res) => {
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
      message: "Dish deleted successfully"
    });
  } catch (error) {
    console.error("DELETE DISH ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
