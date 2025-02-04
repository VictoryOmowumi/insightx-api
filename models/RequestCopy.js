const mongoose = require('mongoose');
const ItemSchema = new mongoose.Schema({
  item_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  purpose: { type: String, required: true },
});
const RequestCopySchema = new mongoose.Schema({
  original_request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  items: [ItemSchema],
  requested_by: { type: String, required: true },
  request_title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'modified'], default: 'pending' },
  copied_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RequestCopy', RequestCopySchema);