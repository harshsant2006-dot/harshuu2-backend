/**
 * HARSHUU 2.0 – Settings Routes
 * Handles platform charges & UPI QR settings
 * Used by Admin Panel + Customer Order Page
 */

const express = require("express");
const router = express.Router();

const PaymentSettings = require("../models/paymentsettings");

/* ======================================================
   GET SETTINGS (PUBLIC – FOR CUSTOMER ORDER PAGE)
====================================================== */
/**
 * @route   GET /settings
 * @desc    Fetch active payment & billing settings
 */
router.get("/", async (req, res) => {
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
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ======================================================
   CREATE / UPDATE SETTINGS (ADMIN)
====================================================== */
/**
 * @route   POST /settings
 * @desc    Create or update payment settings
 * NOTE     Only one active settings document allowed
 */
router.post("/", async (req, res) => {
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
        message: "All settings fields are required"
      });
    }

    // Disable old settings
    await PaymentSettings.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // Create new active settings
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
      message: "Payment settings updated successfully",
      data: settings
    });
  } catch (error) {
    console.error("SAVE SETTINGS ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
