const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authMiddleware to protect routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Stock Requests
 *   description: Manage stock requests
 */

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new stock request
 *     tags: [Stock Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requested_by:
 *                 type: string
 *               request_title:
 *                 type: string
 *               description:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     item_name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     purpose:
 *                       type: string
 *     responses:
 *       201:
 *         description: Request created successfully
 */
router.post('/', requestController.createRequest);

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get all stock requests
 *     tags: [Stock Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of stock requests
 */
router.get('/', requestController.getAllRequests);

/**
 * @swagger
 * /api/requests/summary:
 *   get:
 *     summary: Get stock request summary
 *     tags: [Stock Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock request summary
 */
router.get('/summary', requestController.getRequestSummary);



/**
 * @swagger
 * /api/requests/{id}:
 *   put:
 *     summary: Approve, reject, or modify a stock request
 *     tags: [Stock Requests]
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
 *               action:
 *                 type: string
 *                 enum: [approve, reject, modify]
 *               notes:
 *                 type: string
 *               modified_data:
 *                 type: object
 *                 properties:
 *                   item_name:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   purpose:
 *                     type: string
 *                   request_title:
 *                     type: string
 *                   description:
 *                     type: string
 *     responses:
 *       200:
 *         description: Request updated successfully
 */
router.put('/:id', requestController.updateRequest);

/**
 * @swagger
 * /api/requests/{id}/history:
 *   get:
 *     summary: Get history of a stock request
 *     tags: [Stock Requests]
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
 *         description: List of request history
 */
router.get('/:id/history', requestController.getRequestHistory);

// get single request
/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get a single stock request
 *     tags: [Stock Requests]
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
 *         description: Stock request details
 */
router.get('/:id', requestController.getRequest);

// delete request
/**
 * @swagger
 * /api/requests/{id}:
 *   delete:
 *     summary: Delete a stock request
 *     tags: [Stock Requests]
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
 *         description: Request deleted successfully
 */
router.delete('/:id', requestController.deleteRequest);

module.exports = router;