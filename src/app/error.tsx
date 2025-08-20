"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
    
    // You could also send this to an error reporting service like Sentry
    // Sentry.captureException(error);
  }, [error]);

  const handleReset = () => {
    // Clear the error and try to recover
    reset();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Something Went Wrong
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            We&apos;re sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
          </p>
          {error.digest && (
            <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded-lg inline-block">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details (Development):</h3>
            <p className="text-sm text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-sm text-red-600 cursor-pointer">Stack Trace</summary>
                <pre className="text-xs text-red-600 mt-2 whitespace-pre-wrap overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            onClick={handleReset}
            className="flex items-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 rounded-xl shadow-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
          
          <Button
            onClick={handleGoBack}
            className="flex items-center px-6 py-3 bg-gray-600 text-white hover:bg-gray-700 transition-all duration-200 rounded-xl shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
          
          <Button
            onClick={handleGoHome}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-200 rounded-xl shadow-lg shadow-purple-500/25"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Button>
        </div>

        {/* Help Section */}
        <div className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Still Having Issues?
          </h3>
          <p className="text-gray-600 mb-4">
            If the problem persists, please contact our support team with the error details above.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/support')}
              className="px-6 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors rounded-lg"
            >
              Contact Support
            </Button>
            <Button
              onClick={() => router.push('/help')}
              className="px-6 py-2 bg-green-100 text-green-700 hover:bg-green-200 transition-colors rounded-lg"
            >
              Help Center
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            💡 Tip: Try refreshing the page or clearing your browser cache
          </p>
        </div>
      </div>
    </div>
  );
}

