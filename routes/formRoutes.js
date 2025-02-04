const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkFormAccess} = require('../middleware/formMiddleware');
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
 *     summary: Get form details
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
 * /api/forms/{id}/publish:
 *   post:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activity:
 *                 type: string
 *                 description: ID of the activity to link the form to
 *     responses:
 *       200:
 *         description: Form published
 */
router.post('/:id/publish', formController.publishForm);

module.exports = router;