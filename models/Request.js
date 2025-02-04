const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  item_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  purpose: { type: String, required: true },
});

const RequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [ItemSchema], // Array of items
  requested_by: { type: String, required: true },
  request_title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'modified'], default: 'pending' }, 
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Request', RequestSchema);