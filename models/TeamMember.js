const mongoose = require('mongoose');


const TeamMemberSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['Admin', 'Manager', 'Member'], default: 'Member' },
  
  });
  
module.exports = mongoose.model('TeamMember', TeamMemberSchema);