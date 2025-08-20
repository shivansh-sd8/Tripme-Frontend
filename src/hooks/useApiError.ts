import { useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { ErrorHandler, ApiError, formatErrorForDisplay } from '@/lib/error-handler';

export const useApiError = () => {
  const { showError, showWarning, showInfo } = useToast();

  const handleError = useCallback((error: any, context?: string) => {
    const apiError = ErrorHandler.handleApiError(error);
    
    // Log error for debugging
    ErrorHandler.logError(error, context);
    
    // Show appropriate toast based on error type
    if (ErrorHandler.isNetworkError(apiError)) {
      showError(
        'Connection Error',
        'Please check your internet connection and try again.',
        8000
      );
    } else if (ErrorHandler.isAuthError(apiError)) {
      showError(
        'Authentication Error',
        'Please log in again to continue.',
        6000
      );
    } else if (ErrorHandler.isValidationError(apiError)) {
      showWarning(
        'Validation Error',
        ErrorHandler.getUserFriendlyMessage(apiError),
        8000
      );
    } else if (ErrorHandler.isServerError(apiError)) {
      showError(
        'Server Error',
        'Our team has been notified. Please try again later.',
        10000
      );
    } else {
      showError(
        'Error',
        formatErrorForDisplay(apiError),
        6000
      );
    }
    
    return apiError;
  }, [showError, showWarning]);

  const handleValidationErrors = useCallback((errors: ApiError['errors'], formFields?: string[]) => {
    if (!errors || errors.length === 0) return;
    
    // If specific form fields are provided, show field-specific errors
    if (formFields && formFields.length > 0) {
      const fieldErrors = errors.filter(err => formFields.includes(err.field));
      if (fieldErrors.length > 0) {
        showWarning(
          'Form Errors',
          `Please fix the following issues: ${fieldErrors.map(err => err.message).join(', ')}`,
          8000
        );
        return;
      }
    }
    
    // Show general validation error
    showWarning(
      'Validation Error',
      errors[0]?.message || 'Please check your input and try again.',
      8000
    );
  }, [showWarning]);

  const handleSuccess = useCallback((message: string, title: string = 'Success') => {
    // Note: We need to add showSuccess to the destructured values from useToast
    // For now, we'll use showInfo as a fallback
    showInfo(title, message, 4000);
  }, [showInfo]);

  const handleInfo = useCallback((message: string, title: string = 'Info') => {
    showInfo(title, message, 4000);
  }, [showInfo]);

  const handleWarning = useCallback((message: string, title: string = 'Warning') => {
    showWarning(title, message, 6000);
  }, [showWarning]);

  return {
    handleError,
    handleValidationErrors,
    handleSuccess,
    handleInfo,
    handleWarning,
    isNetworkError: ErrorHandler.isNetworkError,
    isAuthError: ErrorHandler.isAuthError,
    isValidationError: ErrorHandler.isValidationError,
    isServerError: ErrorHandler.isServerError,
    formatError: formatErrorForDisplay,
  };
};
