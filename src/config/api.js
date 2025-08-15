// API configuration that handles both development proxy and production URLs

// In development, we use the Vite proxy to avoid CORS issues
// In production, we use the direct API URL (assuming CORS is properly configured)
export const getApiBaseUrl = () => {
  // Always use /api prefix - handled by Vite proxy in dev, Netlify proxy in production
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Always log the configuration for debugging during development
console.log('🔧 API Configuration loaded - baseURL:', API_BASE_URL);