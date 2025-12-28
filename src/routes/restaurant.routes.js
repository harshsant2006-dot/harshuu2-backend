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
import Restaurant from "../models/restaurant.js";
import Dish from "../models/dish.js";

const router = express.Router();

/* =====================================================
   CREATE RESTAURANT
===================================================== */
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
      isActive: true
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
router.patch("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
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
router.patch("/:id/status", async (req, res) => {
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
      message: `Restaurant is now ${
        restaurant.isActive ? "ACTIVE" : "INACTIVE"
      }`,
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
router.delete("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Remove all dishes under this restaurant
    await Dish.deleteMany({ restaurant: restaurant._id });

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

export default router;   // ⭐ ONLY export, ONLY at end
