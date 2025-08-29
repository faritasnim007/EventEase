import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Clock,
  MapPin,
  Star,
  DollarSign
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import CreateEventForm from '../../components/Events/CreateEventForm';
import EditEventForm from '../../components/Events/EditEventForm';
import toast from 'react-hot-toast';

const OrganiserPanel = () => {
  const { user, isAdmin } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchMyEvents();
    fetchStats();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await api.events.getMyEvents();
      setMyEvents(response.data.events || []);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.users.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await api.events.delete(eventId);
      toast.success('Event deleted successfully');
      fetchMyEvents();
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to delete event';
      toast.error(message);
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

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const dashboardStats = [
    {
      title: 'My Events',
      value: myEvents.length,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Upcoming Events',
      value: myEvents.filter(event => isUpcoming(event.date)).length,
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Attendees',
      value: myEvents.reduce((sum, event) => sum + (event.attendeeCount || 0), 0),
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Avg Rating',
      value: '4.5',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-primary" />
            Organiser Panel
          </h1>
          <p className="text-muted-foreground">
            Manage your events and track their performance
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
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

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-card p-4 rounded-lg border border-border hover:bg-accent transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-green-500/10 w-fit mb-3">
              <Plus className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="font-medium mb-1">Create New Event</h3>
            <p className="text-sm text-muted-foreground">Start organizing your next event</p>
          </button>

          <Link
            to="/events"
            className="bg-card p-4 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 w-fit mb-3">
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="font-medium mb-1">Browse All Events</h3>
            <p className="text-sm text-muted-foreground">See what's happening on campus</p>
          </Link>

          <div className="bg-card p-4 rounded-lg border border-border">
            <div className="p-2 rounded-lg bg-purple-500/10 w-fit mb-3">
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="font-medium mb-1">Sponsorship Requests</h3>
            <p className="text-sm text-muted-foreground">Manage sponsorship applications</p>
          </div>
        </div>
      </div>

      {/* My Events */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">My Events</h2>
        </div>

        {myEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first event to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Attendees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-accent/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {event.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(event.date)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <Users className="h-3 w-3 mr-1" />
                        {event.attendeeCount || 0}
                        {event.maxAttendees && ` / ${event.maxAttendees}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${isUpcoming(event.date)
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-gray-500/10 text-gray-500'
                        }`}>
                        {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/events/${event._id}`}
                          className="p-1 rounded hover:bg-accent transition-colors"
                          title="View event"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEditModal(true);
                          }}
                          className="p-1 rounded hover:bg-accent transition-colors text-blue-500"
                          title="Edit event"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="p-1 rounded hover:bg-accent transition-colors text-red-500"
                            title="Delete event"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
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
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Event"
        size="lg"
      >
        {selectedEvent && (
          <EditEventForm
            event={selectedEvent}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedEvent(null);
              fetchMyEvents();
            }}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default OrganiserPanel;