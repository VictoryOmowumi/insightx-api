const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /api/settings/roles
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
// @route   POST /api/settings/roles
// @access  Private (Admin)
exports.createRole = async (req, res) => {
  const { name, permissions } = req.body;

  try {
    const newRole = new Role({ name, permissions });
    await newRole.save();
    res.status(201).json(newRole);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update a role
// @route   PUT /api/settings/roles/:id
// @access  Private (Admin)
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body;

  try {
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { name, permissions },
      { new: true, runValidators: true }
    );
    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(updatedRole);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a role
// @route   DELETE /api/settings/roles/:id
// @access  Private (Admin)
exports.deleteRole = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRole = await Role.findByIdAndDelete(id);
    if (!deletedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};