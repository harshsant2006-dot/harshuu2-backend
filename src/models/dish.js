/**
 * HARSHUU 2.0
 * Dish Model
 * ----------------
 * Represents a single menu item belonging to a restaurant.
 */

import mongoose from "mongoose";
const { DISH_TYPE } = require("../config/constants");

const dishSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300
    },

    image: {
      type: String, // Cloudinary / S3 URL
      required: true
    },

    type: {
      type: String,
      enum: Object.values(DISH_TYPE), // VEG / NON_VEG
      required: true,
      index: true
    },

    price: {
      type: Number,
      required: true,
      min: 1
    },

    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },

    preparationTimeMinutes: {
      type: Number,
      default: 15,
      min: 1,
      max: 180
    },

    popularityScore: {
      type: Number,
      default: 0
    },

    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/**
 * Compound index:
 * Fast lookup of menu items per restaurant
 */
dishSchema.index({ restaurant: 1, isAvailable: 1 });

/**
 * Safety check:
 * Dish must be available to order
 */
dishSchema.methods.canBeOrdered = function () {
  return this.isAvailable === true;
};

module.exports = mongoose.model("Dish", dishSchema);
