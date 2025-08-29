const User = require('../models/User');
const Event = require('../models/Event');
const Attendee = require('../models/Attendee');
const Sponsorship = require('../models/Sponsorship');
const Feedback = require('../models/Feedback');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { createTokenUser, attachCookiesToResponse } = require('../utils');
const { createNotification, notificationTemplates } = require('../utils/notificationService');

const getAllUsers = async (req, res) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    query.role = role;
  }

  const users = await User.find(query)
    .select('-password')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.status(StatusCodes.OK).json({
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const {
    email,
    name,
    age,
    gender,
    phone,
    department,
    year,
    interests,
    bio,
    profileImage
  } = req.body;

  if (!email || !name) {
    throw new CustomError.BadRequestError('Please provide email and name');
  }

  const user = await User.findOne({ _id: req.user.userId });

  // Update basic info
  user.email = email;
  user.name = name;
  

  // Update demographic data (optional fields)
  if (age !== undefined) user.age = age;
  if (gender !== undefined) user.gender = gender;
  if (phone !== undefined) user.phone = phone;
  if (department !== undefined) user.department = department;
  if (year !== undefined) user.year = year;
  if (interests !== undefined) user.interests = interests;
  if (bio !== undefined) user.bio = bio;
  if (profileImage !== undefined) user.profileImage = profileImage;


  const rs = await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

const banUser = async (req, res) => {
  const { id } = req.params;
  // const { reason } = req.body;

  // if (!reason) {
  //   throw new CustomError.BadRequestError('Please provide a reason for banning');
  // }

  const reason = "you have been banned due to bad behaviour"

  const user = await User.findById(id);
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${id}`);
  }

  if (user.role === 'admin') {
    throw new CustomError.BadRequestError('Cannot ban admin users');
  }

  user.isBanned = true;
  user.bannedBy = req.user.userId;
  user.bannedAt = new Date();
  user.bannedReason = reason;

  await user.save();

  // Send notification to the banned user
  const bannedByUser = await User.findById(req.user.userId);
  const notificationData = notificationTemplates.userBanned(reason, bannedByUser.name);
  await createNotification({
    user: id,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type,
    relatedUser: req.user.userId,
  });

  res.status(StatusCodes.OK).json({ msg: 'User banned successfully' });
};

const unbanUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${id}`);
  }

  user.isBanned = false;
  user.bannedBy = undefined;
  user.bannedAt = undefined;
  user.bannedReason = undefined;

  await user.save();

  // Send notification to the unbanned user
  const unbannedByUser = await User.findById(req.user.userId);
  const notificationData = notificationTemplates.userUnbanned(unbannedByUser.name);
  await createNotification({
    user: id,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type,
    relatedUser: req.user.userId,
  });

  res.status(StatusCodes.OK).json({ msg: 'User unbanned successfully' });
};

const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role, eventIds } = req.body;

  if (!role) {
    throw new CustomError.BadRequestError('Please provide a role');
  }

  if (!['admin', 'organiser', 'user'].includes(role)) {
    throw new CustomError.BadRequestError('Invalid role provided');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${id}`);
  }

  // Prevent changing own role if you're the only admin
  if (req.user.userId === id && req.user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 1 && role !== 'admin') {
      throw new CustomError.BadRequestError('Cannot change role - you are the only admin');
    }
  }

  const oldRole = user.role;
  user.role = role;
  await user.save();

  let assignedEvents = [];

  // If changing to organiser and event IDs are provided, assign to existing events
  if (role === 'organiser' && eventIds && eventIds.length > 0) {
    const Event = require('../models/Event');

    // Find all events to assign
    const eventsToAssign = await Event.find({
      _id: { $in: eventIds },
      status: { $ne: 'cancelled' } // Don't assign to cancelled events
    });

    if (eventsToAssign.length === 0) {
      throw new CustomError.BadRequestError('No valid events found to assign');
    }

    // Assign organiser to each event
    for (const event of eventsToAssign) {
      if (!event.assignedOrganisers.includes(id)) {
        event.assignedOrganisers.push(id);
        await event.save();
      }
    }

    // Get updated events with populated data
    assignedEvents = await Event.find({ _id: { $in: eventIds } })
      .populate('createdBy', 'name email')
      .populate('assignedOrganisers', 'name email');

    // Send notifications to the new organiser for each assigned event
    const { createNotification, createBulkNotifications, notificationTemplates } = require('../utils/notificationService');
    const adminUser = await User.findById(req.user.userId);

    const notifications = assignedEvents.map(event => ({
      user: id,
      title: 'New Event Assignment',
      message: `You have been promoted to organiser and assigned to manage "${event.title}" by ${adminUser.name}.`,
      type: 'role_change_with_events',
      relatedEvent: event._id,
      relatedUser: req.user.userId,
    }));

    await createBulkNotifications(notifications);
  } else if (oldRole !== role) {
    // Send notification for role change without event assignment
    const adminUser = await User.findById(req.user.userId);
    const notificationData = notificationTemplates.roleChange(role, adminUser.name);
    await createNotification({
      user: id,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      relatedUser: req.user.userId,
    });
  }

  const updatedUser = await User.findById(id).select('-password');

  const response = {
    msg: `User role updated to ${role}`,
    user: updatedUser
  };

  if (assignedEvents.length > 0) {
    response.assignedEvents = assignedEvents;
    response.msg += ` and assigned to ${assignedEvents.length} event${assignedEvents.length > 1 ? 's' : ''}`;
  }

  res.status(StatusCodes.OK).json(response);
};

const getDashboardData = async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Get user profile with demographic data
  const user = await User.findById(userId).select('-password');

  let dashboardData = {
    user,
    stats: {},
    recentActivity: {},
  };

  if (userRole === 'admin') {
    // Admin dashboard data
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalAttendees = await Attendee.countDocuments();
    const totalSponsorships = await Sponsorship.countDocuments();

    // Recent events
    const recentEvents = await Event.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // User demographics
    const userDemographics = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const genderDistribution = await User.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentDistribution = await User.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    dashboardData.stats = {
      totalUsers,
      totalEvents,
      totalAttendees,
      totalSponsorships,
      userDemographics,
      genderDistribution,
      departmentDistribution,
    };

    dashboardData.recentActivity = {
      recentEvents,
    };

  } else if (userRole === 'organiser') {
    // Organiser dashboard data
    const assignedEvents = await Event.find({
      assignedOrganisers: userId
    }).countDocuments();

    const myEvents = await Event.find({ assignedOrganisers: userId })
      .populate('attendeeCount')
      .populate('sponsorCount')
      .sort({ startDate: 1 })
      .limit(5);

    const totalAttendees = await Attendee.countDocuments({
      event: { $in: await Event.find({ assignedOrganisers: userId }).distinct('_id') }
    });

    dashboardData.stats = {
      assignedEvents,
      totalAttendees,
    };

    dashboardData.recentActivity = {
      myEvents,
    };

  } else {
    // Regular user dashboard data - only show registered events
    const myRegisteredEvents = await Attendee.countDocuments({
      user: userId,
      status: 'registered'
    });

    // Count upcoming events the user is registered for
    const upcomingEventsCount = await Attendee.aggregate([
      {
        $match: {
          user: userId,
          status: 'registered'
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      {
        $unwind: '$eventDetails'
      },
      {
        $match: {
          'eventDetails.startDate': { $gte: new Date() }
        }
      },
      {
        $count: 'upcomingCount'
      }
    ]);

    const upcomingCount = upcomingEventsCount.length > 0 ? upcomingEventsCount[0].upcomingCount : 0;

    // Get registered events (both upcoming and past)
    const registeredEvents = await Attendee.find({
      user: userId,
      status: 'registered'
    })
      .populate({
        path: 'event',
        select: 'title startDate location category status'
      })
      .sort({ 'event.startDate': 1 })
      .limit(10);

    // Filter out null events and separate upcoming vs past
    const validEvents = registeredEvents.filter(item => item.event);
    const now = new Date();
    const upcomingEvents = validEvents.filter(item => new Date(item.event.startDate) >= now);
    const pastEvents = validEvents.filter(item => new Date(item.event.startDate) < now);

    dashboardData.stats = {
      myRegisteredEvents,
      upcomingEventsCount: upcomingCount,
    };

    dashboardData.recentActivity = {
      upcomingEvents,
      pastEvents: pastEvents.slice(0, 3), // Show last 3 past events
    };
  }

  res.status(StatusCodes.OK).json(dashboardData);
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  banUser,
  unbanUser,
  changeUserRole,
  getDashboardData,
};