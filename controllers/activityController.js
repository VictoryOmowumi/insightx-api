const fs = require('fs');
const path = require('path');
const Activity = require('../models/Activity');
const RecentActivity = require('../models/RecentActivity')
const User = require('../models/User');
const Channel = require('../models/Channel');
const Agent = require('../models/Agent');
const Form = require('../models/Form');
const formatCurrency = require('../utils/helpers').formatCurrency;
const formatCurrencyShortForm = require('../utils/helpers').formatCurrencyShortForm;


// @desc    Get all activities
// @route   GET /api/activities
// @access  Public
exports.getActivities = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const activities = await Activity.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title');

    const count = await Activity.countDocuments();
    const activitiesWithAutoId = activities.map((activity, index) => ({
      ...activity.toObject(),
      autoId: (page - 1) * limit + index + 1,
    }));

    res.json({
      activities: activitiesWithAutoId,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Get activity by ID
// @route   GET /api/activities/:id
// @access  Public
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('createdBy', 'name email') 
      .populate('dependencies', 'title status') 
      .populate('discussions.user', 'name email') 
      .populate('collaborators', 'name email') 
      .populate('assignedTo', 'name forms phone') 
      .populate('forms'); 

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private
exports.createActivity = async (req, res) => {
  const { title, description, startDate, endDate, targetAudience, budget, channels, type, kpis, dependencies, status, assignedTo, forms } = req.body;

  // Ensure the user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  if (!status) {
    status = 'In Progress';
  } else if (new Date(endDate) < new Date()) {
    status = 'Completed';
  } else if (new Date(startDate) > new Date()) {
    status = 'Upcoming';
  } else {
    status = 'In Progress';
  } 

  const activity = new Activity({
    title,
    description,
    status,
    startDate,
    endDate,
    createdBy: req.user.id, // Use the authenticated user's ID
    targetAudience,
    budget,
    channels,
    type,
    kpis,
    dependencies,
    assignedTo, // Assign agents to the activity
    forms, // Tie forms to the activity
    discussion: [],
    feedback: null,
  });

  try {
    const savedActivity = await activity.save();

    // Assign the activity to the selected agents
    if (assignedTo && assignedTo.length > 0) {
      await Agent.updateMany(
        { _id: { $in: assignedTo } },
        { $push: { activities: savedActivity._id } }
      );
    }

    // Log recent activity
    await RecentActivity.create({
      type: "Activity Update",
      description: `New activity created: ${title}`,
      icon: "PiClockCountdownFill",
      user: req.user.name,
    });

    res.status(201).json(savedActivity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update an activity
// @route   PUT /api/activities/:id
// @access  Private
exports.updateActivity = async (req, res) => {
  const { id } = req.params;
  const { title, description, startDate, endDate, targetAudience, budget, channels, type, kpis, dependencies, status, assignedTo, forms } = req.body;

  try {
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    // Find the activity
    const activity = await Activity.findById(id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    // Log changes to history
    const changes = {};
    for (const key in req.body) {
      if (req.body[key] !== activity[key]) {
        changes[key] = req.body[key];
      }
    }

    if (Object.keys(changes).length > 0) {
      activity.history.push({
        user: req.user.id,
        action: 'Activity updated',
        details: `Updated by ${req.user.name}`,
        changes,
      });

      // Log recent activity
      await RecentActivity.create({
        type: "Activity Update",
        description: `Activity "${activity.title}" updated by ${req.user.name}`,
        icon: "PiClockCountdownFill",
        user: req.user.name,
      });
    }

    // Update assigned agents
    if (assignedTo && assignedTo.length > 0) {
      // Remove activity from previously assigned agents
      await Agent.updateMany(
        { activities: activity._id },
        { $pull: { activities: activity._id } }
      );

      // Add activity to newly assigned agents
      await Agent.updateMany(
        { _id: { $in: assignedTo } },
        { $push: { activities: activity._id } }
      );

      activity.assignedTo = assignedTo;
    }

    // Update forms tied to the activity
    if (forms) {
      activity.forms = forms;
    }

    // Update other fields
    if (title) activity.title = title;
    if (description) activity.description = description;
    if (startDate) activity.startDate = startDate;
    if (endDate) activity.endDate = endDate;
    if (targetAudience) activity.targetAudience = targetAudience;
    if (budget) activity.budget = budget;
    if (channels) activity.channels = channels;
    if (type) activity.type = type;
    if (kpis) activity.kpis = kpis;
    if (dependencies) activity.dependencies = dependencies;
    if (status) activity.status = status;

    const updatedActivity = await activity.save();

    res.json(updatedActivity);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await Activity.findByIdAndDelete(id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    // Log recent activity
    await RecentActivity.create({
      type: "Activity Update",
      description: `Activity "${activity.title}" deleted by ${req.user.name}`,
      icon: "PiClockCountdownFill",
      user: req.user.name,
    });

    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add a chat message to the discussion
// @route   POST /api/activities/:id/discussion
// @access  Private
exports.addDiscussionMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  try {
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    // Extract mentioned users from the message
    const mentions = (message.match(/@(\w+)/g) || []);
    const mentionedUsernames = mentions.map((mention) => mention.slice(1)); // Remove the '@' symbol

    // Find the mentioned users in the database
    const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } });

    // Add the message to the discussion
    activity.discussions.push({
      user: req.user.id, // Authenticated user
      message,
      mentions: mentionedUsers.map((user) => user._id), // Store mentioned user IDs
    });

    await activity.save();

    // Populate the user and mentions fields in discussions
    await activity.populate('discussions.user', 'name email');
    await activity.populate('discussions.mentions', 'name email');

    // Log recent activity
    await RecentActivity.create({
      type: "Comment",
      description: `New comment added to activity "${activity.title}" by ${req.user.name}`,
      icon: "BiCommentDetail",
      user: req.user.name,
    });

    // Notify mentioned users
    mentionedUsers.forEach((mentionedUser) => {
      // Send a notification to the mentioned user
      console.log(`Notifying ${mentionedUser.name}: You were mentioned by ${req.user.name}`);
      // You can integrate a notification service here (e.g., WebSockets, email, etc.)
    });

    res.status(201).json(activity.discussions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Add feedback when marking an activity as completed
// @route   POST /api/activities/:id/feedback
// @access  Private

exports.addFeedback = async (req, res) => {
  const { id } = req.params;
  const { comments } = req.body;
  const files = req.files?.map((file) => file.path); // Get file paths

  try {
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    // Ensure the activity is marked as completed
    if (activity.status !== 'Completed') {
      return res.status(400).json({ message: 'Activity must be marked as completed to add feedback.' });
    }

    // Ensure feedback hasn't already been added
    if (activity.feedback) {
      return res.status(400).json({ message: 'Feedback has already been added for this activity.' });
    }

    // Delete old files if feedback is being updated
    if (activity.feedback?.files) {
      activity.feedback.files.forEach((file) => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Delete the file
        }
      });
    }

    // Add feedback
    activity.feedback = {
      user: req.user.id, // Authenticated user
      comments,
      files,
    };

    await activity.save();

    // Log recent activity
    await RecentActivity.create({
      type: "Feedback",
      description: `Feedback added to activity "${activity.title}" by ${req.user.name}`,
      icon: "BiCommentDetail",
      user: req.user.name,
    });

    res.status(201).json(activity.feedback);
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ message: 'File size exceeds the limit of 5MB.' });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};


// @desc    Get summary data for all activities
// @route   GET /api/activities/summary
// @access  Public
exports.getActivitiesSummary = async (req, res) => {
  try {
    const activities = await Activity.find();

    const totalActivities = activities.length;
    const activeActivities = activities.filter((a) => a.status === 'In Progress').length;
    const completedActivities = activities.filter((a) => a.status === 'Completed').length;
    const pendingActivities = activities.filter((a) => a.status === 'Pending').length;
    const overdueActivities = activities.filter(
      (a) => new Date(a.endDate) < new Date() && a.status !== 'Completed'
    ).length;
    const totalBudget = activities.reduce((sum, a) => sum + (a.budget || 0), 0);
    const averageBudget =
      activities.length > 0
        ? activities.reduce((sum, a) => sum + (a.budget || 0), 0) / activities.length
        : 0;
    const activityDistributionByType = activities.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});
    const activityDistributionByStatus = activities.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    const activitySummary = [
      {
        label: "Total Activities",
        value: totalActivities.toString(),
        helpText: "Total number of activities",
      },
      {
        label: "Active Activities",
        value: activeActivities.toString(),
        helpText: "Activities currently in progress",
      },
      {
        label: "Completed Activities",
        value: completedActivities.toString(),
        helpText: "Activities that have been completed",
      },
      {
        label: "Pending Activities",
        value: pendingActivities.toString(),
        helpText: "Activities that are pending",
      },
      {
        label: "Overdue Activities",
        value: overdueActivities.toString(),
        helpText: "Activities that are overdue",
      },
      {
        label: "Total Budget",
        value: formatCurrencyShortForm(totalBudget),
        helpText: "Total budget for all activities",
      },
      {
        label: "Average Budget",
        value: formatCurrencyShortForm(averageBudget),
        helpText: "Average budget per activity",
      },
      {
        label: "Activity Distribution by Type",
        value: JSON.stringify(activityDistributionByType),
        helpText: "Distribution of activities by type",
      },
      {
        label: "Activity Distribution by Status",
        value: JSON.stringify(activityDistributionByStatus),
        helpText: "Distribution of activities by status",
      },
    ];

    res.json(activitySummary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Get summary data for a single activity
// @route   GET /api/activities/:id/summary
// @access  Public
exports.getActivitySummary = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id)
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title status');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const summary = {
      status: activity.status,
      progress: activity.progress || 0, // Assuming progress is a field in the model
      budgetUtilization: activity.budgetUtilization || 0, // Assuming budgetUtilization is a field
      timeRemaining: Math.ceil(
        (new Date(activity.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      ), // Days remaining
      dependencies: {
        total: activity.dependencies.length,
        completed: activity.dependencies.filter((d) => d.status === 'Completed').length,
      },
      kpis: activity.kpis || [], // Assuming kpis is a field in the model
      discussionCount: activity.discussion.length,
      feedback: activity.feedback || null,
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Get all channels
// @route   GET /api/channels
// @access  Public
exports.getChannels = async (req, res) => {
  try {
    // Fetch channels from the database
    const channels = await Channel.find(); // Assuming you have a Channel model
    res.json(channels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// @desc    Close an activity
// @route   PUT /api/activities/:id/close 
// @access  Private
exports.closeActivity = async (req, res) => {
  const { id } = req.params;

  try {
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    activity.status = 'closed';
    await activity.save();

    // Update all forms tied to this activity
    await Form.updateMany(
      { activity: id, stopOnActivityClose: true },
      { acceptResponses: false }
    );

    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Manually close a form
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

    res.json(form);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
