/**
 * HARSHUU 2.0
 * Dish Model
 * ----------------
 * Represents a single menu item belonging to a restaurant.
 */

import mongoose from "mongoose";
import CONSTANTS from "../config/constant.js";

const { DISH_TYPE } = CONSTANTS;

if (!DISH_TYPE) {
  throw new Error("DISH_TYPE is missing in constants");
}

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
 * Compound index
 */
dishSchema.index({ restaurant: 1, isAvailable: 1 });

/**
 * Instance method
 */
dishSchema.methods.canBeOrdered = function () {
  return this.isAvailable === true;
};

const Dish = mongoose.model("Dish", dishSchema);

export default Dish;
