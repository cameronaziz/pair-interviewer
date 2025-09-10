'use client';

import { useEffect } from 'react';

const GlobalErrorHandler: React.FC = () => {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);

      // Prevent the default behavior (which would log to console)
      event.preventDefault();

      // You can add additional error reporting here if needed
      // For example, sending to an error tracking service
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Uncaught Error:', event.error);

      // You can add additional error reporting here if needed
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default GlobalErrorHandler;
