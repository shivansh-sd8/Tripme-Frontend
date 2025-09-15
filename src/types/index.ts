// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'guest' | 'host' | 'admin';
  isVerified: boolean;
  profileImage?: string;
  accountStatus: 'active' | 'suspended' | 'deactivated';
  kyc?: {
    identityDocument?: string;
    documentNumber?: string;
    documentImage?: string;
    status: 'pending' | 'verified' | 'rejected' | 'not_submitted';
  };
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  bio?: string;
  languages?: string[];
  socialLogins?: {
    googleId?: string;
    facebookId?: string;
  };
  savedListings?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Stay/Property types (for frontend display)
export interface Stay {
  id: string;
  title: string;
  description: string;
  images: string[];
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: [number, number];
  };
  price: {
    amount: number;
    currency: string;
  };
  rating: number;
  reviewCount: number;
  maxGuests: number;
  tags: string[];
  instantBookable: boolean;
  amenities: string[];
  host: {
    id: string;
    name: string;
    avatar?: string;
    isSuperhost: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Authentication types
export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role?: 'guest' | 'host' | 'admin';
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

// Location types
export interface Location {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  userAddress?: string; // User's own address description
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

// Property/Listing types
export interface Property {
  _id: string;
  title: string;
  description: string;
  host: string | User;
  location: Location;
  type: 'villa' | 'apartment' | 'hostel' | 'house' | 'cottage' | 'cabin' | 'treehouse' | 'boat';
  propertyType: 'premium' | 'standard' | 'budget' | 'luxury';
  style: 'modern' | 'traditional' | 'minimalist' | 'rustic' | 'industrial' | 'scandinavian' | 'mediterranean' | 'tropical';
  images: PropertyImage[];
  // For backward compatibility with StayCard component
  imageUrls?: string[];
  pricing: PropertyPricing;
  hourlyBooking?: HourlyBookingSettings;
  houseRules: string[];
  checkInTime: string;
  checkOutTime: string;
  availability: Availability[];
  amenities: string[];
  features: string[];
  services: string[];
  maxGuests: number;
  minNights: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' | 'super-strict';
  isFeatured: boolean;
  isDraft: boolean;
  isSponsored: boolean;
  isTopRated: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    slug: string;
  };
  status: 'draft' | 'published' | 'suspended' | 'deleted';
  rating: PropertyRating;
  reviewCount: number;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyImage {
  url: string;
  publicId?: string;
  isPrimary?: boolean;
  caption?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

export interface PropertyPricing {
  basePrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  securityDeposit?: number;
  extraGuestPrice?: number;
  extraGuestFee?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';
}

export interface HourlyBookingSettings {
  enabled: boolean;
  minStayDays: number;
  hourlyRates: {
    sixHours: number;
    twelveHours: number;
    eighteenHours: number;
  };
}

export interface HourlyExtension {
  hours: 6 | 12 | 18;
  rate: number;
  totalHours: number;
}

export interface HourlyPricingBreakdown {
  daily: {
    nights: number;
    basePrice: number;
    extraGuests: number;
    total: number;
  };
  hourly?: {
    hours: number;
    rate: number;
    description: string;
    total: number;
  };
  fees: {
    cleaningFee: number;
    serviceFee: number;
    securityDeposit: number;
    platformFee: number;
    hostEarning: number;
  };
  totals: {
    subtotal: number;
    total: number;
  };
}

export interface PropertyRating {
  average: number;
  cleanliness?: number;
  accuracy?: number;
  communication?: number;
  location?: number;
  checkIn?: number;
  value?: number;
}

export interface Availability {
  date: Date;
  isAvailable: boolean;
  price: number;
}

// Service types
export interface Service {
  _id: string;
  title: string;
  description: string;
  provider: string | User;
  serviceType: 'tour-guide' | 'car-rental' | 'wellness' | 'chef' | 'photographer' | 'hairdresser' | 'yoga-teacher' | 'transportation' | 'other';
  duration: { value: number; unit: 'minutes' | 'hours' | 'days' };
  location: Location;
  groupSize: {
    min: number;
    max: number;
  };
  pricing: ServicePricing;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' | 'super-strict';
  requirements: string[];
  media: ServiceMedia[];
  availableSlots: TimeSlot[];
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    slug: string;
  };
  status: 'draft' | 'published' | 'suspended' | 'deleted';
  rating: PropertyRating;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServicePricing {
  basePrice: number;
  perPersonPrice?: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';
}

export interface ServiceMedia {
  url: string;
  type: 'image' | 'video';
  caption?: string;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

// Booking types
export interface Booking {
  _id: string;
  user: string | User;
  host: string | User;
  listing?: string | Property;
  service?: string | Service;
  bookingType: 'property' | 'service';
  bookingDuration?: 'daily' | 'hourly';
  checkIn?: Date;
  checkOut?: Date;
  timeSlot?: TimeSlot;
  hourlyExtension?: HourlyExtension;
  guests: {
    adults: number;
    children?: number;
    infants?: number;
  };
  totalAmount: number;
  taxAmount?: number;
  serviceFee: number;
  cleaningFee: number;
  securityDeposit?: number;
  currency: string;
  cancellationPolicy: string;
  specialRequests?: string;
  couponApplied?: string;
  discountAmount: number;
  refundAmount?: number;
  paymentIntentId?: string;
  refunded?: boolean;
  cancelledAt?: Date;
  cancelledBy?: string | User;
  cancellationReason?: string;
  refundStatus?: 'pending' | 'processed' | 'completed' | 'not_applicable';
  checkedIn?: boolean;
  checkedInAt?: Date;
  checkedInBy?: string | User;
  checkInNotes?: string;
  hostFee?: number;
  platformFee?: number;
  receiptId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partially_refunded' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

export interface ErrorResponse {
  message: string;
  code: string;
  details?: any;
}

// Search and filter types
export interface SearchFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  instantBookable?: boolean;
}

export interface SearchFormData {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

// Payment types
export interface Payment {
  _id: string;
  booking: string;
  user: string | User;
  amount: number;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'wallet';
  paymentDetails?: {
    cardLast4?: string;
    cardBrand?: string;
    paymentGateway?: string;
    transactionId?: string;
  };
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  taxes?: number;
  commission?: {
    hostCommission?: number;
    platformCommission?: number;
  };
  coupon?: string;
  refunds?: Array<{
    amount: number;
    reason: string;
    processedAt: Date;
    transactionId: string;
  }>;
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review types
export interface Review {
  _id: string;
  booking: string;
  reviewer: string | User;
  reviewedUser: string | User;
  listing?: string | Property;
  service?: string | Service;
  reviewType: 'property' | 'service' | 'host' | 'guest';
  rating: number;
  subRatings?: {
    cleanliness?: number;
    accuracy?: number;
    communication?: number;
    location?: number;
    checkIn?: number;
    value?: number;
  };
  comment: string;
  hostResponse?: {
    text: string;
    respondedAt: Date;
  };
  isPublished?: boolean;
  reported?: {
    isReported?: boolean;
    reason?: string;
    reportedBy?: string | User;
    reportedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// UI Component types
export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
  padding?: 'default' | 'none' | 'compact';
  className?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export interface CheckboxProps {
  label?: string;
  error?: string;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
}

// Host application types
export interface HostApplication {
  _id: string;
  user: string | User;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string | User;
}

// KYC Verification types
export interface KYCVerification {
  _id: string;
  user: string | User;
  identityDocument: {
    type: 'passport' | 'national-id' | 'drivers-license' | 'aadhar-card';
    number: string;
    frontImage: string;
    backImage: string;
    expiryDate?: Date;
  };
  addressProof: {
    type: 'utility-bill' | 'bank-statement' | 'rental-agreement' | 'property-tax';
    documentImage: string;
    address: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };
  selfie: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Notification types
export interface Notification {
  _id: string;
  user: string;
  type: 'booking' | 'review' | 'payment' | 'support' | 'system' | 'admin';
  title: string;
  message: string;
  relatedEntity?: {
    type: 'Booking' | 'Property' | 'Review';
    id: string;
  };
  isRead: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// Coupon types
export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  amount: number;
  maxDiscount?: number;
  minBookingAmount?: number;
  validFrom: Date;
  validTo: Date;
  usageLimit?: number;
  usedCount: number;
  usedBy: Array<{
    user: string | User;
    usedAt: Date;
  }>;
  isActive: boolean;
  applicableToListings?: string[];
  applicableToServices?: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Availability types
export interface AvailabilityModel {
  _id: string;
  property: string;
  date: Date;
  status: 'available' | 'blocked' | 'booked' | 'maintenance';
  reason?: string;
  bookedBy?: string;
  bookedAt?: Date;
  blockedBy?: string;
  blockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Pagination types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Form validation types
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: Record<string, string>;
} 