const Notification = require('../models/Notification');

const createNotification = async ({
  user,
  title,
  message,
  type,
  relatedEvent = null,
  relatedUser = null
}) => {
  try {
    const notification = await Notification.create({
      user,
      title,
      message,
      type,
      relatedEvent,
      relatedUser,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

const createBulkNotifications = async (notifications) => {
  try {
    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

// Notification templates
const notificationTemplates = {
  eventRegistration: (eventTitle) => ({
    title: 'Event Registration Successful',
    message: `You have successfully registered for "${eventTitle}". We look forward to seeing you there!`,
    type: 'event_registration'
  }),

  eventRegistrationCancelled: (eventTitle) => ({
    title: 'Event Registration Cancelled',
    message: `Your registration for "${eventTitle}" has been cancelled. You can register again if you change your mind.`,
    type: 'event_registration_cancelled'
  }),

  eventReminder: (eventTitle, daysLeft) => ({
    title: 'Event Reminder',
    message: `Don't forget! "${eventTitle}" is coming up in ${daysLeft} days. Make sure you're prepared!`,
    type: 'event_reminder'
  }),

  organiserAssignment: (eventTitle, assignedBy) => ({
    title: 'Organiser Assignment',
    message: `You have been assigned as an organiser for "${eventTitle}" by ${assignedBy}.`,
    type: 'organiser_assignment'
  }),

  sponsorshipApproved: (eventTitle, amount) => ({
    title: 'Sponsorship Approved',
    message: `Your sponsorship of $${amount} for "${eventTitle}" has been approved. Thank you for your support!`,
    type: 'sponsorship_update'
  }),

  sponsorshipRejected: (eventTitle, reason) => ({
    title: 'Sponsorship Update',
    message: `Your sponsorship request for "${eventTitle}" was not approved. Reason: ${reason}`,
    type: 'sponsorship_update'
  }),

  eventDeleted: (eventTitle) => ({
    title: 'Event Cancelled',
    message: `Unfortunately, "${eventTitle}" has been cancelled. We apologize for any inconvenience.`,
    type: 'event_deleted'
  }),

  userBanned: (reason, bannedBy) => ({
    title: 'Account Restricted',
    message: `Your account has been temporarily restricted by ${bannedBy}. Reason: ${reason}. Please contact support for more information.`,
    type: 'user_banned'
  }),

  userUnbanned: (unbannedBy) => ({
    title: 'Account Restriction Lifted',
    message: `Your account restriction has been lifted by ${unbannedBy}. You can now access all features again.`,
    type: 'user_unbanned'
  }),

  roleChangeWithEvent: (eventTitle, assignedBy) => ({
    title: 'New Role & Event Assignment',
    message: `You have been promoted to organiser and assigned to manage "${eventTitle}" by ${assignedBy}. Please review and publish the event when ready.`,
    type: 'role_change_with_events'
  }),

  roleChangeWithEvents: (eventCount, assignedBy) => ({
    title: 'New Role & Multiple Event Assignment',
    message: `You have been promoted to organiser and assigned to manage ${eventCount} event${eventCount > 1 ? 's' : ''} by ${assignedBy}.`,
    type: 'role_change_with_events'
  }),

  roleChange: (newRole, changedBy) => ({
    title: 'Role Updated',
    message: `Your role has been changed to ${newRole} by ${changedBy}.`,
    type: 'role_change_with_events'
  })
};

module.exports = {
  createNotification,
  createBulkNotifications,
  notificationTemplates,
};