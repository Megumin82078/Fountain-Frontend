import React from 'react';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default' // default, minimal, card
}) => {
  const variantStyles = {
    default: 'bg-gray-50 rounded-lg p-8',
    minimal: 'py-8',
    card: 'bg-white border border-gray-200 rounded-lg p-8 shadow-sm'
  };

  return (
    <div className={`text-center ${variantStyles[variant]}`}>
      {Icon && (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;