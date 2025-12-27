/**
 * HARSHUU 2.0
 * Application Constants
 * ---------------------
 * Central place for platform-wide constants.
 * NO business logic here – only safe defaults & enums.
 */

const ORDER_STATUS = Object.freeze({
  CREATED: "CREATED",
  PAID: "PAID",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  PICKED: "PICKED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
});

const USER_ROLES = Object.freeze({
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  DELIVERY: "DELIVERY"
});

const RESTAURANT_STATUS = Object.freeze({
  OPEN: "OPEN",
  CLOSED: "CLOSED"
});

/**
 * Billing Defaults
 * (Actual values can be overridden via ENV / Admin Settings)
 */
const BILLING_DEFAULTS = Object.freeze({
  PLATFORM_FEE: 5,           // ₹ flat (default)
  HANDLING_CHARGE: 3,        // ₹ flat (default)
  GST_PERCENT: 5,            // 5% GST on FOOD TOTAL only
  DELIVERY_PER_KM: 10        // ₹10 per km
});

/**
 * Distance & delivery rules
 */
const DELIVERY_RULES = Object.freeze({
  MIN_DISTANCE_KM: 1,
  MAX_DISTANCE_KM: 15,
  BASE_DELIVERY_KM: 3         // First 3 km can be free / flat logic
});

/**
 * Limits & safeguards
 */
const LIMITS = Object.freeze({
  MAX_CART_ITEMS: 50,
  MAX_QTY_PER_ITEM: 20,
  MAX_RESTAURANTS_PER_CITY: 500
});

/**
 * Regex / Validation helpers
 */
const REGEX = Object.freeze({
  MOBILE: /^[6-9]\d{9}$/,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/
});

module.exports = {
  ORDER_STATUS,
  USER_ROLES,
  RESTAURANT_STATUS,
  BILLING_DEFAULTS,
  DELIVERY_RULES,
  LIMITS,
  REGEX
};
