import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import CreateEventForm from '../../components/Events/CreateEventForm';

const Events = () => {
  const { isAuthenticated, isOrganiser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    date: '',
    location: '',
  });
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        ...filters,
      };
      const response = await api.events.getAll(params);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      date: '',
      location: '',
    });
    setSearchTerm('');
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

  const isRegistrationOpen = (registrationDeadline) => {
    return new Date(registrationDeadline) > new Date();
  };

  const getRegistrationStatus = (event) => {
    if (!event.registrationDeadline) return 'Open';

    const now = new Date();
    const deadline = new Date(event.registrationDeadline);
    const eventStart = new Date(event.startDate || event.date);

    if (now > deadline) return 'Closed';
    if (now > eventStart) return 'Event Started';

    return 'Open';
  };

  const EventCard = ({ event }) => (
    <div className="bg-card border border-border rounded-lg overflow-hidden card-hover">
      {event.imageUrl ? (
        <div className="h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center" style={{ display: 'none' }}>
            <Calendar className="h-12 w-12 text-primary" />
          </div>
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
          <Calendar className="h-12 w-12 text-primary" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold line-clamp-2">{event.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${isUpcoming(event.date)
            ? 'bg-green-500/10 text-green-500'
            : 'bg-gray-500/10 text-gray-500'
            }`}>
            {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
          </span>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            {formatDate(event.startDate || event.date)} at {formatTime(event.startDate || event.date)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {event.attendeeCount || 0} / {event.maxAttendees || '∞'} attendees
          </div>
          {event.registrationDeadline && (
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <span className={`${getRegistrationStatus(event) === 'Open' ? 'text-green-600' : 'text-red-600'}`}>
                Registration {getRegistrationStatus(event) === 'Open' ? 'closes' : 'closed'}: {formatDate(event.registrationDeadline)} at {formatTime(event.registrationDeadline)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {event.category && (
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                {event.category}
              </span>
            )}
            {event.registrationDeadline && (
              <span className={`px-2 py-1 text-xs rounded-full ${getRegistrationStatus(event) === 'Open'
                ? 'bg-green-500/10 text-green-600'
                : 'bg-red-500/10 text-red-600'
                }`}>
                Registration {getRegistrationStatus(event)}
              </span>
            )}
          </div>
          <Link
            to={`/events/${event._id}`}
            className="btn-primary text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  const EventListItem = ({ event }) => (
    <div className="bg-card border border-border rounded-lg p-6 card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${isUpcoming(event.date)
              ? 'bg-green-500/10 text-green-500'
              : 'bg-gray-500/10 text-gray-500'
              }`}>
              {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
            </span>
          </div>

          <p className="text-muted-foreground text-sm mb-4">
            {event.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {formatDate(event.startDate || event.date)} at {formatTime(event.startDate || event.date)}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {event.location}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              {event.attendeeCount || 0} / {event.maxAttendees || '∞'} attendees
            </div>
            {event.registrationDeadline && (
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <span className={`${getRegistrationStatus(event) === 'Open' ? 'text-green-600' : 'text-red-600'}`}>
                  Registration {getRegistrationStatus(event) === 'Open' ? 'closes' : 'closed'}: {formatDate(event.registrationDeadline)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {event.category && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {event.category}
                </span>
              )}
              {event.registrationDeadline && (
                <span className={`px-2 py-1 text-xs rounded-full ${getRegistrationStatus(event) === 'Open'
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-red-500/10 text-red-600'
                  }`}>
                  Registration {getRegistrationStatus(event)}
                </span>
              )}
            </div>
            <Link
              to={`/events/${event._id}`}
              className="btn-primary"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Events</h1>
          <p className="text-muted-foreground">
            Discover and join amazing events happening around campus
          </p>
        </div>
        {isAuthenticated && isOrganiser && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary mt-4 md:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearch}
              className="form-input pl-10"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-outline ${showFilters ? 'bg-accent' : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </button>
            <div className="flex border border-border rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'} rounded-l-lg transition-colors`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'} rounded-r-lg transition-colors`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-card p-4 rounded-lg border border-border animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="form-input"
                >
                  <option value="">All Categories</option>
                  <option value="academic">Academic</option>
                  <option value="social">Social</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                </select>
              </div>
              <div>
                <label className="form-label">Date</label>
                <select
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="form-input"
                >
                  <option value="">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this-week">This Week</option>
                  <option value="next-week">Next Week</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>
              <div>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="btn-outline w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || Object.values(filters).some(f => f)
              ? 'Try adjusting your search or filters'
              : 'No events are currently available'
            }
          </p>
          {isAuthenticated && isOrganiser && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Event
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
        }>
          {events.map((event) =>
            viewMode === 'grid' ? (
              <EventCard key={event._id} event={event} />
            ) : (
              <EventListItem key={event._id} event={event} />
            )
          )}
        </div>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Event"
        size="lg"
      >
        <CreateEventForm
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEvents();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Events;