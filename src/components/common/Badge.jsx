import React from 'react';
import { clsx } from 'clsx';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  pill = false,
  dot = false,
  icon = null,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium';
  
  const variants = {
    default: 'bg-neutral-100 text-neutral-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
    info: 'bg-blue-100 text-blue-800',
    // Solid variants
    'primary-solid': 'bg-primary-600 text-white',
    'success-solid': 'bg-success-600 text-white',
    'warning-solid': 'bg-warning-600 text-white',
    'error-solid': 'bg-error-600 text-white',
    'info-solid': 'bg-blue-600 text-white',
    // Outline variants
    'primary-outline': 'border border-primary-300 text-primary-700 bg-white',
    'success-outline': 'border border-success-300 text-success-700 bg-white',
    'warning-outline': 'border border-warning-300 text-warning-700 bg-white',
    'error-outline': 'border border-error-300 text-error-700 bg-white'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const badgeClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    {
      'rounded-full': pill,
      'rounded': !pill
    },
    className
  );

  if (dot) {
    return (
      <span className={badgeClasses} {...props}>
        <span className="w-2 h-2 rounded-full bg-current mr-2" />
        {children}
      </span>
    );
  }

  return (
    <span className={badgeClasses} {...props}>
      {icon && (
        <span className={clsx(iconSizes[size], children ? 'mr-1.5' : '')}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

// Health status badge component
export const HealthStatusBadge = ({ status, className = '', ...props }) => {
  const statusConfig = {
    normal: {
      variant: 'success',
      children: 'Normal',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    abnormal: {
      variant: 'error',
      children: 'Abnormal',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      variant: 'warning',
      children: 'Warning',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    pending: {
      variant: 'default',
      children: 'Pending',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant={config.variant}
      icon={config.icon}
      pill
      className={className}
      {...props}
    >
      {config.children}
    </Badge>
  );
};

// Priority badge component
export const PriorityBadge = ({ priority, className = '', ...props }) => {
  const priorityConfig = {
    low: {
      variant: 'success',
      children: 'Low Priority'
    },
    medium: {
      variant: 'warning',
      children: 'Medium Priority'
    },
    high: {
      variant: 'error',
      children: 'High Priority'
    },
    critical: {
      variant: 'error-solid',
      children: 'Critical'
    }
  };

  const config = priorityConfig[priority] || priorityConfig.low;

  return (
    <Badge
      variant={config.variant}
      size="sm"
      pill
      className={className}
      {...props}
    >
      {config.children}
    </Badge>
  );
};

// Request status badge component
export const RequestStatusBadge = ({ status, className = '', ...props }) => {
  const statusConfig = {
    pending: {
      variant: 'warning',
      children: 'Pending',
      dot: true
    },
    in_progress: {
      variant: 'info',
      children: 'In Progress',
      dot: true
    },
    completed: {
      variant: 'success',
      children: 'Completed',
      dot: true
    },
    failed: {
      variant: 'error',
      children: 'Failed',
      dot: true
    },
    cancelled: {
      variant: 'default',
      children: 'Cancelled',
      dot: true
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant={config.variant}
      dot={config.dot}
      pill
      className={className}
      {...props}
    >
      {config.children}
    </Badge>
  );
};

export default Badge;