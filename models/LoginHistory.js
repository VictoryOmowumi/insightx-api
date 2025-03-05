const mongoose = require('mongoose');

const LoginHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['success', 'failed'], required: true },
  });
  
module.exports = mongoose.model('LoginHistory', LoginHistorySchema);