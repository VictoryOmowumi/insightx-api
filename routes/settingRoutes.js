const express = require('express');
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Manage roles, user settings, and admin settings
 */

/**
 * @swagger
 * /api/settings/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 */
router.get('/roles', settingsController.getRoles);

/**
 * @swagger
 * /api/settings/user:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings fetched successfully
 */
router.get('/user', settingsController.getUserSettings);

/**
 * @swagger
 * /api/settings/user:
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark]
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   inApp:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: User settings updated successfully
 */
router.put('/user', settingsController.updateUserSettings);

/**
 * @swagger
 * /api/settings/admin:
 *   get:
 *     summary: Get admin settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin settings fetched successfully
 */
router.get('/admin', adminAuthMiddleware, settingsController.getAdminSettings);

/**
 * @swagger
 * /api/settings/admin:
 *   put:
 *     summary: Update admin settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   newRequests:
 *                     type: boolean
 *                   teamActivity:
 *                     type: boolean
 *               teamMembers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Array of team member IDs
 *     responses:
 *       200:
 *         description: Admin settings updated successfully
 */
router.put('/admin', adminAuthMiddleware, settingsController.updateAdminSettings);

/**
 * @swagger
 * /api/settings/login-history:
 *   get:
 *     summary: Get login history
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Login history fetched successfully
 */
router.get('/login-history', adminAuthMiddleware, settingsController.getLoginHistory);

module.exports = router;