const mongoose = require('mongoose');


const AdminSettingsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: {
      newRequests: { type: Boolean, default: true },
      teamActivity: { type: Boolean, default: true },
      newMembers: { type: Boolean, default: true },
    },
   teamMembers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      email: String,
      role: String,
      isActive: { type: Boolean, default: true }, // Add this field
      lastLogin: { type: Date },
    },
  ],
  });
  
  module.exports = mongoose.model('AdminSetting', AdminSettingsSchema);