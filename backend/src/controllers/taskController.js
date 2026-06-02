const taskService = require('../services/taskService');
const catchAsync = require('../utils/catchAsync');

exports.createTask = catchAsync(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user.id);

  res.status(201).json({
    status: 'success',
    message: 'Task created successfully',
    data: { task },
  });
});

exports.getAllTasks = catchAsync(async (req, res) => {
  const result = await taskService.getAllTasks(req.user.id, req.user.role, req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.getTaskById = catchAsync(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: { task },
  });
});

exports.updateTask = catchAsync(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user.id, req.user.role);

  res.status(200).json({
    status: 'success',
    message: 'Task updated successfully',
    data: { task },
  });
});

exports.deleteTask = catchAsync(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    status: 'success',
    message: 'Task deleted successfully',
  });
});
