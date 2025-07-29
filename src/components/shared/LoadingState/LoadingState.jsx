import React from 'react';
import styles from './LoadingState.module.css';

const LoadingState = ({ 
  message = 'Loading...', 
  size = 'medium',
  variant = 'default',
  icon = '⏳',
  className = ''
}) => {
  return (
    <div className={`${styles.loadingState} ${styles[size]} ${styles[variant]} ${className}`}>
      <div className={styles.spinner}>
        <div className={styles.spinnerIcon}>{icon}</div>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

// Specialized loading components for common use cases
export const DocumentLoading = ({ className }) => (
  <LoadingState
    message="Loading your health records..."
    icon="📄"
    className={className}
  />
);

export const SearchLoading = ({ className }) => (
  <LoadingState
    message="Searching your health data..."
    icon="🔍"
    variant="search"
    className={className}
  />
);

export const ProfileLoading = ({ className }) => (
  <LoadingState
    message="Loading your health profile..."
    icon="❤️"
    className={className}
  />
);

export const RequestLoading = ({ className }) => (
  <LoadingState
    message="Processing your request..."
    icon="📋"
    className={className}
  />
);

export const UploadLoading = ({ className }) => (
  <LoadingState
    message="Uploading documents..."
    icon="☁️"
    variant="upload"
    className={className}
  />
);

// Skeleton loading for list items
export const SkeletonLoader = ({ count = 3, height = '80px', className = '' }) => (
  <div className={`${styles.skeletonContainer} ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className={styles.skeletonItem}
        style={{ height }}
      >
        <div className={styles.skeletonAvatar}></div>
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonText}></div>
        </div>
      </div>
    ))}
  </div>
);

// Inline loading spinner for buttons
export const InlineSpinner = ({ size = 'small', className = '' }) => (
  <div className={`${styles.inlineSpinner} ${styles[size]} ${className}`}>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
  </div>
);

export default LoadingState;