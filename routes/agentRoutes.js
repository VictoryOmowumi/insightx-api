const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const agentAuthMiddleware = require('../middleware/agentAuthMiddleware');
const { validateAgentRegistration } = require('../middleware/validationMiddleware');

/**
 * @swagger
 * /api/agents/register:
 *   post:
 *     summary: Register a new agent
 *     tags: [Agents]
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agent registered successfully
 *       400:
 *         description: Agent with this phone number already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/register', adminAuthMiddleware, validateAgentRegistration, agentController.registerAgent);

/**
 * @swagger
 * /api/agents/login:
 *   post:
 *     summary: Agent login
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', agentController.loginAgent);

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: Get all agents
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agent'
 *       401:
 *         description: Unauthorized
 */
router.get('/', adminAuthMiddleware, agentController.getAgents);

/**
 * @swagger
 * /api/agents/{id}:
 *   get:
 *     summary: Get agent by ID
 *     tags: [Agents]
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
 *         description: Agent details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Agent not found
 */
router.get('/:id', agentController.getAgentById);

/**
 * @swagger
 * /api/agents/summary:
 *   get:
 *     summary: Get agents summary
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agents summary retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAgents:
 *                   type: number
 *                 activeAgents:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/summary', adminAuthMiddleware, agentController.getAgentsSummary);

/**
 * @swagger
 * /api/agents/{id}/summary:
 *   get:
 *     summary: Get agent summary by ID
 *     tags: [Agents]
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
 *         description: Agent summary retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activityCount:
 *                   type: number
 *                 submissionCount:
 *                   type: number
 *                 recentSubmissionCount:
 *                   type: number
 *                 submissionStatusCount:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       count:
 *                         type: number
 *                 assignedForms:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/summary', agentController.getAgentSummaryById);

/**
 * @swagger
 * /api/agents/{id}/forms:
 *   get:
 *     summary: Get forms assigned to an agent by ID
 *     tags: [Agents]
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
 *         description: List of assigned forms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Form'
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/forms', agentController.getAssignedForms);

/**
 * @swagger
 * /api/agents/forms/{id}/submit:
 *   post:
 *     summary: Submit form data (for agents)
 *     tags: [Agents]
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
 *               formData:
 *                 type: object
 *     responses:
 *       201:
 *         description: Submission saved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 */
router.post('/forms/:id/submit', agentAuthMiddleware, agentController.submitForm);

/**
 * @swagger
 * /api/agents/request-password-reset:
 *   post:
 *     summary: Request password reset
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset token sent
 *       404:
 *         description: Agent not found
 */
router.post('/request-password-reset', agentController.requestPasswordReset);

/**
 * @swagger
 * /api/agents/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', agentAuthMiddleware, agentController.resetPassword);


/**
 * @swagger
 * /api/agents/{id}/activities/{activityId}:
 *   get:
 *     summary: Get a single activity assigned to an agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Activity details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Activity not found
 */
router.get('/:id/activities/:activityId', agentController.getActivityByAgent);

/**
 * @swagger
 * /api/agents/forms/{id}:
 *   get:
 *     summary: Get a single form assigned to an agent
 *     tags: [Agents]
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
 *         description: Form details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Form'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 */
router.get('/forms/:id', agentController.getFormById);

/**
 * @swagger
 * /api/agents/{id}/activities:
 *   get:
 *     summary: Get activities assigned to an agent
 *     tags: [Agents]
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
 *         description: List of activities assigned to the agent
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Agent not found
 */
router.get('/:id/activities', agentController.getActivitiesByAgent);

module.exports = router;