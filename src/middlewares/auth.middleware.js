/**
 * HARSHUU 2.0 – Authentication Middleware
 * --------------------------------------
 * JWT based route protection
 * Supports Admin-only access (optional)
 *
 * This middleware is PRODUCTION-GRADE
 */

const jwt = require("jsonwebtoken");

/**
 * Verify JWT Token
 * ----------------
 * Used for protected routes
 */
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

/**
 * Admin Only Middleware
 * ---------------------
 * Use ONLY if admin protection required
 * (Optional as per your requirement)
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access"
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access only"
    });
  }

  next();
};
