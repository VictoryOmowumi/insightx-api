const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['newRequest', 'teamActivity', 'newMember', 'activity', 'mention', 'feedback', 'reminder', 'system', 'login'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return value && value.trim().length > 0;
      },
      message: 'Message cannot be empty',
    },
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
    default: '',
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
}, { timestamps: true });

// Indexes
NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ read: 1 });
NotificationSchema.index({ createdAt: -1 });

// Virtual for unread count
NotificationSchema.virtual('unreadCount').get(function () {
  return this.model('Notification').countDocuments({ userId: this.userId, read: false });
});

// Method to mark as read
NotificationSchema.methods.markAsRead = function () {
  this.read = true;
  return this.save();
};

module.exports = mongoose.model('Notification', NotificationSchema);