const Activity = require('../models/Activity');
const Form = require('../models/Form');
const Agent = require('../models/Agent');
const Request = require('../models/Request');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res) => {
  try {
    // Fetch all data in parallel
    const [activities, forms, agents, requests] = await Promise.all([
      Activity.find(),
      Form.find(),
      Agent.find(),
      Request.find(),
    ]);

    // Calculate activity metrics
    const activityMetrics = {
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

    // Calculate form metrics
    const formMetrics = {
      totalForms: forms.length,
      assignedForms: forms.filter((f) => f.status === 'Assigned').length,
      submittedForms: forms.filter((f) => f.status === 'Submitted').length,
      pendingReviewForms: forms.filter((f) => f.status === 'Pending Review').length,
    };

    // Calculate agent metrics
    const agentMetrics = {
      totalAgents: agents.length,
      activeAgents: agents.filter((a) => a.status === 'Active').length,
      inactiveAgents: agents.filter((a) => a.status === 'Inactive').length,
    };

    // Calculate request metrics
    const requestMetrics = {
      totalRequests: requests.length,
      pendingRequests: requests.filter((r) => r.status === 'Pending').length,
      approvedRequests: requests.filter((r) => r.status === 'Approved').length,
      rejectedRequests: requests.filter((r) => r.status === 'Rejected').length,
    };

    // Combine all metrics
    const summary = {
      activityMetrics,
      formMetrics,
      agentMetrics,
      requestMetrics,
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get activity-related metrics
// @route   GET /api/dashboard/activities
// @access  Private
exports.getActivityMetrics = async (req, res) => {
  try {
    const activities = await Activity.find();
    const activityMetrics = {
      totalActivities: activities.length,
      activeActivities: activities.filter((a) => a.status === 'In Progress').length,
      completedActivities: activities.filter((a) => a.status === 'Completed').length,
      pendingActivities: activities.filter((a) => a.status === 'Pending').length,
      overdueActivities: activities.filter(
        (a) => new Date(a.endDate) < new Date() && a.status !== 'Completed'
      ).length,
    };
    res.json(activityMetrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get form-related metrics
// @route   GET /api/dashboard/forms
// @access  Private
exports.getFormMetrics = async (req, res) => {
  try {
    const forms = await Form.find();
    const formMetrics = {
      totalForms: forms.length,
      assignedForms: forms.filter((f) => f.status === 'Assigned').length,
      submittedForms: forms.filter((f) => f.status === 'Submitted').length,
      pendingReviewForms: forms.filter((f) => f.status === 'Pending Review').length,
    };
    res.json(formMetrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get agent-related metrics
// @route   GET /api/dashboard/agents
// @access  Private
exports.getAgentMetrics = async (req, res) => {
  try {
    const agents = await Agent.find();
    const agentMetrics = {
      totalAgents: agents.length,
      activeAgents: agents.filter((a) => a.status === 'Active').length,
      inactiveAgents: agents.filter((a) => a.status === 'Inactive').length,
    };
    res.json(agentMetrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get request-related metrics
// @route   GET /api/dashboard/requests
// @access  Private
exports.getRequestMetrics = async (req, res) => {
  try {
    const requests = await Request.find();
    const requestMetrics = {
      totalRequests: requests.length,
      pendingRequests: requests.filter((r) => r.status === 'Pending').length,
      approvedRequests: requests.filter((r) => r.status === 'Approved').length,
      rejectedRequests: requests.filter((r) => r.status === 'Rejected').length,
    };
    res.json(requestMetrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};