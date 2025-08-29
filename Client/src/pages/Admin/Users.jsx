import { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Search,
  UserCheck,
  UserX,
  Shield,
  Phone,
  GraduationCap,
  Edit,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [showEventSelection, setShowEventSelection] = useState(false);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showEventsTab, setShowEventsTab] = useState(false);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loadingPendingEvents, setLoadingPendingEvents] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPendingEvents();
  }, []);

  const fetchAvailableEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await api.events.getAll({ status: 'published', limit: 100 });
      setAvailableEvents(response.data.events || []);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchPendingEvents = async () => {
    try {
      setLoadingPendingEvents(true);
      const response = await api.events.getAll({ status: 'draft', limit: 100 });
      setPendingEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch pending events:', error);
    } finally {
      setLoadingPendingEvents(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.users.getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      if (action === 'ban') {
        await api.users.banUser(userId);
        toast.success('User banned successfully');
      } else if (action === 'unban') {
        await api.users.unbanUser(userId);
        toast.success('User unbanned successfully');
      }
      fetchUsers(); // Refresh data
    } catch (error) {
      const message = error.response?.data?.msg || `Failed to ${action} user`;
      toast.error(message);
    }
  };

  const handleRoleChange = async () => {
    try {
      const requestData = { role: newRole };

      // If changing to organiser and events are selected, include event IDs
      if (newRole === 'organiser' && selectedEventIds.length > 0) {
        requestData.eventIds = selectedEventIds;
      }

      const response = await api.users.changeRoleWithEvents(selectedUser._id, requestData);

      if (response.data.assignedEvents && response.data.assignedEvents.length > 0) {
        const eventTitles = response.data.assignedEvents.map(e => e.title).join(', ');
        toast.success(`User role updated and assigned to events: ${eventTitles}`);
      } else {
        toast.success('User role updated successfully');
      }

      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      setShowEventSelection(false);
      setSelectedEventIds([]);
      setAvailableEvents([]);
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to update user role';
      toast.error(message);
    }
  };

  const handleEventSelection = (eventId) => {
    setSelectedEventIds(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const handleEventStatusChange = async (eventId, status) => {
    try {
      await api.events.update(eventId, { status });
      toast.success(`Event ${status === 'published' ? 'published' : 'rejected'} successfully`);
      fetchPendingEvents();
    } catch (error) {
      const message = error.response?.data?.msg || `Failed to ${status} event`;
      toast.error(message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter ||
      (statusFilter === 'active' && !user.isBanned) ||
      (statusFilter === 'banned' && user.isBanned);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/10 text-red-500';
      case 'organiser':
        return 'bg-blue-500/10 text-blue-500';
      case 'student':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <UsersIcon className="h-8 w-8 mr-3 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">
          Manage users, events, and system settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setShowEventsTab(false)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${!showEventsTab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
            >
              <UsersIcon className="h-4 w-4 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setShowEventsTab(true)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${showEventsTab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Event Review
              {pendingEvents.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingEvents.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {!showEventsTab ? (
        <>
          {/* User Management Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-green-500">
                {users.filter(u => !u.isBanned).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-red-500">
                {users.filter(u => u.isBanned).length}
              </div>
              <div className="text-sm text-muted-foreground">Banned Users</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-blue-500">
                {users.filter(u => u.role === 'organiser').length}
              </div>
              <div className="text-sm text-muted-foreground">Organisers</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card p-6 rounded-lg border border-border mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="organiser">Organiser</option>
                  <option value="student">Student</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-accent/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <UsersIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.isBanned
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-green-500/10 text-green-500'
                          }`}>
                          {user.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-1 rounded hover:bg-accent transition-colors"
                            title="View details"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                              setShowRoleModal(true);
                            }}
                            className="p-1 rounded hover:bg-accent transition-colors text-blue-500"
                            title="Change role"
                          >
                            <Shield className="h-4 w-4" />
                          </button>

                          {user.isBanned ? (
                            <button
                              onClick={() => handleUserAction(user._id, 'unban')}
                              className="p-1 rounded hover:bg-accent transition-colors text-green-500"
                              title="Unban user"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user._id, 'ban')}
                              className="p-1 rounded hover:bg-accent transition-colors text-red-500"
                              title="Ban user"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter || statusFilter
                    ? 'Try adjusting your search or filters'
                    : 'No users are currently registered'
                  }
                </p>
              </div>
            )}
          </div>

          {/* User Details Modal */}
          <Modal
            isOpen={showUserModal}
            onClose={() => setShowUserModal(false)}
            title="User Details"
          >
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <UsersIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {selectedUser.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Age</label>
                    <p>{selectedUser.age || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p>{selectedUser.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Department</label>
                    <p className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {selectedUser.department || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Academic Year</label>
                    <p>{selectedUser.year || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <span className={`px-2 py-1 text-xs rounded-full ${selectedUser.isBanned
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-green-500/10 text-green-500'
                      }`}>
                      {selectedUser.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </div>
                </div>

                {selectedUser.bio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="text-sm">{selectedUser.bio}</p>
                  </div>
                )}

                {selectedUser.interests && selectedUser.interests.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Interests</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedUser.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Modal>

          {/* Role Change Modal */}
          <Modal
            isOpen={showRoleModal}
            onClose={() => {
              setShowRoleModal(false);
              setShowEventSelection(false);
              setSelectedEventIds([]);
              setAvailableEvents([]);
            }}
            title="Change User Role"
          >
            {selectedUser && (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Change role for <strong>{selectedUser.name}</strong>
                </p>

                <div>
                  <label className="form-label">New Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => {
                      setNewRole(e.target.value);
                      if (e.target.value === 'organiser') {
                        setShowEventSelection(true);
                        fetchAvailableEvents();
                      } else {
                        setShowEventSelection(false);
                        setSelectedEventIds([]);
                      }
                    }}
                    className="form-input"
                  >
                    <option value="user">User</option>
                    <option value="student">Student</option>
                    <option value="organiser">Organiser</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Event Selection - Only show when changing to organiser */}
                {showEventSelection && (
                  <div className="space-y-4 p-4 bg-accent/20 rounded-lg border border-border">
                    <h4 className="font-medium text-sm">Assign Events to New Organiser</h4>
                    <p className="text-xs text-muted-foreground">
                      Select existing events to assign to this new organiser
                    </p>

                    {loadingEvents ? (
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm">Loading events...</span>
                      </div>
                    ) : availableEvents.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {availableEvents.map((event) => (
                          <div
                            key={event._id}
                            className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-accent/30 cursor-pointer"
                            onClick={() => handleEventSelection(event._id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedEventIds.includes(event._id)}
                              onChange={() => handleEventSelection(event._id)}
                              className="rounded border-border"
                            />
                            <div className="flex-1">
                              <h5 className="font-medium text-sm">{event.title}</h5>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                                <span>{event.location}</span>
                                <span className={`px-2 py-1 rounded-full ${event.status === 'published'
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-yellow-500/10 text-yellow-500'
                                  }`}>
                                  {event.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No events available to assign</p>
                      </div>
                    )}

                    {selectedEventIds.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Selected {selectedEventIds.length} event{selectedEventIds.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      setShowRoleModal(false);
                      setShowEventSelection(false);
                      setSelectedEventIds([]);
                      setAvailableEvents([]);
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRoleChange}
                    className="btn-primary"
                  >
                    {showEventSelection && selectedEventIds.length > 0
                      ? `Update Role & Assign ${selectedEventIds.length} Event${selectedEventIds.length > 1 ? 's' : ''}`
                      : 'Update Role'}
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </>
      ) : (
        /* Event Review Section */
        <>
          {/* Event Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-yellow-500">{pendingEvents.length}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-green-500">
                {pendingEvents.filter(e => e.status === 'published').length}
              </div>
              <div className="text-sm text-muted-foreground">Published Events</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-blue-500">
                {pendingEvents.reduce((total, event) => total + (event.attendeeCount || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Attendees</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="text-2xl font-bold text-purple-500">
                {pendingEvents.filter(e => e.allowSponsorship).length}
              </div>
              <div className="text-sm text-muted-foreground">Sponsorship Enabled</div>
            </div>
          </div>

          {/* Pending Events */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Events Pending Review</h2>
              <p className="text-muted-foreground text-sm">Review and approve events created by organisers</p>
            </div>

            {loadingPendingEvents ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : pendingEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No events pending review</h3>
                <p className="text-muted-foreground">All events have been reviewed</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingEvents.map((event) => (
                  <div key={event._id} className="p-6 hover:bg-accent/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${event.status === 'draft'
                              ? 'bg-yellow-500/10 text-yellow-600'
                              : 'bg-green-500/10 text-green-600'
                            }`}>
                            {event.status}
                          </span>
                          {event.allowSponsorship && (
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-600">
                              Sponsorship Enabled
                            </span>
                          )}
                        </div>

                        <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            <div>
                              <div>Start: {formatDate(event.startDate || event.date)}</div>
                              <div>Reg. Deadline: {formatDate(event.registrationDeadline)}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <UsersIcon className="h-4 w-4 mr-2" />
                            <div>
                              <div>{event.attendeeCount || 0} registered</div>
                              <div>Max: {event.maxAttendees || 'Unlimited'}</div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div><strong>Location:</strong> {event.location}</div>
                            <div><strong>Category:</strong> {event.category}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div><strong>Created by:</strong> {event.createdBy?.name}</div>
                            <div><strong>Created:</strong> {formatDate(event.createdAt)}</div>
                          </div>
                        </div>

                        {event.sponsorshipRequirements && (
                          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-sm text-purple-800 mb-1">Sponsorship Requirements:</h4>
                            <p className="text-sm text-purple-700">{event.sponsorshipRequirements}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => window.open(`/events/${event._id}`, '_blank')}
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                          title="View event details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {event.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleEventStatusChange(event._id, 'published')}
                              className="p-2 rounded-lg hover:bg-accent transition-colors text-green-600"
                              title="Approve and publish event"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEventStatusChange(event._id, 'cancelled')}
                              className="p-2 rounded-lg hover:bg-accent transition-colors text-red-600"
                              title="Reject event"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Users;