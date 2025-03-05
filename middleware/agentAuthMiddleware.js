const jwt = require('jsonwebtoken');
const Agent = require('../models/Agent');

const agentAuthMiddleware = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const agent = await Agent.findById(decoded.id);

    if (!agent) {
      return res.status(401).json({ message: 'Agent not found' });
    }

    req.agent = agent;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = agentAuthMiddleware;