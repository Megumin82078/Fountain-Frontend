import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Store error details
    this.setState({
      error,
      errorInfo
    });
    
    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // If a reset callback is provided, call it
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleReset);
      }

      // Default fallback UI with inline styles
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '16px'
        }}>
          <div style={{
            maxWidth: '512px',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '40px'
            }}>
              ⚠️
            </div>
            
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '8px' 
            }}>
              Oops! Something went wrong
            </h1>
            
            <p style={{ 
              color: '#4b5563', 
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              We encountered an unexpected error. The issue has been logged and we'll look into it.
            </p>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ textAlign: 'left', marginBottom: '24px' }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  fontSize: '14px', 
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  Error details (development only)
                </summary>
                <pre style={{ 
                  marginTop: '8px',
                  fontSize: '12px',
                  backgroundColor: '#f3f4f6',
                  padding: '16px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  border: '1px solid #e5e7eb'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '12px', 
              justifyContent: 'center',
              '@media (min-width: 640px)': {
                flexDirection: 'row'
              }
            }}>
              <button
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onClick={this.handleReset}
              >
                Try Again
              </button>
              
              <button
                style={{
                  backgroundColor: 'white',
                  color: '#374151',
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onClick={() => window.location.href = '/'}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specific error boundary for smaller components
export const ComponentErrorBoundary = ({ children, fallback, onError }) => {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => {
        if (fallback) {
          return fallback(error, errorInfo, reset);
        }
        
        return (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '20px'
            }}>
              ⚠️
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Component Error
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#4b5563',
              marginBottom: '16px'
            }}>
              This component encountered an error and couldn't load properly.
            </p>
            <button
              style={{
                fontSize: '14px',
                padding: '6px 12px',
                backgroundColor: 'white',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              onClick={reset}
            >
              Retry
            </button>
          </div>
        );
      }}
      onReset={onError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;