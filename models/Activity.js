const mongoose = require('mongoose');

const KPISchema = new mongoose.Schema({
  name: { type: String, required: true }, // KPI name (e.g., "Engagement Rate")
  target: { type: Number, required: true }, // Target value (e.g., 20%)
});

const HistorySchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now }, // When the change occurred
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who made the change
    action: { type: String, required: true }, // e.g., "Status changed to Completed"
    details: { type: String }, // Additional details about the change
    changes: { type: Object }, // Object containing the changes (e.g., { status: "Completed" })
  });

const DiscussionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who sent the message
    message: { type: String, required: true }, // Chat message
    timestamp: { type: Date, default: Date.now }, // When the message was sent
  });
  
  const FeedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who provided feedback
    comments: { type: String }, // Overall feedback comments
    files: [{ type: String }], // Array of file URLs (e.g., Google Drive links)
    timestamp: { type: Date, default: Date.now }, // When the feedback was provided
  });
  

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Pending', 'In Progress', 'Paused', 'Completed'], default: 'Pending' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  targetAudience: { type: String },
  budget: { type: Number },
  channels: [{ type: String }],
  type: { type: String, enum: ['Campaign', 'Event', 'Product Launch', 'Product Activation', 'Product Relaunch'], required: true },
  kpis: [KPISchema], // Array of KPIs
  progress: { type: Number, min: 0, max: 100, default: 0 }, // Completion percentage
  history: [HistorySchema], // Log of changes
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }], // Linked activities
  discussions: [DiscussionSchema], // Discussion messages
  feedback: FeedbackSchema, // Feedback from stakeholders
  forms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Form' }],
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }],
});

module.exports = mongoose.model('Activity', ActivitySchema);