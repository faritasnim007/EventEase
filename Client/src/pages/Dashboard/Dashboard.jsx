import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Bell,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  Plus,
  ArrowRight,
  Edit
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import CreateEventForm from '../../components/Events/CreateEventForm';
import EditEventForm from '../../components/Events/EditEventForm';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAdmin, isOrganiser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [myRsvps, setMyRsvps] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentEvents();
    fetchMyRsvps();
    if (isOrganiser) {
      fetchMyEvents();
    }
  }, [isOrganiser]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.users.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchRecentEvents = async () => {
    try {
      const response = await api.events.getAll({ limit: 6 });
      setRecentEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch recent events:', error);
    }
  };

  const fetchMyRsvps = async () => {
    try {
      const response = await api.attendees.getMyRsvps();
      setMyRsvps(response.data.rsvps || []);
    } catch (error) {
      console.error('Failed to fetch RSVPs:', error);
    } finally {
      if (!isOrganiser) {
        setLoading(false);
      }
    }
  };

  const fetchMyEvents = async () => {
    try {
      const response = await api.events.getMyEvents();
      setMyEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch my events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getStats = () => {
    if (isOrganiser) {
      return [
        {
          title: 'Events Organizing',
          value: myEvents.length,
          icon: Calendar,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
        },
        {
          title: 'Upcoming Events',
          value: myEvents.filter(event => new Date(event.startDate || event.date) > new Date()).length,
          icon: Clock,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
        },
        {
          title: 'Total Attendees',
          value: myEvents.reduce((total, event) => total + (event.attendeeCount || 0), 0),
          icon: Users,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10',
        },
        {
          title: 'Notifications',
          value: dashboardData?.unreadNotifications || 0,
          icon: Bell,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
        },
      ];
    }

    return [
      {
        title: 'Events Attended',
        value: dashboardData?.eventsAttended || 0,
        icon: Calendar,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
      },
      {
        title: 'Upcoming RSVPs',
        value: myRsvps.filter(rsvp => new Date(rsvp.event?.date) > new Date()).length,
        icon: Clock,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
      },
      {
        title: 'Notifications',
        value: dashboardData?.unreadNotifications || 0,
        icon: Bell,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
      },
      {
        title: 'Feedback Given',
        value: dashboardData?.feedbackCount || 0,
        icon: Star,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
      },
    ];
  };

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your events and activities.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Link to="/events" className="btn-primary">
            <Calendar className="h-4 w-4 mr-2" />
            Browse Events
          </Link>
          {isOrganiser && (
            <>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-secondary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </button>
              <Link to="/events" className="btn-outline">
                <Edit className="h-4 w-4 mr-2" />
                Manage Events
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className="btn-outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Organiser Events or My Upcoming Events */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {isOrganiser ? 'My Events' : 'My Upcoming Events'}
            </h2>
            <Link to="/events" className="text-primary hover:text-primary/80 text-sm">
              View all
            </Link>
          </div>

          {isOrganiser ? (
            // Organiser Events Section
            myEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No events organized yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myEvents.slice(0, 3).map((event) => (
                  <div key={event._id} className="flex items-center space-x-4 p-4 bg-accent/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{event.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(event.startDate || event.date)} at {formatTime(event.startDate || event.date)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        {event.attendeeCount || 0} attendees
                      </div>
                      {event.registrationDeadline && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Bell className="h-3 w-3 mr-1" />
                          Registration closes: {formatDate(event.registrationDeadline)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEditModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                        title="Edit event"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/events/${event._id}`}
                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                        title="View event"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Regular User Events Section
            myRsvps.filter(rsvp => new Date(rsvp.event?.date) > new Date()).length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No upcoming events</p>
                <Link to="/events" className="btn-primary">
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myRsvps
                  .filter(rsvp => new Date(rsvp.event?.date) > new Date())
                  .slice(0, 3)
                  .map((rsvp) => (
                    <div key={rsvp._id} className="flex items-center space-x-4 p-4 bg-accent/50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{rsvp.event?.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(rsvp.event?.date)} at {formatTime(rsvp.event?.date)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {rsvp.event?.location}
                        </div>
                      </div>
                      <Link
                        to={`/events/${rsvp.event?._id}`}
                        className="text-primary hover:text-primary/80"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
              </div>
            )
          )}
        </div>

        {/* Recent Events or Event Statistics */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {isOrganiser ? 'Event Statistics' : 'Recent Events'}
            </h2>
            <Link to="/events" className="text-primary hover:text-primary/80 text-sm">
              View all
            </Link>
          </div>

          {isOrganiser ? (
            // Event Statistics for Organisers
            myEvents.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No statistics available</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {myEvents.filter(event => new Date(event.startDate || event.date) > new Date()).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Upcoming Events</div>
                  </div>
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {myEvents.reduce((total, event) => total + (event.attendeeCount || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Attendees</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Top Events by Attendance</h3>
                  {myEvents
                    .sort((a, b) => (b.attendeeCount || 0) - (a.attendeeCount || 0))
                    .slice(0, 3)
                    .map((event) => (
                      <div key={event._id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(event.startDate || event.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{event.attendeeCount || 0}</div>
                          <div className="text-xs text-muted-foreground">attendees</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )
          ) : (
            // Recent Events for Regular Users
            recentEvents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent events</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.slice(0, 3).map((event) => (
                  <div key={event._id} className="flex items-center space-x-4 p-4 bg-accent/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-secondary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{event.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(event.date)} at {formatTime(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        {event.attendeeCount || 0} attendees
                      </div>
                    </div>
                    <Link
                      to={`/events/${event._id}`}
                      className="text-primary hover:text-primary/80"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Profile Summary */}
      <div className="mt-8 bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Profile Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-2">Personal Information</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Department:</strong> {user?.department}</p>
              <p><strong>Year:</strong> {user?.year}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Contact</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {user?.phone}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user?.interests?.length > 0 ? (
                user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No interests added</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/profile" className="btn-outline">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Create Event Modal */}
      {isOrganiser && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Event"
          size="lg"
        >
          <CreateEventForm
            onSuccess={() => {
              setShowCreateModal(false);
              fetchMyEvents();
              toast.success('Event created successfully!');
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}

      {/* Edit Event Modal */}
      {isOrganiser && selectedEvent && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          title="Edit Event"
          size="lg"
        >
          <EditEventForm
            event={selectedEvent}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedEvent(null);
              fetchMyEvents();
              toast.success('Event updated successfully!');
            }}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedEvent(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;