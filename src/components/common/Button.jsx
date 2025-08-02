import React from 'react';
import { clsx } from 'clsx';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-elegant focus:ring-primary-500',
    secondary: 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 shadow-elegant focus:ring-primary-500',
    ghost: 'hover:bg-neutral-100 text-neutral-700 focus:ring-primary-500',
    danger: 'bg-error-600 hover:bg-error-700 text-white shadow-elegant focus:ring-error-500',
    success: 'bg-success-600 hover:bg-success-700 text-white shadow-elegant focus:ring-success-500',
    warning: 'bg-warning-600 hover:bg-warning-700 text-white shadow-elegant focus:ring-warning-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500 p-0'
  };

  const sizes = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  };

  const buttonClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    {
      'w-full': fullWidth,
      'cursor-not-allowed': disabled || loading,
      'opacity-75': loading
    },
    className
  );

  const iconElement = icon && (
    <span className={clsx(
      iconSizes[size],
      {
        'mr-2': iconPosition === 'left' && children,
        'ml-2': iconPosition === 'right' && children
      }
    )}>
      {typeof icon === 'string' ? (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {/* This would be replaced with actual icon implementation */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ) : (
        icon
      )}
    </span>
  );

  const loadingSpinner = (
    <div className={clsx('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])}>
    </div>
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className="mr-2">
          {loadingSpinner}
        </span>
      )}
      
      {!loading && icon && iconPosition === 'left' && iconElement}
      
      {children && (
        <span className={loading ? 'opacity-75' : ''}>
          {children}
        </span>
      )}
      
      {!loading && icon && iconPosition === 'right' && iconElement}
    </button>
  );
};

export default Button;