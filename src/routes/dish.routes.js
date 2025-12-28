/**
 * HARSHUU 2.0
 * Dish Routes (Production Grade)
 * --------------------------------
 * Handles:
 * - Add dish to restaurant
 * - Update dish price
 * - Toggle availability
 * - Delete dish
 * - Fetch dishes by restaurant
 */

import express from "express";
import Dish from "../models/dish.js";
import Restaurant from "../models/restaurant.js";

const router = express.Router();

/* =====================================================
   ADD DISH TO RESTAURANT (ADMIN)
===================================================== */
/**
 * @route   POST /dishes
 */
router.post("/", async (req, res) => {
  try {
    const { restaurantId, name, price, type, image } = req.body;

    if (!restaurantId || !name || !price || !type || !image) {
      return res.status(400).json({
        success: false,
        message: "restaurantId, name, price, type and image are required"
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
      restaurant: restaurantId,
      name,
      price,
      type,
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
 * @route   GET /dishes/restaurant/:restaurantId
 */
router.get("/restaurant/:restaurantId", async (req, res) => {
  try {
    const dishes = await Dish.find({
      restaurant: req.params.restaurantId,
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
   UPDATE DISH PRICE (ADMIN)
===================================================== */
/**
 * @route   PATCH /dishes/:id/price
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
   TOGGLE DISH AVAILABILITY (ADMIN)
===================================================== */
/**
 * @route   PATCH /dishes/:id/status
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
      message: `Dish is now ${
        dish.isAvailable ? "AVAILABLE" : "UNAVAILABLE"
      }`,
      data: dish
    });
  } catch (error) {
    console.error("TOGGLE DISH STATUS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   DELETE DISH (ADMIN)
===================================================== */
/**
 * @route   DELETE /dishes/:id
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

export default router;   // ⭐ ONLY export, ONLY at end
