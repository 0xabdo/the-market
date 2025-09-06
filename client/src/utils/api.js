import axios from 'axios';
import { API_BASE_URL, API_KEY } from '../config/api';

// Export the base URL for use in other files
export const API_URL = API_BASE_URL;

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

// Request interceptor to add API key and auth token
api.interceptors.request.use(
  (config) => {
    // Validate API key is available
    if (!API_KEY) {
      console.error('❌ API Key is missing! Please check your .env file');
      return Promise.reject(new Error('API Key is not configured'));
    }
    
    // Add API key to all requests
    config.headers['X-API-Key'] = API_KEY;
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add origin header for security validation
    config.headers.Origin = window.location.origin;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle API key errors
    if (error.response?.status === 401 && error.response?.data?.error === 'API key required') {
      console.error('API key is missing or invalid');
      // You might want to redirect to an error page or show a message
    }
    
    // Handle origin validation errors
    if (error.response?.status === 403 && error.response?.data?.error === 'Invalid origin') {
      console.error('Request origin is not allowed');
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  verifyEmail: (token) => api.post('/api/auth/verify-email', { token }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/api/auth/reset-password', { token, password }),
  refreshToken: () => api.post('/api/auth/refresh-token'),
};

export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (userData) => api.put('/api/users/profile', userData),
  getUser: (userId) => api.get(`/api/users/${userId}`),
  getUsers: (params) => api.get('/api/users', { params }),
};

export const productAPI = {
  getProducts: (params) => api.get('/api/products', { params }),
  getProduct: (productId) => api.get(`/api/products/${productId}`),
  createProduct: (productData) => api.post('/api/products', productData),
  updateProduct: (productId, productData) => api.put(`/api/products/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/api/products/${productId}`),
  searchProducts: (query) => api.get(`/api/products/search?q=${encodeURIComponent(query)}`),
};

export const orderAPI = {
  getOrders: (params) => api.get('/api/orders', { params }),
  getOrder: (orderId) => api.get(`/api/orders/${orderId}`),
  createOrder: (orderData) => api.post('/api/orders', orderData),
  updateOrder: (orderId, orderData) => api.put(`/api/orders/${orderId}`, orderData),
  cancelOrder: (orderId) => api.patch(`/api/orders/${orderId}/cancel`),
};

export const reviewAPI = {
  getReviews: (params) => api.get('/api/reviews', { params }),
  createReview: (reviewData) => api.post('/api/reviews', reviewData),
  updateReview: (reviewId, reviewData) => api.put(`/api/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`/api/reviews/${reviewId}`),
};

export const messageAPI = {
  getMessages: (params) => api.get('/api/messages', { params }),
  sendMessage: (messageData) => api.post('/api/messages', messageData),
  markAsRead: (messageId) => api.patch(`/api/messages/${messageId}/read`),
};

export const uploadAPI = {
  uploadImage: (formData) => api.post('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  uploadFile: (formData) => api.post('/api/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  updateUser: (userId, userData) => api.put(`/api/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  getProducts: (params) => api.get('/api/admin/products', { params }),
  updateProduct: (productId, productData) => api.put(`/api/admin/products/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/api/admin/products/${productId}`),
  getOrders: (params) => api.get('/api/admin/orders', { params }),
  updateOrder: (orderId, orderData) => api.put(`/api/admin/orders/${orderId}`, orderData),
};

export default api;
