const Request = require('../models/Request');
const RequestHistory = require('../models/RequestHistory');
const RequestCopy = require('../models/RequestCopy');
const User = require('../models/User');
const { sendNotification } = require('../utils/notification');

// Create a new request
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

// Approve/Reject/Modify Request
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes, modified_data } = req.body;
    const user_id = req.user.id; // Assuming user ID is available in the request

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (action === 'modified' && modified_data) {
      // Create a copy of the original request
      const requestCopy = new RequestCopy({
        original_request_id: request._id,
        ...request.toObject(),
      });
      await requestCopy.save();

      // Update the original request
      if (modified_data.items) {
        request.items = modified_data.items;
      }
      await request.save();
    } else {
      request.status = action;
      await request.save();
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
    res.status(500).json({ message: 'Error updating request', error });
  }
};

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate('user_id', 'username');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error });
  }
};

// Get request history
exports.getRequestHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await RequestHistory.find({ request_id: id }).populate('action_by', 'username');
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching request history', error });
  }
};