const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  createSponsorship,
  getEventSponsorships,
  updateSponsorshipStatus,
  getMySponsorships,
} = require('../controllers/sponsorshipController');

router.use(authenticateUser);

// User routes
router.route('/sponsor/:eventId').post(createSponsorship);
router.route('/my-sponsorships').get(getMySponsorships);

// Admin/Organiser routes
router
  .route('/event/:eventId')
  .get(authorizePermissions('admin', 'organiser'), getEventSponsorships);

router
  .route('/:sponsorshipId/status')
  .patch(authorizePermissions('admin', 'organiser'), updateSponsorshipStatus);

module.exports = router;