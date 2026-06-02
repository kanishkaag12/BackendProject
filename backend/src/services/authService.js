const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  generateTokens(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  async register({ name, email, password, role }) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const user = await User.create({ name, email, password, role: role || 'user' });
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login({ email, password }) {
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const tokens = this.generateTokens(user);
      return tokens;
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new AppError('Invalid or expired refresh token', 401);
      }
      throw error;
    }
  }

  async getProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}

module.exports = new AuthService();
