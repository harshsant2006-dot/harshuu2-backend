/**
 * HARSHUU 2.0 – Restaurant Controller
 * Handles restaurant & menu data for customer side
 * Production-grade business logic
 */

const Restaurant = require("../models/restaurant");
const Dish = require("../models/dish");

/* ======================================================
   PUBLIC – CUSTOMER SIDE
====================================================== */

/**
 * Get all restaurants (for index.html)
 * Only approved & active restaurants
 */
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .select("name image address isOpen isVegOnly")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    console.error("GET RESTAURANTS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get single restaurant details
 */
exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id)
      .select("name image address isOpen isVegOnly");

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
};

/**
 * Get menu of a restaurant (menu.html)
 */
exports.getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    if (!restaurant.isOpen) {
      return res.status(403).json({
        success: false,
        message: "Restaurant is currently closed"
      });
    }

    const dishes = await Dish.find({
      restaurant: restaurantId,
      isAvailable: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        isVegOnly: restaurant.isVegOnly
      },
      count: dishes.length,
      data: dishes
    });
  } catch (error) {
    console.error("GET MENU ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================================================
   INTERNAL / FUTURE USE
====================================================== */

/**
 * Toggle dish availability (optional future use)
 */
exports.toggleDishAvailability = async (req, res) => {
  try {
    const { dishId } = req.params;

    const dish = await Dish.findById(dishId);
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};
