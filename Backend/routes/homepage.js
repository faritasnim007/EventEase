const express = require('express');
const router = express.Router();

// Serve homepage (for API-only backend, you’d just serve React from /build, but here's a placeholder route)
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to EventEase - Smart Campus Event Management System' });
});

module.exports = router;
