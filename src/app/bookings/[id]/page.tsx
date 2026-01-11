"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useAuth } from '@/core/store/auth-context';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Star,
  Phone,
  Mail,
  MessageSquare,
  Download,
  Trash2,
  Info,
  Shield,
  FileText,
  Wifi,
  Car,
  Coffee,
  Tv,
  AirVent,
  Snowflake,
  Utensils,
  Dumbbell,
  Waves,
  WashingMachine,
  ParkingCircle,
  Bed,
  Bath,
  Home,
  User,
  CalendarDays,
  Clock4,
  Eye,
  Copy,
  ExternalLink,
  CheckSquare,
  CreditCard
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface BookingDetails {
  _id: string;
  listing: {
    _id: string;
    title: string;
    description: string;
    images: Array<{
      url: string;
      publicId?: string;
      isPrimary?: boolean;
      width?: number;
      height?: number;
      format?: string;
      size?: number;
      _id?: string;
      id?: string;
    }>;
    location?: {
      type: string;
      coordinates: number[];
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    pricing: {
      basePrice: number;
      cleaningFee: number;
      serviceFee: number;
      securityDeposit?: number;
      currency: string;
    };
    amenities: string[];
    houseRules: string[];
    cancellationPolicy: {
      type: 'flexible' | 'moderate' | 'strict' | 'super_strict';
      description: string;
      refundPercentage: number;
      deadlineHours: number;
    };
    host: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      profileImage: string;
      responseTime: string;
      about?: string;
      joinedDate?: string;
      totalListings?: number;
    };
    propertyType?: string;
    checkInTime?: string;
    checkOutTime?: string;
  };
  host: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string;
    responseTime: string;
    about?: string;
    joinedDate?: string;
    totalListings?: number;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profileImage: string;
  };
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  platformFee: number;
  processingFee: number;
  gst: number;
  discountAmount: number;
  hostFee: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  specialRequests?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  refundAmount?: number;
  refunded?: boolean;
  refundStatus?: 'pending' | 'completed' | 'failed' | 'not_applicable';
  checkedIn?: boolean;
  checkedOut?: boolean;
  // Hourly booking fields
  hourlyExtension?: {
    hours: number;
    rate: number;
    totalHours: number;
  };
  bookingType?: 'daily' | '24hour' | 'hourly';
  is24Hour?: boolean;
  checkOutTime?: string;
  pricingBreakdown?: {
    customerBreakdown: {
    baseAmount: number;
      cleaningFee: number;
    serviceFee: number;
      securityDeposit: number;
      hourlyExtension: number;
      discountAmount: number;
      subtotal: number;
      platformFee: number;
      processingFee: number;
      gst: number;
      totalAmount: number;
    };
    hostBreakdown: {
      baseAmount: number;
    cleaningFee: number;
      serviceFee: number;
    securityDeposit: number;
      hourlyExtension: number;
      discountAmount: number;
      subtotal: number;
    platformFee: number;
    hostEarning: number;
    };
    platformBreakdown: {
      platformFee: number;
      processingFee: number;
      gst: number;
      totalRevenue: number;
    };
  };
}

interface CancellationPolicy {
  type: 'flexible' | 'moderate' | 'strict' | 'super_strict';
  description: string;
  refundPercentage: number;
  deadlineHours: number;
  color: string;
  icon: any;
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [refundInfo, setRefundInfo] = useState<{
    amount: number;
    percentage: number;
    policy: string;
  } | null>(null);

  // Check for success parameter
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessMessage(true);
      // Auto-scroll to success section when it appears
      setTimeout(() => {
        const successSection = document.getElementById('booking-success-section');
        if (successSection) {
          successSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [searchParams, booking]);

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);
    
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
      const response = await apiClient.getBooking(id as string);
      
      if (response.success) {
          setBooking(response.data.booking);
        } else {
        setError(response.message || 'Failed to fetch booking details');
      }
    } catch (error: any) {
      setError('Failed to fetch booking details');
      } finally {
          setLoading(false);
    }
  };

  const calculateRefundInfo = (booking: BookingDetails) => {
    if (!booking) return null;

    // If booking is pending, always full refund
    if (booking.status === 'pending') {
      return {
        amount: booking.totalAmount,
        percentage: 100,
        policy: 'Full refund for cancellations before host approval'
      };
    }

    // For confirmed bookings, calculate based on cancellation policy
    const policy = booking.listing?.cancellationPolicy || 'moderate';
    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercentage = 0;
    let policyDescription = '';

    switch (policy) {
      case 'flexible':
        if (hoursUntilCheckIn > 24) {
          refundPercentage = 100;
          policyDescription = 'Full refund if cancelled more than 24 hours before check-in';
        } else {
          refundPercentage = 0;
          policyDescription = 'No refund if cancelled within 24 hours of check-in';
        }
        break;
      case 'moderate':
        if (hoursUntilCheckIn > 120) { // 5 days
          refundPercentage = 100;
          policyDescription = 'Full refund if cancelled more than 5 days before check-in';
        } else if (hoursUntilCheckIn > 24) {
          refundPercentage = 50;
          policyDescription = '50% refund if cancelled between 1-5 days before check-in';
        } else {
          refundPercentage = 0;
          policyDescription = 'No refund if cancelled within 24 hours of check-in';
        }
        break;
      case 'strict':
        if (hoursUntilCheckIn > 168) { // 7 days
          refundPercentage = 50;
          policyDescription = '50% refund if cancelled more than 7 days before check-in';
        } else {
          refundPercentage = 0;
          policyDescription = 'No refund if cancelled within 7 days of check-in';
        }
        break;
      case 'super_strict':
        refundPercentage = 0;
        policyDescription = 'No refunds under any circumstances';
        break;
      default:
        refundPercentage = 0;
        policyDescription = 'Standard cancellation policy applies';
    }

    return {
      amount: (booking.totalAmount * refundPercentage) / 100,
      percentage: refundPercentage,
      policy: policyDescription
    };
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    try {
      setCancelling(true);
      setError(''); // Clear any previous errors
      
      console.log('🔄 Attempting to cancel booking:', booking._id);
      console.log('📝 Cancellation reason:', cancellationReason);
      
      const response = await apiClient.cancelBooking(booking._id, cancellationReason);
      
      console.log('📨 Cancellation response:', response);
      
      if (response.success) {
        console.log('✅ Booking cancelled successfully');
        setBooking(prev => prev ? {
          ...prev,
          status: 'cancelled',
          cancellationReason,
          refundAmount: response.data.refundAmount || refundInfo?.amount || 0,
          refundStatus: 'pending',
          refunded: (response.data.refundAmount || refundInfo?.amount || 0) > 0
        } : null);
        setShowCancelModal(false);
        setCancellationReason('');
        setRefundInfo(null);
      } else {
        console.error('❌ Cancellation failed:', response.message);
        setError(response.message || 'Failed to cancel booking');
      }
    } catch (error: any) {
      console.error('❌ Error cancelling booking:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to cancel booking';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('📝 Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const openCancelModal = () => {
    if (booking) {
      const refund = calculateRefundInfo(booking);
      setRefundInfo(refund);
      setShowCancelModal(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          Confirmed
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-4 h-4 mr-1" />
          Pending
        </span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <XCircle className="w-4 h-4 mr-1" />
          Cancelled
        </span>;
      case 'completed':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          Completed
        </span>;
      default:
        return null;
    }
  };

  const getCancellationPolicy = (type: string): CancellationPolicy => {
    const policies = {
      flexible: {
        type: 'flexible' as const,
        description: 'Free cancellation until 24 hours before check-in',
        refundPercentage: 100,
        deadlineHours: 24,
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      moderate: {
        type: 'moderate' as const,
        description: 'Free cancellation until 5 days before check-in',
        refundPercentage: 100,
        deadlineHours: 120,
        color: 'bg-blue-100 text-blue-800',
        icon: Shield
      },
      strict: {
        type: 'strict' as const,
        description: '50% refund if cancelled more than 7 days before check-in',
        refundPercentage: 50,
        deadlineHours: 168,
        color: 'bg-orange-100 text-orange-800',
        icon: AlertTriangle
      },
      super_strict: {
        type: 'super_strict' as const,
        description: 'No refunds available',
        refundPercentage: 0,
        deadlineHours: 0,
        color: 'bg-red-100 text-red-800',
        icon: XCircle
      }
    };
    return policies[type as keyof typeof policies] || policies.flexible;
  };

  const calculateRefund = () => {
    if (!booking) return { amount: 0, percentage: 0 };
    
    // For pending bookings (host hasn't accepted yet), always give full refund
    if (booking.status === 'pending') {
      return { amount: booking.totalAmount, percentage: 100 };
    }
    
    // For other booking statuses, use cancellation policy
    const policy = getCancellationPolicy(booking.listing?.cancellationPolicy?.type || 'moderate');
    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilCheckIn <= policy.deadlineHours) {
      return { amount: 0, percentage: 0 };
    }
    
    const refundAmount = (booking.totalAmount * policy.refundPercentage) / 100;
    return { amount: refundAmount, percentage: policy.refundPercentage };
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate checkout time based on check-in time and booking type
  const getCheckoutTime = (): string => {
    // If booking has explicit checkout time, use it
    if (booking?.checkOutTime) {
      return booking.checkOutTime;
    }

    // For 24-hour bookings, calculate checkout time (check-in + 23 hours)
    if (booking?.is24Hour && booking?.checkIn) {
      const checkInDate = new Date(booking.checkIn);
      const checkInTime = booking.listing?.checkInTime || '3:00 PM';
      
      // Parse check-in time
      const [timePart, period] = checkInTime.split(' ');
      const [hours, minutes] = timePart.split(':').map(Number);
      let checkInHours = hours;
      if (period === 'PM' && hours !== 12) checkInHours += 12;
      if (period === 'AM' && hours === 12) checkInHours = 0;
      
      // Set check-in time on the check-in date
      checkInDate.setHours(checkInHours, minutes || 0, 0, 0);
      
      // Add 23 hours for checkout
      const checkoutDate = new Date(checkInDate);
      checkoutDate.setHours(checkoutDate.getHours() + 23);
      
      // Format checkout time
      const checkoutHours = checkoutDate.getHours();
      const checkoutMinutes = checkoutDate.getMinutes();
      const checkoutPeriod = checkoutHours >= 12 ? 'PM' : 'AM';
      const displayHours = checkoutHours > 12 ? checkoutHours - 12 : (checkoutHours === 0 ? 12 : checkoutHours);
      const displayMinutes = checkoutMinutes.toString().padStart(2, '0');
      
      return `${displayHours}:${displayMinutes} ${checkoutPeriod}`;
    }

    // Fallback to listing's default checkout time or 11:00 AM
    return booking?.listing?.checkOutTime || '11:00 AM';
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, any> = {
      'wifi': <Wifi className="w-5 h-5" />,
      'parking': <ParkingCircle className="w-5 h-5" />,
      'kitchen': <Utensils className="w-5 h-5" />,
      'tv': <Tv className="w-5 h-5" />,
      'ac': <AirVent className="w-5 h-5" />,
      'heating': <Snowflake className="w-5 h-5" />,
      'washer': <WashingMachine className="w-5 h-5" />,
      'gym': <Dumbbell className="w-5 h-5" />,
      'pool': <Waves className="w-5 h-5" />,
      'coffee': <Coffee className="w-5 h-5" />,
      'car': <Car className="w-5 h-5" />
    };
    return iconMap[amenity.toLowerCase()] || <Home className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Booking not found</h2>
          <p className="text-gray-500 mt-2">The booking you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-red-900">Error</h2>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  setError('');
                  fetchBookingDetails();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const policy = getCancellationPolicy(booking.listing?.cancellationPolicy?.type || 'moderate');
  const refund = calculateRefund();
  const canCancel = booking.status === 'confirmed' || booking.status === 'pending';
  const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white rounded-lg shadow-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Booking Details</h1>
                <p className="text-sm text-gray-500 mt-1">#{booking._id?.slice(-8) || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(booking.status)}
            </div>
          </div>
        </div>

        {/* Airbnb-Style Success Section */}
        {showSuccessMessage && booking && (
          <div 
            id="booking-success-section"
            className="mb-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden"
          >
            <div className="p-8">
              {/* Header with Success Icon */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Booking Confirmed!</h2>
                    <p className="text-gray-600 text-lg">Your reservation is confirmed</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Confirmation Code */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Confirmation Code</p>
                <p className="text-2xl font-mono font-bold text-gray-900">#{booking._id?.slice(-8).toUpperCase() || 'UNKNOWN'}</p>
              </div>

              {/* Quick Summary Card */}
              <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Property</p>
                    <p className="font-semibold text-gray-900">{booking.listing?.title || 'Property'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Dates</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Guests</p>
                    <p className="font-semibold text-gray-900">
                      {booking.guests.adults + booking.guests.children + booking.guests.infants} guest{booking.guests.adults + booking.guests.children + booking.guests.infants !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="font-semibold text-gray-900 text-lg">{formatCurrency(booking.totalAmount, booking.currency)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Confirmation */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-green-100 rounded-lg border border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Payment Processed</p>
                  <p className="text-sm text-green-700">
                    {booking.paymentStatus === 'paid' 
                      ? 'Your payment has been successfully processed.' 
                      : 'Payment is being processed.'}
                  </p>
                </div>
              </div>


              

              {/* What's Next Section */}
              <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  What's Next?
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Check-in instructions will be sent to your email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>The host will confirm your booking shortly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>You can view full booking details below</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    // TODO: Implement download receipt functionality
                    console.log('Download receipt');
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  Download Receipt
                </button>
                <button
                  onClick={() => {
                    setShowSuccessMessage(false);
                    const detailsSection = document.getElementById('booking-details');
                    if (detailsSection) {
                      detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Eye className="w-5 h-5" />
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modern Grid Layout */}
        <div id="booking-details" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Property & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                {booking.listing?.images?.[0]?.url ? (
                  <img
                    src={booking.listing.images[0].url}
                    alt={booking.listing.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                      </div>
        )}
                    </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {booking.listing?.title || 'Property Title'}
                        </h2>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{booking.listing?.location?.address || 'Location not specified'}</span>
                      </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <User className="w-4 h-4 mr-2" />
                      <span>Hosted by {booking.host?.name || 'Unknown Host'}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {booking.listing?.description || 'No description available.'}
                          </p>
                      </div>
                    </div>
                            </div>

            {/* Stay Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                Stay Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Check-in</span>
                          </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatDate(booking.checkIn)}</div>
                      <div className="text-xs text-blue-600">After {booking.listing?.checkInTime || '3:00 PM'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">Check-out</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatDate(booking.checkOut)}</div>
                      <div className="text-xs text-green-600">
                        Before {getCheckoutTime()}
                        {booking.hourlyExtension?.hours && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            +{booking.hourlyExtension.hours}h extension
                          </span>
                        )}
                  </div>
                        </div>
                        </div>
                      </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-800">Guests</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {booking.guests.adults} adults
                      {booking.guests.children > 0 && `, ${booking.guests.children} children`}
                      {booking.guests.infants > 0 && `, ${booking.guests.infants} infants`}
                        </div>
                        </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-orange-600 mr-2" />
                      <span className="text-sm font-medium text-orange-800">Duration</span>
                      </div>
                    <div className="text-sm font-semibold text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</div>
                    </div>
                        </div>
                        </div>
                      </div>

            {/* Amenities Card */}
            {booking.listing?.amenities && booking.listing.amenities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-gray-600" />
                  Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {booking.listing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                      {getAmenityIcon(amenity)}
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </div>
                      ))}
                        </div>
                        </div>
            )}

            {/* Host Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Host Information
              </h3>
                  <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
              </div>
                    <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{booking.host?.name || 'Unknown Host'}</h4>
                  <p className="text-sm text-gray-500 mb-2">Response time: {booking.host?.responseTime || 'Within 24 hours'}</p>
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-gray-300">
                      <MessageSquare className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-gray-300">
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </button>
                        </div>
                      </div>
                        </div>
                      </div>

            {/* Enhanced Refund Information Card */}
            {(booking.status === 'cancelled' && booking.refundAmount !== undefined) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                  Cancellation & Refund Details
                </h3>
                
                  <div className="space-y-4">
                  {/* Refund Amount */}
                  <div className={`p-4 rounded-xl border-2 ${
                    booking.refundAmount > 0 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          booking.refundAmount > 0 ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {booking.refundAmount > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      <div>
                          <h4 className={`font-semibold ${
                            booking.refundAmount > 0 ? 'text-green-800' : 'text-red-800'
                          }`}>
                            Refund Amount
                          </h4>
                          <p className={`text-sm ${
                            booking.refundAmount > 0 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {booking.refundAmount > 0 ? (
                              <>
                                {formatCurrency(booking.refundAmount)} 
                                {booking.refundAmount === booking.totalAmount ? ' (Full refund)' : ' (Partial refund)'}
                              </>
                            ) : (
                              'No refund provided'
                            )}
                          </p>
                      </div>
                    </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          booking.refundAmount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(booking.refundAmount)}
                      </div>
                        <div className="text-xs text-gray-500">
                          {booking.refundAmount > 0 ? 'Will be processed' : 'Policy applied'}
                    </div>
                        </div>
                      </div>
                  </div>

                  {/* Refund Status */}
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Refund Status</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      booking.refundStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                      booking.refundStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      booking.refundStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.refundStatus === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {booking.refundStatus === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {booking.refundStatus === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                      {booking.refundStatus ? booking.refundStatus.charAt(0).toUpperCase() + booking.refundStatus.slice(1) : 'N/A'}
                    </span>
              </div>
                  
                  {/* Cancellation Details */}
                  <div className="space-y-2">
                    {booking.cancelledAt && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Cancelled On</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(booking.cancelledAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
            )}

                    {booking.cancellationReason && (
                      <div className="py-2">
                        <span className="text-sm text-gray-600 block mb-1">Cancellation Reason</span>
                        <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                          {booking.cancellationReason}
                        </p>
                          </div>
                        )}
                      </div>

                  {/* Refund Timeline */}
                  {booking.refundAmount > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-blue-800 mb-2">Refund Timeline</h5>
                      <div className="space-y-2 text-xs text-blue-700">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Refund initiated: {new Date().toLocaleDateString()}</span>
                      </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span>Processing time: 3-5 business days</span>
                    </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span>Refund will appear in your original payment method</span>
                      </div>
                    </div>
                        </div>
                      )}
                    </div>
              </div>
            )}

            {/* Cancellation Policy Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-gray-600" />
                Cancellation Policy
              </h3>
                  <div className="flex items-start space-x-3">
                <policy.icon className={`w-5 h-5 mt-0.5 ${policy.color.replace('bg-', 'text-').replace(' text-', '')}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 capitalize">{policy.type.replace('_', ' ')} Policy</p>
                      <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                      {canCancel && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            If you cancel now, you'll receive a refund of{' '}
                            <span className="font-medium text-gray-900">{formatCurrency(refund.amount)}</span>
                            {' '}({refund.percentage}% of total)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                    </div>
                    </div>

          {/* Right Column - Pricing & Actions */}
          <div className="space-y-6">
            {/* Price Breakdown Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
              
              <div className="space-y-3">
                {/* Base Amount */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Base Amount</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(booking.pricingBreakdown?.customerBreakdown?.baseAmount || booking.listing?.pricing?.basePrice || 0)}
                  </span>
                  </div>
                
                {/* Cleaning Fee */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Cleaning Fee</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(booking.pricingBreakdown?.customerBreakdown?.cleaningFee || booking.listing?.pricing?.cleaningFee || 0)}
                  </span>
                      </div>
                
                {/* Service Fee */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Service Fee</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(booking.pricingBreakdown?.customerBreakdown?.serviceFee || booking.listing?.pricing?.serviceFee || 0)}
                  </span>
                        </div>
                
                {/* Security Deposit */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Security Deposit</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(booking.pricingBreakdown?.customerBreakdown?.securityDeposit || booking.listing?.pricing?.securityDeposit || 0)}
                  </span>
                    </div>
                
                {/* Hourly Extension */}
                {((booking.pricingBreakdown?.customerBreakdown?.hourlyExtension ?? 0) > 0 || (booking.hourlyExtension?.hours ?? 0) > 0) && (
                  <div className="flex justify-between items-center py-2 bg-blue-50 rounded-lg px-3 -mx-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-700">
                        Hourly Extension ({booking.hourlyExtension?.hours ?? 0}h)
                      </span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      +{formatCurrency(booking.pricingBreakdown?.customerBreakdown?.hourlyExtension ?? 0)}
                    </span>
                  </div>
                )}
                
                {/* Discount */}
                {booking.discountAmount > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Discount</span>
                    <span className="text-sm font-medium text-green-600">
                      -{formatCurrency(booking.discountAmount)}
                    </span>
              </div>
            )}
                
                {/* Subtotal */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-700">Subtotal</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(booking.pricingBreakdown?.customerBreakdown?.subtotal || booking.subtotal || 0)}
                    </span>
                </div>
                </div>
                
                {/* Platform Fee */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Platform Fee</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(booking.pricingBreakdown?.customerBreakdown?.platformFee || booking.platformFee || 0)}
                  </span>
                </div>
                
                {/* Processing Fee */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Processing Fee</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(booking.pricingBreakdown?.customerBreakdown?.processingFee || booking.processingFee || 0)}
                  </span>
                  </div>
                
                {/* GST */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">GST (18%)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(booking.pricingBreakdown?.customerBreakdown?.gst || booking.gst || 0)}
                  </span>
                  </div>
                
                {/* Total */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3">
                    <span className="text-base font-semibold text-gray-900">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(booking.pricingBreakdown?.customerBreakdown?.totalAmount || booking.totalAmount)}
                    </span>
                  </div>
                  </div>
                    </div>
                    </div>

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download Receipt</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Copy className="w-4 h-4" />
                  <span>Copy Booking ID</span>
                </button>
                
                {(booking.refundAmount && booking.refundAmount > 0) && (
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    <span>View Refund Status</span>
                  </button>
                )}
                
                {canCancel && (
                  <button
                    onClick={openCancelModal}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Booking</span>
                  </button>
                )}
              </div>
                </div>

            {/* Booking Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Booking ID</span>
                  <span className="text-sm font-mono text-gray-900">{booking._id}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <span className={`text-sm font-medium ${
                    booking.paymentStatus === 'paid' ? 'text-green-600' : 
                    booking.paymentStatus === 'pending' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1)}
                    </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">
                    {new Date(booking._id).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
                  </div>

                  
                  </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Cancel Booking</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
          </div>
                </div>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
        </div>
      </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Error Display */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to cancel this booking? This will release your reserved dates and process a refund according to the cancellation policy.
                </p>
                
                {/* Refund Information */}
                {refundInfo && (
                  <div className={`p-4 rounded-xl border-2 ${
                    refundInfo.percentage > 0 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        refundInfo.percentage > 0 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                      }`}>
                        {refundInfo.percentage > 0 ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          refundInfo.percentage > 0 ? 'text-green-800' : 'text-red-800'
                        }`}>
                          Refund Information
                        </h4>
                        <p className={`text-sm mt-1 ${
                          refundInfo.percentage > 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {refundInfo.percentage > 0 ? (
                            <>
                              You'll receive a refund of <span className="font-bold">{formatCurrency(refundInfo.amount)}</span> ({refundInfo.percentage}% of total)
                            </>
                          ) : (
                            'No refund will be provided for this cancellation'
                          )}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          {refundInfo.policy}
                  </p>
                </div>
              </div>
                  </div>
                )}
              </div>

              {/* Cancellation Reason */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (optional)
                </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please let us know why you're cancelling this booking..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-colors"
                rows={3}
              />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setError('');
                  }}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:shadow-md"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="flex-1 px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {cancelling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Cancel Booking</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 
