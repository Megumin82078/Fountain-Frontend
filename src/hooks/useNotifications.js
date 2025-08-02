import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';

// Custom hook for managing toast notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 5000,
      dismissible: true,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss if duration is set
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, title = 'Success') => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration: 4000
    });
  }, [addNotification]);

  const showError = useCallback((message, title = 'Error') => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 6000
    });
  }, [addNotification]);

  const showWarning = useCallback((message, title = 'Warning') => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 5000
    });
  }, [addNotification]);

  const showInfo = useCallback((message, title = 'Info') => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: 4000
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

// Hook for browser notifications (Web Notifications API)
export const useWebNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  }, []);

  const showNotification = useCallback((title, options = {}) => {
    if (permission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto-close after 6 seconds
      setTimeout(() => {
        notification.close();
      }, 6000);

      return notification;
    }
    return null;
  }, [permission]);

  // Health-specific notification methods
  const showHealthAlert = useCallback((message, severity = 'medium') => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };

    return showNotification(`${icons[severity]} Health Alert`, {
      body: message,
      tag: 'health-alert',
      requireInteraction: severity === 'critical'
    });
  }, [showNotification]);

  const showMedicationReminder = useCallback((medication, time) => {
    return showNotification('💊 Medication Reminder', {
      body: `Time to take ${medication} at ${time}`,
      tag: 'medication-reminder',
      requireInteraction: true
    });
  }, [showNotification]);

  const showAppointmentReminder = useCallback((appointment, time) => {
    return showNotification('📅 Appointment Reminder', {
      body: `${appointment} scheduled for ${time}`,
      tag: 'appointment-reminder',
      requireInteraction: true
    });
  }, [showNotification]);

  return {
    permission,
    requestPermission,
    showNotification,
    showHealthAlert,
    showMedicationReminder,
    showAppointmentReminder,
    isSupported: 'Notification' in window
  };
};

export default useNotifications;