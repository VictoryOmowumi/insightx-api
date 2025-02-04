const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, },
  phone: { type: String, required: true, unique: true },
  address: { type: String },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
  createdAt: { type: Date, default: Date.now },
});

// Hash the password before saving
AgentSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('Agent', AgentSchema);