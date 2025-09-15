// Core User Types
export interface User {
  _id: string;
  id?: string; // Backend sometimes sends 'id' instead of '_id'
  name: string;
  email: string;
  phone?: string;
  profileImage?: string | null;
  role: 'guest' | 'host' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  socialLogins?: {
    googleId?: string;
  };
  kyc?: {
    identityDocument?: string;
    documentNumber?: string;
    documentImage?: string;
    status: 'pending' | 'verified' | 'rejected' | 'not_submitted';
    rejectionReason?: string;
  };
}

// Authentication Types
export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  agreeToTerms: boolean;
}

// Property/Listing Types
export interface Property {
  _id: string;
  title: string;
  description: string;
  type: string;
  location: {
    address: string;
    userAddress?: string; // User's own address description
    city: string;
    state: string;
    country: string;
    coordinates: [number, number];
  };
  amenities: string[];
  images: string[];
  price: {
    base: number;
    currency: string;
  };
  capacity: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
  };
  host: User;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface Booking {
  _id: string;
  property: Property;
  guest: User;
  host: User;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  platformFee: number;
  hostEarning: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  checkInNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Service Types
export interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: [number, number];
  };
  price: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly' | 'daily';
  };
  provider: User;
  status: 'pending' | 'approved' | 'rejected';
  images: string[];
  createdAt: string;
  updatedAt: string;
}

// Story/Blog Types
export interface Story {
  _id: string;
  title: string;
  content: string;
  author: User;
  images: string[];
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  activeHosts: number;
  pendingListings: number;
  completedBookings: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'listing_submitted' | 'booking_completed' | 'kyc_verified';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
}

// Search and Filter Types
export interface SearchFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  amenities?: string[];
  propertyType?: string[];
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// UI Component Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ size?: number }>;
  children?: NavItem[];
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// File Upload Types
export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
  uploaded?: boolean;
  error?: string;
}

// Map Types
export interface MapLocation {
  lat: number;
  lng: number;
  address: string;
}

// Payment Types
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: string;
  transactionId?: string;
  createdAt: string;
}

// KYC Types
export interface KYCVerification {
  id: string;
  userId: string;
  documentType: 'passport' | 'drivers_license' | 'national_id';
  documentNumber: string;
  documentImage: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Export all types
export type {
  User,
  AuthResponse,
  LoginFormData,
  SignupFormData,
  Property,
  Booking,
  Service,
  Story,
  AdminStats,
  RecentActivity,
  ApiResponse,
  ValidationError,
  ValidationResult,
  SearchFilters,
  PaginationParams,
  PaginatedResponse,
  ButtonProps,
  InputProps,
  NavItem,
  Notification,
  FileUpload,
  MapLocation,
  Payment,
  KYCVerification,
}; 