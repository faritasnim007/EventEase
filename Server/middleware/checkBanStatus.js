const CustomError = require('../errors');

const checkBanStatus = (req, res, next) => {
  // Only check ban status if user exists and is banned
  if (!req.user || !req.user.isBanned) {
    return next();
  }

  // Allow banned users to only view events and access basic routes
  const allowedRoutes = [
    '/api/v1/events', // GET only for viewing events
    '/api/v1/users/showMe', // View own profile
    '/api/v1/users/dashboard', // View dashboard
    '/api/v1/notifications', // View notifications
  ];

  const currentRoute = req.originalUrl.split('?')[0]; // Remove query parameters
  const method = req.method;

  // Check if the route is allowed for banned users
  const isRouteAllowed = allowedRoutes.some(route => currentRoute.startsWith(route));

  // For events route, only allow GET requests
  if (currentRoute.startsWith('/api/v1/events') && method !== 'GET') {
    throw new CustomError.UnauthorizedError('Your account is restricted. You can only view events.');
  }

  // For other routes, check if they're in the allowed list and only allow GET methods
  if (!isRouteAllowed || method !== 'GET') {
    throw new CustomError.UnauthorizedError('Your account is restricted. Please contact support.');
  }

  next();
};

module.exports = checkBanStatus;