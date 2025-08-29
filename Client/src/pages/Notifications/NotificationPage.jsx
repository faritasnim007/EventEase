import { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Calendar,
  Users,
  Star,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.notifications.getAll();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.notifications.getStats();
      setStats(response.data.stats || { total: 0, unread: 0 });
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.notifications.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.notifications.delete(notificationId);
      const deletedNotif = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      setStats(prev => ({
        total: Math.max(0, prev.total - 1),
        unread: prev.unread - (deletedNotif?.isRead ? 0 : 1)
      }));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event_registration':
      case 'event_reminder':
      case 'event_update':
        return Calendar;
      case 'organiser_assignment':
      case 'user_ban':
      case 'user_unban':
        return Users;
      case 'feedback_received':
        return Star;
      case 'sponsorship_update':
        return DollarSign;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'event_registration':
      case 'event_reminder':
        return 'text-blue-500 bg-blue-500/10';
      case 'organiser_assignment':
        return 'text-green-500 bg-green-500/10';
      case 'user_ban':
        return 'text-red-500 bg-red-500/10';
      case 'user_unban':
        return 'text-green-500 bg-green-500/10';
      case 'feedback_received':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'sponsorship_update':
        return 'text-purple-500 bg-purple-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Bell className="h-8 w-8 mr-3 text-primary" />
          Notifications
        </h1>
        <p className="text-muted-foreground">
          Stay updated with your events and activities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Notifications</div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-2xl font-bold text-blue-500">{stats.unread}</div>
          <div className="text-sm text-muted-foreground">Unread</div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-2xl font-bold text-green-500">{stats.total - stats.unread}</div>
          <div className="text-sm text-muted-foreground">Read</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card p-4 rounded-lg border border-border mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn-outline text-sm"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-card rounded-lg border border-border">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'unread' ? 'No unread notifications' :
                filter === 'read' ? 'No read notifications' :
                  'No notifications yet'}
            </h3>
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'You\'ll see notifications about events, registrations, and updates here.'
                : `Try changing the filter to see ${filter === 'unread' ? 'all' : 'unread'} notifications.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColor(notification.type);

              return (
                <div
                  key={notification._id}
                  className={`p-6 hover:bg-accent/50 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''
                    }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${colorClasses} flex-shrink-0`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium mb-1">
                            {notification.title}
                            {!notification.isRead && (
                              <span className="ml-2 w-2 h-2 bg-primary rounded-full inline-block" />
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-1 rounded hover:bg-accent transition-colors text-green-500"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-1 rounded hover:bg-accent transition-colors text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notification Types Info */}
      <div className="mt-8 bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Notification Types
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>Event registrations and reminders</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <span>Organiser assignments and user updates</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Feedback and rating notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <span>Sponsorship status updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;