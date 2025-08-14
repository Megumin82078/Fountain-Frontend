import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toast } from '../components/common/Alert';

class ToastManager {
  constructor() {
    this.container = null;
    this.root = null;
    this.toasts = [];
  }

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed bottom-0 right-0 z-50 p-4 space-y-4 pointer-events-none';
      document.body.appendChild(this.container);
      this.root = ReactDOM.createRoot(this.container);
    }
  }

  show({ variant = 'info', title, message, duration = 3000 }) {
    if (!this.container) {
      this.init();
    }

    const id = Date.now();
    const toast = { id, variant, title, message, duration };
    
    this.toasts.push(toast);
    this.render();

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  remove(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.render();
  }

  render() {
    const toastElements = this.toasts.map(toast => 
      React.createElement(Toast, {
        key: toast.id,
        variant: toast.variant,
        title: toast.title,
        message: toast.message,
        duration: 0, // We manage duration ourselves
        onClose: () => this.remove(toast.id),
        className: 'pointer-events-auto'
      })
    );

    this.root.render(
      React.createElement('div', { className: 'space-y-4' }, toastElements)
    );
  }

  success(message, title = 'Success') {
    return this.show({ variant: 'success', title, message });
  }

  error(message, title = 'Error') {
    return this.show({ variant: 'error', title, message });
  }

  warning(message, title = 'Warning') {
    return this.show({ variant: 'warning', title, message });
  }

  info(message, title = 'Info') {
    return this.show({ variant: 'info', title, message });
  }
}

// Create singleton instance
const toast = new ToastManager();

// Initialize on first import
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Delay initialization to ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => toast.init());
  } else {
    toast.init();
  }
}

export default toast;