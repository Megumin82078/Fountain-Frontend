// API configuration that handles both development proxy and production URLs

// In development, we use the Vite proxy to avoid CORS issues
// In production, we use the direct API URL (assuming CORS is properly configured)
export const getApiBaseUrl = () => {
  // If we're in development mode (localhost), use the proxy
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '/api';
  }
  
  // Otherwise, use the environment variable or fallback
  return import.meta.env.VITE_API_BASE_URL || 'https://fhfastapi.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the configuration for debugging
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('API Configuration:', {
    hostname: window.location.hostname,
    isDevelopment: window.location.hostname === 'localhost',
    apiBaseUrl: API_BASE_URL,
    envApiUrl: import.meta.env.VITE_API_BASE_URL
  });
}