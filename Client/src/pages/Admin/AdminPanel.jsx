import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  TrendingUp,
  Bell,
  Settings,
  UserCheck,
  UserX,
  Shield,
  BarChart3,
  Activity
} from 'lucide-react';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch multiple data sources
      const [usersResponse, eventsResponse, dashboardResponse] = await Promise.all([
        api.users.getAllUsers(),
        api.events.getAll({ limit: 10 }),
        api.users.getDashboard(),
      ]);

      setRecentUsers(usersResponse.data.users?.slice(0, 5) || []);
      setRecentEvents(eventsResponse.data.events?.slice(0, 5) || []);
      setStats({
        totalUsers: usersResponse.data.users?.length || 0,
        totalEvents: eventsResponse.data.events?.length || 0,
        activeUsers: usersResponse.data.users?.filter(u => !u.isBanned).length || 0,
        bannedUsers: usersResponse.data.users?.filter(u => u.isBanned).length || 0,
        ...dashboardResponse.data,
      });
    } catch (error) {
      toast.error('Failed to load admin dashboard');
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
      fetchDashboardData(); // Refresh data
    } catch (error) {
      const message = error.response?.data?.msg || `Failed to ${action} user`;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const dashboardStats = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: '+12%',
    },
    {
      title: 'Total Events',
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+8%',
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      change: '+5%',
    },
    {
      title: 'Banned Users',
      value: stats?.bannedUsers || 0,
      icon: UserX,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      change: '-2%',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: Users,
      link: '/users',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Create Event',
      description: 'Create a new event',
      icon: Calendar,
      link: '/events',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: Settings,
      link: '#',
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: BarChart3,
      link: '#',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Shield className="h-8 w-8 mr-3 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">
          Manage users, events, and system settings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-green-500 mt-1">{stat.change} from last month</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-card p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className={`p-2 rounded-lg ${action.bgColor} w-fit mb-3`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <h3 className="font-medium mb-1">{action.title}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Users</h2>
            <Link to="/users" className="text-primary hover:text-primary/80 text-sm">
              View all
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-muted-foreground">No users found</p>
          ) : (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'admin'
                            ? 'bg-red-500/10 text-red-500'
                            : user.role === 'organiser'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-green-500/10 text-green-500'
                          }`}>
                          {user.role}
                        </span>
                        {user.isBanned && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-500/10 text-red-500">
                            Banned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Events</h2>
            <Link to="/events" className="text-primary hover:text-primary/80 text-sm">
              View all
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <p className="text-muted-foreground">No events found</p>
          ) : (
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event._id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{event.attendeeCount || 0} attendees</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${new Date(event.date) > new Date()
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-gray-500/10 text-gray-500'
                      }`}>
                      {new Date(event.date) > new Date() ? 'Upcoming' : 'Past'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="mt-8 bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          System Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">98.5%</div>
            <div className="text-sm text-muted-foreground">System Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500 mb-1">1.2s</div>
            <div className="text-sm text-muted-foreground">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500 mb-1">45GB</div>
            <div className="text-sm text-muted-foreground">Storage Used</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;