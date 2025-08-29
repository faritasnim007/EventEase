const mongoose = require('mongoose');

const AttendeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'no-show', 'cancelled'],
      default: 'registered',
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    bannedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    bannedAt: Date,
    bannedReason: String,
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one registration per user per event
AttendeeSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Attendee', AttendeeSchema);