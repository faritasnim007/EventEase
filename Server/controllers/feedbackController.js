const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const Attendee = require('../models/Attendee');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const submitFeedback = async (req, res) => {
  const { eventId } = req.params;
  const { rating, comment, isAnonymous } = req.body;
  const userId = req.user.userId;

  if (!rating) {
    throw new CustomError.BadRequestError('Please provide a rating');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError.NotFoundError(`No event with id: ${eventId}`);
  }

  // Check if user attended the event
  const attendance = await Attendee.findOne({
    user: userId,
    event: eventId,
    status: { $in: ['registered', 'attended'] }
  });

  if (!attendance) {
    throw new CustomError.BadRequestError('You must be registered for this event to submit feedback');
  }

  // Check if user already submitted feedback
  const existingFeedback = await Feedback.findOne({ user: userId, event: eventId });
  if (existingFeedback) {
    throw new CustomError.BadRequestError('You have already submitted feedback for this event');
  }

  const feedback = await Feedback.create({
    user: userId,
    event: eventId,
    rating,
    comment: comment || '',
    isAnonymous: isAnonymous || false,
  });

  const populatedFeedback = await Feedback.findById(feedback._id)
    .populate('user', 'name email')
    .populate('event', 'title date location');

  res.status(StatusCodes.CREATED).json({
    msg: 'Feedback submitted successfully',
    feedback: populatedFeedback
  });
};

const getEventFeedback = async (req, res) => {
  const { eventId } = req.params;
  const { page = 1, limit = 10, rating = '' } = req.query;

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
        throw new CustomError.UnauthorizedError('Not authorized to view feedback for this event');
      }
    } else {
      throw new CustomError.UnauthorizedError('Not authorized to view feedback');
    }
  }

  const query = { event: eventId };
  if (rating) {
    query.rating = parseInt(rating);
  }

  const feedback = await Feedback.find(query)
    .populate({
      path: 'user',
      select: 'name email',
      transform: (doc, ret, options) => {
        // Hide user info for anonymous feedback
        if (ret && options.isAnonymous) {
          return { name: 'Anonymous', email: 'anonymous@example.com' };
        }
        return ret;
      }
    })
    .populate('event', 'title date')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  // Process feedback to handle anonymous submissions
  const processedFeedback = feedback.map(item => {
    if (item.isAnonymous) {
      return {
        ...item.toObject(),
        user: { name: 'Anonymous', email: 'anonymous@example.com' }
      };
    }
    return item;
  });

  const total = await Feedback.countDocuments(query);

  // Calculate average rating
  const ratingStats = await Feedback.aggregate([
    { $match: { event: event._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  // Calculate rating distribution
  let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (ratingStats[0]) {
    ratingStats[0].ratingDistribution.forEach(rating => {
      ratingDistribution[rating]++;
    });
  }

  res.status(StatusCodes.OK).json({
    feedback: processedFeedback,
    stats: {
      averageRating: ratingStats[0]?.averageRating || 0,
      totalFeedback: ratingStats[0]?.totalFeedback || 0,
      ratingDistribution
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

const getPublicEventFeedback = async (req, res) => {
  const { eventId } = req.params;
  const { page = 1, limit = 10, rating = '' } = req.query;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new CustomError.NotFoundError(`No event with id: ${eventId}`);
  }

  const query = { event: eventId };
  if (rating) {
    query.rating = parseInt(rating);
  }

  const feedback = await Feedback.find(query)
    .populate({
      path: 'user',
      select: 'name'
    })
    .populate('event', 'title startDate date')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  // Process feedback to handle anonymous submissions
  const processedFeedback = feedback.map(item => {
    if (item.isAnonymous) {
      return {
        ...item.toObject(),
        user: { name: 'Anonymous' }
      };
    }
    return item;
  });

  const total = await Feedback.countDocuments(query);

  // Calculate average rating
  const ratingStats = await Feedback.aggregate([
    { $match: { event: event._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  // Calculate rating distribution
  let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  if (ratingStats[0]) {
    ratingStats[0].ratingDistribution.forEach(rating => {
      ratingDistribution[rating]++;
    });
  }

  res.status(StatusCodes.OK).json({
    feedback: processedFeedback,
    stats: {
      averageRating: ratingStats[0]?.averageRating || 0,
      totalFeedback: ratingStats[0]?.totalFeedback || 0,
      ratingDistribution
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

const getMyFeedback = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.userId;

  const feedback = await Feedback.find({ user: userId })
    .populate('event', 'title date location category status')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Feedback.countDocuments({ user: userId });

  res.status(StatusCodes.OK).json({
    feedback,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

const updateFeedback = async (req, res) => {
  const { feedbackId } = req.params;
  const { rating, comment, isAnonymous } = req.body;
  const userId = req.user.userId;

  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    throw new CustomError.NotFoundError(`No feedback with id: ${feedbackId}`);
  }

  // Check if user owns this feedback
  if (feedback.user.toString() !== userId) {
    throw new CustomError.UnauthorizedError('Not authorized to update this feedback');
  }

  if (rating) feedback.rating = rating;
  if (comment !== undefined) feedback.comment = comment;
  if (isAnonymous !== undefined) feedback.isAnonymous = isAnonymous;

  await feedback.save();

  const updatedFeedback = await Feedback.findById(feedbackId)
    .populate('user', 'name email')
    .populate('event', 'title date location');

  res.status(StatusCodes.OK).json({
    msg: 'Feedback updated successfully',
    feedback: updatedFeedback
  });
};

const deleteFeedback = async (req, res) => {
  const { feedbackId } = req.params;
  const userId = req.user.userId;

  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    throw new CustomError.NotFoundError(`No feedback with id: ${feedbackId}`);
  }

  // Check if user owns this feedback
  if (feedback.user.toString() !== userId) {
    throw new CustomError.UnauthorizedError('Not authorized to delete this feedback');
  }

  await Feedback.findByIdAndDelete(feedbackId);

  res.status(StatusCodes.OK).json({ msg: 'Feedback deleted successfully' });
};

module.exports = {
  submitFeedback,
  getEventFeedback,
  getPublicEventFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback,
};