import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  Heart,
  Share2,
  Edit,
  Trash2,
  MessageSquare,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import FeedbackForm from '../../components/Events/FeedbackForm';
import SponsorshipForm from '../../components/Events/SponsorshipForm';
import EditEventForm from '../../components/Events/EditEventForm';
import ShareModal from '../../components/Events/ShareModal';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isOrganiser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [attendees, setAttendees] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({});
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showSponsorshipModal, setShowSponsorshipModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    fetchPublicFeedback(); // Fetch feedback for everyone
    if (isAuthenticated) {
      checkRegistrationStatus();
    }
  }, [id, isAuthenticated]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await api.events.getSingle(id);
      setEvent(response.data.event);

      // Fetch additional data if user is organiser/admin
      if (isOrganiser) {
        fetchAttendees();
        fetchFeedback();
      }
    } catch (error) {
      toast.error('Failed to load event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await api.attendees.getMyRsvps();
      const rsvps = response.data.rsvps || [];
      console.log('My RSVPs:', rsvps); // Debug log
      // Check if user is/was registered for this event (including past events)
      const wasRegistered = rsvps.some(rsvp => {
        console.log('Checking RSVP:', rsvp.event?._id, 'vs', id, 'status:', rsvp.status); // Debug log
        return rsvp.event?._id === id &&
          (rsvp.status === 'registered' || rsvp.status === 'attended');
      });
      console.log('Was registered:', wasRegistered); // Debug log
      setIsRegistered(wasRegistered);
    } catch (error) {
      console.error('Failed to check registration status:', error);
    }
  };

  const fetchAttendees = async () => {
    try {
      const response = await api.attendees.getEventAttendees(id);
      setAttendees(response.data.attendees || []);
    } catch (error) {
      console.error('Failed to fetch attendees:', error);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await api.feedback.getEventFeedback(id);
      setFeedback(response.data.feedback || []);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    }
  };

  const fetchPublicFeedback = async () => {
    try {
      const response = await api.feedback.getPublicFeedback(id);
      setFeedback(response.data.feedback || []);
      setFeedbackStats(response.data.stats || {});
    } catch (error) {
      console.error('Failed to fetch public feedback:', error);
    }
  };

  const handleRSVP = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register for events');
      navigate('/login');
      return;
    }

    try {
      setRsvpLoading(true);
      if (isRegistered) {
        await api.attendees.cancelRsvp(id);
        setIsRegistered(false);
        toast.success('Registration cancelled successfully');
      } else {
        await api.attendees.rsvp(id);
        setIsRegistered(true);
        toast.success('Successfully registered for event!');
      }
      fetchEventDetails(); // Refresh to update attendee count
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to update registration';
      toast.error(message);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await api.events.delete(id);
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to delete event';
      toast.error(message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const isPastEvent = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const isRegistrationOpen = () => {
    if (!event?.registrationDeadline) return true;
    return new Date(event.registrationDeadline) > new Date();
  };

  const getRegistrationStatus = () => {
    if (!event?.registrationDeadline) return 'Open';

    const now = new Date();
    const deadline = new Date(event.registrationDeadline);
    const eventStart = new Date(event.startDate || event.date);

    if (now > deadline) return 'Closed';
    if (now > eventStart) return 'Event Started';

    return 'Open';
  };

  const canEdit = isAdmin || (isOrganiser && event?.organisers?.some(org => org._id === user?._id));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Event not found</h2>
          <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/events')} className="btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/events')}
        className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </button>

      {/* Event Header */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
        {/* Event Image */}
        <div className="h-64 overflow-hidden">
          {event.imageUrl ? (
            <>
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="h-64 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center" style={{ display: 'none' }}>
                <Calendar className="h-16 w-16 text-primary" />
              </div>
            </>
          ) : (
            <div className="h-64 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
              <Calendar className="h-16 w-16 text-primary" />
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <span className={`px-3 py-1 text-sm rounded-full ${isUpcoming(event.date)
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-gray-500/10 text-gray-500'
                  }`}>
                  {isUpcoming(event.date) ? 'Upcoming' : 'Past Event'}
                </span>
                {event.category && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {event.category}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title="Share event"
              >
                <Share2 className="h-5 w-5" />
              </button>

              {canEdit && (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    title="Edit event"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={handleDeleteEvent}
                      className="p-2 rounded-lg hover:bg-accent transition-colors text-destructive"
                      title="Delete event"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{formatDate(event.startDate || event.date)}</p>
                  <p className="text-sm text-muted-foreground">{formatTime(event.startDate || event.date)}</p>
                </div>
              </div>

              {event.registrationDeadline && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Registration Deadline</p>
                    <p className={`text-sm ${getRegistrationStatus() === 'Open' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatDate(event.registrationDeadline)} at {formatTime(event.registrationDeadline)}
                    </p>
                    <p className={`text-xs ${getRegistrationStatus() === 'Open' ? 'text-green-600' : 'text-red-600'}`}>
                      Registration {getRegistrationStatus()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {event.attendeeCount || 0}
                    {event.maxAttendees && ` / ${event.maxAttendees}`} attendees
                  </p>
                  {event.maxAttendees && (
                    <p className="text-sm text-muted-foreground">
                      {event.maxAttendees - (event.attendeeCount || 0)} spots remaining
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {event.organisers && event.organisers.length > 0 && (
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Organized by</p>
                    <div className="space-y-1">
                      {event.organisers.map((organiser) => (
                        <p key={organiser._id} className="text-sm text-muted-foreground">
                          {organiser.name}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {isAuthenticated && isUpcoming(event.startDate || event.date) && (
              <button
                onClick={handleRSVP}
                disabled={
                  rsvpLoading ||
                  !isRegistrationOpen() ||
                  (event.maxAttendees && event.attendeeCount >= event.maxAttendees && !isRegistered)
                }
                className={`btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${isRegistered ? 'bg-destructive hover:bg-destructive/90' : ''
                  }`}
                title={!isRegistrationOpen() ? 'Registration deadline has passed' : ''}
              >
                {rsvpLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : isRegistered ? (
                  <Heart className="h-4 w-4 mr-2 fill-current" />
                ) : (
                  <Heart className="h-4 w-4 mr-2" />
                )}
                {rsvpLoading ? 'Processing...' :
                  !isRegistrationOpen() ? 'Registration Closed' :
                    isRegistered ? 'Cancel Registration' : 'Register for Event'}
              </button>
            )}

            {isAuthenticated && isUpcoming(event.startDate || event.date) && !isRegistrationOpen() && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                Registration deadline has passed
              </div>
            )}

            {/* Debug info - remove this later */}
            {/* {isAuthenticated && (
              <div className="text-xs text-gray-500 mb-2">
                Debug: isPastEvent={isPastEvent(event.startDate || event.date).toString()},
                isRegistered={isRegistered.toString()},
                eventDate={event.startDate || event.date}
              </div>
            )} */}

            {isAuthenticated && isPastEvent(event.startDate || event.date) && isRegistered && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="btn-secondary"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Leave Feedback
              </button>
            )}

            {/* Temporary: Show feedback button for registered users regardless of date for testing */}
            {isAuthenticated && isRegistered && (
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="btn-outline"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Leave Feedback
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={() => setShowSponsorshipModal(true)}
                className="btn-outline"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Sponsor Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Event Description */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">About This Event</h2>
        <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
      </div>

      {/* Attendees (for organisers) */}
      {isOrganiser && attendees.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Attendees ({attendees.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attendees.map((attendee) => (
              <div key={attendee._id} className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{attendee.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{attendee.user?.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Reviews & Feedback - Public */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Reviews & Feedback</h2>
          {feedbackStats.totalFeedback > 0 && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${i < Math.round(feedbackStats.averageRating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="font-medium">
                  {feedbackStats.averageRating?.toFixed(1)} ({feedbackStats.totalFeedback} reviews)
                </span>
              </div>
            </div>
          )}
        </div>

        {feedback.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div key={item._id} className="p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{item.user?.name || 'Anonymous'}</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {item.comment && (
                  <p className="text-muted-foreground">{item.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Leave Feedback"
      >
        <FeedbackForm
          eventId={id}
          onSuccess={() => {
            setShowFeedbackModal(false);
            fetchPublicFeedback(); // Refresh public feedback after submission
          }}
          onCancel={() => setShowFeedbackModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showSponsorshipModal}
        onClose={() => setShowSponsorshipModal(false)}
        title="Sponsor This Event"
      >
        <SponsorshipForm
          eventId={id}
          onSuccess={() => setShowSponsorshipModal(false)}
          onCancel={() => setShowSponsorshipModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Event"
        size="lg"
      >
        <EditEventForm
          event={event}
          onSuccess={() => {
            setShowEditModal(false);
            fetchEventDetails();
          }}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Event"
      >
        <ShareModal
          event={event}
          onClose={() => setShowShareModal(false)}
        />
      </Modal>
    </div>
  );
};

export default EventDetails;