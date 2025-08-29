const Event = require('../models/Event');
const User = require('../models/User');
const Attendee = require('../models/Attendee');
const Sponsorship = require('../models/Sponsorship');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');
const { createNotification, createBulkNotifications, notificationTemplates } = require('../utils/notificationService');

const createEvent = async (req, res) => {
  req.body.createdBy = req.user.userId;

  // Ensure backward compatibility - if startDate is provided but date is not, use startDate as date
  if (req.body.startDate && !req.body.date) {
    req.body.date = req.body.startDate;
  }

  // Validate dates are valid
  if (req.body.startDate && isNaN(new Date(req.body.startDate))) {
    throw new CustomError.BadRequestError('Invalid start date provided');
  }

  if (req.body.registrationDeadline && isNaN(new Date(req.body.registrationDeadline))) {
    throw new CustomError.BadRequestError('Invalid registration deadline provided');
  }

  // Validate that registration deadline is before start date
  if (req.body.registrationDeadline && req.body.startDate) {
    const registrationDeadline = new Date(req.body.registrationDeadline);
    const startDate = new Date(req.body.startDate);

    if (registrationDeadline >= startDate) {
      throw new CustomError.BadRequestError('Registration deadline must be before the event start date');
    }
  }

  const event = await Event.create(req.body);
  res.status(StatusCodes.CREATED).json({ event });
};

const getAllEvents = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    category = '',
    status = 'published',
    sortBy = 'date',
    sortOrder = 'asc'
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (status) {
    query.status = status;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const events = await Event.find(query)
    .populate('createdBy', 'name email')
    .populate('assignedOrganisers', 'name email')
    .populate('attendeeCount')
    .populate('sponsorCount')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sortOptions);

  const total = await Event.countDocuments(query);

  res.status(StatusCodes.OK).json({
    events,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

const getSingleEvent = async (req, res) => {
  const { id: eventId } = req.params;

  const event = await Event.findOne({ _id: eventId })
    .populate('createdBy', 'name email')
    .populate('assignedOrganisers', 'name email')
    .populate('attendeeCount')
    .populate('sponsorCount');

  if (!event) {
    throw new CustomError.NotFoundError(`No event with id : ${eventId}`);
  }

  res.status(StatusCodes.OK).json({ event });
};

const updateEvent = async (req, res) => {
  const { id: eventId } = req.params;

  const event = await Event.findOne({ _id: eventId });

  if (!event) {
    throw new CustomError.NotFoundError(`No event with id : ${eventId}`);
  }

  // Check permissions - admin can edit any event, organiser can edit assigned events
  if (req.user.role !== 'admin') {
    if (req.user.role === 'organiser') {
      const isAssigned = event.assignedOrganisers.some(
        organiserId => organiserId.toString() === req.user.userId
      );
      if (!isAssigned) {
        throw new CustomError.UnauthorizedError('Not authorized to edit this event');
      }
    } else {
      throw new CustomError.UnauthorizedError('Not authorized to edit events');
    }
  }

  // Organisers cannot change certain fields
  if (req.user.role === 'organiser') {
    delete req.body.createdBy;
    delete req.body.assignedOrganisers;
  }

  const updatedEvent = await Event.findOneAndUpdate(
    { _id: eventId },
    req.body,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email')
    .populate('assignedOrganisers', 'name email');

  res.status(StatusCodes.OK).json({ event: updatedEvent });
};

const deleteEvent = async (req, res) => {
  const { id: eventId } = req.params;

  const event = await Event.findOne({ _id: eventId });

  if (!event) {
    throw new CustomError.NotFoundError(`No event with id : ${eventId}`);
  }

  // Get all attendees and sponsors to notify them
  const attendees = await Attendee.find({ event: eventId }).distinct('user');
  const sponsors = await Sponsorship.find({ event: eventId }).distinct('user');

  // Combine and deduplicate user IDs
  const usersToNotify = [...new Set([...attendees, ...sponsors])];

  // Create notifications for all affected users
  if (usersToNotify.length > 0) {
    const notificationData = notificationTemplates.eventDeleted(event.title);
    const notifications = usersToNotify.map(userId => ({
      user: userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      relatedEvent: eventId,
    }));

    await createBulkNotifications(notifications);
  }

  await Event.findOneAndDelete({ _id: eventId });
  res.status(StatusCodes.OK).json({ msg: 'Success! Event removed.' });
};

const assignOrganiser = async (req, res) => {
  const { id: eventId } = req.params;
  const { organiserId } = req.body;

  if (!organiserId) {
    throw new CustomError.BadRequestError('Please provide organiser ID');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError.NotFoundError(`No event with id : ${eventId}`);
  }

  const organiser = await User.findById(organiserId);
  if (!organiser) {
    throw new CustomError.NotFoundError(`No user with id : ${organiserId}`);
  }

  if (organiser.role !== 'organiser') {
    throw new CustomError.BadRequestError('User must have organiser role');
  }

  if (organiser.isBanned) {
    throw new CustomError.BadRequestError('Cannot assign banned user as organiser');
  }

  if (event.assignedOrganisers.includes(organiserId)) {
    throw new CustomError.BadRequestError('Organiser already assigned to this event');
  }

  event.assignedOrganisers.push(organiserId);
  await event.save();

  const updatedEvent = await Event.findById(eventId)
    .populate('assignedOrganisers', 'name email');

  // Send notification to the assigned organiser
  const assignedByUser = await User.findById(req.user.userId);
  const notificationData = notificationTemplates.organiserAssignment(event.title, assignedByUser.name);
  await createNotification({
    user: organiserId,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type,
    relatedEvent: eventId,
    relatedUser: req.user.userId,
  });

  // Also notify sponsors about the new organiser assignment
  const sponsors = await Sponsorship.find({ event: eventId }).distinct('user');
  if (sponsors.length > 0) {
    const sponsorNotificationData = {
      title: 'New Organiser Assigned',
      message: `A new organiser (${organiser.name}) has been assigned to "${event.title}" by ${assignedByUser.name}.`,
      type: 'organiser_assignment'
    };

    const sponsorNotifications = sponsors.map(sponsorId => ({
      user: sponsorId,
      title: sponsorNotificationData.title,
      message: sponsorNotificationData.message,
      type: sponsorNotificationData.type,
      relatedEvent: eventId,
      relatedUser: organiserId,
    }));

    await createBulkNotifications(sponsorNotifications);
  }

  res.status(StatusCodes.OK).json({ event: updatedEvent });
};

const removeOrganiser = async (req, res) => {
  const { id: eventId } = req.params;
  const { organiserId } = req.body;

  if (!organiserId) {
    throw new CustomError.BadRequestError('Please provide organiser ID');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError.NotFoundError(`No event with id : ${eventId}`);
  }

  event.assignedOrganisers = event.assignedOrganisers.filter(
    id => id.toString() !== organiserId
  );
  await event.save();

  const updatedEvent = await Event.findById(eventId)
    .populate('assignedOrganisers', 'name email');

  res.status(StatusCodes.OK).json({ event: updatedEvent });
};

const getMyEvents = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  let query = {};

  if (req.user.role === 'admin') {
    // Admin can see all events
  } else if (req.user.role === 'organiser') {
    // Organiser can see assigned events
    query.assignedOrganisers = req.user.userId;
  } else {
    // Regular users see events they created (if any)
    query.createdBy = req.user.userId;
  }

  const events = await Event.find(query)
    .populate('createdBy', 'name email')
    .populate('assignedOrganisers', 'name email')
    .populate('attendeeCount')
    .populate('sponsorCount')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Event.countDocuments(query);

  res.status(StatusCodes.OK).json({
    events,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

const getEventStats = async (req, res) => {
  const { id: eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError.NotFoundError(`No event with id : ${eventId}`);
  }

  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'organiser') {
    throw new CustomError.UnauthorizedError('Not authorized to view event stats');
  }

  if (req.user.role === 'organiser') {
    const isAssigned = event.assignedOrganisers.some(
      organiserId => organiserId.toString() === req.user.userId
    );
    if (!isAssigned) {
      throw new CustomError.UnauthorizedError('Not authorized to view this event stats');
    }
  }

  const attendeeStats = await Attendee.aggregate([
    { $match: { event: event._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const sponsorshipStats = await Sponsorship.aggregate([
    { $match: { event: event._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  res.status(StatusCodes.OK).json({
    event: {
      id: event._id,
      title: event.title,
      date: event.date
    },
    attendeeStats,
    sponsorshipStats
  });
};

module.exports = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  assignOrganiser,
  removeOrganiser,
  getMyEvents,
  getEventStats,
};