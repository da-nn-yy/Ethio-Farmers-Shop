import React from "react";
import Icon from "./AppIcon";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // In a real application, you would send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
    console.error('Production error:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center p-8 max-w-md">
            <div className="flex justify-center items-center mb-6">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
                <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-red-200 animate-ping opacity-30" />
              </div>
            </div>
            
            <div className="flex flex-col gap-3 text-center mb-6">
              <h1 className="text-2xl font-medium text-neutral-800">
                {this.props.title || "Something went wrong"}
              </h1>
              <p className="text-neutral-600 text-base">
                {this.props.message || "We encountered an unexpected error while processing your request."}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mt-4 p-4 bg-red-50 rounded-lg">
                  <summary className="cursor-pointer font-medium text-red-800 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="text-sm text-red-700">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {this.state.retryCount < 3 && (
                <button
                  onClick={this.handleRetry}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm"
                >
                  <Icon name="RefreshCw" size={18} color="#fff" />
                  Try Again
                </button>
              )}
              
              <button
                onClick={this.handleReload}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <Icon name="RotateCcw" size={18} color="#fff" />
                Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = "/"}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm"
              >
                <Icon name="Home" size={18} color="#fff" />
                Go Home
              </button>
            </div>

            {this.state.retryCount >= 3 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Multiple retry attempts failed. Please try reloading the page or contact support.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for error boundaries
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error boundary context
export const useErrorBoundary = () => {
  const [error, setError] = React.useState(null);
  
  const resetError = () => setError(null);
  
  const captureError = (error) => {
    setError(error);
  };
  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return { captureError, resetError };
};

export default ErrorBoundary;