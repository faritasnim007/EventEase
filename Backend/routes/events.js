const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth'); // to protect routes

// Create event
router.post('/', authMiddleware, async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Edit event (by ID)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Delete event
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event' });
  }
});

// Get all events (optionally with filters)
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, club } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (club) filter.club = club;
    if (startDate || endDate) filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);

    const events = await Event.find(filter).populate('attendees').exec();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

module.exports = router;
