// middleware/authMiddleware.js
const checkPermission = (resource, action) => {
    return async (req, res, next) => {
      const user = req.user; // Assuming user is attached to the request
      const role = await Role.findById(user.role);
  
      if (!role) {
        return res.status(403).json({ message: 'Role not found' });
      }
  
      const permission = role.permissions.find((p) => p.resource === resource);
      if (!permission || !permission.actions.includes(action)) {
        return res.status(403).json({ message: 'Permission denied' });
      }
  
      next();
    };
  };
  
  module.exports = checkPermission;