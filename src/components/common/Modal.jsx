import React, { useEffect } from 'react';
import { clsx } from 'clsx';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  overlayClassName = '',
  ...props
}) => {
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full'
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={clsx(
        'fixed inset-0 z-50 overflow-y-auto',
        'bg-black bg-opacity-50 backdrop-blur-sm',
        'flex items-center justify-center p-4',
        'animate-fade-in',
        overlayClassName
      )}
      onClick={handleBackdropClick}
      {...props}
    >
      <div className={clsx(
        'relative bg-white rounded-xl shadow-elegant-lg',
        'w-full mx-auto',
        'animate-scale-in',
        sizes[size],
        className
      )}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            {title && (
              <h3 className="text-lg font-semibold text-neutral-900">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 -m-2"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={clsx(
          'p-6',
          {
            'pt-0': title || showCloseButton,
            'pb-0': footer
          }
        )}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Confirmation modal component
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  ...props
}) => {
  const variantStyles = {
    danger: 'bg-error-600 hover:bg-error-700 text-white',
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    success: 'bg-success-600 hover:bg-success-700 text-white'
  };

  const footer = (
    <div className="flex space-x-3 justify-end">
      <button
        onClick={onClose}
        disabled={loading}
        className="btn-secondary"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={clsx(
          'px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50',
          variantStyles[variant]
        )}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="loading-spinner mr-2"></div>
            Processing...
          </div>
        ) : (
          confirmText
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="sm"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      {...props}
    >
      <div className="text-center">
        <div className={clsx(
          'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4',
          variant === 'danger' && 'bg-error-100',
          variant === 'primary' && 'bg-primary-100',
          variant === 'success' && 'bg-success-100'
        )}>
          {variant === 'danger' && (
            <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {variant === 'primary' && (
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {variant === 'success' && (
            <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <p className="text-neutral-600 leading-relaxed">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default Modal;