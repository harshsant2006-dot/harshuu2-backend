/**
 * HARSHUU 2.0 – Admin Controller
 * Business logic for admin operations
 * Industry-grade, production ready
 */

const Restaurant = require("../models/restaurant");
const Dish = require("../models/dish");
const PaymentSettings = require("../models/paymentsettings");

/* ======================================================
   RESTAURANT MANAGEMENT
====================================================== */

/**
 * Add new restaurant
 */
exports.addRestaurant = async (req, res) => {
  try {
    const { name, image, address, isVegOnly } = req.body;

    if (!name || !image || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, image and address are required"
      });
    }

    const restaurant = await Restaurant.create({
      name,
      image,
      address,
      isVegOnly: Boolean(isVegOnly),
      isOpen: true
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
};

/**
 * Open / Close restaurant
 */
exports.toggleRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);
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
    console.error("TOGGLE RESTAURANT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Remove restaurant (hard delete)
 */
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Remove all dishes under this restaurant
    await Dish.deleteMany({ restaurant: id });

    res.json({
      success: true,
      message: "Restaurant and its dishes removed"
    });
  } catch (error) {
    console.error("DELETE RESTAURANT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================================================
   DISH MANAGEMENT
====================================================== */

/**
 * Add dish under restaurant
 */
exports.addDish = async (req, res) => {
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
};

/**
 * Update dish price
 */
exports.updateDishPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (price == null || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required"
      });
    }

    const dish = await Dish.findById(id);
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
      data: dish
    });
  } catch (error) {
    console.error("UPDATE DISH PRICE ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Remove dish
 */
exports.deleteDish = async (req, res) => {
  try {
    const { id } = req.params;

    const dish = await Dish.findByIdAndDelete(id);
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Dish not found"
      });
    }

    res.json({
      success: true,
      message: "Dish removed successfully"
    });
  } catch (error) {
    console.error("DELETE DISH ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================================================
   PAYMENT / BILLING SETTINGS
====================================================== */

/**
 * Update payment & billing settings
 */
exports.updatePaymentSettings = async (req, res) => {
  try {
    const {
      qrImage,
      platformFee,
      handlingCharge,
      deliveryFeePerKm,
      gstPercent
    } = req.body;

    if (
      !qrImage ||
      platformFee == null ||
      handlingCharge == null ||
      deliveryFeePerKm == null ||
      gstPercent == null
    ) {
      return res.status(400).json({
        success: false,
        message: "All billing fields are required"
      });
    }

    // Deactivate previous settings
    await PaymentSettings.updateMany(
      { isActive: true },
      { isActive: false }
    );

    const settings = await PaymentSettings.create({
      qrImage,
      platformFee,
      handlingCharge,
      deliveryFeePerKm,
      gstPercent,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: "Payment settings updated",
      data: settings
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
