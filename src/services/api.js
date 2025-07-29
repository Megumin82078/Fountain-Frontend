import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fountain_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('fountain_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });

        const { access_token } = response.data;
        localStorage.setItem('fountain_token', access_token);
        
        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Clear tokens and redirect to login
        localStorage.removeItem('fountain_token');
        localStorage.removeItem('fountain_refresh_token');
        localStorage.removeItem('fountain_user');
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  signup: (userData) => apiClient.post('/auth/sign-up', userData),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refresh_token: refreshToken }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post('/auth/reset-password', { token, password })
};

// Provider API calls
export const providerAPI = {
  search: (params) => apiClient.get('/provider', { params }),
  getById: (id) => apiClient.get(`/provider/${id}`),
  getFacilities: () => apiClient.get('/facilities'),
  getUploadLink: (providerRequestId) => apiClient.get(`/provider/upload-link/${providerRequestId}`),
  uploadFiles: (token, files, onProgress) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    return apiClient.post(`/provider/upload/${token}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
    });
  }
};

// Request batch API calls
export const requestAPI = {
  create: (requestData) => apiClient.post('/request-batches', requestData),
  getAll: () => apiClient.get('/request-batches'),
  getById: (batchId) => apiClient.get(`/request-batches/${batchId}`),
  update: (batchId, updateData) => apiClient.patch(`/request-batches/${batchId}`, updateData),
  delete: (batchId) => apiClient.delete(`/request-batches/${batchId}`)
};

// Profile API calls
export const profileAPI = {
  getDashboard: () => apiClient.get('/profile/dashboard/me'),
  getProfile: () => apiClient.get('/profile/me'),
  updateProfile: (profileData) => apiClient.patch('/profile/me', profileData),
  getHealthData: () => apiClient.get('/profile/me/health-data'),
  getAbnormalResults: () => apiClient.get('/profile/me/health-data/abnormal'),
  getConditions: () => apiClient.get('/profile/me/conditions'),
  getMedications: () => apiClient.get('/profile/me/medications'),
  getVitals: () => apiClient.get('/profile/me/vitals'),
  getLabs: () => apiClient.get('/profile/me/labs')
};

// Alerts API calls
export const alertsAPI = {
  getAll: () => apiClient.get('/alerts'),
  markAsRead: (alertId) => apiClient.patch(`/alerts/${alertId}`, { read: true }),
  dismiss: (alertId) => apiClient.delete(`/alerts/${alertId}`)
};

// Receiver API calls
export const receiverAPI = {
  getPackages: () => apiClient.get('/receiver/packages'),
  getPackageById: (packageId) => apiClient.get(`/receiver/packages/${packageId}`)
};

// File download helper
export const downloadFile = async (url, filename) => {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Error handling helper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return data.message || 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.message || 'An unexpected error occurred.';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection and try again.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred.';
  }
};

export default apiClient;