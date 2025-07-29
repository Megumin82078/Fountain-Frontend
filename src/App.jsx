import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppProvider from './contexts/AppProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout/AppLayout';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RecordsPage from './pages/records/RecordsPage';
import HealthProfilePage from './pages/profile/HealthProfilePage';
import NewRequestPage from './pages/requests/NewRequestPage';
import SearchResultsPage from './pages/search/SearchResultsPage';
import './styles/design-system.css';
import './styles/globals.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/requests/new" element={
              <ProtectedRoute>
                <AppLayout>
                  <NewRequestPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/requests/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <div>Requests</div>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/records" element={
              <ProtectedRoute>
                <AppLayout>
                  <RecordsPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <AppLayout>
                  <SearchResultsPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile/health" element={
              <ProtectedRoute>
                <AppLayout>
                  <HealthProfilePage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <HealthProfilePage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout>
                  <div>Settings</div>
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Provider Routes */}
            <Route path="/provider/upload/:token" element={<div>Provider Upload</div>} />
            
            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App
