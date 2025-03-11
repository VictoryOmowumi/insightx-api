const Notification = require('../models/Notification');

// @desc    Get notifications for a user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const notifications = await Notification.updateMany(
      { userId: req.user.id },
      { read: true },
      { multi: true }
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};