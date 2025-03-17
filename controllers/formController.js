const Form = require('../models/Form');
const Submission = require('../models/Submission');
const RecentActivity = require('../models/RecentActivity');
const Activity = require('../models/Activity');
const User = require('../models/User');
const slugify = require('slugify');
const Agent = require('../models/Agent');
const { sendNotification, createNotification } = require('../utils/appNotification');

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
exports.createForm = async (req, res) => {
  const { title, description } = req.body;

  try {
    // Generate a unique slug
    let slug = slugify(title, { lower: true });
    let slugExists = await Form.findOne({ slug });
    let counter = 1;

    while (slugExists) {
      slug = slugify(`${title}-${counter}`, { lower: true });
      slugExists = await Form.findOne({ slug });
      counter++;
    }

    const form = new Form({
      title,
      description,
      createdBy: req.user.id, // Authenticated user
      slug,
    });

    const savedForm = await form.save();

    // Log recent activity
    await RecentActivity.create({
      type: "Form Update",
      description: `New form created: ${title}`,
      icon: "RiFileTextFill",
      user: req.user.name,
    });

    res.status(201).json({ id: savedForm._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Duplicate a form
// @route   POST /api/forms/:id/duplicate
// @access  Private
exports.duplicateForm = async (req, res) => {
  const { id } = req.params;

  try {
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    // Generate a unique slug for the duplicated form
    let slug = slugify(`${form.title}-copy`, { lower: true });
    let slugExists = await Form.findOne({ slug });
    let counter = 1;

    while (slugExists) {
      slug = slugify(`${form.title}-copy-${counter}`, { lower: true });
      slugExists = await Form.findOne({ slug });
      counter++;
    }

    // Create a new form with the same details
    const duplicatedForm = new Form({
      title: `${form.title} (Copy)`,
      description: form.description,
      elements: form.elements,
      visibility: form.visibility,
      assignedAgents: form.assignedAgents,
      acceptResponses: form.acceptResponses,
      status: 'draft', // Set the status to draft for the duplicated form
      createdBy: req.user.id, // Authenticated user
      slug,
    });

    const savedDuplicatedForm = await duplicatedForm.save();

    // Log recent activity
    await RecentActivity.create({
      type: "Form Update",
      description: `Form "${form.title}" duplicated by ${req.user.name}`,
      icon: "RiFileTextFill",
      user: req.user.name,
    });

    res.status(201).json(savedDuplicatedForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Update a form
// @route   PUT /api/forms/:id
// @access  Private
exports.updateForm = async (req, res) => {
  const { id } = req.params;
  const { title, description, elements, visibility, assignedAgents, acceptResponses, status, activity, collaborators } = req.body;

  try {
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    // Ensure the form is published before allowing updates to activity, agents, or visibility
    if (form.status !== 'published') {
      return res.status(400).json({ message: 'Form must be published before it can be tied to an activity, assigned agents, or made public.' });
    }

    // Validate visibility and assigned agents
    if (visibility === 'restricted' && (!assignedAgents || assignedAgents.length === 0)) {
      return res.status(400).json({ message: 'Agents must be assigned for restricted forms.' });
    }

    // Update the form
    if (title) form.title = title;
    if (description) form.description = description;
    if (elements) form.elements = elements;
    if (visibility) form.visibility = visibility;
    if (assignedAgents) form.assignedAgents = assignedAgents;
    if (acceptResponses !== undefined) form.acceptResponses = acceptResponses;
    if (status) form.status = status;
    if (activity) form.activity = activity;
    if (collaborators) form.collaborators = collaborators;

    const savedForm = await form.save();

    // Update the associated activity if activity ID is provided
    if (activity) {
      const activityDoc = await Activity.findById(activity);
    
      if (activityDoc) {
       
        if (activityDoc.forms && activityDoc.forms.toString() !== savedForm._id.toString()) {
          return res.status(400).json({ message: 'This activity is already tied to another form.' });
        }

       
        if (assignedAgents) {
          activityDoc.assignedTo = assignedAgents; 
        
          await Agent.updateMany(
            { _id: { $in: assignedAgents } },
            { $addToSet: { activities: activityDoc._id } } 
          );
        }
        if (collaborators) {
          activityDoc.collaborators = collaborators; 
        }
        activityDoc.forms = savedForm._id; 
  
        await activityDoc.save();
      }
    }

    // Log recent activity
    await RecentActivity.create({
      type: "Form Update",
      description: `Form "${form.title}" updated by ${req.user.name}`,
      icon: "RiFileTextFill",
      user: req.user.name,
    });

    res.json(savedForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
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


// @desc    Get public form details
// @route   GET /api/public/forms/:slug/:id
// @access  Public
exports.getPublicForm = async (req, res) => {
  const { id } = req.params;

  try {
    const form = await Form.findOne({ _id: id });
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Submit form data (for public users)
// @route   POST /api/forms/public/submit
// @access  Public
exports.submitPublicForm = async (req, res) => {
  const { formId, formData } = req.body;
  console.log(formId, formData, req.body);
  try {
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found today.' });
    }

    // Check if the form is public
    if (form.visibility !== 'public') {
      return res.status(403).json({ message: 'This form is not public.' });
    }

    // Check if the form is still accepting responses
    if (!form.acceptResponses) {
      return res.status(400).json({ message: 'This form is no longer accepting responses.' });
    }

    // Save the submission
    const submission = new Submission({
      form: form._id,
      formData,
    });

    const savedSubmission = await submission.save();

    // Add the submission to the form's responses
    form.responses.push(savedSubmission._id);
    await form.save();
    form.updateProgress();
    res.status(201).json(savedSubmission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all forms
// @route   GET /api/forms
// @access  Private
exports.getForms = async (req, res) => {
    try {
      const forms = await Form.find();
      const formsWithAutoId = forms.map((form, index) => ({
        ...form.toObject(),
        autoId: index + 1,
      }));
  
      res.json(formsWithAutoId);
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

    // Log recent activity
    await RecentActivity.create({
      type: "Form Update",
      description: `Form "${form.title}" deleted by ${req.user.name}`,
      icon: "RiFileTextFill",
      user: req.user.name,
    });

    res.json({ message: 'Form deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

 
  // @desc    Publish a form
  // @route   PUT /api/forms/:id/publish
  // @access  Private
  exports.publishForm = async (req, res) => {
    const { id } = req.params;
    const { elements, title, description } = req.body;
  
    try {
      let form = await Form.findById(id);
      if (!form) {
        return res.status(404).json({ message: 'Form not found.' });
      }
  
      // Update form elements, title, and description if provided
      if (elements) form.elements = elements;
      if (title) form.title = title;
      if (description) form.description = description;
  
      // Generate a unique slug
      let slug = slugify(form.title, { lower: true });
      let slugExists = await Form.findOne({ slug });
      let counter = 1;
  
      while (slugExists) {
        slug = slugify(`${form.title}-${counter}`, { lower: true });
        slugExists = await Form.findOne({ slug });
        counter++;
      }
  
      // Update the form status and slug
      form.status = 'published';
      form.publishedAt = Date.now();
      form.acceptResponses = true; // Allow responses by default
      form.slug = slug;
  
      const savedForm = await form.save();
  
      // Log recent activity
      await RecentActivity.create({
        type: "Form Update",
        description: `Form "${form.title}" published by ${req.user.name}`,
        icon: "RiFileTextFill",
        user: req.user.name,
      });
  
      // Return a general URL for the form
      const formUrl = `http://localhost:5173/forms/response/${form.slug}/${id}`;
  
      res.json({ ...savedForm.toObject(), url: formUrl });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

// @desc    Close a form
// @route   POST /api/forms/:id/close
// @access  Private
exports.closeForm = async (req, res) => {
  const { id } = req.params;

  try {
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    form.status = 'closed';
    form.acceptResponses = false;
    await form.save();

    // Log recent activity
    await RecentActivity.create({
      type: "Form Update",
      description: `Form "${form.title}" closed by ${req.user.name}`,
      icon: "RiFileTextFill",
      user: req.user.name,
    });

    res.json(savedForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Stop accepting responses
// @route   POST /api/forms/:id/stop-responses
// @access  Private
exports.stopResponses = async (req, res) => {
  const { id } = req.params;

  try {
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    form.acceptResponses = false;
    const savedForm = await form.save();

    // Log recent activity
    await RecentActivity.create({
      type: "Form Update",
      description: `Form "${form.title}" stopped accepting responses by ${req.user.name}`,
      icon: "RiFileTextFill",
      user: req.user.name,
    });

    res.json(savedForm);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// @desc    Get form summary
// @route   GET /api/forms/summary
// @access  Private
exports.getFormSummary = async (req, res) => {
  try {
    const totalForms = await Form.countDocuments();
    const activeForms = await Form.countDocuments({ status: 'published' });
    const completedForms = await Form.countDocuments({ status: 'closed' });
    const totalSubmissions = await Submission.countDocuments();
    const totalVisitsResult = await Form.aggregate([
      { $group: { _id: null, totalVisits: { $sum: "$visits" } } }
    ]);

    const totalVisits = totalVisitsResult.length > 0 ? totalVisitsResult[0].totalVisits : 0;
    const submissionRate = totalVisits > 0 ? (totalSubmissions / totalVisits) * 100 : 0;

    const formSummary = [
      {
        label: "Total Forms",
        value: totalForms.toString(),
        helpText: "Total number of forms created",
      },
      {
        label: "Active Forms",
        value: activeForms.toString(),
        helpText: "Total number of active forms",
      },
      {
        label: "Completed Forms",
        value: completedForms.toString(),
        helpText: "Total number of completed forms",
      },
      {
        label: "Submission Rate",
        value: `${submissionRate.toFixed(2)}%`,
        helpText: "Visits that resulted in a form submission",
      },
    ];

    res.json(formSummary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get form responses
// @route   GET /api/forms/:id/responses
// @access  Private
exports.getFormResponses = async (req, res) => {
  const { id } = req.params;

  try {
    const form = await Form.findById(id).populate({
      path: 'responses',
      populate: {
        path: 'agent',
        select: 'name email phone _id',
      },
    });
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    // Create a map of element IDs to labels
    const elementLabels = {};
    form.elements.forEach(element => {
      elementLabels[element.id] = element.extraAttributes.label;
    });

    // Map formData keys to labels in each response and include agent information
    const responsesWithLabels = form.responses.map(response => {
      const formDataWithLabels = {};
      for (const key in response.formData) {
        formDataWithLabels[elementLabels[key] || key] = response.formData[key];
      }
      return {
        ...response.toObject(),
        formData: formDataWithLabels,
        agentName: response.agent ? response.agent.name : 'Anonymous',
        agentEmail: response.agent ? response.agent.email : 'N/A',
        agentPhone: response.agent ? response.agent.phone : 'N/A',
        agentId: response.agent ? response.agent._id : null,
      };
    });

    res.json(responsesWithLabels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};