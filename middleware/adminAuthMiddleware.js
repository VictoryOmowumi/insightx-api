const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.adminAuthMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'Manager') throw new Error();

    req.user = user; // Attach user to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token or unauthorized access.' });
  }
};