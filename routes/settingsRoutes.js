const express = require('express');
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authMiddleware to protect routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Manage roles and system settings
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
 * /api/settings/roles:
 *   post:
 *     summary: Create a new role
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     resource:
 *                       type: string
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 */
router.post('/roles', settingsController.createRole);

/**
 * @swagger
 * /api/settings/roles/:id:
 *   put:
 *     summary: Update a role
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     resource:
 *                       type: string
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.put('/roles/:id', settingsController.updateRole);

/**
 * @swagger
 * /api/settings/roles/:id:
 *   delete:
 *     summary: Delete a role
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 */
router.delete('/roles/:id', settingsController.deleteRole);

module.exports = router;