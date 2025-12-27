/**
 * HARSHUU 2.0
 * Restaurant Model
 * ----------------
 * Represents a food restaurant/hotel on the platform.
 */

const mongoose = require("mongoose");
const { RESTAURANT_STATUS } = require("../config/constants");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500
    },

    image: {
      type: String, // Cloudinary / S3 URL
      required: true
    },

    status: {
      type: String,
      enum: Object.values(RESTAURANT_STATUS),
      default: RESTAURANT_STATUS.CLOSED,
      index: true
    },

    cuisineTypes: {
      type: [String], // e.g. ["Indian", "Chinese"]
      default: []
    },

    address: {
      fullAddress: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true,
        index: true
      },
      area: {
        type: String,
        trim: true
      }
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },

    deliveryRadiusKm: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    },

    isActive: {
      type: Boolean,
      default: true
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },

    commissionPercent: {
      type: Number,
      default: 15, // platform commission
      min: 0,
      max: 50
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
 * Geo index for distance-based delivery calculation
 */
restaurantSchema.index({ location: "2dsphere" });

/**
 * Safety: prevent ordering if restaurant is closed or inactive
 */
restaurantSchema.methods.canAcceptOrder = function () {
  return this.status === RESTAURANT_STATUS.OPEN && this.isActive;
};

module.exports = mongoose.model("Restaurant", restaurantSchema);
