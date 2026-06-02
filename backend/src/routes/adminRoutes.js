const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only operations
 */

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
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
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Admin]
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
 *         description: User details with tasks
 *       404:
 *         description: User not found
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;
