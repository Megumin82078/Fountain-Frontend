import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  type = 'text',
  size = 'md',
  variant = 'default',
  fullWidth = true,
  leftIcon = null,
  rightIcon = null,
  onRightIconClick = null,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseClasses = 'block border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent placeholder-neutral-400 disabled:bg-neutral-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'border-neutral-300 focus:ring-primary-500 bg-white text-neutral-900',
    error: 'border-error-300 focus:ring-error-500 bg-white text-neutral-900',
    success: 'border-success-300 focus:ring-success-500 bg-white text-neutral-900'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const inputClasses = clsx(
    baseClasses,
    variants[error ? 'error' : variant],
    sizes[size],
    {
      'w-full': fullWidth,
      'pl-10': leftIcon,
      'pr-10': rightIcon
    },
    className
  );

  const containerClasses = clsx(
    'relative',
    { 'w-full': fullWidth },
    containerClassName
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-neutral-400 w-5 h-5">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div 
            className={clsx(
              "absolute inset-y-0 right-0 pr-3 flex items-center",
              onRightIconClick ? "cursor-pointer" : "pointer-events-none"
            )}
            onClick={onRightIconClick}
          >
            <span className="text-neutral-400 hover:text-neutral-600 w-5 h-5">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-error-600 flex items-center">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className="text-sm text-neutral-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;