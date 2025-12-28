/**
 * HARSHUU 2.0 – Settings Routes
 * Handles platform charges & UPI QR settings
 * Used by Admin Panel + Customer Order Page
 */

import express from "express";
import PaymentSettings from "../models/paymentsettings.js";

const router = express.Router();

/* ======================================================
   GET SETTINGS (PUBLIC – CUSTOMER ORDER PAGE)
====================================================== */
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
        upiQrImage: settings.upiQrImage,
        platformFee: settings.platformFee,
        handlingCharge: settings.handlingCharge,
        deliveryFeePerKm: settings.deliveryFeePerKm,
        gstPercentage: settings.gstPercentage
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
router.post("/", async (req, res) => {
  try {
    const {
      upiQrImage,
      platformFee,
      handlingCharge,
      deliveryFeePerKm,
      gstPercentage
    } = req.body;

    if (
      !upiQrImage ||
      platformFee == null ||
      handlingCharge == null ||
      deliveryFeePerKm == null ||
      gstPercentage == null
    ) {
      return res.status(400).json({
        success: false,
        message: "All settings fields are required"
      });
    }

    // Disable old active settings
    await PaymentSettings.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // Create new active settings
    const settings = await PaymentSettings.create({
      upiQrImage,
      platformFee,
      handlingCharge,
      deliveryFeePerKm,
      gstPercentage,
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

export default router;   // ⭐ ONLY export, ONLY at end
