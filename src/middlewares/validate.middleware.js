/**
 * HARSHUU 2.0 – Request Validation Middleware
 * ------------------------------------------
 * Purpose:
 * - Validate request body, params, query
 * - Prevent bad / malicious input reaching controllers
 * - Keep controllers CLEAN and SAFE
 *
 * Usage:
 * router.post("/route", validate(schema), controller)
 */

module.exports = function validate(schema) {
  return (req, res, next) => {
    try {
      if (!schema || typeof schema !== "object") {
        return next();
      }

      /**
       * ===============================
       * BODY VALIDATION
       * ===============================
       */
      if (schema.body) {
        const { error, value } = schema.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true
        });

        if (error) {
          return res.status(400).json({
            success: false,
            message: error.details.map(d => d.message).join(", ")
          });
        }

        req.body = value;
      }

      /**
       * ===============================
       * PARAMS VALIDATION
       * ===============================
       */
      if (schema.params) {
        const { error, value } = schema.params.validate(req.params, {
          abortEarly: false
        });

        if (error) {
          return res.status(400).json({
            success: false,
            message: error.details.map(d => d.message).join(", ")
          });
        }

        req.params = value;
      }

      /**
       * ===============================
       * QUERY VALIDATION
       * ===============================
       */
      if (schema.query) {
        const { error, value } = schema.query.validate(req.query, {
          abortEarly: false
        });

        if (error) {
          return res.status(400).json({
            success: false,
            message: error.details.map(d => d.message).join(", ")
          });
        }

        req.query = value;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
