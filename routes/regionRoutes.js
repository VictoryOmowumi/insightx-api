const express = require('express');
const regionController = require('../controllers/regionController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Regions
 *   description: Manage regions and territories
 */

/**
 * @swagger
 * /api/regions:
 *   get:
 *     summary: Get all regions
 *     tags: [Regions]
 *     responses:
 *       200:
 *         description: Regions fetched successfully
 */
router.get('/', regionController.getRegions);

module.exports = router;