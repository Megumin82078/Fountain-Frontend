import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';

const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000,
  icon = true,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const variants = {
    success: {
      container: 'bg-success-50 border-success-200 text-success-800',
      icon: 'text-success-400',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    error: {
      container: 'bg-error-50 border-error-200 text-error-800',
      icon: 'text-error-400',
      iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 text-warning-800',
      icon: 'text-warning-400',
      iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
    },
    info: {
      container: 'bg-primary-50 border-primary-200 text-primary-800',
      icon: 'text-primary-400',
      iconPath: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
    }
  };

  useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const variantConfig = variants[variant];

  return (
    <div 
      className={clsx(
        'border rounded-lg p-4 animate-fade-in',
        variantConfig.container,
        className
      )}
      {...props}
    >
      <div className="flex">
        {icon && (
          <div className="flex-shrink-0">
            <svg 
              className={clsx('w-5 h-5', variantConfig.icon)} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={variantConfig.iconPath} 
              />
            </svg>
          </div>
        )}
        
        <div className={clsx('flex-1', { 'ml-3': icon })}>
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        
        {dismissible && (
          <div className="flex-shrink-0 ml-3">
            <button
              type="button"
              onClick={handleDismiss}
              className={clsx(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                'hover:bg-black hover:bg-opacity-10 transition-colors',
                variantConfig.icon,
                variant === 'success' && 'focus:ring-success-600 focus:ring-offset-success-50',
                variant === 'error' && 'focus:ring-error-600 focus:ring-offset-error-50',
                variant === 'warning' && 'focus:ring-warning-600 focus:ring-offset-warning-50',
                variant === 'info' && 'focus:ring-primary-600 focus:ring-offset-primary-50'
              )}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Toast notification component
export const Toast = ({
  variant = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Animation duration
  };

  if (!isVisible) return null;

  const variants = {
    success: {
      container: 'bg-white border-success-200 text-success-800 shadow-lg',
      accent: 'bg-success-500'
    },
    error: {
      container: 'bg-white border-error-200 text-error-800 shadow-lg',
      accent: 'bg-error-500'
    },
    warning: {
      container: 'bg-white border-warning-200 text-warning-800 shadow-lg',
      accent: 'bg-warning-500'
    },
    info: {
      container: 'bg-white border-primary-200 text-primary-800 shadow-lg',
      accent: 'bg-primary-500'
    }
  };

  const variantConfig = variants[variant];

  return (
    <div 
      className={clsx(
        'relative max-w-sm w-full border rounded-lg pointer-events-auto overflow-hidden',
        'transform transition-all duration-300 ease-in-out',
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
        variantConfig.container,
        className
      )}
      {...props}
    >
      {/* Accent bar */}
      <div className={clsx('absolute left-0 top-0 bottom-0 w-1', variantConfig.accent)} />
      
      <div className="p-4 pl-6">
        <div className="flex items-start">
          <div className="flex-1">
            {title && (
              <p className="text-sm font-medium">
                {title}
              </p>
            )}
            {message && (
              <p className={clsx('text-sm', { 'mt-1': title })}>
                {message}
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0 ml-4">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;