const mongoose = require('mongoose');

const SponsorshipSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Please provide sponsorship amount'],
      min: [1, 'Sponsorship amount must be at least 1'],
    },
    message: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    rejectedReason: String,
  },
  { timestamps: true }
);

// Compound index to ensure one sponsorship per user per event
SponsorshipSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Sponsorship', SponsorshipSchema);