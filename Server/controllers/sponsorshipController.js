const Sponsorship = require('../models/Sponsorship');
const Event = require('../models/Event');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { createNotification, notificationTemplates } = require('../utils/notificationService');

const createSponsorship = async (req, res) => {
  const { eventId } = req.params;
  const { amount, message } = req.body;
  const userId = req.user.userId;

  if (!amount || amount <= 0) {
    throw new CustomError.BadRequestError('Please provide a valid sponsorship amount');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError.NotFoundError(`No event with id: ${eventId}`);
  }

  if (!event.allowSponsorship) {
    throw new CustomError.BadRequestError('This event does not allow sponsorships');
  }

  if (event.status !== 'published') {
    throw new CustomError.BadRequestError('Cannot sponsor unpublished event');
  }

  // Check if user already sponsored this event
  const existingSponsorship = await Sponsorship.findOne({ user: userId, event: eventId });
  if (existingSponsorship) {
    throw new CustomError.BadRequestError('You have already sponsored this event');
  }

  const sponsorship = await Sponsorship.create({
    user: userId,
    event: eventId,
    amount,
    message: message || '',
  });

  const populatedSponsorship = await Sponsorship.findById(sponsorship._id)
    .populate('user', 'name email')
    .populate('event', 'title date location');

  res.status(StatusCodes.CREATED).json({
    msg: 'Sponsorship request submitted successfully',
    sponsorship: populatedSponsorship
  });
};

const getEventSponsorships = async (req, res) => {
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
        throw new CustomError.UnauthorizedError('Not authorized to view sponsorships for this event');
      }
    } else {
      throw new CustomError.UnauthorizedError('Not authorized to view sponsorships');
    }
  }

  const query = { event: eventId };
  if (status) {
    query.status = status;
  }

  const sponsorships = await Sponsorship.find(query)
    .populate('user', 'name email')
    .populate('event', 'title date')
    .populate('approvedBy', 'name email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Sponsorship.countDocuments(query);

  // Calculate total approved sponsorship amount
  const totalApproved = await Sponsorship.aggregate([
    { $match: { event: event._id, status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.status(StatusCodes.OK).json({
    sponsorships,
    totalApprovedAmount: totalApproved[0]?.total || 0,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

const updateSponsorshipStatus = async (req, res) => {
  const { sponsorshipId } = req.params;
  const { status, rejectedReason } = req.body;

  if (!status) {
    throw new CustomError.BadRequestError('Please provide status');
  }

  if (status === 'rejected' && !rejectedReason) {
    throw new CustomError.BadRequestError('Please provide rejection reason');
  }

  const sponsorship = await Sponsorship.findById(sponsorshipId).populate('event');
  if (!sponsorship) {
    throw new CustomError.NotFoundError(`No sponsorship with id: ${sponsorshipId}`);
  }

  // Check permissions
  if (req.user.role !== 'admin') {
    if (req.user.role === 'organiser') {
      const isAssigned = sponsorship.event.assignedOrganisers.some(
        organiserId => organiserId.toString() === req.user.userId
      );
      if (!isAssigned) {
        throw new CustomError.UnauthorizedError('Not authorized to update this sponsorship');
      }
    } else {
      throw new CustomError.UnauthorizedError('Not authorized to update sponsorships');
    }
  }

  sponsorship.status = status;

  if (status === 'approved') {
    sponsorship.approvedBy = req.user.userId;
    sponsorship.approvedAt = new Date();
    sponsorship.rejectedReason = undefined;
  } else if (status === 'rejected') {
    sponsorship.rejectedReason = rejectedReason;
    sponsorship.approvedBy = undefined;
    sponsorship.approvedAt = undefined;
  }

  await sponsorship.save();

  // Send notification to the sponsor
  let notificationData;
  if (status === 'approved') {
    notificationData = notificationTemplates.sponsorshipApproved(
      sponsorship.event.title,
      sponsorship.amount
    );
  } else if (status === 'rejected') {
    notificationData = notificationTemplates.sponsorshipRejected(
      sponsorship.event.title,
      rejectedReason
    );
  }

  if (notificationData) {
    await createNotification({
      user: sponsorship.user,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      relatedEvent: sponsorship.event._id,
    });
  }

  const updatedSponsorship = await Sponsorship.findById(sponsorshipId)
    .populate('user', 'name email')
    .populate('event', 'title date')
    .populate('approvedBy', 'name email');

  res.status(StatusCodes.OK).json({
    msg: `Sponsorship ${status} successfully`,
    sponsorship: updatedSponsorship
  });
};

const getMySponsorships = async (req, res) => {
  const { page = 1, limit = 10, status = '' } = req.query;
  const userId = req.user.userId;

  const query = { user: userId };
  if (status) {
    query.status = status;
  }

  const sponsorships = await Sponsorship.find(query)
    .populate('event', 'title date location category status')
    .populate('approvedBy', 'name email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Sponsorship.countDocuments(query);

  // Calculate total sponsored amount
  const totalSponsored = await Sponsorship.aggregate([
    { $match: { user: userId, status: 'approved' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.status(StatusCodes.OK).json({
    sponsorships,
    totalSponsoredAmount: totalSponsored[0]?.total || 0,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

module.exports = {
  createSponsorship,
  getEventSponsorships,
  updateSponsorshipStatus,
  getMySponsorships,
};