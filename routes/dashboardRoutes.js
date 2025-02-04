const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authMiddleware to protect routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Fetch dashboard metrics and insights
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get high-level summary metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary metrics fetched successfully
 */
router.get('/summary', dashboardController.getDashboardSummary);

/**
 * @swagger
 * /api/dashboard/activities:
 *   get:
 *     summary: Get activity-related metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity metrics fetched successfully
 */
router.get('/activities', dashboardController.getActivityMetrics);

/**
 * @swagger
 * /api/dashboard/forms:
 *   get:
 *     summary: Get form-related metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Form metrics fetched successfully
 */
router.get('/forms', dashboardController.getFormMetrics);

/**
 * @swagger
 * /api/dashboard/agents:
 *   get:
 *     summary: Get agent-related metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent metrics fetched successfully
 */
router.get('/agents', dashboardController.getAgentMetrics);

/**
 * @swagger
 * /api/dashboard/requests:
 *   get:
 *     summary: Get request-related metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Request metrics fetched successfully
 */
router.get('/requests', dashboardController.getRequestMetrics);

module.exports = router;