import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActionTypes } from '../../context/AppContext';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import AppFooter from './AppFooter';

const AppLayout = ({ children, showFooter = false }) => {
  const { state, dispatch } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('🏠 AppLayout: Rendering with auth state:', {
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user ? { id: state.auth.user.id, email: state.auth.user.email } : null,
    loading: state.auth.loading
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    dispatch({ type: ActionTypes.TOGGLE_SIDEBAR });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <AppSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <AppHeader onToggleSidebar={toggleSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="min-h-full">
            {children}
          </div>
        </main>

        {/* Footer (optional) */}
        {showFooter && <AppFooter />}
      </div>
    </div>
  );
};

export default AppLayout;