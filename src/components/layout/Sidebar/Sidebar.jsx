import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useHealthData } from '../../../contexts/HealthDataContext';
import Button from '../../shared/Button/Button';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { recentActivity, urgentActions } = useHealthData();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const navigationItems = [
    {
      path: '/dashboard',
      icon: '🏠',
      label: 'Dashboard',
      description: 'Overview and quick stats'
    },
    {
      path: '/requests/new',
      icon: '📋',
      label: 'New Request',
      description: 'Request medical records',
      primary: true
    },
    {
      path: '/records',
      icon: '📁',
      label: 'Records Library',
      description: 'View all documents'
    },
    {
      path: '/profile/health',
      icon: '❤️',
      label: 'Health Profile',
      description: 'Conditions & medications'
    },
    {
      path: '/search',
      icon: '🔍',
      label: 'Search',
      description: 'Find health information'
    }
  ];

  // Mock urgent actions
  const mockUrgentActions = [
    {
      id: 1,
      type: 'medication_refill',
      title: 'Medication Refill Due',
      description: 'Lisinopril expires in 3 days',
      action: () => handleNavigation('/profile/health'),
      priority: 'high'
    },
    {
      id: 2,
      type: 'appointment_reminder',
      title: 'Annual Checkup Due',
      description: 'Schedule with Dr. Johnson',
      action: () => handleNavigation('/requests/new'),
      priority: 'medium'
    }
  ];

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.sidebarContent}>
        <div className={styles.sidebarHeader}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className={styles.userDetails}>
              <h4>{user?.firstName} {user?.lastName}</h4>
              <p>Patient ID: {user?.patientId || 'FH001'}</p>
            </div>
          </div>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className={styles.navigation}>
          <h5 className={styles.sectionTitle}>Navigation</h5>
          {navigationItems.map((item) => (
            <button
              key={item.path}
              className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''} ${item.primary ? styles.primary : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <div className={styles.navContent}>
                <span className={styles.navLabel}>{item.label}</span>
                <span className={styles.navDescription}>{item.description}</span>
              </div>
            </button>
          ))}
        </nav>

        {/* Urgent Actions */}
        {mockUrgentActions.length > 0 && (
          <div className={styles.urgentSection}>
            <h5 className={styles.sectionTitle}>Urgent Actions</h5>
            <div className={styles.urgentList}>
              {mockUrgentActions.map((action) => (
                <div
                  key={action.id}
                  className={`${styles.urgentItem} ${styles[action.priority]}`}
                >
                  <div className={styles.urgentContent}>
                    <h6>{action.title}</h6>
                    <p>{action.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={action.action}
                    className={styles.urgentAction}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className={styles.quickStats}>
          <h5 className={styles.sectionTitle}>Quick Stats</h5>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>12</span>
              <span className={styles.statLabel}>Documents</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>3</span>
              <span className={styles.statLabel}>Active Conditions</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>2</span>
              <span className={styles.statLabel}>Pending Requests</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.sidebarFooter}>
          <Button
            variant="ghost"
            size="small"
            onClick={() => handleNavigation('/settings')}
            className={styles.settingsButton}
          >
            <span className={styles.icon}>⚙️</span>
            Settings
          </Button>
        </div>
      </div>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
    </aside>
  );
};

export default Sidebar;