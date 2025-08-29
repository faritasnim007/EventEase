const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  rsvpToEvent,
  cancelRSVP,
  getEventAttendees,
  updateAttendeeStatus,
  banAttendee,
  unbanAttendee,
  getMyRSVPs,
} = require('../controllers/attendeeController');

router.use(authenticateUser);

// User routes
router.route('/rsvp/:eventId').post(rsvpToEvent);
router.route('/cancel/:eventId').delete(cancelRSVP);
router.route('/my-rsvps').get(getMyRSVPs);

// Admin/Organiser routes
router
  .route('/event/:eventId')
  .get(authorizePermissions('admin', 'organiser'), getEventAttendees);

router
  .route('/:attendeeId/status')
  .patch(authorizePermissions('admin', 'organiser'), updateAttendeeStatus);

router
  .route('/:attendeeId/ban')
  .patch(authorizePermissions('admin', 'organiser'), banAttendee);

router
  .route('/:attendeeId/unban')
  .patch(authorizePermissions('admin', 'organiser'), unbanAttendee);

module.exports = router;