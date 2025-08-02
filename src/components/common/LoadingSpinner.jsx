import React from 'react';
import { clsx } from 'clsx';

const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  text = null,
  fullScreen = false,
  className = '',
  ...props
}) => {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variants = {
    primary: 'border-primary-600',
    secondary: 'border-neutral-600',
    success: 'border-success-600',
    warning: 'border-warning-600',
    error: 'border-error-600',
    white: 'border-white'
  };

  const spinnerClasses = clsx(
    'animate-spin rounded-full border-2 border-t-transparent',
    sizes[size],
    variants[variant],
    className
  );

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className={spinnerClasses} {...props} />
          {text && (
            <p className={clsx('mt-4 text-neutral-600', textSizes[size])}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className={spinnerClasses} {...props} />
      {text && (
        <span className={clsx('ml-3 text-neutral-600', textSizes[size])}>
          {text}
        </span>
      )}
    </div>
  );
};

// Skeleton loader component
export const Skeleton = ({
  width = 'full',
  height = '4',
  className = '',
  animate = true,
  ...props
}) => {
  const widths = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '2/3': 'w-2/3',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4'
  };

  const heights = {
    '2': 'h-2',
    '3': 'h-3',
    '4': 'h-4',
    '5': 'h-5',
    '6': 'h-6',
    '8': 'h-8',
    '10': 'h-10',
    '12': 'h-12',
    '16': 'h-16',
    '20': 'h-20'
  };

  return (
    <div 
      className={clsx(
        'bg-neutral-200 rounded',
        widths[width] || `w-${width}`,
        heights[height] || `h-${height}`,
        animate && 'animate-pulse',
        className
      )}
      {...props}
    />
  );
};

// Page loading component
export const PageLoader = ({ 
  text = 'Loading...', 
  description = null,
  className = ''
}) => {
  return (
    <div className={clsx('page-container', className)}>
      <div className="content-container">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center max-w-md mx-auto">
            <LoadingSpinner size="xl" />
            <h3 className="mt-6 text-lg font-medium text-neutral-900">
              {text}
            </h3>
            {description && (
              <p className="mt-2 text-neutral-600">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Card skeleton component
export const CardSkeleton = ({ 
  showImage = false,
  showTitle = true,
  showDescription = true,
  lines = 3,
  className = ''
}) => {
  return (
    <div className={clsx('card animate-pulse', className)}>
      {showImage && (
        <Skeleton height="48" className="mb-4" />
      )}
      {showTitle && (
        <Skeleton width="3/4" height="6" className="mb-3" />
      )}
      {showDescription && (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton 
              key={index}
              width={index === lines - 1 ? '2/3' : 'full'}
              height="4"
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Table skeleton component
export const TableSkeleton = ({ 
  rows = 5,
  columns = 4,
  className = ''
}) => {
  return (
    <div className={clsx('animate-pulse', className)}>
      {/* Table header */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} height="6" width="3/4" />
        ))}
      </div>
      
      {/* Table rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={`row-${rowIndex}`}
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={`cell-${rowIndex}-${colIndex}`} 
                height="4" 
                width={colIndex === 0 ? '2/3' : 'full'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;