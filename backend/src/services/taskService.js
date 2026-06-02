const { Task, User } = require('../models');
const AppError = require('../utils/AppError');

class TaskService {
  /**
   * Create a new task
   */
  async createTask(data, userId) {
    const task = await Task.create({
      ...data,
      userId,
    });
    return task;
  }

  /**
   * Get all tasks with pagination and filtering
   * Admin sees all tasks, users see only their own
   */
  async getAllTasks(userId, role, query = {}) {
    const { page = 1, limit = 10, status, search } = query;
    const offset = (page - 1) * limit;

    const where = {};

    // Users can only see their own tasks
    if (role !== 'admin') {
      where.userId = userId;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Search by title
    if (search) {
      const { Op } = require('sequelize');
      where.title = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    return {
      tasks,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Get task by ID with ownership check
   */
  async getTaskById(id, userId, role) {
    const task = await Task.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      }],
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check ownership (admin can access any task)
    if (role !== 'admin' && task.userId !== userId) {
      throw new AppError('You do not have permission to access this task', 403);
    }

    return task;
  }

  /**
   * Update task
   */
  async updateTask(id, data, userId, role) {
    const task = await this.getTaskById(id, userId, role);

    await task.update(data);
    return task;
  }

  /**
   * Delete task
   */
  async deleteTask(id, userId, role) {
    const task = await this.getTaskById(id, userId, role);

    await task.destroy();
    return { message: 'Task deleted successfully' };
  }
}

module.exports = new TaskService();
