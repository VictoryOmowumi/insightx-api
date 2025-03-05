const Role = require('../models/Role');
const UserSetting = require('../models/UserSetting');
const AdminSetting = require('../models/AdminSetting');
const LoginHistory = require('../models/LoginHistory');
const User = require('../models/User');

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

// @desc    Get user settings
// @route   GET /api/settings/user
// @access  Private
exports.getUserSettings = async (req, res) => {
  try {
    let settings = await UserSetting.findOne({ userId: req.user.id });

   
    if (!settings) {
      settings = new UserSetting({
        userId: req.user.id,
        theme: 'light',
        notifications: {
          email: true, 
          inApp: true, 
        },
      });
      await settings.save();
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get admin settings
// @route   GET /api/settings/admin
// @access  Private (Admin)
exports.getAdminSettings = async (req, res) => {
  try {
    let settings = await AdminSetting.findOne({ userId: req.user.id });

    if (!settings) {
      const allUsers = await User.find(); // Fetch all users
      settings = new AdminSetting({
        userId: req.user.id,
        theme: 'light',
        notifications: {
          newRequests: true,
          teamActivity: true,
          newMembers: true,
        },
        teamMembers: allUsers.map(user => ({
          userId: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin,
        })),
      });
      await settings.save();
    } else {
      // Populate teamMembers with user details
      const allUsers = await User.find({ _id: { $ne: req.user.id } });
      console.log(allUsers); 
      settings.teamMembers = allUsers.map(user => ({
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin || null,
      }));
      await settings.save();
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings/user
// @access  Private
exports.updateUserSettings = async (req, res) => {
  try {
    const updatedSettings = await UserSetting.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updatedSettings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update admin settings
// @route   PUT /api/settings/admin
// @access  Private (Admin)
exports.updateAdminSettings = async (req, res) => {
  try {
    const updatedSettings = await AdminSetting.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updatedSettings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Get login history
// @route   GET /api/settings/login-history
// @access  Private (Admin)
exports.getLoginHistory = async (req, res) => {
  try {
    const allUsers = await User.find({ _id: { $ne: req.user.id } }); // Fetch all users except the current user
    const userIds = allUsers.map(user => user._id);

    const loginHistory = await LoginHistory.find({ userId: { $in: userIds } }).populate('userId', 'name email');
    res.json(loginHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};