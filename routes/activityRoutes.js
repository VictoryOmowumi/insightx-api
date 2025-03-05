const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Apply authMiddleware to protect routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Manage marketing activities
 */

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get all activities
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of activities
 */
router.get('/', activityController.getActivities);


/**
 * @swagger
 * /api/activities/summary:
 *   get:
 *     summary: Get summary data for all activities
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary of activities
 */
router.get('/summary', activityController.getActivitiesSummary);


/**
 * @swagger
 * /api/activities/channels:
 *   get:
 *     summary: Get all channels
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of channels
 */
router.get('/channels', activityController.getChannels);


/**
 * @swagger
 * /api/activities/{id}/summary:
 *   get:
 *     summary: Get summary data for a single activity
 *     tags: [Activities]
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
 *         description: Summary of the activity
 *       404:
 *         description: Activity not found
 */
router.get('/:id/summary', activityController.getActivitySummary);


/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: Get an activity by ID
 *     tags: [Activities]
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
 *         description: Activity details
 *       404:
 *         description: Activity not found
 */
router.get('/:id', activityController.getActivityById);


/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Create a new activity
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
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
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               targetAudience:
 *                 type: string
 *               budget:
 *                 type: number
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *                 enum: [Campaign, Event, Product Launch, Product Activation]
 *               kpis:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     target:
 *                       type: number
 *               dependencies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: IDs of dependent activities
 *     responses:
 *       201:
 *         description: Activity created
 */
router.post('/', activityController.createActivity);

/**
 * @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: Update an activity
 *     tags: [Activities]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Paused, Completed]
 *               startDate:
  *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               targetAudience:
 *                 type: string
 *               budget:
 *                 type: number
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *                 enum: [Campaign, Event, Product Launch, Product Activation]
 *               kpis:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     target:
 *                       type: number
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               dependencies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: IDs of dependent activities
 *     responses:
 *       200:
 *         description: Activity updated
 */
router.put('/:id', activityController.updateActivity);

/**
 * @swagger
 * /api/activities/{id}:
 *   put:
 *     summary: Update an activity
 *     tags: [Activities]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Paused, Completed]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               targetAudience:
 *                 type: string
 *               budget:
 *                 type: number
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *               type:
 *                 type: string
 *                 enum: [Campaign, Event, Product Launch, Product Activation]
 *               kpis:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     target:
 *                       type: number
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               dependencies:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: IDs of dependent activities
 *     responses:
 *       200:
 *         description: Activity updated
 */
router.put('/:id', activityController.updateActivity);

/**
 * @swagger
 * /api/activities/{id}:
 *   delete:
 *     summary: Delete an activity
 *     tags: [Activities]
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
 *         description: Activity deleted
 */
router.delete('/:id', activityController.deleteActivity);

/**
 * @swagger
 * /api/activities/{id}/discussion:
 *   post:
 *     summary: Add a chat message to the discussion
 *     tags: [Activities]
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
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat message added
 */
router.post('/:id/discussion', activityController.addDiscussionMessage);

/**
 * @swagger
 * /api/activities/{id}/feedback:
 *   post:
 *     summary: Add feedback when marking an activity as completed
 *     tags: [Activities]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Feedback added
 */
router.post('/:id/feedback', upload.array('files', 5), activityController.addFeedback); // Allow up to 5 files




module.exports = router;