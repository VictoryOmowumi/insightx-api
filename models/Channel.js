// models/Channel.js
const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Channel name (e.g., Facebook, Instagram)
});

module.exports = mongoose.model('Channel', ChannelSchema);