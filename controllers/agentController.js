const Agent = require('../models/Agent');
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
    console.log(password);
    // Generate a unique identifier
    const identifier = phone;

    // Create the agent
    const agent = new Agent({
      name,
      email,
      phone,
      address,
      password,
      identifier, // Populate the required identifier field
    });

    await agent.save();

    // Send SMS with login details
    const message = `Welcome to InsightX! Your login details:\nPhone: ${phone}\nPassword: ${password}`;
    await sendSMS(phone, message);

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

    // Generate JWT token
    const token = jwt.sign({ id: agent._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get forms assigned to an agent by ID
// @route   GET /api/agents/:id/forms
// @access  Private (Admin only)
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
  // @access  Private
  exports.submitForm = async (req, res) => {
    const { id } = req.params;
    const { storeDetails, formData } = req.body;
  
    try {
      const submission = new Submission({
        form: id,
        agent: req.agent._id, // Use req.agent instead of req.user
        storeDetails,
        formData,
      });
  
      await submission.save();
      res.status(201).json({ message: 'Submission saved successfully.' });
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
  const { resetToken, newPassword } = req.body;

  try {
    const agent = await Agent.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }, // Token must not be expired
    });

    if (!agent) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Update password
    agent.password = newPassword;
    agent.resetPasswordToken = undefined;
    agent.resetPasswordExpires = undefined;

    await agent.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};