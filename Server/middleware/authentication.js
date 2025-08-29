const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const authenticateUser = async (req, res, next) => {
  // Check for Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid - No token provided');
  }

  try {
    const payload = isTokenValid(token);

    // Get fresh user data to check ban status
    const User = require('../models/User');
    const currentUser = await User.findById(payload.user.userId).select('isBanned');

    if (!currentUser) {
      throw new CustomError.UnauthenticatedError('Authentication Invalid - User not found');
    }

    req.user = { ...payload.user, isBanned: currentUser.isBanned || false };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
