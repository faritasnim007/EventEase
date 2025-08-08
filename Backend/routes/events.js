const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// ---- Multer setup for photo uploads ----
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // local folder. Make sure it's created!
  },
  filename: function (req, file, cb) {
    // Unique filename includes timestamp
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// ---- ROUTES ----

// CREATE
router.post('/', authMiddleware, async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// EDIT/UPDATE
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET ALL EVENTS (for listing)
router.get('/', async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
});

// GET EVENT BY ID (for edit form)
router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.json(event);
});

// ---- PHOTO UPLOAD ROUTE ----
// POST /api/events/:id/photos
router.post('/:id/photos', authMiddleware, upload.array('photos', 10), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // save uploaded image urls/paths
    const photos = req.files.map(file => `/uploads/${file.filename}`);
    event.photos.push(...photos);

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading photos' });
  }
});

module.exports = router;
