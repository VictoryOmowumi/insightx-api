const mongoose = require('mongoose');

const KPISchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  target: { type: Number, required: true }, 
});

const HistorySchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now }, 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    details: { type: String }, 
    changes: { type: Object }, 
  });

  const DiscussionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    message: { type: String, required: true }, 
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Store mentioned users
    timestamp: { type: Date, default: Date.now }, 
});
  
  const FeedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    comments: { type: String }, 
    files: [{ type: String }], 
    timestamp: { type: Date, default: Date.now }, 
  });
  

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Upcoming', 'In Progress', 'Paused', 'Completed'], default: 'In Progress' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  targetAudience: { type: String },
  location: {type: String},
  budget: { type: Number },
  channels: [{ type: String }],
  type: { type: String, enum: ['Campaign', 'Event', 'Product Activation', 'Product Relaunch'], required: true },
  typeDetails: { type: Object },
  kpis: [KPISchema], // Array of KPIs
  progress: { type: Number, min: 0, max: 100, default: 0 }, 
  history: [HistorySchema], // Log of changes
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }], 
  discussions: [DiscussionSchema], 
  feedback: FeedbackSchema, 
  forms: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }],
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Activity', ActivitySchema);