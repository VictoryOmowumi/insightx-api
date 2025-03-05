const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true }, // Unique but optional
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Manager', 'Member'], default: 'Member' },
  profilePic: { type: String },
  password: { type: String },
  isActive: { type: Boolean, default: true },
  googleProfile: { type: mongoose.Schema.Types.Mixed }, 
  lastLogin: { type: Date },
  loginHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LoginHistory' }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);