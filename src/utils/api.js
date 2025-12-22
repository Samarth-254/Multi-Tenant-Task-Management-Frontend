import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Organizations API
export const organizationsAPI = {
  get: () => api.get('/organizations'),
  update: (data) => api.put('/organizations', data),
  getUsers: (params) => api.get('/organizations/users', { params }),
  removeUser: (userId) => api.delete(`/organizations/users/${userId}`),
  updateSettings: (settings) => api.put('/organizations/settings', settings),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
  deactivateUser: (userId) => api.put(`/users/${userId}/deactivate`),
  activateUser: (userId) => api.put(`/users/${userId}/activate`),
  changePassword: (passwords) => api.put('/users/change-password', passwords),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (taskData) => api.post('/tasks', taskData),
  getTask: (taskId) => api.get(`/tasks/${taskId}`),
  updateTask: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  addComment: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }),
};

// Invitations API
export const invitationsAPI = {
  send: (invitationData) => api.post('/invitations', invitationData),
  getAll: (params) => api.get('/invitations', { params }),
  getInvitation: (token) => api.get(`/invitations/${token}`),
  acceptInvitation: (token, userData) => api.post(`/invitations/${token}/accept`, userData),
  cancel: (invitationId) => api.delete(`/invitations/${invitationId}`),
  resend: (invitationId) => api.post(`/invitations/${invitationId}/resend`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markMultipleAsRead: (notificationIds) => api.put('/notifications/mark-read', { notificationIds }),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getStats: () => api.get('/notifications/stats'),
};

export default api;
