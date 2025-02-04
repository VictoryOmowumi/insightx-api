const jwt = require('jsonwebtoken');
const Agent = require('../models/Agent');

exports.agentAuthMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await Agent.findById(decoded.id);
    if (!agent) throw new Error();

    req.agent = agent; // Attach agent to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};