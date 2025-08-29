const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  banUser,
  unbanUser,
  changeUserRole,
  getDashboardData,
} = require('../controllers/userController');

router
  .route('/')
  .get(authenticateUser, authorizePermissions('admin'), getAllUsers);

router.route('/showMe').get(authenticateUser, showCurrentUser);
router.route('/dashboard').get(authenticateUser, getDashboardData);
router.route('/updateUser').patch(authenticateUser, updateUser);
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);

// Organiser only routes
router
  .route('/:id/ban')
  .patch(authenticateUser, authorizePermissions('admin', 'organiser'), banUser);

router
  .route('/:id/unban')
  .patch(authenticateUser, authorizePermissions('admin', 'organiser'), unbanUser);


// Admin only routes
router
  .route('/:id/change-role')
  .patch(authenticateUser, authorizePermissions('admin'), changeUserRole);

router.route('/:id').get(authenticateUser, getSingleUser);

module.exports = router;