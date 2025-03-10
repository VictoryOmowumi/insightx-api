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


module.exports = router;