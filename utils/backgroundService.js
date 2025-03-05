const cron = require('node-cron');
const Activity = require('../models/Activity');
const RecentActivity = require('../models/RecentActivity');
const { sendNotification } = require('./notification');
const {getIO} = require('./socket'); 

// Schedule a job to run every day at midnight
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const activities = await Activity.find({ endDate: { $lt: now }, status: { $ne: 'Completed' } });

    for (const activity of activities) {
      activity.status = 'Completed';
      await activity.save();

      // Send a notification for completion
        const io = getIO();
      io.emit('activityNotification', {
        activityId: activity._id,
        message: `Activity "${activity.title}" has been marked as completed.`,
      });

      // Log recent activity for completion
      await RecentActivity.create({
        type: "Activity Update",
        description: `Activity "${activity.title}" marked as completed`,
        icon: "PiClockCountdownFill",
        user: 'System',
      });

      // Notify the user who created the activity
      const user = await User.findById(activity.createdBy);
      if (user) {
        await sendNotification(
          user.email,
          `Activity "${activity.title}" has been marked as completed`,
          'completed',
          activity,
          process.env.BASE_URL
        );
      }
    }

    
  } catch (error) {
    console.error('Error updating completed activities:', error);
  }
});