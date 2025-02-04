const fs = require('fs');
const path = require('path');
const Activity = require('../models/Activity');

// @desc    Get all activities
// @route   GET /api/activities
// @access  Public
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('createdBy', 'name email')
      .populate('dependencies', 'title');
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private
exports.createActivity = async (req, res) => {
  const { title, description, startDate, endDate, targetAudience, budget, channels, type, kpis, dependencies } = req.body;

  // Ensure the user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  const activity = new Activity({
    title,
    description,
    status: 'Pending', // Default status
    startDate,
    endDate,
    createdBy: req.user.id, // Use the authenticated user's ID
    targetAudience,
    budget,
    channels,
    type,
    kpis,
    dependencies,
    discussion: [],
    feedback: null,
  });

  try {
    const savedActivity = await activity.save();
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
  const updates = req.body;

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
    for (const key in updates) {
      if (updates[key] !== activity[key]) {
        changes[key] = updates[key];
      }
    }

    if (Object.keys(changes).length > 0) {
      activity.history.push({
        user: req.user.id, // User who made the change
        action: 'Activity updated',
        details: `Updated by ${req.user.name}`,
        changes, // Object containing the changes
      });

      // Send a notification if the activity is marked as completed
      if (updates.status === 'Completed') {
        io.emit('activityNotification', {
          activityId: id,
          message: `Activity "${activity.title}" has been marked as completed.`,
        });
      }
    }

    // Update the activity
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true }
    );

    // Send a notification for general updates
    io.emit('activityNotification', {
      activityId: id,
      message: `Activity "${activity.title}" has been updated.`,
    });

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

    // Add the message to the discussion
    activity.discussions.push({
      user: req.user.id, // Authenticated user
      message,
    });

    await activity.save();
    res.status(201).json(activity.discussion);
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

    const summary = {
      totalActivities: activities.length,
      activeActivities: activities.filter((a) => a.status === 'In Progress').length,
      completedActivities: activities.filter((a) => a.status === 'Completed').length,
      pendingActivities: activities.filter((a) => a.status === 'Pending').length,
      overdueActivities: activities.filter(
        (a) => new Date(a.endDate) < new Date() && a.status !== 'Completed'
      ).length,
      totalBudget: activities.reduce((sum, a) => sum + (a.budget || 0), 0),
      averageBudget:
        activities.length > 0
          ? activities.reduce((sum, a) => sum + (a.budget || 0), 0) / activities.length
          : 0,
      activityDistributionByType: activities.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {}),
      activityDistributionByStatus: activities.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json(summary);
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