const Form = require('../models/Form');
const slugify = require('slugify');


// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
exports.createForm = async (req, res) => {
    const { title, description } = req.body;
  
    try {
      const form = new Form({
        title,
        description,
        createdBy: req.user.id, // Authenticated user
      });
  
      const savedForm = await form.save();
      res.status(201).json(savedForm);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

// @desc    Update a form (save progress)
// @route   PUT /api/forms/:id
// @access  Private
exports.updateForm = async (req, res) => {
    const { id } = req.params;
    const { elements } = req.body;
  
    try {
      const form = await Form.findByIdAndUpdate(
        id,
        { elements, updatedAt: Date.now() },
        { new: true }
      );
      if (!form) return res.status(404).json({ message: 'Form not found' });
      res.json(form);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };


  // @desc    Get form details
// @route   GET /api/forms/:id
// @access  Private
exports.getForm = async (req, res) => {
    const { id } = req.params;
  
    try {
      const form = await Form.findById(id);
      if (!form) return res.status(404).json({ message: 'Form not found' });
      res.json(form);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
// @desc    Preview a form
// @route   GET /api/forms/:id/preview
// @access  Private
exports.previewForm = async (req, res) => {
  const { id } = req.params;

  try {
    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    // Return the form structure for preview
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a form
// @route   DELETE /api/forms/:id
// @access  Private
exports.deleteForm = async (req, res) => {
    const { id } = req.params;
  
    try {
      const form = await Form.findByIdAndDelete(id);
      if (!form) return res.status(404).json({ message: 'Form not found' });
      res.json({ message: 'Form deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


// @desc    Publish a form
// @route   POST /api/forms/:id/publish
// @access  Private
exports.publishForm = async (req, res) => {
    const { id } = req.params;
    const { activity, visibility, assignedAgents } = req.body;
  
    try {
      const form = await Form.findById(id);
      if (!form) {
        return res.status(404).json({ message: 'Form not found.' });
      }
  
      // Validate visibility and assigned agents
      if (visibility === 'private' && (!assignedAgents || assignedAgents.length === 0)) {
        return res.status(400).json({ message: 'Agents must be assigned for private forms.' });
      }
  
      // Check if the activity exists (if provided)
      if (activity) {
        const activityExists = await Activity.findById(activity);
        if (!activityExists) {
          return res.status(404).json({ message: 'Activity not found.' });
        }
      }
        // Generate a unique slug for public forms
    if (visibility === 'public') {
        form.slug = slugify(form.title, { lower: true });
        }

  
      // Update the form
      form.status = 'published';
      form.visibility = visibility;
      form.activity = activity || null; 
      form.assignedAgents = assignedAgents || []; 
  
      const savedForm = await form.save();
      res.json(savedForm);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


  // @desc    Submit form data (for public users)
// @route   POST /api/public/forms/:slug/submit
// @access  Public
exports.submitPublicForm = async (req, res) => {
    const { slug } = req.params;
    const { formData } = req.body;
  
    try {
      const form = await Form.findOne({ slug });
      if (!form) {
        return res.status(404).json({ message: 'Form not found.' });
      }
  
      // Save the submission
      const submission = new Submission({
        form: form._id,
        formData,
      });
  
      const savedSubmission = await submission.save();
      res.status(201).json(savedSubmission);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };