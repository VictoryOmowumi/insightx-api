const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: function() {
      return this.formVisibility !== 'public';
    },
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  gpsLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: function() {
        return this.formVisibility !== 'public';
      },
    },
    coordinates: {
      type: [Number],
      required: function() {
        return this.formVisibility !== 'public';
      },
    },
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  formVisibility: {
    type: String,
    required: true,
  },
});

// Pre-save hook to set formVisibility
SubmissionSchema.pre('validate', async function(next) {
  if (this.isNew) {
    const form = await mongoose.model('Form').findById(this.form);
    if (form) {
      this.formVisibility = form.visibility;
    }
  }
  next();
});

module.exports = mongoose.model('Submission', SubmissionSchema);