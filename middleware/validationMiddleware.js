const { body, validationResult } = require('express-validator');

exports.validateAgentRegistration = [
  body('name').notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Invalid email address.'),
  body('phone').notEmpty().withMessage('Phone number is required.'),
  body('address').notEmpty().withMessage('Address is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];