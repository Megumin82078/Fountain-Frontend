import React, { useState, useEffect, createContext, useContext } from 'react';
import styles from './NotificationSystem.module.css';

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const showSuccess = (message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      icon: '✅',
      ...options
    });
  };

  const showError = (message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      icon: '❌',
      duration: 7000, // Longer for errors
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      icon: '⚠️',
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      icon: 'ℹ️',
      ...options
    });
  };

  const showLoading = (message, options = {}) => {
    return addNotification({
      type: 'loading',
      message,
      icon: '⏳',
      duration: 0, // Don't auto-remove loading notifications
      ...options
    });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Individual Notification Component
const Notification = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const handleAction = () => {
    if (notification.action) {
      notification.action();
    }
    handleRemove();
  };

  return (
    <div
      className={`
        ${styles.notification} 
        ${styles[notification.type]} 
        ${isVisible ? styles.visible : ''} 
        ${isRemoving ? styles.removing : ''}
      `}
    >
      <div className={styles.content}>
        {notification.icon && (
          <span className={styles.icon}>{notification.icon}</span>
        )}
        
        <div className={styles.messageContent}>
          {notification.title && (
            <h4 className={styles.title}>{notification.title}</h4>
          )}
          <p className={styles.message}>{notification.message}</p>
        </div>
      </div>

      <div className={styles.actions}>
        {notification.actionLabel && (
          <button
            className={styles.actionButton}
            onClick={handleAction}
          >
            {notification.actionLabel}
          </button>
        )}
        
        {notification.type !== 'loading' && (
          <button
            className={styles.closeButton}
            onClick={handleRemove}
            aria-label="Close notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Notification Container
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className={styles.notificationContainer}>
      <div className={styles.notificationList}>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

// Health-specific notification helpers
export const useHealthNotifications = () => {
  const notifications = useNotifications();

  return {
    ...notifications,
    
    // Health-specific convenience methods
    showRecordUploaded: (recordName) => {
      return notifications.showSuccess(
        `${recordName} has been successfully uploaded`,
        {
          title: 'Record Uploaded',
          icon: '📄',
          duration: 6000
        }
      );
    },

    showRequestSubmitted: (providerName) => {
      return notifications.showSuccess(
        `Your records request has been sent to ${providerName}`,
        {
          title: 'Request Submitted',
          icon: '📋',
          actionLabel: 'View Status',
          action: () => window.location.href = '/requests'
        }
      );
    },

    showMedicationReminder: (medicationName, daysLeft) => {
      return notifications.showWarning(
        `${medicationName} prescription expires in ${daysLeft} days`,
        {
          title: 'Medication Reminder',
          icon: '💊',
          actionLabel: 'Refill Now',
          duration: 10000
        }
      );
    },

    showAppointmentReminder: (doctorName, date) => {
      return notifications.showInfo(
        `Upcoming appointment with ${doctorName} on ${date}`,
        {
          title: 'Appointment Reminder',
          icon: '📅',
          actionLabel: 'View Details',
          duration: 8000
        }
      );
    },

    showLabResultsAvailable: (testName) => {
      return notifications.showInfo(
        `New lab results available for ${testName}`,
        {
          title: 'Lab Results Ready',
          icon: '🧪',
          actionLabel: 'View Results',
          action: () => window.location.href = '/profile/health'
        }
      );
    },

    showShareSuccess: (recipientName) => {
      return notifications.showSuccess(
        `Health records successfully shared with ${recipientName}`,
        {
          title: 'Records Shared',
          icon: '🔗',
          duration: 6000
        }
      );
    }
  };
};

export default NotificationProvider;