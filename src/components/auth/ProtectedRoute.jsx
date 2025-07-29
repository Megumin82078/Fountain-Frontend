import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--color-gray-100)'
      }}>
        <div style={{
          padding: 'var(--spacing-xl)',
          background: 'var(--color-white)',
          borderRadius: 'var(--radius-large)',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--color-gray-300)',
            borderTop: '4px solid var(--color-primary-blue)',
            borderRadius: '50%',
            margin: '0 auto var(--spacing-md)',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            color: 'var(--color-gray-700)',
            fontSize: 'var(--font-size-body)',
            margin: 0
          }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;