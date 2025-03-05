const Activity = require('../models/Activity');
const Form = require('../models/Form');
const Agent = require('../models/Agent');
const Request = require('../models/Request');
const RecentActivity = require('../models/RecentActivity'); 

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res) => {
  try {
    // Fetch all data in parallel
    const [activities, forms, agents, requests, recentActivities] = await Promise.all([
      Activity.find(),
      Form.find(),
      Agent.find(),
      Request.find(),
      RecentActivity.find().sort({ date: -1 }).limit(10), // Fetch the 10 most recent activities
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
      pendingRequests: requests.filter((r) => r.status === 'pending').length,
      approvedRequests: requests.filter((r) => r.status === 'approved').length,
      rejectedRequests: requests.filter((r) => r.status === 'rejected').length,
    };

    // Combine all metrics and recent activities
    const summary = {
      activityMetrics,
      formMetrics,
      agentMetrics,
      requestMetrics,
      recentActivities, // Include recent activities in the response
    };

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};