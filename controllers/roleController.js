const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (Admin)
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new role
// @route   POST /api/roles
// @access  Private (Admin)
exports.createRole = async (req, res) => {
  const { name, description, permissions } = req.body;

  try {
    const newRole = new Role({ name, description, permissions });
    await newRole.save();
    res.status(201).json(newRole);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private (Admin)
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, description, permissions } = req.body;

  try {
    const role = await Role.findByIdAndUpdate(
      id,
      { name, description, permissions, updatedAt: Date.now() },
      { new: true }
    );
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Private (Admin)
exports.deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Role.findByIdAndDelete(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};