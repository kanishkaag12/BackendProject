const { User, Task } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows: users } = await User.findAndCountAll({
    attributes: ['id', 'name', 'email', 'role', 'createdAt'],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    },
  });
});

exports.getUserById = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: ['id', 'name', 'email', 'role', 'createdAt'],
    include: [{
      model: Task,
      as: 'tasks',
      attributes: ['id', 'title', 'status', 'createdAt'],
    }],
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.getDashboardStats = catchAsync(async (req, res) => {
  const totalUsers = await User.count();
  const totalTasks = await Task.count();
  const tasksByStatus = await Task.findAll({
    attributes: [
      'status',
      [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
    ],
    group: ['status'],
  });

  res.status(200).json({
    status: 'success',
    data: {
      totalUsers,
      totalTasks,
      tasksByStatus,
    },
  });
});
