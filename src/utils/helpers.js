import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';

// Date helper functions
export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatStr) : 'Invalid Date';
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = parseISO(dateString);
    return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : 'Unknown';
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Unknown';
  }
};

// Health data helpers
export const isAbnormalLabResult = (value, refLow, refHigh) => {
  if (value === null || value === undefined) return false;
  if (refLow !== null && value < refLow) return true;
  if (refHigh !== null && value > refHigh) return true;
  return false;
};

export const isAbnormalVitalSign = (value, refLow, refHigh) => {
  return isAbnormalLabResult(value, refLow, refHigh);
};

export const getHealthStatusColor = (isAbnormal) => {
  return isAbnormal ? 'error' : 'success';
};

export const getHealthStatusText = (isAbnormal) => {
  return isAbnormal ? 'Abnormal' : 'Normal';
};

// Alert severity helpers
export const getAlertSeverityColor = (severity) => {
  const severityColors = {
    low: 'text-success-600 bg-success-100',
    medium: 'text-warning-600 bg-warning-100',
    high: 'text-error-600 bg-error-100',
    critical: 'text-error-800 bg-error-200'
  };
  return severityColors[severity] || severityColors.medium;
};

export const getAlertSeverityIcon = (severity) => {
  const severityIcons = {
    low: 'info',
    medium: 'alert-triangle',
    high: 'alert-circle',
    critical: 'alert-octagon'
  };
  return severityIcons[severity] || severityIcons.medium;
};

// Form validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // Min 8 chars, needs uppercase, lowercase and number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhone = (phone) => {
  // Simple phone check
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Text helpers
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatName = (firstName, lastName) => {
  if (!firstName && !lastName) return 'Unknown';
  if (!firstName) return lastName;
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
};

// Number formatting helpers
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return 'N/A';
  if (isNaN(value)) return 'Invalid';
  
  return Number(value).toFixed(decimals);
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  if (isNaN(amount)) return 'Invalid';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Array helpers
export const groupByCategory = (items, categoryKey = 'category') => {
  return items.reduce((groups, item) => {
    const category = item[categoryKey] || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});
};

export const sortByDate = (items, dateKey = 'created_at', ascending = false) => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateKey]);
    const dateB = new Date(b[dateKey]);
    
    if (ascending) {
      return dateA - dateB;
    }
    return dateB - dateA;
  });
};

// Local storage helpers
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

// Debounce helper
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Error helpers
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

export const isNetworkError = (error) => {
  return !error.response && error.code === 'NETWORK_ERROR';
};

// API response utilities
export const extractApiData = (response) => {
  return response?.data || response;
};

export const isApiSuccess = (response) => {
  return response?.status >= 200 && response?.status < 300;
};