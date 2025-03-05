const mongoose = require('mongoose');


const RequestHistorySchema = new mongoose.Schema({
  request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  action: { type: String, enum: ['created', 'approved', 'rejected', 'modified'], required: true },
  action_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String },
  action_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RequestHistory', RequestHistorySchema);