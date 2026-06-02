const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: result,
  });
});

exports.login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: result,
  });
});

exports.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);

  res.status(200).json({
    status: 'success',
    message: 'Token refreshed successfully',
    data: tokens,
  });
});

exports.getProfile = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});
