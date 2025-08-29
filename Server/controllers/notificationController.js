const Notification = require('../models/Notification');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const getMyNotifications = async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;
  const userId = req.user.userId;

  const query = { user: userId };
  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  const notifications = await Notification.find(query)
    .populate('relatedEvent', 'title date')
    .populate('relatedUser', 'name')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    user: userId,
    isRead: false
  });

  res.status(StatusCodes.OK).json({
    notifications,
    unreadCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

const markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.userId;

  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId
  });

  if (!notification) {
    throw new CustomError.NotFoundError('Notification not found');
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(StatusCodes.OK).json({
    msg: 'Notification marked as read',
    notification
  });
};

const markAllAsRead = async (req, res) => {
  const userId = req.user.userId;

  await Notification.updateMany(
    { user: userId, isRead: false },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  res.status(StatusCodes.OK).json({
    msg: 'All notifications marked as read'
  });
};

const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.userId;

  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId
  });

  if (!notification) {
    throw new CustomError.NotFoundError('Notification not found');
  }

  await Notification.findByIdAndDelete(notificationId);

  res.status(StatusCodes.OK).json({
    msg: 'Notification deleted successfully'
  });
};

const getNotificationStats = async (req, res) => {
  const userId = req.user.userId;

  const stats = await Notification.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
        }
      }
    }
  ]);

  const totalNotifications = await Notification.countDocuments({ user: userId });
  const totalUnread = await Notification.countDocuments({
    user: userId,
    isRead: false
  });

  res.status(StatusCodes.OK).json({
    stats: {
      total: totalNotifications,
      unread: totalUnread,
      typeBreakdown: stats
    }
  });
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
};