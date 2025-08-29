import axios from 'axios';

// Configure base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.defaults.baseURL = API_BASE_URL;

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const api = {
  // Auth
  auth: {
    login: (data) => axios.post('/api/v1/auth/login', data),
    register: (data) => axios.post('/api/v1/auth/register', data),
    logout: () => axios.delete('/api/v1/auth/logout'),
    forgotPassword: (data) => axios.post('/api/v1/auth/forgot-password', data),
    resetPassword: (data) => axios.post('/api/v1/auth/reset-password', data),
  },

  // Users
  users: {
    getProfile: () => axios.get('/api/v1/users/showMe'),
    getDashboard: () => axios.get('/api/v1/users/dashboard'),
    updateProfile: (data) => axios.patch('/api/v1/users/updateUser', data),
    updatePassword: (data) => axios.patch('/api/v1/users/updateUserPassword', data),
    getAllUsers: () => axios.get('/api/v1/users'),
    getSingleUser: (id) => axios.get(`/api/v1/users/${id}`),
    banUser: (id) => axios.patch(`/api/v1/users/${id}/ban`),
    unbanUser: (id) => axios.patch(`/api/v1/users/${id}/unban`),
    changeRole: (id, data) => axios.patch(`/api/v1/users/${id}/change-role`, data),
    changeRoleWithEvents: (id, data) => axios.patch(`/api/v1/users/${id}/change-role`, data),
  },

  // Events
  events: {
    getAll: (params) => axios.get('/api/v1/events', { params }),
    getSingle: (id) => axios.get(`/api/v1/events/${id}`),
    create: (data) => axios.post('/api/v1/events', data),
    update: (id, data) => axios.patch(`/api/v1/events/${id}`, data),
    delete: (id) => axios.delete(`/api/v1/events/${id}`),
    getMyEvents: () => axios.get('/api/v1/events/my/events'),
    getStats: (id) => axios.get(`/api/v1/events/stats/${id}`),
    assignOrganiser: (id, data) => axios.post(`/api/v1/events/${id}/assign-organiser`, data),
    removeOrganiser: (id, data) => axios.delete(`/api/v1/events/${id}/remove-organiser`, { data }),
  },

  // Attendees
  attendees: {
    rsvp: (eventId) => axios.post(`/api/v1/attendees/rsvp/${eventId}`),
    cancelRsvp: (eventId) => axios.delete(`/api/v1/attendees/cancel/${eventId}`),
    getMyRsvps: () => axios.get('/api/v1/attendees/my-rsvps'),
    getEventAttendees: (eventId) => axios.get(`/api/v1/attendees/event/${eventId}`),
    updateStatus: (attendeeId, data) => axios.patch(`/api/v1/attendees/${attendeeId}/status`, data),
    banAttendee: (attendeeId) => axios.patch(`/api/v1/attendees/${attendeeId}/ban`),
    unbanAttendee: (attendeeId) => axios.patch(`/api/v1/attendees/${attendeeId}/unban`),
  },

  // Feedback
  feedback: {
    submit: (eventId, data) => axios.post(`/api/v1/feedback/submit/${eventId}`, data),
    getMyFeedback: () => axios.get('/api/v1/feedback/my-feedback'),
    getEventFeedback: (eventId) => axios.get(`/api/v1/feedback/event/${eventId}`),
    getPublicFeedback: (eventId) => axios.get(`/api/v1/feedback/public/${eventId}`),
    update: (feedbackId, data) => axios.patch(`/api/v1/feedback/${feedbackId}`, data),
    delete: (feedbackId) => axios.delete(`/api/v1/feedback/${feedbackId}`),
  },

  // Notifications
  notifications: {
    getAll: () => axios.get('/api/v1/notifications'),
    getStats: () => axios.get('/api/v1/notifications/stats'),
    markAsRead: (id) => axios.patch(`/api/v1/notifications/${id}/read`),
    markAllAsRead: () => axios.patch('/api/v1/notifications/mark-all-read'),
    delete: (id) => axios.delete(`/api/v1/notifications/${id}`),
  },

  // Sponsorships
  sponsorships: {
    create: (eventId, data) => axios.post(`/api/v1/sponsorships/sponsor/${eventId}`, data),
    getMySponsorships: () => axios.get('/api/v1/sponsorships/my-sponsorships'),
    getEventSponsorships: (eventId) => axios.get(`/api/v1/sponsorships/event/${eventId}`),
    updateStatus: (sponsorshipId, data) => axios.patch(`/api/v1/sponsorships/${sponsorshipId}/status`, data),
  },
};

export default api;