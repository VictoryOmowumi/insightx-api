const mongoose = require('mongoose');
const Agent = require('../models/Agent');
const Submission = require('../models/Submission');
const Form = require('../models/Form');
const Activity = require('../models/Activity');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendSMS } = require('../utils/sms'); // SMS utility function

// @desc    Register a new agent
// @route   POST /api/agents/register
// @access  Private (Admin only)
exports.registerAgent = async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    // Check if the agent already exists
    const existingAgent = await Agent.findOne({ phone });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent with this phone number already exists.' });
    }

    // Generate a random password
    const { nanoid } = await import('nanoid');
    const password = nanoid(8); // 8-character random password

    // Generate a unique identifier
    const identifier = phone;

    // Create the agent
    const agent = new Agent({
      name,
      email: email || undefined,
      phone,
      address,
      password,
      identifier,
      createdBy: req.user._id,
    });

    await agent.save();

    // Send SMS with login details
    const message = `Welcome to InsightX! Your login details:\nPhone: ${phone}\nPassword: ${password}`;
    await sendSMS(phone, message);
    console.log(message);
    res.status(201).json({ message: 'Agent registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Agent login
// @route   POST /api/agents/login
// @access  Public
exports.loginAgent = async (req, res) => {
  const { identifier, password } = req.body;
 
  try {
    const agent = await Agent.findOne({ identifier });
  
    if (!agent) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

  
     // Check password
     const isMatch = await bcrypt.compare(password, agent.password);
   
     if (!isMatch) {
       return res.status(401).json({ message: 'Invalid credentials.' });
     }

    // Generate JWT token with full agent details
    const token = jwt.sign(
      {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        address: agent.address,
        role: 'Agent',
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get forms assigned to an agent by ID
// @route   GET /api/agents/:id/forms
// @access  Public
exports.getAssignedForms = async (req, res) => {
  const { id } = req.params;

  try {
    const forms = await Form.find({ assignedAgents: id, status: 'published' });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Submit form data (for agents)
// @route   POST /api/agents/forms/:id/submit
// @access  Public
exports.submitForm = async (req, res) => {
  const { id } = req.params;
  const { formData, gpsLocation } = req.body;
  try {
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    const submission = new Submission({
      form: id,
      agent: req.agent._id,
      formData,
      gpsLocation: {
        type: 'Point',
        coordinates: gpsLocation.coordinates,
      },
    });

    const savedSubmission = await submission.save();

    // Add the submission to the form's responses
    form.responses.push(savedSubmission._id);
    await form.save();

    form.updateProgress();

    res.status(201).json({ message: 'Submission saved successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all agents
// @route   GET /api/agents
// @access  Private (Admin only)
exports.getAgents = async (req, res) => {
  try {
    const agents = await Agent.find();

    // Add an incremental auto ID to each agent
    const agentsWithAutoId = agents.map((agent, index) => ({
      ...agent.toObject(),
      autoId: index + 1,
    }));

    res.json(agentsWithAutoId);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// @desc    Get agent by ID
// @route   GET /api/agents/:id
// @access  Public
exports.getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).populate({
      path: 'activities',
      select: '_id title status startDate endDate description'
    });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found.' });
    }
    res.json(agent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// @desc    Get activities assigned to an agent
// @route   GET /api/agents/:id/activities
// @access  Public
exports.getActivitiesByAgent = async (req, res) => {
  const { id } = req.params;

  try {
    const agent = await Agent.findById(id).populate('activities');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found.' });
    }

    res.json(agent.activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get a single activity assigned to an agent
// @route   GET /api/agents/:id/activities/:activityId
// @access  Public
exports.getActivityByAgent = async (req, res) => {
  const { id, activityId } = req.params;

  try {
    const agent = await Agent.findById(id).populate({
      path: 'activities',
      match: { _id: activityId },
      select: 'title description status startDate endDate type progress forms',
      populate: {
        path: 'forms',
        select: 'id responses totalResponses completionPercentage',
        populate: {
          path: 'responses',
          select: 'formData gpsLocation submittedAt'
        }
      }
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found.' });
    }

    const activity = agent.activities.find(activity => activity._id.toString() === activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get single form by id
// @desc    Get form by ID
// @route   GET /api/agents/forms/:id
// @access  Public
exports.getFormById = async (req, res) => {
  const { id } = req.params;

  try {
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found.' });
    }

    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// @desc    Get forms tied to an activity
// @route   GET /api/activities/:id/forms
// @access  Public
exports.getFormsByActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await Activity.findById(id).populate('forms');
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    res.json(activity.forms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Request password reset
// @route   POST /api/agents/request-password-reset
// @access  Public
exports.requestPasswordReset = async (req, res) => {
  const { phone } = req.body;

  try {
    const agent = await Agent.findOne({ phone });
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(5).toString('hex');
    agent.resetPasswordToken = resetToken;
    agent.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    console.log(resetToken);
    await agent.save();

    // Send SMS with reset token
    const message = `Your password reset token is: ${resetToken}`;
    await sendSMS(phone, message);

    res.json({ message: 'Password reset token sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reset password
// @route   POST /api/agents/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  const { newPassword, resetToken } = req.body;
  try {
    const agent = await Agent.findOne({ resetPasswordToken: resetToken, resetPasswordExpires: { $gt: Date.now() } });
    if (!agent) {
      return res.status(404).json({ message: 'Invalid or expired reset token.' });
    }

    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    agent.password = await bcrypt.hash(newPassword, salt);

    // Clear the reset token and expiration
    agent.resetPasswordToken = undefined;
    agent.resetPasswordExpires = undefined;

    await agent.save();
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Agents Summary
// @route   GET /api/agents/summary
// @access  Public
exports.getAgentsSummary = async (req, res) => {
  try {
    const totalAgents = await Agent.countDocuments();

    const activeAgents = await Agent.countDocuments({ activities: { $exists: true, $ne: [] } });

    const inactiveAgents = totalAgents - activeAgents;

    const recentAgents = await Agent.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const agentsWithActivities = await Agent.aggregate([
      { $match: { activities: { $exists: true, $ne: [] } } },
      { $project: { activityCount: { $size: "$activities" } } },
      { $group: { _id: null, totalActivities: { $sum: "$activityCount" }, count: { $sum: 1 } } },
    ]);

    const averageActivitiesPerAgent =
      agentsWithActivities.length > 0
        ? (agentsWithActivities[0].totalActivities / agentsWithActivities[0].count).toFixed(2)
        : 0;

    const agentsWithSubmissions = await Submission.distinct("agent");

    const agentsWithoutSubmissions = totalAgents - agentsWithSubmissions.length;

    // Agent summary object
    const agentSummary = [
      {
        label: "Total Agents",
        value: totalAgents.toString(),
        helpText: "Total number of registered agents",
      },
      {
        label: "Active Agents",
        value: activeAgents.toString(),
        helpText: "Agents with assigned activities",
      },
      {
        label: "Agents with Submissions",
        value: agentsWithSubmissions.length.toString(),
        helpText: "Agents who have submitted forms",
      },
      {
        label: "Agents without Submissions",
        value: agentsWithoutSubmissions.toString(),
        helpText: "Agents who have not submitted any forms",
      },
    ];

    res.json(agentSummary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get agent summary by ID
// @route   GET /api/agents/:id/summary
// @access  Public
exports.getAgentSummaryById = async (req, res) => {
  const { id } = req.params;

  try {
    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found.' });
    }

    const activityCount = agent.activities.length;

    const submissionCount = await Submission.countDocuments({ agent: id });

    const recentSubmissionCount = await Submission.countDocuments({
      agent: id,
      submittedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const submissionStatusCount = await Submission.aggregate([
      { $match: { agent: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get forms assigned to the agent
    const assignedForms = await Form.find({ assignedAgents: id });

    // Agent summary object
    const agentSummary = {
      activityCount,
      submissionCount,
      recentSubmissionCount,
      submissionStatusCount,
      assignedForms: assignedForms.length,
    };

    res.json(agentSummary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};