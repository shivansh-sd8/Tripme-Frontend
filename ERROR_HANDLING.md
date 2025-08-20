# Error Handling System Documentation

## Overview

The TripMe application implements a comprehensive error handling system that provides consistent error management across both frontend and backend, with user-friendly error messages and proper logging.

## Backend Error Handling

### Error Middleware (`backend/middlewares/error.middleware.js`)

The backend already has comprehensive error handling middleware that includes:

- **Main Error Handler**: Catches and processes all types of errors
- **404 Handler**: Handles undefined routes
- **Async Handler**: Wraps async functions to catch errors
- **Validation Error Handler**: Processes Joi validation errors
- **Database Error Handler**: Handles MongoDB/Mongoose errors
- **Security Error Handler**: Detects potential security issues
- **Timeout Handler**: Manages request timeouts
- **Error Logger**: Comprehensive error logging
- **Graceful Shutdown**: Handles server shutdown gracefully

### Usage in Server

The error middleware is properly configured in `server.js`:

```javascript
const { errorHandler, notFound } = require('./middlewares/error.middleware');

// Apply 404 handler for undefined routes
app.use(notFound);

// Apply error handler (must be last)
app.use(errorHandler);
```

## Frontend Error Handling

### 1. Error Pages

#### 404 Page (`src/app/not-found.tsx`)
- Beautiful, user-friendly 404 page
- Quick action buttons for navigation
- Help section with support links
- Responsive design with gradients and animations

#### Global Error Page (`src/app/error.tsx`)
- Handles runtime errors in Next.js
- Shows error details in development mode
- Provides recovery options
- User-friendly error messages

#### Loading Page (`src/app/loading.tsx`)
- Global loading state for the application
- Animated loading indicators
- Consistent with app design

### 2. Error Handler Utility (`src/lib/error-handler.ts`)

#### Features
- **Automatic Error Type Detection**: Identifies network, auth, validation, and server errors
- **Standardized Error Format**: Consistent error structure across the app
- **User-Friendly Messages**: Converts technical errors to readable text
- **Development vs Production**: Shows detailed errors only in development
- **Error Logging**: Comprehensive error logging for debugging

#### Usage

```typescript
import { ErrorHandler } from '@/lib/error-handler';

// Handle any type of error
const apiError = ErrorHandler.handleApiError(error);

// Check error types
if (ErrorHandler.isNetworkError(apiError)) {
  // Handle network errors
}

if (ErrorHandler.isAuthError(apiError)) {
  // Handle authentication errors
}

// Get user-friendly message
const message = ErrorHandler.getUserFriendlyMessage(apiError);
```

### 3. Toast Notification System

#### Toast Component (`src/components/ui/Toast.tsx`)
- Beautiful, animated toast notifications
- Multiple types: success, error, warning, info
- Auto-dismiss with progress bar
- Responsive design

#### Toast Context (`src/contexts/ToastContext.tsx`)
- Manages multiple toast notifications
- Provides easy-to-use methods for showing toasts
- Handles toast lifecycle automatically

#### Usage

```typescript
import { useToast } from '@/contexts/ToastContext';

const { showSuccess, showError, showWarning, showInfo } = useToast();

// Show different types of toasts
showSuccess('Operation completed!', 'Success');
showError('Something went wrong', 'Error');
showWarning('Please check your input', 'Warning');
showInfo('New feature available', 'Info');
```

### 4. API Error Hook (`src/hooks/useApiError.ts`)

#### Features
- **Automatic Error Handling**: Handles different error types automatically
- **Toast Integration**: Shows appropriate toast notifications
- **Context Awareness**: Provides context for error logging
- **Validation Error Handling**: Special handling for form validation errors

#### Usage

```typescript
import { useApiError } from '@/hooks/useApiError';

const { handleError, handleSuccess, handleValidationErrors } = useApiError();

// Handle API errors
try {
  const response = await fetch('/api/endpoint');
  if (!response.ok) {
    throw new Error('API call failed');
  }
} catch (error) {
  handleError(error, 'API Operation');
}

// Handle validation errors
handleValidationErrors(validationErrors, ['email', 'password']);

// Show success messages
handleSuccess('Data saved successfully!', 'Success');
```

### 5. Error Boundary (`src/components/ErrorBoundary.tsx`)

#### Features
- **React Error Catching**: Catches JavaScript errors in React components
- **Fallback UI**: Shows user-friendly error interface
- **Error Logging**: Logs errors for debugging
- **Recovery Options**: Provides ways to recover from errors

#### Usage

The ErrorBoundary is already configured in the root layout:

```typescript
// In src/app/layout.tsx
<ErrorBoundary>
  <AuthProvider>
    <ToastProvider>
      {children}
    </ToastProvider>
  </AuthProvider>
</ErrorBoundary>
```

## Error Types and Handling

### 1. Network Errors
- **Detection**: `ErrorHandler.isNetworkError()`
- **Handling**: Shows connection error message
- **Recovery**: Suggests checking internet connection

### 2. Authentication Errors (401/403)
- **Detection**: `ErrorHandler.isAuthError()`
- **Handling**: Shows login prompt
- **Recovery**: Redirects to login page

### 3. Validation Errors (400/422)
- **Detection**: `ErrorHandler.isValidationError()`
- **Handling**: Shows field-specific error messages
- **Recovery**: Highlights problematic form fields

### 4. Server Errors (5xx)
- **Detection**: `ErrorHandler.isServerError()`
- **Handling**: Shows generic server error message
- **Recovery**: Suggests trying again later

### 5. Rate Limiting Errors (429)
- **Detection**: Status code 429
- **Handling**: Shows rate limit message
- **Recovery**: Suggests waiting before retrying

## Best Practices

### 1. Always Use Error Handling
```typescript
// ❌ Bad
try {
  const data = await apiCall();
} catch (error) {
  console.error(error);
}

// ✅ Good
try {
  const data = await apiCall();
} catch (error) {
  handleError(error, 'API Operation');
}
```

### 2. Provide Context
```typescript
// Always provide context for better debugging
handleError(error, 'User Registration');
handleError(error, 'Payment Processing');
handleError(error, 'Data Fetching');
```

### 3. Handle Validation Errors Properly
```typescript
// For form validation errors
if (error.errors && error.errors.length > 0) {
  handleValidationErrors(error.errors, ['email', 'password']);
}
```

### 4. Use Appropriate Toast Types
```typescript
// Success operations
showSuccess('Profile updated successfully!');

// Information
showInfo('New features available');

// Warnings
showWarning('Please complete your profile');

// Errors
showError('Failed to save changes');
```

## Configuration

### Environment Variables
- `NODE_ENV`: Controls error detail visibility
- `NEXT_PUBLIC_APP_URL`: Base URL for the application

### Toast Configuration
- **Duration**: Default 5000ms (5 seconds)
- **Position**: Top-right corner
- **Max Width**: 384px (w-96)
- **Z-Index**: 50

### Error Logging
- **Development**: Full error details in console
- **Production**: Minimal error details, full logging to external service

## Testing Error Handling

### Example Component
See `src/components/examples/ErrorHandlingExample.tsx` for a comprehensive example of all error handling features.

### Testing Different Error Types
1. **Network Errors**: Disconnect internet or use invalid URLs
2. **Validation Errors**: Submit forms with invalid data
3. **Authentication Errors**: Use expired or invalid tokens
4. **Server Errors**: Trigger backend errors
5. **Rate Limiting**: Make many rapid requests

## Troubleshooting

### Common Issues

1. **Toasts Not Showing**
   - Check if ToastProvider is in the component tree
   - Verify z-index values
   - Check for CSS conflicts

2. **Error Boundary Not Catching Errors**
   - Ensure ErrorBoundary wraps the component
   - Check for async errors (use try-catch)
   - Verify error is thrown in render or lifecycle methods

3. **Error Handling Not Working**
   - Import hooks correctly
   - Check error object structure
   - Verify error middleware is applied

### Debug Mode
In development mode, errors show:
- Full error messages
- Stack traces
- Component stacks
- Request details

## Future Enhancements

1. **Error Reporting Service**: Integrate with Sentry or similar
2. **Error Analytics**: Track error patterns and frequency
3. **Automatic Retry**: Implement retry logic for transient errors
4. **Offline Support**: Handle errors when offline
5. **Internationalization**: Multi-language error messages

## Support

For issues with the error handling system:
1. Check this documentation
2. Review the example component
3. Check console logs for detailed error information
4. Contact the development team
