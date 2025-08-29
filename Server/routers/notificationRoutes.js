const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
} = require('../controllers/notificationController');

router.use(authenticateUser);

router.route('/').get(getMyNotifications);
router.route('/stats').get(getNotificationStats);
router.route('/mark-all-read').patch(markAllAsRead);
router.route('/:notificationId/read').patch(markAsRead);
router.route('/:notificationId').delete(deleteNotification);

module.exports = router;