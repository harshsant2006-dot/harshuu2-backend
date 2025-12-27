/**
 * HARSHUU 2.0 – Dish Controller
 * Handles ALL dish-related business logic
 * Used by Admin Panel (secure routes)
 */

const Dish = require("../models/dish");
const Restaurant = require("../models/restaurant");

/* ======================================================
   ADMIN – DISH MANAGEMENT
====================================================== */

/**
 * Add new dish under a restaurant
 * POST /admin/dish
 */
exports.addDish = async (req, res) => {
  try {
    const {
      restaurantId,
      name,
      price,
      isVeg,
      image
    } = req.body;

    // Validation
    if (!restaurantId || !name || !price || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Create dish
    const dish = await Dish.create({
      restaurant: restaurantId,
      name: name.trim(),
      price: Number(price),
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
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * Update dish price
 * PATCH /admin/dish/:id/price
 */
exports.updateDishPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!price || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price"
      });
    }

    const dish = await Dish.findById(id);
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Dish not found"
      });
    }

    dish.price = Number(price);
    await dish.save();

    res.json({
      success: true,
      message: "Dish price updated",
      data: dish
    });

  } catch (error) {
    console.error("UPDATE PRICE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * Toggle dish availability (Enable / Disable)
 * PATCH /admin/dish/:id/status
 */
exports.toggleDishStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findById(id);
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
    console.error("TOGGLE DISH ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * Remove dish permanently
 * DELETE /admin/dish/:id
 */
exports.deleteDish = async (req, res) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findById(id);
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
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ======================================================
   INTERNAL / READ OPERATIONS
====================================================== */

/**
 * Get all dishes of a restaurant (Admin view)
 */
exports.getDishesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const dishes = await Dish.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: dishes.length,
      data: dishes
    });

  } catch (error) {
    console.error("GET DISHES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
