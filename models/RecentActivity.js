const mongoose = require('mongoose');

const RecentActivitySchema = new mongoose.Schema({
  type: { type: String, required: true }, 
  description: { type: String, required: true },
  icon: { type: String }, 
  date: { type: Date, default: Date.now },
  user: { type: String, required: true }, 
});

module.exports = mongoose.model('RecentActivity', RecentActivitySchema);