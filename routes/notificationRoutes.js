const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// Apply authMiddleware to protect routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Manage notifications
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for a user
 *     tags: [Notifications]
 *     description: Get all notifications for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Server error
 */
router.get('/', notificationController.getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     description: Mark a notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Notification ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     description: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Server error
 */
router.put('/read', notificationController.markAllAsRead);

module.exports = router;