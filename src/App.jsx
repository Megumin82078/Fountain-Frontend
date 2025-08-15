import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';
import { ROUTES } from './constants';
import { BackendStatus, ErrorBoundary } from './components/common';

// Import all pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import StateDemo from './pages/demo/StateDemo';
import ConditionsPage from './pages/health-records/ConditionsPage';
import ApiTestPage from './pages/debug/ApiTestPage';
import MedicationsPage from './pages/health-records/MedicationsPage';
import LabResultsPage from './pages/health-records/LabResultsPage';
import VitalSignsPage from './pages/health-records/VitalSignsPage';
import ProceduresPage from './pages/health-records/ProceduresPage';
import RequestManagementPage from './pages/requests/RequestManagementPage';
import RequestTrackingPage from './pages/requests/RequestTrackingPage';
import ProviderManagementPage from './pages/providers/ProviderManagementPage';
import ReminderPage from './pages/alerts/ReminderPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import SettingsPage from './pages/dashboard/SettingsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SupabaseCallback from './components/auth/SupabaseCallback';

// Removed old error boundary - using the new one from components/common

// Component to conditionally render BackendStatus based on route
function ConditionalBackendStatus() {
  const location = useLocation();
  
  // Don't show on landing page
  if (location.pathname === '/') {
    return null;
  }
  
  return <BackendStatus />;
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <SettingsProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.HOME} element={<LandingPage />} />
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.SIGNUP} element={<LoginPage />} />
                
                {/* Supabase Auth Callback - handles email confirmation */}
                <Route path="/auth/callback" element={<SupabaseCallback />} />
                
                {/* Protected Routes */}
                <Route 
                  path={ROUTES.DASHBOARD} 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Health Records Routes */}
                <Route 
                  path={ROUTES.HEALTH_RECORDS} 
                  element={
                    <ProtectedRoute>
                      <Navigate to={ROUTES.CONDITIONS} replace />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path={ROUTES.CONDITIONS} 
                  element={
                    <ProtectedRoute>
                      <ConditionsPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path={ROUTES.MEDICATIONS} 
                  element={
                    <ProtectedRoute>
                      <MedicationsPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path={ROUTES.LABS} 
                  element={
                    <ProtectedRoute>
                      <LabResultsPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path={ROUTES.VITALS} 
                  element={
                    <ProtectedRoute>
                      <VitalSignsPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path={ROUTES.PROCEDURES} 
                  element={
                    <ProtectedRoute>
                      <ProceduresPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Request Management Routes */}
                <Route 
                  path={ROUTES.REQUESTS} 
                  element={
                    <ProtectedRoute>
                      <RequestManagementPage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/requests/track/:requestId" 
                  element={
                    <ProtectedRoute>
                      <RequestTrackingPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Provider Management */}
                <Route 
                  path={ROUTES.PROVIDERS} 
                  element={
                    <ProtectedRoute>
                      <ProviderManagementPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Alerts */}
                <Route 
                  path={ROUTES.ALERTS} 
                  element={
                    <ProtectedRoute>
                      <ReminderPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Profile & Settings Routes */}
                <Route 
                  path={ROUTES.PROFILE} 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path={ROUTES.SETTINGS} 
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Demo Routes */}
                <Route 
                  path={ROUTES.DEMO_STATE} 
                  element={
                    <ProtectedRoute>
                      <StateDemo />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Debug Routes */}
                <Route 
                  path="/debug/api-test" 
                  element={
                    <ProtectedRoute>
                      <ApiTestPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch all route - 404 page */}
                <Route path="*" element={
                  <div className="page-container">
                    <div className="content-container">
                      <div className="flex items-center justify-center min-h-96">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold text-neutral-900 mb-4">404 - Page Not Found</h1>
                          <p className="text-neutral-600 mb-8">The page you're looking for doesn't exist.</p>
                          <Link to={ROUTES.HOME} className="btn-primary">
                            Go to Home
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
              
              {/* Backend Status Monitor - Shows when backend is down (not on landing page) */}
              <ConditionalBackendStatus />
            </div>
          </Router>
        </SettingsProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;