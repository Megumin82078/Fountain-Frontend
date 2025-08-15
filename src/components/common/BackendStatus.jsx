import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const BackendStatus = () => {
  const [status, setStatus] = useState('checking');
  const [showDetails, setShowDetails] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  
  useEffect(() => {
    let mounted = true;
    
    const checkBackend = async () => {
      if (!mounted) return;
      
      try {
        const startTime = Date.now();
        await apiService.healthCheck();
        const endTime = Date.now();
        const timeTaken = endTime - startTime;
        
        if (mounted) {
          setStatus('connected');
          setResponseTime(timeTaken);
          setLastCheckTime(new Date());
          
          // Log response time for debugging
          if (import.meta.env.VITE_DEBUG_MODE === 'true') {
            console.log(`Backend health check: ${timeTaken}ms`);
          }
          
          // Hide details if backend comes back online
          if (status === 'error') {
            setShowDetails(false);
          }
        }
      } catch (error) {
        if (mounted) {
          console.error('Backend health check failed:', error);
          setStatus('error');
          setLastCheckTime(new Date());
          setResponseTime(null);
        }
      }
    };
    
    // Initial check
    checkBackend();
    
    // Check every 30 seconds (or use env variable)
    const interval = parseInt(import.meta.env.VITE_HEALTH_CHECK_INTERVAL || 30000);
    const intervalId = setInterval(checkBackend, interval);
    
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [status]);
  
  // Don't show anything if connected (good UX - no news is good news)
  if (status === 'connected' && !import.meta.env.VITE_ALWAYS_SHOW_BACKEND_STATUS) {
    return null;
  }
  
  // Don't show on landing page unless explicitly enabled
  if (window.location.pathname === '/' && !import.meta.env.VITE_SHOW_BACKEND_STATUS_ON_LANDING) {
    return null;
  }
  
  // Show small indicator if connected and VITE_ALWAYS_SHOW_BACKEND_STATUS is true
  if (status === 'connected') {
    return (
      <div className="fixed bottom-4 right-4 bg-success-500 text-white p-2 rounded-lg shadow-lg flex items-center space-x-2 text-sm">
        <CheckCircleIcon className="h-4 w-4" />
        <span>Backend connected ({responseTime}ms)</span>
      </div>
    );
  }
  
  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg shadow-lg flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span className="text-sm">Checking backend connection...</span>
      </div>
    );
  }
  
  // Show error state
  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50">
      <div className="bg-error-500 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold">Backend Connection Error</h4>
            <p className="text-sm mt-1">
              Cannot connect to the backend server.
            </p>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs underline mt-2 hover:text-gray-200 transition-colors"
            >
              {showDetails ? 'Hide' : 'Show'} details
            </button>
            
            {showDetails && (
              <div className="mt-3 bg-error-600 rounded p-3 text-xs">
                <p className="font-semibold mb-1">To start the backend:</p>
                <code className="block bg-error-700 p-2 rounded font-mono overflow-x-auto">
                  cd fountain-backend<br />
                  uvicorn main:app --reload
                </code>
                <p className="mt-2">
                  Expected at: <span className="font-mono">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</span>
                </p>
                {lastCheckTime && (
                  <p className="mt-1 text-gray-300">
                    Last checked: {lastCheckTime.toLocaleTimeString()}
                  </p>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 bg-error-500 hover:bg-error-400 px-3 py-1 rounded transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Demo mode indicator */}
      <div className="mt-2 bg-warning-500 text-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">
            Running in demo mode with limited functionality
          </span>
        </div>
      </div>
    </div>
  );
};

export default BackendStatus;