// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: 'TripMe',
  VERSION: '1.0.0',
  DESCRIPTION: 'Your trusted platform for unique travel experiences',
  SUPPORT_EMAIL: 'support@tripme.com',
  PRIVACY_POLICY_URL: '/privacy',
  TERMS_OF_SERVICE_URL: '/terms',
} as const;

// User Roles
export const USER_ROLES = {
  GUEST: 'guest',
  HOST: 'host',
  ADMIN: 'admin',
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;

// Property Status
export const PROPERTY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// KYC Status
export const KYC_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Document Types
export const DOCUMENT_TYPES = {
  PASSPORT: 'passport',
  DRIVERS_LICENSE: 'drivers_license',
  NATIONAL_ID: 'national_id',
} as const;

// Property Types
export const PROPERTY_TYPES = [
  'apartment',
  'house',
  'villa',
  'cabin',
  'cottage',
  'loft',
  'studio',
  'penthouse',
  'castle',
  'treehouse',
  'yurt',
  'tent',
  'boat',
  'camper',
  'other',
] as const;

// Amenities
export const AMENITIES = [
  'wifi',
  'air_conditioning',
  'heating',
  'kitchen',
  'washer',
  'dryer',
  'parking',
  'pool',
  'hot_tub',
  'gym',
  'workspace',
  'tv',
  'netflix',
  'amazon_prime',
  'disney_plus',
  'hbo_max',
  'hulu',
  'peacock',
  'paramount_plus',
  'apple_tv',
  'youtube_tv',
  'sling_tv',
  'fubo_tv',
  'philo',
  'tubi',
  'pluto_tv',
  'roku_channel',
  'crackle',
  'vudu',
  'redbox',
  'popcornflix',
  'xumo',
  'plex',
  'emby',
  'jellyfin',
  'kodi',
  'stremio',
  'syncler',
  'weyd',
  'real_debrid',
  'all_debrid',
  'premiumize',
  'easynews',
  'usenet',
  'nzbgeek',
  'nzbplanet',
  'nzbgeek',
  'nzbplanet',
  'nzbgeek',
  'nzbplanet',
  'nzbgeek',
  'nzbplanet',
] as const;

// Service Categories
export const SERVICE_CATEGORIES = [
  'transportation',
  'food_delivery',
  'cleaning',
  'laundry',
  'concierge',
  'tour_guide',
  'photography',
  'wellness',
  'entertainment',
  'education',
  'business',
  'other',
] as const;

// Story Categories
export const STORY_CATEGORIES = [
  'travel_tips',
  'destination_guide',
  'local_experience',
  'food_culture',
  'adventure',
  'relaxation',
  'family_travel',
  'solo_travel',
  'budget_travel',
  'luxury_travel',
  'backpacking',
  'road_trip',
  'cruise',
  'beach',
  'mountain',
  'city',
  'rural',
  'island',
  'desert',
  'forest',
  'arctic',
  'tropical',
  'temperate',
  'mediterranean',
  'alpine',
  'coastal',
  'inland',
  'urban',
  'suburban',
  'remote',
] as const;

// Navigation Items
export const NAV_ITEMS = {
  HOME: { label: 'Home', href: '/' },
  SEARCH: { label: 'Search', href: '/search' },
  SERVICES: { label: 'Services', href: '/services' },
  STORIES: { label: 'Stories', href: '/stories' },
  BECOME_HOST: { label: 'Become a Host', href: '/become-host' },
  LOGIN: { label: 'Sign In', href: '/auth/login' },
  SIGNUP: { label: 'Sign Up', href: '/auth/signup' },
} as const;

// Admin Navigation Items
export const ADMIN_NAV_ITEMS = {
  DASHBOARD: { label: 'Dashboard', href: '/admin/dashboard' },
  USERS: { label: 'Users', href: '/admin/users' },
  HOSTS: { label: 'Hosts', href: '/admin/hosts' },
  LISTINGS: { label: 'Listings', href: '/admin/listings' },
  BOOKINGS: { label: 'Bookings', href: '/admin/bookings' },
  KYC: { label: 'KYC', href: '/admin/kyc' },
  PAYMENTS: { label: 'Payments', href: '/admin/payments' },
  REVIEWS: { label: 'Reviews', href: '/admin/reviews' },
  SETTINGS: { label: 'Settings', href: '/admin/settings' },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  MAX_IMAGES_PER_PROPERTY: 20,
  MAX_DOCUMENTS_PER_USER: 5,
} as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 20.5937, lng: 78.9629 }, // India center
  DEFAULT_ZOOM: 5,
  MAX_ZOOM: 18,
  MIN_ZOOM: 3,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const;

// Currency
export const CURRENCY = {
  DEFAULT: 'USD',
  SUPPORTED: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
} as const;

// Commission Rates
export const COMMISSION_RATES = {
  DEFAULT: 0.10, // 10%
  MIN: 0.05, // 5%
  MAX: 0.20, // 20%
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in.',
  SIGNUP: 'Account created successfully.',
  LOGOUT: 'Successfully logged out.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  BOOKING_CREATED: 'Booking created successfully.',
  BOOKING_CANCELLED: 'Booking cancelled successfully.',
  PROPERTY_CREATED: 'Property listed successfully.',
  PROPERTY_UPDATED: 'Property updated successfully.',
  PROPERTY_DELETED: 'Property deleted successfully.',
  SERVICE_CREATED: 'Service created successfully.',
  SERVICE_UPDATED: 'Service updated successfully.',
  SERVICE_DELETED: 'Service deleted successfully.',
  STORY_CREATED: 'Story published successfully.',
  STORY_UPDATED: 'Story updated successfully.',
  STORY_DELETED: 'Story deleted successfully.',
  KYC_SUBMITTED: 'KYC submitted successfully.',
  KYC_APPROVED: 'KYC approved successfully.',
  KYC_REJECTED: 'KYC rejected.',
  HOST_APPROVED: 'Host approved successfully.',
  HOST_REJECTED: 'Host rejected.',
  LISTING_APPROVED: 'Listing approved successfully.',
  LISTING_REJECTED: 'Listing rejected.',
  PAYMENT_PROCESSED: 'Payment processed successfully.',
  REFUND_PROCESSED: 'Refund processed successfully.',
} as const; 