const mongoose = require('mongoose');

const FormElementSchema = new mongoose.Schema({
  id: { type: String, required: true }, // Unique identifier for the element
  type: {
    type: String,
    enum: [
      'TitleField',
      'SubTitleField',
      'SeparatorField',
      'SpacerField',
      'TextField',
      'NumberField',
      'TextAreaField',
      'DateField',
      'SelectField',
      'CheckboxField',
      'FileField',
      'ProductField',
      'ParagraphField',
      'RegionField',
    ],
    required: true,
  },
  extraAttributes: { type: mongoose.Schema.Types.Mixed, required: true, options: {} },
});

const ResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  formData: { type: mongoose.Schema.Types.Mixed, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' },
  visibility: { type: String, enum: ['public', 'restricted'], default: 'public' },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }, // Single activity reference
  assignedAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }],
  elements: [FormElementSchema],
  responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }], // Reference to submissions
  slug: { type: String, unique: true, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date },
  closedAt: { type: Date },
  acceptResponses: { type: Boolean, default: true },
  stopOnActivityClose: { type: Boolean, default: false }, // New field
  totalResponses: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
});

FormSchema.methods.updateProgress = function () {
  this.totalResponses = this.responses.length;
  this.completionPercentage = (this.totalResponses / this.assignedAgents.length) * 100;
  this.progress = (this.totalResponses / this.assignedAgents.length) * 100;
  this.save();
};

module.exports = mongoose.model('Form', FormSchema);