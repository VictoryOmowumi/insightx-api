const express = require('express');
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authMiddleware to protect routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Manage user roles and permissions
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 */
router.get('/', roleController.getRoles);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
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
router.post('/', roleController.createRole);

/**
 * @swagger
 * /api/roles/:id:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
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
router.put('/:id', roleController.updateRole);

/**
 * @swagger
 * /api/roles/:id:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
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
router.delete('/:id', roleController.deleteRole);

module.exports = router;