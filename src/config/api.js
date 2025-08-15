// API configuration that handles both development proxy and production URLs

// In development, we use the Vite proxy to avoid CORS issues
// In production, we use the direct API URL (assuming CORS is properly configured)
export const getApiBaseUrl = () => {
  // Use Vite proxy in development, actual API URL in production
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '/api';
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://fhfastapi.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

// Always log the configuration for debugging during development
console.log('🔧 API Configuration loaded - baseURL:', API_BASE_URL);