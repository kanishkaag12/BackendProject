const AppError = require('../utils/AppError');

/**
 * Validation middleware factory using Joi schemas
 * @param {Object} schema - Joi schema object with optional body, params, query keys
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    ['body', 'params', 'query'].forEach((key) => {
      if (schema[key]) {
        const { error, value } = schema[key].validate(req[key], {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          const errors = error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, ''),
          }));
          validationErrors.push(...errors);
        } else {
          req[key] = value;
        }
      }
    });

    if (validationErrors.length > 0) {
      const errorMessage = validationErrors
        .map((err) => `${err.field}: ${err.message}`)
        .join('; ');
      return next(new AppError(errorMessage, 400));
    }

    next();
  };
};

module.exports = validate;
