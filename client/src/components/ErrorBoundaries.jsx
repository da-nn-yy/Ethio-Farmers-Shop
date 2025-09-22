import React from 'react';
import ErrorBoundary from './ErrorBoundary';

// API Error Boundary for API-related errors
export const ApiErrorBoundary = ({ children, onApiError }) => {
  const fallback = (error, retry) => (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center p-8 max-w-md">
        <div className="flex justify-center items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 text-center mb-6">
          <h1 className="text-2xl font-medium text-neutral-800">
            API Connection Error
          </h1>
          <p className="text-neutral-600 text-base">
            We're having trouble connecting to our servers. Please check your internet connection and try again.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={retry}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
          >
            Retry Connection
          </button>
          
          <button
            onClick={() => window.location.href = "/"}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallback}
      onError={onApiError}
      title="Connection Error"
      message="Unable to connect to the server"
    >
      {children}
    </ErrorBoundary>
  );
};

// Route Error Boundary for route-specific errors
export const RouteErrorBoundary = ({ children, routeName }) => {
  const fallback = (error, retry) => (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center p-8 max-w-md">
        <div className="flex justify-center items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 text-center mb-6">
          <h1 className="text-2xl font-medium text-neutral-800">
            Page Error
          </h1>
          <p className="text-neutral-600 text-base">
            {routeName ? `There was an error loading the ${routeName} page.` : 'There was an error loading this page.'}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={retry}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallback}
      title="Page Error"
      message={`Error loading ${routeName || 'page'}`}
    >
      {children}
    </ErrorBoundary>
  );
};

// Component Error Boundary for individual components
export const ComponentErrorBoundary = ({ children, componentName, onError }) => {
  const fallback = (error, retry) => (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-red-800">
          {componentName ? `${componentName} Error` : 'Component Error'}
        </h3>
      </div>
      
      <p className="text-sm text-red-700 mb-3">
        This component encountered an error and couldn't render properly.
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={retry}
          className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallback}
      onError={onError}
      title={`${componentName || 'Component'} Error`}
    >
      {children}
    </ErrorBoundary>
  );
};

// Form Error Boundary for form-related errors
export const FormErrorBoundary = ({ children, formName }) => {
  const fallback = (error, retry) => (
    <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-yellow-800">
          {formName ? `${formName} Form Error` : 'Form Error'}
        </h3>
      </div>
      
      <p className="text-sm text-yellow-700 mb-3">
        There was an error with the form. Your data is safe and you can try again.
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={retry}
          className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded transition-colors duration-200"
        >
          Retry Form
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallback}
      title={`${formName || 'Form'} Error`}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;






























