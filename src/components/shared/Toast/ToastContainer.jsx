import React from 'react';
import Toast from './Toast';
import { useUI } from '../../../contexts/UIContext';
import styles from './Toast.module.css';

const ToastContainer = () => {
  const { notifications, removeNotification } = useUI();

  if (!notifications.length) return null;

  return (
    <div className={styles.toastContainer}>
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
          autoHide={notification.duration > 0}
          duration={notification.duration}
        />
      ))}
    </div>
  );
};

export default ToastContainer;