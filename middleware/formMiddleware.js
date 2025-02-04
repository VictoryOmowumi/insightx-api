const Form = require('../models/Form');

// Middleware to check form access
exports.checkFormAccess = async (req, res, next) => {
  const { id } = req.params;

  try {
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    // Public forms are accessible to everyone
    if (form.visibility === 'public') {
      return next();
    }

    // Private forms require authentication and agent assignment
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    // Check if the user is an assigned agent
    const isAssignedAgent = form.assignedAgents.includes(req.user.id);
    if (!isAssignedAgent) {
      return res.status(403).json({ message: 'You do not have access to this form.' });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};