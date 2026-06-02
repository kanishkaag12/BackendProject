const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Authentication middleware - verifies JWT and attaches user to request
 */
exports.authenticate = catchAsync(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Access denied. No token provided.', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired. Please login again.', 401);
    }
    throw error;
  }
});

/**
 * Authorization middleware - checks user role
 * @param  {...string} roles - Allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};
