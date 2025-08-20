"use client";
import React, { useState } from 'react';
import { useApiError } from '@/hooks/useApiError';
import { useToast } from '@/contexts/ToastContext';
import Button from '@/components/ui/Button';

export default function ErrorHandlingExample() {
  const [loading, setLoading] = useState(false);
  const { handleError, handleSuccess, handleValidationErrors } = useApiError();
  const { showSuccess } = useToast();

  // Example 1: Basic error handling
  const simulateApiError = async () => {
    setLoading(true);
    try {
      // Simulate an API call that fails
      const response = await fetch('/api/nonexistent-endpoint');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      handleError(error, 'API Call');
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Success handling
  const simulateSuccess = () => {
    handleSuccess('Operation completed successfully!', 'Success');
  };

  // Example 3: Validation error handling
  const simulateValidationError = () => {
    const mockValidationError = {
      success: false,
      message: 'Validation failed',
      statusCode: 400,
      errors: [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password must be at least 8 characters' }
      ]
    };
    
    handleValidationErrors(mockValidationError.errors, ['email', 'password']);
  };

  // Example 4: Network error handling
  const simulateNetworkError = () => {
    const networkError = new TypeError('fetch failed');
    handleError(networkError, 'Network Request');
  };

  // Example 5: Server error handling
  const simulateServerError = () => {
    const serverError = {
      success: false,
      message: 'Internal server error',
      statusCode: 500
    };
    handleError(serverError, 'Server Operation');
  };

  // Example 6: Authentication error handling
  const simulateAuthError = () => {
    const authError = {
      success: false,
      message: 'Invalid token',
      statusCode: 401
    };
    handleError(authError, 'Authentication');
  };

  // Example 7: Using toast directly
  const showCustomToast = () => {
    showSuccess('This is a custom success message!', 'Custom Toast');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Error Handling Examples
        </h1>
        <p className="text-gray-600">
          Click the buttons below to see different types of error handling in action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Error Handling */}
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Basic Error Handling
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Simulates an API call that fails and shows how errors are handled.
          </p>
          <Button
            onClick={simulateApiError}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Loading...' : 'Simulate API Error'}
          </Button>
        </div>

        {/* Success Handling */}
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Success Handling
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Shows how success messages are displayed.
          </p>
          <Button
            onClick={simulateSuccess}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Show Success Message
          </Button>
        </div>

        {/* Validation Error Handling */}
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Validation Error Handling
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Simulates form validation errors with field-specific messages.
          </p>
          <Button
            onClick={simulateValidationError}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Simulate Validation Error
          </Button>
        </div>

        {/* Network Error Handling */}
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Network Error Handling
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Simulates network connectivity issues.
          </p>
          <Button
            onClick={simulateNetworkError}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            Simulate Network Error
          </Button>
        </div>

        {/* Server Error Handling */}
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Server Error Handling
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Simulates server-side errors (5xx status codes).
          </p>
          <Button
            onClick={simulateServerError}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Simulate Server Error
          </Button>
        </div>

        {/* Authentication Error Handling */}
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Authentication Error Handling
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Simulates authentication and authorization errors.
          </p>
          <Button
            onClick={simulateAuthError}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Simulate Auth Error
          </Button>
        </div>

        {/* Custom Toast */}
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Custom Toast
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Shows how to use the toast system directly.
          </p>
          <Button
            onClick={showCustomToast}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Show Custom Toast
          </Button>
        </div>
      </div>

      {/* Information Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          How to Use Error Handling
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>1. Import the hook:</strong> <code>import {'{'} useApiError {'}'} from '@/hooks/useApiError';</code>
          </p>
          <p>
            <strong>2. Use in your component:</strong> <code>const { handleError, handleSuccess } = useApiError();</code>
          </p>
          <p>
            <strong>3. Handle errors:</strong> <code>handleError(error, 'Context');</code>
          </p>
          <p>
            <strong>4. Show success:</strong> <code>handleSuccess('Message', 'Title');</code>
          </p>
        </div>
      </div>

      {/* Features List */}
      <div className="mt-6 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Error Handling Features
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          <li>✅ Automatic error type detection</li>
          <li>✅ User-friendly error messages</li>
          <li>✅ Toast notifications</li>
          <li>✅ Development vs production error details</li>
          <li>✅ Validation error handling</li>
          <li>✅ Network error handling</li>
          <li>✅ Authentication error handling</li>
          <li>✅ Server error handling</li>
          <li>✅ Error logging and debugging</li>
          <li>✅ Consistent error format</li>
        </ul>
      </div>
    </div>
  );
}
