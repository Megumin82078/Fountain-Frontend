import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner, Alert } from '../common';

const SupabaseCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      // Get the hash parameters
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const accessToken = hashParams.get('access_token');
      const error = hashParams.get('error');
      const errorCode = hashParams.get('error_code');
      const errorDescription = hashParams.get('error_description');

      if (error) {
        // Handle errors
        setStatus('error');
        
        if (errorCode === 'otp_expired') {
          setMessage('Email confirmation link has expired. Please sign up again to receive a new confirmation email.');
        } else {
          setMessage(errorDescription || 'Authentication failed. Please try again.');
        }
        
        // Redirect to login after 5 seconds
        setTimeout(() => navigate('/login'), 5000);
      } else if (accessToken) {
        // Handle successful confirmation
        setStatus('success');
        setMessage('Email confirmed successfully! Redirecting to login...');
        
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        
        // Redirect to login after 2 seconds
        setTimeout(() => navigate('/login'), 2000);
      } else {
        // No hash params, redirect to home
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Authentication
          </h2>
          
          {status === 'processing' && (
            <div className="mt-8">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-gray-600">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mt-8">
              <Alert
                variant="success"
                title="Success!"
                message={message}
              />
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-8">
              <Alert
                variant="error"
                title="Authentication Error"
                message={message}
              />
              <p className="mt-4 text-sm text-gray-600">
                You will be redirected to the login page in a few seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupabaseCallback;