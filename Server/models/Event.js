const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
      maxlength: 1000,
    },
    startDate: {
      type: Date,
    },
    location: {
      type: String,
      required: [true, 'Please provide event location'],
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, 'Please provide event category'],
      enum: ['academic', 'cultural', 'sports', 'workshop', 'seminar', 'social', 'other'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    allowSponsorship: {
      type: Boolean,
      default: false,
    },
    sponsorshipRequirements: {
      type: String,
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedOrganisers: [{
      type: mongoose.Types.ObjectId,
      ref: 'User',
    }],
    maxAttendees: {
      type: Number,
      default: null, // null means unlimited
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    registrationDeadline: {
      type: Date,
    },
    tags: [{
      type: String,
      maxlength: 30,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for attendee count
EventSchema.virtual('attendeeCount', {
  ref: 'Attendee',
  localField: '_id',
  foreignField: 'event',
  count: true,
});

// Virtual for sponsor count
EventSchema.virtual('sponsorCount', {
  ref: 'Sponsorship',
  localField: '_id',
  foreignField: 'event',
  count: true,
});

module.exports = mongoose.model('Event', EventSchema);