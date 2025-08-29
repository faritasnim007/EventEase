const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  assignOrganiser,
  removeOrganiser,
  getMyEvents,
  getEventStats,
} = require('../controllers/eventController');

// Public routes
router.route('/').get(getAllEvents);
router.route('/:id').get(getSingleEvent);

// Protected routes
router.use(authenticateUser);

router.route('/my/events').get(getMyEvents);
router.route('/stats/:id').get(getEventStats);

// Admin only routes
router
  .route('/')
  .post(authorizePermissions('admin', 'organiser'), createEvent);

router
  .route('/:id')
  .patch(authorizePermissions('admin', 'organiser'), updateEvent)
  .delete(authorizePermissions('admin'), deleteEvent);

router
  .route('/:id/assign-organiser')
  .post(authorizePermissions('admin'), assignOrganiser);

router
  .route('/:id/remove-organiser')
  .delete(authorizePermissions('admin'), removeOrganiser);

module.exports = router;