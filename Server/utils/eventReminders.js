const Event = require('../models/Event');
const Attendee = require('../models/Attendee');
const { createBulkNotifications, notificationTemplates } = require('./notificationService');

const sendEventReminders = async () => {
  try {
    console.log('Checking for events that need reminders...');

    // Calculate date 3 days from now
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);

    const endOfDay = new Date(threeDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    // Find events happening in 3 days
    const upcomingEvents = await Event.find({
      date: {
        $gte: threeDaysFromNow,
        $lte: endOfDay
      },
      status: 'published'
    });

    console.log(`Found ${upcomingEvents.length} events happening in 3 days`);

    for (const event of upcomingEvents) {
      // Get all registered attendees for this event
      const attendees = await Attendee.find({
        event: event._id,
        status: { $in: ['registered', 'attended'] }
      }).distinct('user');

      if (attendees.length > 0) {
        // Create reminder notifications
        const notificationData = notificationTemplates.eventReminder(event.title, 3);
        const notifications = attendees.map(userId => ({
          user: userId,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          relatedEvent: event._id,
        }));

        await createBulkNotifications(notifications);
        console.log(`Sent reminders to ${attendees.length} attendees for event: ${event.title}`);
      }
    }

    console.log('Event reminder check completed');
  } catch (error) {
    console.error('Error sending event reminders:', error);
  }
};

// Function to start the reminder scheduler
const startReminderScheduler = () => {
  // Run immediately on startup
  sendEventReminders();

  // Then run every 24 hours (86400000 milliseconds)
  setInterval(sendEventReminders, 24 * 60 * 60 * 1000);

  console.log('Event reminder scheduler started - will check daily at startup time');
};

module.exports = {
  sendEventReminders,
  startReminderScheduler,
};