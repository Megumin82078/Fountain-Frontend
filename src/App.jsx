import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';
import { ROUTES } from './constants';

// Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import StateDemo from './pages/demo/StateDemo';
import ConditionsPage from './pages/health-records/ConditionsPage';
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
import { AppLayout } from './components/layout';

function App() {
  return (
    <AppProvider>
      <SettingsProvider>
        <Router>
            <div className="App">
              <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.HOME} element={<LandingPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.SIGNUP} element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route 
              path={ROUTES.DASHBOARD} 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Health Records Routes - Placeholder */}
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
            
            {/* Other Routes - Placeholders */}
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
            
            <Route 
              path={ROUTES.PROVIDERS} 
              element={
                <ProtectedRoute>
                  <ProviderManagementPage />
                </ProtectedRoute>
              } 
            />
            
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
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
          
        </div>
      </Router>
    </SettingsProvider>
</AppProvider>
  );
}

export default App;