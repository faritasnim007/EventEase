const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  submitFeedback,
  getEventFeedback,
  getPublicEventFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');

// Public routes
router.route('/public/:eventId').get(getPublicEventFeedback);

router.use(authenticateUser);

// User routes
router.route('/submit/:eventId').post(submitFeedback);
router.route('/my-feedback').get(getMyFeedback);
router.route('/:feedbackId').patch(updateFeedback).delete(deleteFeedback);

// Admin/Organiser routes
router
  .route('/event/:eventId')
  .get(authorizePermissions('admin', 'organiser'), getEventFeedback);

module.exports = router;