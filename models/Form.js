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
      ],
      required: true,
    },
    extraAttributes: { type: mongoose.Schema.Types.Mixed, required: true }, // Field-specific properties
  });

const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['draft', 'published', 'Unpublished'], default: 'draft' }, // Form status
  visibility: { type: String, enum: ['public', 'private'], default: 'private' }, // Form visibility
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }, // Linked activity (optional)
  assignedAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }], // Assigned agents (for private forms)
  elements: [FormElementSchema], // Array of form elements
  slug: { type: String, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who created the form
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: { type: Date }, // Timestamp when the form is published
});
module.exports = mongoose.model('Form', FormSchema);