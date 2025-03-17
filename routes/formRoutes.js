const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkFormAccess, checkAgentFormAccess } = require('../middleware/formMiddleware');

/**
 * @swagger
 * /api/forms/{id}/public:
 *   get:
 *     summary: Get public form details
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public form details
 */
router.get('/:id/public', formController.getPublicForm);

/**
 * @swagger
 * /api/forms/public/submit:
 *   post:
 *     summary: Submit a public form
 *     tags: [Forms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formId:
 *                 type: string
 *               formData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Form submitted
 */
router.post('/public/submit', formController.submitPublicForm);

// Apply authMiddleware to protect routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/forms:
 *   post:
 *     summary: Create a new form
 *     tags: [Forms]
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
 *     responses:
 *       201:
 *         description: Form created
 */
router.post('/', formController.createForm);

/**
 * @swagger
 * /api/forms/summary:
 *   get:
 *     summary: Get form summary
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Form summary retrieved
 */
router.get('/summary', formController.getFormSummary);

/**
 * @swagger
 * /api/forms/{id}:
 *   put:
 *     summary: Update a form (save progress)
 *     tags: [Forms]
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
 *               elements:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/FormElement'
 *     responses:
 *       200:
 *         description: Form updated
 */
router.put('/:id', formController.updateForm);

/**
 * @swagger
 * /api/forms/{id}:
 *   get:
 *     summary: Get form details for owner, managers, and admins
 *     tags: [Forms]
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
 *         description: Form details
 */
router.get('/:id', checkFormAccess, formController.getForm);

/**
 * @swagger
 * /api/forms/{id}/duplicate:
 *   post:
 *     summary: Duplicate a form
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Form duplicated
 */
router.post('/:id/duplicate', authMiddleware, formController.duplicateForm);


/**
 * @swagger
 * /api/forms:
 *   get:
 *     summary: Get all forms
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Forms retrieved
 */
router.get('/', formController.getForms);

/**
 * @swagger
 * /api/forms/agent/{id}:
 *   get:
 *     summary: Get form details for assigned agents
 *     tags: [Forms]
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
 *         description: Form details for assigned agents
 */
router.get('/agent/:id', checkAgentFormAccess, formController.getForm);

/**
 * @swagger
 * /api/forms/{id}/publish:
 *   put:
 *     summary: Publish a form
 *     tags: [Forms]
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
 *         description: Form published
 */
router.put('/:id/publish', formController.publishForm);

/**
 * @swagger
 * /api/forms/{id}/close:
 *   post:
 *     summary: Close a form
 *     tags: [Forms]
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
 *               acceptResponses:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Form closed
 */
router.post('/:id/close', formController.closeForm);

/**
 * @swagger
 * /api/forms/{id}/stop-responses:
 *   post:
 *     summary: Stop accepting responses
 *     tags: [Forms]
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
 *         description: Form responses stopped
 */
router.post('/:id/stop-responses', formController.stopResponses);

/**
 * @swagger
 * /api/forms/{id}/response:
 *   get:
 *     summary: Get all responses for a form
 *     tags: [Forms]
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
 *         description: Form responses retrieved
 */
router.get('/:id/response', formController.getFormResponses);

module.exports = router;