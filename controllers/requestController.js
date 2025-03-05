const Request = require('../models/Request');
const RequestHistory = require('../models/RequestHistory');
const RequestCopy = require('../models/RequestCopy');
const RecentActivity = require('../models/RecentActivity');
const User = require('../models/User');
const { sendNotification } = require('../utils/notification');

// Create a new request

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private

exports.createRequest = async (req, res) => {
  try {
    const { requested_by, request_title, description, items } = req.body;
    const user_id = req.user.id; // Assuming user ID is available in the request

    const newRequest = new Request({
      user_id,
      requested_by,
      request_title,
      description,
      items,
    });

    await newRequest.save();

    // Log history
    await RequestHistory.create({
      request_id: newRequest._id,
      action: 'created',
      action_by: user_id,
    });

    // Log recent activity
    await RecentActivity.create({
      type: "Request Update",
      description: `New request created: ${request_title}`,
      icon: "RiShoppingCart2Fill",
      user: requested_by, // Use the name of the requester
    });

    // Notify admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await sendNotification(
        admin.email,
        'New Request Created',
        'created',
        newRequest,
        process.env.BASE_URL // e.g., 'http://localhost:5000'
      );
    }

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating request', error });
  }
};

// Update a request

// @desc    Update a request
// @route   PUT /api/requests/:id
// @access  Private

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes, items } = req.body; // Use `items` directly from the payload
    const user_id = req.user.id;

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (action === 'modified' && items) {
      // Create a copy of the original request
      const requestCopyData = request.toObject();
      delete requestCopyData._id;

      const requestCopy = new RequestCopy({
        original_request_id: request._id,
        ...requestCopyData,
      });
      await requestCopy.save();

      // Update the original request
      if (items.add) {
        request.items = [...request.items, ...items.add];
      }

      if (items.remove) {
        request.items = request.items.filter(
          item => !items.remove.some(
            removeItem => removeItem._id === item._id.toString()
          )
        );
      }

      if (items.update) {
        items.update.forEach(updateItem => {
          const itemIndex = request.items.findIndex(item => item._id.toString() === updateItem._id);
          if (itemIndex !== -1) {
            request.items[itemIndex] = { ...request.items[itemIndex].toObject(), ...updateItem };
          }
        });
      }

      request.updated_at = Date.now();
      await request.save();

      // Log recent activity for modification
      await RecentActivity.create({
        type: "Request Update",
        description: `Request "${request.request_title}" modified by ${req.user.name}`,
        icon: "RiShoppingCart2Fill",
        user: req.user.name,
      });
    } else {
      request.status = action;
      request.updated_at = Date.now();
      await request.save();

      // Log recent activity for status change
      await RecentActivity.create({
        type: "Request Update",
        description: `Request "${request.request_title}" ${action} by ${req.user.name}`,
        icon: "RiShoppingCart2Fill",
        user: req.user.name,
      });
    }

    // Log history
    await RequestHistory.create({
      request_id: request._id,
      action,
      action_by: user_id,
      notes,
    });

    // Notify user
    const user = await User.findById(request.user_id);
    if (user) {
      await sendNotification(
        user.email,
        `Request ${action}`,
        action,
        request,
        process.env.BASE_URL
      );
    }

    res.status(200).json(request);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Error updating request', error });
  }
};

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate('user_id', 'username');

    // add autoId to each request
    const requestsWithAutoId = requests.map((request, index) => ({
      autoId: index + 1,
      ...request.toObject(),
    }));

    res.status(200).json(requestsWithAutoId);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error });
  }
};

// Get a single request
exports.getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id).populate('user_id', 'username');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching request', error });
  }
};


// Get request history
exports.getRequestHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await RequestHistory.find({ request_id: id }).populate('action_by', 'name email');
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching request history', error });
  }
};

// @desc    Get summary data for all stock requests
// @route   GET /api/requests/summary
// @access  Public
exports.getRequestSummary = async (req, res) => {
  try {
    const requests = await Request.find();

    const totalRequests = requests.length;
    const pendingRequests = requests.filter((r) => r.status === 'pending').length;
    const approvedRequests = requests.filter((r) => r.status === 'approved').length;
    const rejectedRequests = requests.filter((r) => r.status === 'rejected').length;
    const modifiedRequests = requests.filter((r) => r.status === 'modified').length;

    const requestSummary = [
      {
        label: "Total Requests",
        value: totalRequests.toString(),
        helpText: "Total number of stock requests",
      },
      {
        label: "Pending Requests",
        value: pendingRequests.toString(),
        helpText: "Requests currently pending approval",
      },
      {
        label: "Approved Requests",
        value: approvedRequests.toString(),
        helpText: "Requests that have been approved",
      },
      {
        label: "Rejected Requests",
        value: rejectedRequests.toString(),
        helpText: "Requests that have been rejected",
      },
      {
        label: "Modified Requests",
        value: modifiedRequests.toString(),
        helpText: "Requests that have been modified",
      },
    ];

    res.json(requestSummary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a request

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Private


exports.deleteRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await Request.findByIdAndDelete(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Log recent activity
    await RecentActivity.create({
      type: "Request Update",
      description: `Request "${request.request_title}" deleted by ${req.user.name}`,
      icon: "RiShoppingCart2Fill",
      user: req.user.name,
    });

    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};