import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ROUTES } from '../../constants';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { state } = useApp();
  const location = useLocation();
  const { isAuthenticated, user, loading } = state.auth;

  console.log('🛡️ ProtectedRoute: Current auth state:', {
    isAuthenticated,
    user: user ? { id: user.id, email: user.email } : null,
    loading,
    pathname: location.pathname
  });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={ROUTES.LOGIN} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Access Denied
              </h2>
              <p className="text-neutral-600 mb-6">
                You don't have permission to access this page. Please contact your administrator if you believe this is an error.
              </p>
              <button
                onClick={() => window.history.back()}
                className="btn-primary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;