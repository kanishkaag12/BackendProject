const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const taskValidation = require('../validations/taskValidation');

// All task routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *         userId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Complete project documentation
 *               description:
 *                 type: string
 *                 example: Write comprehensive docs for the API
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 default: pending
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.post('/', validate(taskValidation.createTask), taskController.createTask);

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks (users see own, admin sees all)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks with pagination
 *       401:
 *         description: Not authenticated
 */
router.get('/', validate(taskValidation.getAllTasks), taskController.getAllTasks);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 *       403:
 *         description: Access denied
 */
router.get('/:id', validate(taskValidation.getTask), taskController.getTaskById);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *       403:
 *         description: Access denied
 */
router.put('/:id', validate(taskValidation.updateTask), taskController.updateTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       403:
 *         description: Access denied
 */
router.delete('/:id', validate(taskValidation.getTask), taskController.deleteTask);

module.exports = router;
