const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Assign agent to activity (requires admin authentication)
router.post('/agents/assign', adminAuthMiddleware, agentController.assignAgent);

module.exports = router;