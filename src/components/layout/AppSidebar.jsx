import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ROUTES, HEALTH_CATEGORIES } from '../../constants';
import { Badge } from '../common';
import { clsx } from 'clsx';
import FountainLogo from '../../assets/Fountain Logo.png';

const AppSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useApp();

  const { unreadCount } = state.alerts;

  const navigationItems = [
    {
      name: 'Dashboard',
      href: ROUTES.DASHBOARD,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      )
    },
    {
      name: 'Health Records',
      href: ROUTES.HEALTH_RECORDS,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      children: [
        {
          name: 'Conditions',
          href: ROUTES.CONDITIONS,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )
        },
        {
          name: 'Medications',
          href: ROUTES.MEDICATIONS,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
          )
        },
        {
          name: 'Lab Results',
          href: ROUTES.LABS,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
            </svg>
          )
        },
        {
          name: 'Vital Signs',
          href: ROUTES.VITALS,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )
        },
        {
          name: 'Procedures',
          href: ROUTES.PROCEDURES,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          )
        }
      ]
    },
    {
      name: 'Requests',
      href: ROUTES.REQUESTS,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Providers',
      href: ROUTES.PROVIDERS,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Reminders',
      href: ROUTES.ALERTS,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 17.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" />
        </svg>
      ),
      badge: unreadCount > 0 ? unreadCount : null
    }
  ];

  const handleNavigation = (href) => {
    navigate(href);
    onClose?.(); // Close mobile sidebar
  };

  const isActive = (href) => {
    if (href === ROUTES.HEALTH_RECORDS) {
      return [ROUTES.CONDITIONS, ROUTES.MEDICATIONS, ROUTES.LABS, ROUTES.VITALS, ROUTES.PROCEDURES].includes(location.pathname);
    }
    return location.pathname === href;
  };

  const isChildActive = (href) => {
    return location.pathname === href;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo fixed at top */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-75 transition-opacity"
          >
            <span className="text-xl font-bold text-black" style={{fontFamily: 'var(--font-display)'}}>Fountain</span>
          </button>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <div key={item.name}>
              <button
                onClick={() => handleNavigation(item.href)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group',
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500 shadow-sm'
                    : 'text-neutral-700 hover:text-primary-700 hover:bg-neutral-50'
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-5 h-5 flex-shrink-0">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <Badge 
                      variant="error" 
                      size="xs"
                      className="min-w-[20px] h-5 flex items-center justify-center"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                  {item.children && (
                    <svg 
                      className={clsx(
                        'w-4 h-4 transition-transform',
                        isActive(item.href) ? 'rotate-90' : ''
                      )} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Sub-navigation */}
              {item.children && isActive(item.href) && (
                <div className="mt-2 ml-8 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child.name}
                      onClick={() => handleNavigation(child.href)}
                      className={clsx(
                        'w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200',
                        isChildActive(child.href)
                          ? 'bg-primary-100 text-primary-800 font-medium'
                          : 'text-neutral-600 hover:text-primary-700 hover:bg-neutral-50'
                      )}
                    >
                      <span className="w-4 h-4 flex-shrink-0">
                        {child.icon}
                      </span>
                      <span>{child.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

      </div>
    </>
  );
};

export default AppSidebar;