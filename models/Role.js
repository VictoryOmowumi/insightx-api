const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  resource: { type: String, required: true }, // e.g., "Activity", "Form", "Dashboard"
  actions: [{ type: String }], // e.g., ["create", "read", "update", "delete"]
});

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Admin", "Manager", "Agent"
  description: { type: String }, // Optional description of the role
  permissions: [PermissionSchema], // Array of permissions
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Role', RoleSchema);
