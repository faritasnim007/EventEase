const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide notification title'],
      maxlength: 100,
    },
    message: {
      type: String,
      required: [true, 'Please provide notification message'],
      maxlength: 500,
    },
    type: {
      type: String,
      enum: [
        'event_registration',
        'event_registration_cancelled',
        'event_reminder',
        'organiser_assignment',
        'sponsorship_update',
        'event_deleted',
        'user_banned',
        'user_unbanned',
        'role_change_with_events',
        'general'
      ],
      required: true,
    },
    relatedEvent: {
      type: mongoose.Types.ObjectId,
      ref: 'Event',
    },
    relatedUser: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  { timestamps: true }
);

// Index for efficient queries
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);