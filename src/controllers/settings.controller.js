/**
 * HARSHUU 2.0 – Settings Controller
 * Handles payment QR, charges & GST configuration
 * PRODUCTION-GRADE BUSINESS LOGIC
 */

const PaymentSettings = require("../models/paymentsettings");

/* ======================================================
   GET SETTINGS (PUBLIC)
   Used by customer order page
====================================================== */

/**
 * GET /settings
 * Returns current active payment & billing settings
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await PaymentSettings.findOne({ isActive: true });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Payment settings not configured"
      });
    }

    res.json({
      success: true,
      data: {
        qrImage: settings.qrImage,
        platformFee: settings.platformFee,
        handlingCharge: settings.handlingCharge,
        deliveryFeePerKm: settings.deliveryFeePerKm,
        gstPercent: settings.gstPercent
      }
    });

  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ======================================================
   CREATE / UPDATE SETTINGS (ADMIN)
====================================================== */

/**
 * POST /admin/settings
 * Creates or updates billing & payment settings
 */
exports.upsertSettings = async (req, res) => {
  try {
    const {
      qrImage,
      platformFee,
      handlingCharge,
      deliveryFeePerKm,
      gstPercent
    } = req.body;

    // ---------- VALIDATION ----------
    if (!qrImage) {
      return res.status(400).json({
        success: false,
        message: "QR image is required"
      });
    }

    if (
      platformFee < 0 ||
      handlingCharge < 0 ||
      deliveryFeePerKm < 0 ||
      gstPercent < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Charges cannot be negative"
      });
    }

    // ---------- DEACTIVATE OLD SETTINGS ----------
    await PaymentSettings.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // ---------- CREATE NEW SETTINGS ----------
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
      message: "Payment & billing settings updated",
      data: settings
    });

  } catch (error) {
    console.error("UPSERT SETTINGS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ======================================================
   ADMIN – VIEW SETTINGS HISTORY (OPTIONAL)
====================================================== */

/**
 * GET /admin/settings
 * Returns all historical settings
 */
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await PaymentSettings.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: settings.length,
      data: settings
    });

  } catch (error) {
    console.error("GET ALL SETTINGS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
