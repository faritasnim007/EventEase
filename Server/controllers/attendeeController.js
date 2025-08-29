const Attendee = require('../models/Attendee');
const Event = require('../models/Event');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { createNotification, notificationTemplates } = require('../utils/notificationService');

const rsvpToEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.userId;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError.NotFoundError(`No event with id: ${eventId}`);
  }

  if (event.status !== 'published') {
    throw new CustomError.BadRequestError('Cannot RSVP to unpublished event');
  }

  // Check if registration deadline has passed
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    const deadlineDate = new Date(event.registrationDeadline).toLocaleDateString();
    const deadlineTime = new Date(event.registrationDeadline).toLocaleTimeString();
    throw new CustomError.BadRequestError(`Registration deadline has passed. Registration closed on ${deadlineDate} at ${deadlineTime}`);
  }

  // Check if event is full
  if (event.maxAttendees) {
    const currentAttendees = await Attendee.countDocuments({
      event: eventId,
      status: { $in: ['registered', 'attended'] }
    });
    if (currentAttendees >= event.maxAttendees) {
      throw new CustomError.BadRequestError('Event is full');
    }
  }

  // Check if user already registered
  const existingRSVP = await Attendee.findOne({ user: userId, event: eventId });
  if (existingRSVP) {
    if (existingRSVP.status === 'cancelled') {
      existingRSVP.status = 'registered';
      existingRSVP.registrationDate = new Date();
      await existingRSVP.save();
      return res.status(StatusCodes.OK).json({
        msg: 'RSVP reactivated successfully',
        attendee: existingRSVP
      });
    }
    throw new CustomError.BadRequestError('Already registered for this event');
  }

  const attendee = await Attendee.create({
    user: userId,
    event: eventId,
  });

  const populatedAttendee = await Attendee.findById(attendee._id)
    .populate('user', 'name email')
    .populate('event', 'title date location');

  // Send notification for successful registration
  const notificationData = notificationTemplates.eventRegistration(event.title);
  await createNotification({
    user: userId,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type,
    relatedEvent: eventId,
  });

  res.status(StatusCodes.CREATED).json({
    msg: 'RSVP successful',
    attendee: populatedAttendee
  });
};

const cancelRSVP = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.userId;

  const attendee = await Attendee.findOne({ user: userId, event: eventId }).populate('event', 'title');
  if (!attendee) {
    throw new CustomError.NotFoundError('No RSVP found for this event');
  }

  if (attendee.status === 'cancelled') {
    throw new CustomError.BadRequestError('RSVP already cancelled');
  }

  attendee.status = 'cancelled';
  await attendee.save();

  // Send notification for cancelled registration
  const notificationData = notificationTemplates.eventRegistrationCancelled(attendee.event.title);
  await createNotification({
    user: userId,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type,
    relatedEvent: eventId,
  });

  res.status(StatusCodes.OK).json({ msg: 'RSVP cancelled successfully' });
};

const getEventAttendees = async (req, res) => {
  const { eventId } = req.params;
  const { page = 1, limit = 10, status = '' } = req.query;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError.NotFoundError(`No event with id: ${eventId}`);
  }

  // Check permissions
  if (req.user.role !== 'admin') {
    if (req.user.role === 'organiser') {
      const isAssigned = event.assignedOrganisers.some(
        organiserId => organiserId.toString() === req.user.userId
      );
      if (!isAssigned) {
        throw new CustomError.UnauthorizedError('Not authorized to view attendees for this event');
      }
    } else {
      throw new CustomError.UnauthorizedError('Not authorized to view attendees');
    }
  }

  const query = { event: eventId };
  if (status) {
    query.status = status;
  }

  const attendees = await Attendee.find(query)
    .populate('user', 'name email')
    .populate('event', 'title date')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ registrationDate: -1 });

  const total = await Attendee.countDocuments(query);

  res.status(StatusCodes.OK).json({
    attendees,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

const updateAttendeeStatus = async (req, res) => {
  const { attendeeId } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    throw new CustomError.BadRequestError('Please provide status');
  }

  const attendee = await Attendee.findById(attendeeId).populate('event');
  if (!attendee) {
    throw new CustomError.NotFoundError(`No attendee with id: ${attendeeId}`);
  }

  // Check permissions
  if (req.user.role !== 'admin') {
    if (req.user.role === 'organiser') {
      const isAssigned = attendee.event.assignedOrganisers.some(
        organiserId => organiserId.toString() === req.user.userId
      );
      if (!isAssigned) {
        throw new CustomError.UnauthorizedError('Not authorized to update this attendee');
      }
    } else {
      throw new CustomError.UnauthorizedError('Not authorized to update attendees');
    }
  }

  attendee.status = status;
  if (notes) {
    attendee.notes = notes;
  }
  await attendee.save();

  const updatedAttendee = await Attendee.findById(attendeeId)
    .populate('user', 'name email')
    .populate('event', 'title date');

  res.status(StatusCodes.OK).json({
    msg: 'Attendee status updated',
    attendee: updatedAttendee
  });
};

const banAttendee = async (req, res) => {
  const { attendeeId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new CustomError.BadRequestError('Please provide a reason for banning');
  }

  const attendee = await Attendee.findById(attendeeId).populate('event');
  if (!attendee) {
    throw new CustomError.NotFoundError(`No attendee with id: ${attendeeId}`);
  }

  // Check permissions
  if (req.user.role !== 'admin') {
    if (req.user.role === 'organiser') {
      const isAssigned = attendee.event.assignedOrganisers.some(
        organiserId => organiserId.toString() === req.user.userId
      );
      if (!isAssigned) {
        throw new CustomError.UnauthorizedError('Not authorized to ban this attendee');
      }
    } else {
      throw new CustomError.UnauthorizedError('Not authorized to ban attendees');
    }
  }

  attendee.isBanned = true;
  attendee.bannedBy = req.user.userId;
  attendee.bannedAt = new Date();
  attendee.bannedReason = reason;
  await attendee.save();

  res.status(StatusCodes.OK).json({ msg: 'Attendee banned successfully' });
};

const unbanAttendee = async (req, res) => {
  const { attendeeId } = req.params;

  const attendee = await Attendee.findById(attendeeId).populate('event');
  if (!attendee) {
    throw new CustomError.NotFoundError(`No attendee with id: ${attendeeId}`);
  }

  // Check permissions
  if (req.user.role !== 'admin') {
    if (req.user.role === 'organiser') {
      const isAssigned = attendee.event.assignedOrganisers.some(
        organiserId => organiserId.toString() === req.user.userId
      );
      if (!isAssigned) {
        throw new CustomError.UnauthorizedError('Not authorized to unban this attendee');
      }
    } else {
      throw new CustomError.UnauthorizedError('Not authorized to unban attendees');
    }
  }

  attendee.isBanned = false;
  attendee.bannedBy = undefined;
  attendee.bannedAt = undefined;
  attendee.bannedReason = undefined;
  await attendee.save();

  res.status(StatusCodes.OK).json({ msg: 'Attendee unbanned successfully' });
};

const getMyRSVPs = async (req, res) => {
  const { page = 1, limit = 10, status = '' } = req.query;
  const userId = req.user.userId;

  const query = { user: userId };
  if (status) {
    query.status = status;
  }

  const rsvps = await Attendee.find(query)
    .populate('event', 'title startDate date location category status')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ registrationDate: -1 });

  const total = await Attendee.countDocuments(query);

  res.status(StatusCodes.OK).json({
    rsvps,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

module.exports = {
  rsvpToEvent,
  cancelRSVP,
  getEventAttendees,
  updateAttendeeStatus,
  banAttendee,
  unbanAttendee,
  getMyRSVPs,
};