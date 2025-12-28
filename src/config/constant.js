/**
 * HARSHUU 2.0
 * Application Constants
 * ---------------------
 * Central place for platform-wide constants.
 * NO business logic here – only safe defaults & enums.
 */

/**
 * Dish Types
 */
const DISH_TYPE = Object.freeze({
  VEG: "VEG",
  NON_VEG: "NON_VEG"
});

/**
 * Order Status
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

/**
 * User Roles
 */
const USER_ROLES = Object.freeze({
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  DELIVERY: "DELIVERY"
});

/**
 * Restaurant Status
 */
const RESTAURANT_STATUS = Object.freeze({
  OPEN: "OPEN",
  CLOSED: "CLOSED"
});

/**
 * Billing Defaults
 */
const BILLING_DEFAULTS = Object.freeze({
  PLATFORM_FEE: 5,     // ₹ flat
  HANDLING_CHARGE: 3,  // ₹ flat
  GST_PERCENT: 5,      // %
  DELIVERY_PER_KM: 10  // ₹ per km
});

/**
 * Delivery rules
 */
const DELIVERY_RULES = Object.freeze({
  MIN_DISTANCE_KM: 1,
  MAX_DISTANCE_KM: 15,
  BASE_DELIVERY_KM: 3
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
 * Regex helpers
 */
const REGEX = Object.freeze({
  MOBILE: /^[6-9]\d{9}$/,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/
});

/**
 * ✅ DEFAULT EXPORT (ES MODULE)
 */
const CONSTANTS = {
  DISH_TYPE,
  ORDER_STATUS,
  USER_ROLES,
  RESTAURANT_STATUS,
  BILLING_DEFAULTS,
  DELIVERY_RULES,
  LIMITS,
  REGEX
};

export default CONSTANTS;
