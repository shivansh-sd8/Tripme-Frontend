"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  const { user, isAuthenticated } = useAuth();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBookingById(id as string);
      
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

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    try {
      setCancelling(true);
      const response = await apiClient.cancelBooking(booking._id, cancellationReason);
      
      if (response.success) {
        setBooking(prev => prev ? {
          ...prev,
          status: 'cancelled',
          cancellationReason,
          refundAmount: response.data.refundAmount
        } : null);
        setShowCancelModal(false);
        setCancellationReason('');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
    } finally {
      setCancelling(false);
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

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Booking not found</h2>
          <p className="text-gray-500 mt-2">The booking you're looking for doesn't exist.</p>
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

        {/* Modern Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <div className="text-xs text-green-600">Before {booking.listing?.checkOutTime || '11:00 AM'}</div>
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
                
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel this booking?
              </p>
              <div className="p-3 bg-yellow-50 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  <Info className="h-4 w-4 inline mr-1" />
                  You'll receive a refund of {formatCurrency(refund.amount)} ({refund.percentage}% of total)
                </p>
              </div>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 mb-4"
                rows={3}
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
