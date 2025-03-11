const Notification = require('../models/Notification');
const { getIo } = require('../utils/socket'); // Import getIo from socket.js

const createNotification = async (userId, type, message, link) => {
  try {
    const notification = new Notification({
      userId,
      type,
      message,
      link,
    });
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

const sendNotification = async (userId, type, message, link) => {
  // Create the notification in the database
  const notification = await createNotification(userId, type, message, link);

  // Emit the notification to the connected client
  if (notification) {
    const io = getIo();
    io.to(userId.toString()).emit('notification', notification);
    console.log(`Notification sent to user ${userId}:`, notification);
  }
};

module.exports = {
  createNotification,
  sendNotification,
};