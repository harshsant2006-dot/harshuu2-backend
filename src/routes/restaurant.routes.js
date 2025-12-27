/**
 * HARSHUU 2.0
 * Restaurant Routes (Internal / Business Logic)
 * ---------------------------------------------
 * Handles:
 * - Restaurant CRUD
 * - Open / Close status
 * - Restaurant-specific queries
 */

import express from "express";
const router = express.Router();

const Restaurant = require("../models/restaurant");
const Dish = require("../models/dish");

/* =====================================================
   CREATE RESTAURANT
===================================================== */
/**
 * @route   POST /restaurant
 * @desc    Create a new restaurant
 */
router.post("/", async (req, res) => {
  try {
    const { name, image, address, location } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name and image are required"
      });
    }

    const restaurant = await Restaurant.create({
      name,
      image,
      address,
      location,
      isOpen: true
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant
    });
  } catch (error) {
    console.error("CREATE RESTAURANT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   GET SINGLE RESTAURANT
===================================================== */
/**
 * @route   GET /restaurant/:id
 * @desc    Get restaurant by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    res.json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error("GET RESTAURANT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   UPDATE RESTAURANT DETAILS
===================================================== */
/**
 * @route   PATCH /restaurant/:id
 * @desc    Update restaurant details
 */
router.patch("/:id", async (req, res) => {
  try {
    const updates = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    res.json({
      success: true,
      message: "Restaurant updated",
      data: restaurant
    });
  } catch (error) {
    console.error("UPDATE RESTAURANT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   OPEN / CLOSE RESTAURANT
===================================================== */
/**
 * @route   PATCH /restaurant/:id/status
 * @desc    Toggle restaurant open/close
 */
router.patch("/:id/status", async (req, res) => {
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
      message: `Restaurant is now ${restaurant.isOpen ? "OPEN" : "CLOSED"}`,
      data: restaurant
    });
  } catch (error) {
    console.error("TOGGLE RESTAURANT STATUS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   DELETE RESTAURANT (CASCADE)
===================================================== */
/**
 * @route   DELETE /restaurant/:id
 * @desc    Delete restaurant and its dishes
 */
router.delete("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Remove all dishes of this restaurant
    await Dish.deleteMany({ restaurantId: restaurant._id });

    // Remove restaurant
    await restaurant.deleteOne();

    res.json({
      success: true,
      message: "Restaurant and related dishes deleted"
    });
  } catch (error) {
    console.error("DELETE RESTAURANT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
