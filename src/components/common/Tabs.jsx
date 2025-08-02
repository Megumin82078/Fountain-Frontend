import React, { useState } from 'react';
import { clsx } from 'clsx';

const Tabs = ({
  tabs = [],
  defaultTab = 0,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
  tabsClassName = '',
  contentClassName = '',
  ...props
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab);
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (index) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(index);
    }
    onChange?.(index, tabs[index]);
  };

  const variants = {
    default: {
      container: 'border-b border-neutral-200',
      tab: 'border-b-2 border-transparent hover:text-neutral-700 hover:border-neutral-300',
      activeTab: 'border-primary-500 text-primary-600',
      inactiveTab: 'text-neutral-500'
    },
    pills: {
      container: 'bg-neutral-100 p-1 rounded-lg',
      tab: 'rounded-md transition-all duration-200',
      activeTab: 'bg-white text-neutral-900 shadow-sm',
      inactiveTab: 'text-neutral-600 hover:text-neutral-900 hover:bg-white hover:bg-opacity-50'
    },
    underline: {
      container: '',
      tab: 'border-b-2 border-transparent hover:border-neutral-200',
      activeTab: 'border-primary-500 text-primary-600',
      inactiveTab: 'text-neutral-500 hover:text-neutral-700'
    }
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const variantConfig = variants[variant];

  return (
    <div className={clsx('w-full', className)} {...props}>
      {/* Tab Headers */}
      <div className={clsx(
        'flex',
        variantConfig.container,
        {
          'w-full': fullWidth,
          'space-x-1': variant === 'pills'
        },
        tabsClassName
      )}>
        {tabs.map((tab, index) => (
          <button
            key={tab.key || index}
            onClick={() => handleTabClick(index)}
            disabled={tab.disabled}
            className={clsx(
              'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              sizes[size],
              variantConfig.tab,
              activeTab === index 
                ? variantConfig.activeTab 
                : variantConfig.inactiveTab,
              {
                'flex-1 text-center': fullWidth,
                'whitespace-nowrap': !fullWidth
              }
            )}
          >
            <div className="flex items-center justify-center space-x-2">
              {tab.icon && (
                <span className="w-5 h-5">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-neutral-200 text-neutral-800 rounded-full">
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={clsx('mt-6', contentClassName)}>
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

// Vertical tabs component
export const VerticalTabs = ({
  tabs = [],
  defaultTab = 0,
  onChange,
  className = '',
  tabsClassName = '',
  contentClassName = '',
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (index) => {
    setActiveTab(index);
    onChange?.(index, tabs[index]);
  };

  return (
    <div className={clsx('flex', className)} {...props}>
      {/* Tab Headers */}
      <div className={clsx(
        'flex flex-col space-y-1 mr-6 min-w-0',
        tabsClassName
      )}>
        {tabs.map((tab, index) => (
          <button
            key={tab.key || index}
            onClick={() => handleTabClick(index)}
            disabled={tab.disabled}
            className={clsx(
              'flex items-center space-x-3 px-4 py-3 text-left rounded-lg font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              activeTab === index
                ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            )}
          >
            {tab.icon && (
              <span className="w-5 h-5 flex-shrink-0">
                {tab.icon}
              </span>
            )}
            <span className="flex-1">{tab.label}</span>
            {tab.badge && (
              <span className="px-2 py-0.5 text-xs font-medium bg-neutral-200 text-neutral-800 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={clsx('flex-1 min-w-0', contentClassName)}>
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

// Tab panel component for better organization
export const TabPanel = ({ children, className = '', ...props }) => {
  return (
    <div className={clsx('focus:outline-none', className)} {...props}>
      {children}
    </div>
  );
};

export default Tabs;