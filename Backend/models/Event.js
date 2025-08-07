const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String },
  photos: [{ type: String }], // URLs/paths to uploaded photos
  category: { type: String },
  club: { type: String },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  feedback: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String
  }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
