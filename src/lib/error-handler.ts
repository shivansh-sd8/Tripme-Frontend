export interface ApiError {
  success: false;
  message: string;
  statusCode?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class ErrorHandler {
  /**
   * Handle API errors and return a standardized error object
   */
  static handleApiError(error: any): ApiError {
    // If it's already our ApiError format, return as is
    if (error && typeof error === 'object' && error.success === false) {
      return error;
    }

    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        message: 'Network error. Please check your internet connection.',
        statusCode: 0
      };
    }

    // Handle HTTP errors
    if (error.status || error.statusCode) {
      const status = error.status || error.statusCode;
      let message = 'An error occurred while processing your request.';

      switch (status) {
        case 400:
          message = 'Bad request. Please check your input and try again.';
          break;
        case 401:
          message = 'You are not authorized to perform this action. Please log in.';
          break;
        case 403:
          message = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 409:
          message = 'Conflict. The resource already exists or cannot be created.';
          break;
        case 422:
          message = 'Validation error. Please check your input.';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
          message = 'Internal server error. Please try again later.';
          break;
        case 503:
          message = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          message = `Error ${status}: ${error.message || 'An unexpected error occurred.'}`;
      }

      return {
        success: false,
        message,
        statusCode: status,
        errors: error.errors || []
      };
    }

    // Handle validation errors
    if (error.name === 'ValidationError' && error.details) {
      const validationErrors = error.details.map((detail: any) => ({
        field: detail.path?.join('.') || 'unknown',
        message: detail.message
      }));

      return {
        success: false,
        message: 'Validation error. Please check your input.',
        statusCode: 400,
        errors: validationErrors
      };
    }

    // Handle generic errors
    return {
      success: false,
      message: error.message || 'An unexpected error occurred.',
      statusCode: 500,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }

  /**
   * Extract validation errors from API error response
   */
  static extractValidationErrors(error: ApiError): ValidationError[] {
    if (error.errors && Array.isArray(error.errors)) {
      return error.errors;
    }
    return [];
  }

  /**
   * Get field-specific error message
   */
  static getFieldError(field: string, errors: ValidationError[]): string | null {
    const fieldError = errors.find(err => err.field === field);
    return fieldError ? fieldError.message : null;
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: ApiError): boolean {
    return error.statusCode === 0 || error.message.includes('Network error');
  }

  /**
   * Check if error is an authentication error
   */
  static isAuthError(error: ApiError): boolean {
    return error.statusCode === 401 || error.statusCode === 403;
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: ApiError): boolean {
    return error.statusCode === 400 || error.statusCode === 422;
  }

  /**
   * Check if error is a server error
   */
  static isServerError(error: ApiError): boolean {
    return error.statusCode && error.statusCode >= 500;
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: ApiError): string {
    // If it's a validation error with specific field errors, show the first one
    if (this.isValidationError(error) && error.errors && error.errors.length > 0) {
      return error.errors[0].message;
    }

    // Return the main error message
    return error.message;
  }

  /**
   * Log error for debugging (development only)
   */
  static logError(error: any, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
      console.error('Error details:', error);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
      console.groupEnd();
    }
  }

  /**
   * Handle async operations with error catching
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<{ data: T | null; error: ApiError | null }> {
    try {
      const data = await operation();
      return { data, error: null };
    } catch (error) {
      const apiError = this.handleApiError(error);
      this.logError(error, context);
      return { data: null, error: apiError };
    }
  }
}

/**
 * Utility function to check if an error is retryable
 */
export const isRetryableError = (error: ApiError): boolean => {
  // Network errors are usually retryable
  if (ErrorHandler.isNetworkError(error)) return true;
  
  // Server errors (5xx) are usually retryable
  if (ErrorHandler.isServerError(error)) return true;
  
  // Rate limiting errors are retryable after some time
  if (error.statusCode === 429) return true;
  
  // Timeout errors are retryable
  if (error.statusCode === 408) return true;
  
  return false;
};

/**
 * Utility function to get retry delay based on error type
 */
export const getRetryDelay = (error: ApiError, attempt: number): number => {
  if (error.statusCode === 429) {
    // Rate limiting: exponential backoff with jitter
    return Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30000);
  }
  
  if (ErrorHandler.isServerError(error)) {
    // Server errors: shorter delay
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }
  
  // Default: 1 second
  return 1000;
};

/**
 * Utility function to format error for display
 */
export const formatErrorForDisplay = (error: ApiError): string => {
  if (ErrorHandler.isNetworkError(error)) {
    return '🌐 Connection error. Please check your internet connection and try again.';
  }
  
  if (ErrorHandler.isAuthError(error)) {
    return '🔐 Authentication error. Please log in again.';
  }
  
  if (ErrorHandler.isValidationError(error)) {
    return '📝 ' + ErrorHandler.getUserFriendlyMessage(error);
  }
  
  if (ErrorHandler.isServerError(error)) {
    return '⚡ Server error. Our team has been notified. Please try again later.';
  }
  
  return '❌ ' + ErrorHandler.getUserFriendlyMessage(error);
};
