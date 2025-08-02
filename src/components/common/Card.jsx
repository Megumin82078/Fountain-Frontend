import React from 'react';
import { clsx } from 'clsx';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  variant = 'default',
  padding = 'md',
  shadow = 'default',
  hover = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-xl border transition-all duration-200';
  
  const variants = {
    default: 'border-neutral-200',
    success: 'border-success-200 bg-success-50',
    warning: 'border-warning-200 bg-warning-50',
    error: 'border-error-200 bg-error-50',
    info: 'border-primary-200 bg-primary-50'
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-elegant',
    md: 'shadow-md',
    lg: 'shadow-elegant-lg',
    xl: 'shadow-xl'
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const cardClasses = clsx(
    baseClasses,
    variants[variant],
    shadows[shadow],
    {
      'hover:shadow-elegant-lg hover:-translate-y-1 cursor-pointer': hover,
      'cursor-pointer': onClick
    },
    className
  );

  const bodyClasses = clsx(
    paddings[padding],
    {
      'pt-0': title || subtitle,
      'pb-0': footer
    },
    bodyClassName
  );

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {(title || subtitle) && (
        <div className={clsx('border-b border-neutral-200 px-6 py-4', headerClassName)}>
          {title && (
            <h3 className="text-lg font-semibold text-neutral-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={bodyClasses}>
        {children}
      </div>
      
      {footer && (
        <div className={clsx('bg-neutral-50 border-t border-neutral-200 px-6 py-4 rounded-b-xl', footerClassName)}>
          {footer}
        </div>
      )}
    </div>
  );
};

// Specialized card components
export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  className = '',
  ...props 
}) => {
  const changeColors = {
    positive: 'text-success-600',
    negative: 'text-error-600',
    neutral: 'text-neutral-600'
  };

  return (
    <Card 
      className={clsx('relative overflow-hidden', className)}
      padding="md"
      hover
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          {change && (
            <p className={clsx('text-sm font-medium flex items-center mt-2', changeColors[changeType])}>
              {changeType === 'positive' && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              )}
              {changeType === 'negative' && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                </svg>
              )}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="w-6 h-6 text-primary-600">
                {icon}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export const HealthCard = ({
  category,
  value,
  unit,
  status,
  date,
  trend,
  className = '',
  ...props
}) => {
  const statusColors = {
    normal: 'text-success-600 bg-success-100',
    abnormal: 'text-error-600 bg-error-100',
    warning: 'text-warning-600 bg-warning-100'
  };

  return (
    <Card 
      className={clsx('group', className)}
      padding="md"
      hover
      {...props}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-neutral-900 group-hover:text-primary-600 transition-colors">
          {category}
        </h4>
        {status && (
          <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', statusColors[status])}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>
      
      <div className="flex items-baseline space-x-2 mb-2">
        <span className="text-2xl font-bold text-neutral-900">{value}</span>
        {unit && <span className="text-sm text-neutral-500">{unit}</span>}
      </div>
      
      <div className="flex items-center justify-between text-sm text-neutral-500">
        {date && <span>{date}</span>}
        {trend && (
          <div className="flex items-center">
            {trend > 0 ? (
              <svg className="w-4 h-4 mr-1 text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            ) : trend < 0 ? (
              <svg className="w-4 h-4 mr-1 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
              </svg>
            ) : null}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;