const Joi = require('joi');

const createTask = {
  body: Joi.object({
    title: Joi.string().min(1).max(200).required().messages({
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title must not exceed 200 characters',
      'any.required': 'Title is required',
    }),
    description: Joi.string().max(2000).allow('', null).messages({
      'string.max': 'Description must not exceed 2000 characters',
    }),
    status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
  }),
};

const updateTask = {
  body: Joi.object({
    title: Joi.string().min(1).max(200).messages({
      'string.min': 'Title must be at least 1 character',
      'string.max': 'Title must not exceed 200 characters',
    }),
    description: Joi.string().max(2000).allow('', null),
    status: Joi.string().valid('pending', 'in-progress', 'completed'),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid task ID format',
    }),
  }),
};

const getTask = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid task ID format',
    }),
  }),
};

const getAllTasks = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('pending', 'in-progress', 'completed'),
    search: Joi.string().max(200),
  }),
};

module.exports = { createTask, updateTask, getTask, getAllTasks };
