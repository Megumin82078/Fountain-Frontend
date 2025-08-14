import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ActionTypes } from '../../context/AppContext';
import { useAuth } from '../../hooks/useApi';
import { ROUTES } from '../../constants';
import { Button, Badge } from '../common';
import { clsx } from 'clsx';

const AppHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useApp();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user } = state.auth;
  const { unreadCount } = state.alerts;

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNotificationClick = () => {
    navigate(ROUTES.ALERTS);
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    navigate(ROUTES.PROFILE);
    setShowUserMenu(false);
  };

  const getPageTitle = () => {
    const pathTitles = {
      [ROUTES.DASHBOARD]: 'Dashboard',
      [ROUTES.CONDITIONS]: 'Conditions',
      [ROUTES.MEDICATIONS]: 'Medications',
      [ROUTES.LABS]: 'Lab Results',
      [ROUTES.VITALS]: 'Vital Signs',
      [ROUTES.PROCEDURES]: 'Procedures',
      [ROUTES.REQUESTS]: 'Request Management',
      [ROUTES.PROVIDERS]: 'Healthcare Providers',
      [ROUTES.ALERTS]: 'Health Reminders',
      [ROUTES.PROFILE]: 'Profile',
      [ROUTES.SETTINGS]: 'Settings'
    };

    return pathTitles[location.pathname] || 'Fountain';
  };

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-3 lg:px-8">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-gray-600 hover:text-black transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-black">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Clean Search */}
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search records..."
              className="w-64 pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Simple Actions */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={() => navigate(ROUTES.REQUESTS)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-black border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Request</span>
            </button>
          </div>

          {/* Clean Notifications */}
          <button
            onClick={handleNotificationClick}
            className="relative p-2 text-gray-600 hover:text-black transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Clean User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || 'Patient'}
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-elegant-lg z-50">
                <div className="py-1">
                  <div className="px-4 py-3 border-b border-neutral-200">
                    <p className="text-sm font-medium text-neutral-900">
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                  
                  <button
                    onClick={() => {
                      navigate(ROUTES.SETTINGS);
                      setShowUserMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>

                  <div className="border-t border-neutral-200 my-1"></div>
                  <button
                    onClick={handleNotificationClick}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                      </svg>
                      Reminders
                    </div>
                    {unreadCount > 0 && (
                      <Badge variant="error" size="xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </button>

                  <div className="border-t border-neutral-200 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-error-700 hover:bg-error-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search records..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <button
            onClick={() => navigate(ROUTES.REQUESTS)}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Click outside handler */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default AppHeader;