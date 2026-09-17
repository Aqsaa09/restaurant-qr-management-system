import axios from 'axios';

// Determine API URL based on environment
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5001/api';
    } else {
      return 'https://res-qr-2.onrender.com/api';
    }
  }
  
  return 'http://localhost:5001/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menu API
export const menuAPI = {
  getAll: () => api.get('/menu'),
  getById: (id) => api.get(`/menu/${id}`),
  getCategories: () => api.get('/menu/categories/all'),
  getByCategory: (category) => api.get(`/menu?category=${category}`)
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getById: (id) => api.get(`/orders/${id}`),
  trackByNumber: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getLatestForTable: (tableId) => api.get(`/orders/table/${tableId}/latest`),
  verifyPayment: (id, paymentData) => api.patch(`/orders/${id}/payment`, paymentData)
};

// Tables API
export const tablesAPI = {
  getByQR: (qrCode) => api.get(`/tables/qr/${qrCode}`),
  getById: (id) => api.get(`/tables/${id}`),
  getAll: () => api.get('/tables')
};

// Feedback API
export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  getAll: (params = {}) => api.get('/feedback', { params }),
  getStats: () => api.get('/feedback/stats')
};

// Service Requests (Call Waiter / Support) API
export const serviceAPI = {
  callWaiter: (data) => api.post('/service-requests', data),
  getAll: (status) => api.get('/service-requests', { params: { status } }),
  resolve: (id) => api.patch(`/service-requests/${id}/status`, { status: 'resolved' })
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  addMenuItem: (item) => api.post('/admin/menu', item),
  updateMenuItem: (id, item) => api.put(`/admin/menu/${id}`, item),
  deleteMenuItem: (id) => api.delete(`/admin/menu/${id}`),
  getTables: () => api.get('/admin/tables'),
  addTable: (table) => api.post('/admin/tables', table),
  updateTable: (id, table) => api.put(`/admin/tables/${id}`, table),
  deleteTable: (id) => api.delete(`/admin/tables/${id}`),
  getFeedback: (params = {}) => api.get('/admin/feedback', { params }),
  getFeedbackStats: () => api.get('/admin/feedback/stats'),
  getServiceRequests: (params = {}) => api.get('/admin/service-requests', { params }),
  resolveServiceRequest: (id) => api.patch(`/admin/service-requests/${id}/resolve`)
};

// Rewards API
export const rewardsAPI = {
  getRewards: (tableId) => api.get(`/rewards/${tableId}`),
  saveRewards: (tableId, data) => api.post(`/rewards/${tableId}`, data),
  applyRewards: (tableId, orderNumber) => api.post(`/rewards/${tableId}/apply/${orderNumber}`)
};

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  verify: () => api.get('/auth/verify'),
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor to add token to all requests
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.hash.includes('login')) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/#/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;