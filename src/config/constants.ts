// Application constants
export const APP_CONSTANTS = {
  NAME: 'TripMe',
  DESCRIPTION: 'Discover and book unique stays across India',
  VERSION: '1.0.0',
  WEBSITE: 'https://tripme.com',
  SUPPORT_EMAIL: 'support@tripme.com',
} as const;

// API constants
export const API_CONSTANTS = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Authentication constants
export const AUTH_CONSTANTS = {
  TOKEN_KEY: 'tripme_token',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

// Booking constants
export const BOOKING_CONSTANTS = {
  MAX_GUESTS: 16,
  MIN_GUESTS: 1,
  MAX_STAY_DURATION: 30, // days
  MIN_STAY_DURATION: 1, // day
  CANCELLATION_WINDOW: 24 * 60 * 60 * 1000, // 24 hours before check-in
} as const;

// Search and filter constants
export const SEARCH_CONSTANTS = {
  DEFAULT_LOCATION: 'India',
  MAX_PRICE: 50000,
  MIN_PRICE: 500,
  PRICE_STEPS: [500, 1000, 2000, 5000, 10000, 20000, 50000],
  DEFAULT_GUESTS: 2,
  MAX_DATE_RANGE: 365, // days
} as const;

// UI constants
export const UI_CONSTANTS = {
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
  },
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL: 2000,
    TOOLTIP: 3000,
    NOTIFICATION: 4000,
  },
} as const;

// Validation constants
export const VALIDATION_CONSTANTS = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  PHONE: {
    PATTERN: /^[6-9]\d{9}$/, // Indian phone number pattern
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: {
    CONNECTION_FAILED: 'Network connection failed. Please check your internet connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    ACCOUNT_EXISTS: 'An account with this email already exists.',
    WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
    INVALID_TOKEN: 'Session expired. Please log in again.',
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    PASSWORD_MISMATCH: 'Passwords do not match.',
    TERMS_NOT_AGREED: 'You must agree to the terms and conditions.',
  },
  BOOKING: {
    UNAVAILABLE_DATES: 'Selected dates are not available.',
    INVALID_GUESTS: 'Number of guests exceeds the property limit.',
    PAYMENT_FAILED: 'Payment failed. Please try again.',
    CANCELLATION_FAILED: 'Unable to cancel booking. Please contact support.',
  },
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Successfully logged in!',
    SIGNUP_SUCCESS: 'Account created successfully!',
    LOGOUT_SUCCESS: 'Successfully logged out!',
    PASSWORD_RESET_SENT: 'Password reset email sent successfully!',
  },
  BOOKING: {
    CREATED: 'Booking created successfully!',
    CANCELLED: 'Booking cancelled successfully!',
    UPDATED: 'Booking updated successfully!',
  },
  PROFILE: {
    UPDATED: 'Profile updated successfully!',
  },
} as const;

// Navigation constants
export const NAVIGATION = {
  PUBLIC_ROUTES: ['/', '/login', '/signup', '/forgot-password'],
  PROTECTED_ROUTES: ['/profile', '/bookings'],
  AUTH_ROUTES: ['/login', '/signup', '/forgot-password'],
} as const;

// File upload constants
export const FILE_CONSTANTS = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    MAX_DIMENSIONS: {
      WIDTH: 1920,
      HEIGHT: 1080,
    },
  },
  DOCUMENT: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  },
} as const;

// Date and time constants
export const DATE_CONSTANTS = {
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',
  DISPLAY_TIME_FORMAT: 'HH:mm',
} as const;

// Currency constants
export const CURRENCY_CONSTANTS = {
  DEFAULT: 'INR',
  SYMBOLS: {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  },
  FORMATS: {
    INR: {
      locale: 'en-IN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
    USD: {
      locale: 'en-US',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  },
} as const;

// Property and Service enums for forms
export const PROPERTY_TYPE_OPTIONS = [
  'apartment', 'house', 'villa', 'cabin', 'condo', 'loft', 'studio', 'chalet', 'castle', 'treehouse', 'boat', 'camper', 'yurt', 'tent', 'cave', 'island', 'lighthouse', 'windmill', 'other'
] as const;

export const SERVICE_TYPE_OPTIONS = [
  'tour-guide', 'car-rental', 'wellness', 'chef', 'photographer', 'hairdresser', 'yoga-teacher', 'transportation', 'other'
] as const; 