import toast from './toast';

// Global error handler for API failures
export const handleApiError = (error, context = '') => {
  console.error(`API Error ${context ? `in ${context}` : ''}:`, error);
  
  // Network error (no response)
  if (!error.response) {
    if (error.message?.includes('timeout')) {
      toast.error('Request timed out. The server may be slow or unavailable.');
      return 'Request timeout';
    }
    toast.error('Unable to connect to server. Please check your internet connection.');
    return 'Network error';
  }
  
  // Server responded with error
  const status = error.response.status;
  const data = error.response.data;
  
  switch (status) {
    case 400:
      toast.error(data?.detail || 'Invalid request. Please check your input.');
      return 'Bad request';
      
    case 401:
      toast.error('Session expired. Please log in again.');
      // Will be handled by axios interceptor
      return 'Unauthorized';
      
    case 403:
      toast.error('You don\'t have permission to perform this action.');
      return 'Forbidden';
      
    case 404:
      toast.error(data?.detail || 'The requested resource was not found.');
      return 'Not found';
      
    case 422:
      // Validation errors
      if (Array.isArray(data?.detail)) {
        const messages = data.detail.map(err => err.msg || err.message).join(', ');
        toast.error(`Validation error: ${messages}`);
      } else {
        toast.error(data?.detail || 'Validation error occurred.');
      }
      return 'Validation error';
      
    case 429:
      toast.error('Too many requests. Please try again later.');
      return 'Rate limited';
      
    case 500:
      toast.error('Server error. Please try again later.');
      return 'Server error';
      
    case 502:
    case 503:
    case 504:
      toast.error('Server is temporarily unavailable. Please try again later.');
      return 'Server unavailable';
      
    default:
      toast.error(data?.detail || `An error occurred (${status})`);
      return `Error ${status}`;
  }
};

// Wrapper for async operations with error handling
export const withErrorHandler = async (operation, context = '', options = {}) => {
  const {
    showLoading = true,
    loadingMessage = 'Loading...',
    successMessage = null,
    errorMessage = null,
    onError = null
  } = options;
  
  try {
    if (showLoading) {
      // Could show a loading indicator here if needed
    }
    
    const result = await operation();
    
    if (successMessage) {
      toast.success(successMessage);
    }
    
    return { success: true, data: result };
  } catch (error) {
    const errorType = handleApiError(error, context);
    
    if (errorMessage) {
      toast.error(errorMessage);
    }
    
    if (onError) {
      onError(error, errorType);
    }
    
    return { success: false, error: errorType, details: error };
  }
};

// Retry logic for failed requests
export const retryOperation = async (operation, maxRetries = 3, delayMs = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

// Check if error is recoverable
export const isRecoverableError = (error) => {
  if (!error.response) return true; // Network errors are potentially recoverable
  
  const status = error.response.status;
  return status >= 500 || status === 429; // Server errors and rate limiting
};

// Format error for display
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  if (error.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map(err => err.msg || err.message).join(', ');
    }
    return error.response.data.detail;
  }
  
  if (error.message) return error.message;
  
  return 'An unexpected error occurred';
};

export default {
  handleApiError,
  withErrorHandler,
  retryOperation,
  isRecoverableError,
  formatErrorMessage
};