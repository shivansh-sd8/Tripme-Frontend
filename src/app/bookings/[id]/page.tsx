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
      averageRating?: number;
      totalReviews?: number;
      isVerified?: boolean;
    };
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
    propertyType?: string;
    checkInTime?: string;
    checkOutTime?: string;
    minNights?: number;
    maxNights?: number;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  host: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profileImage: string;
    responseTime?: string;
    about?: string;
    joinedDate?: string;
    totalListings?: number;
    averageRating?: number;
    totalReviews?: number;
    isVerified?: boolean;
  };
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children?: number;
    infants?: number;
  } | number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partially_refunded' | 'failed';
  createdAt: string;
  specialRequests?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus?: 'pending' | 'processed' | 'completed' | 'not_applicable';
  checkInInstructions?: string;
  houseManual?: string;
  reviews?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  payment?: {
    amount: number;
    status: string;
    method: string;
    transactionId?: string;
    paidAt?: string;
  };
  feeBreakdown?: {
    baseAmount: number;
    serviceFee: number;
    cleaningFee: number;
    securityDeposit: number;
    platformFee: number;
    hostEarning: number;
    discountAmount: number;
    totalAmount: number;
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

const getAmenityIcon = (amenity: string) => {
  const iconMap: { [key: string]: any } = {
    'WiFi': Wifi,
    'Parking': ParkingCircle,
    'Kitchen': Utensils,
    'TV': Tv,
    'AC': AirVent,
    'Heating': Snowflake,
    'Washer': WashingMachine,
    'Pool': Waves,
    'Gym': Dumbbell,
    'Coffee Maker': Coffee,
    'Free Parking': Car,
    'default': Home
  };
  return iconMap[amenity] || iconMap.default;
};

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'host' | 'policies'>('overview');

  // Check authentication and authorization
  useEffect(() => {
    if (isLoading) return; // Wait for auth to load
    
    if (!isAuthenticated) {
      // User is not authenticated, redirect to login
      router.push('/auth/login?redirect=' + encodeURIComponent(`/bookings/${bookingId}`));
      return;
    }
  }, [isAuthenticated, isLoading, router, bookingId]);

  // Fetch booking data
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const fetchBookingDetails = async () => {
      if (!isMounted) return;
      
      // Only fetch if user is authenticated
      if (!isAuthenticated || isLoading) return;
      
      try {
        console.log('Fetching booking details for:', bookingId);
        setLoading(true);
        setError(null);
        
        // Add a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.error('API call timed out after 10 seconds');
            setError('Request timed out. Please try again.');
            setLoading(false);
          }
        }, 10000);
        
        const response = await apiClient.getBooking(bookingId);
        
        // Clear timeout since we got a response
        clearTimeout(timeoutId);
        
        if (!isMounted) return;
        
        console.log('API Response:', response);
        
        if (response.success && response.data?.booking) {
          console.log('Booking data received:', response.data.booking);
          setBooking(response.data.booking);
        } else {
          console.error('Failed to fetch booking details');
          setError('Failed to load booking details. Please try again.');
          setBooking(null);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (!isMounted) return;
        console.error('Error fetching booking details:', error);
        setError('Unable to load booking details. Please check your connection and try again.');
        setBooking(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (bookingId && isAuthenticated && !isLoading) {
      fetchBookingDetails();
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [bookingId, isAuthenticated, isLoading]);

  // Check if user is authorized to view this booking
  const isAuthorized = () => {
    if (!user || !booking) return false;
    
    // Check if the current user is the one who made the booking
    return user._id === booking.user._id || user.id === booking.user._id;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render login prompt if not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600 mb-6">
            Please log in to view your booking details.
          </p>
          <Button
            onClick={() => router.push('/auth/login?redirect=' + encodeURIComponent(`/bookings/${bookingId}`))}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  // Render unauthorized message if user is not the booking owner
  if (isAuthenticated && !isLoading && booking && !isAuthorized()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You are not authorized to view this booking. Only the person who made the booking can access these details.
          </p>
          <Button
            onClick={() => router.push('/bookings')}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            Go to My Bookings
          </Button>
        </div>
      </div>
    );
  }

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      const response = await apiClient.cancelBooking(bookingId, cancellationReason);
      
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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmed
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
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
        description: '50% refund until 7 days before check-in',
        refundPercentage: 50,
        deadlineHours: 168,
        color: 'bg-yellow-100 text-yellow-800',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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



  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-ping"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your booking details...</p>
          <p className="mt-2 text-sm text-gray-500">Booking ID: {bookingId}</p>
          <p className="mt-2 text-sm text-gray-500">If this takes too long, check the console for errors</p>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Error Loading Booking</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Try Again
              </button>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Go Back
              </button>
            </div>
          </div>
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

  const policy = getCancellationPolicy(booking.listing?.cancellationPolicy?.type || 'moderate');
  const refund = calculateRefund();
  const canCancel = booking.status === 'confirmed' || booking.status === 'pending';
  const nights = Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Beautiful Header */}
        <div className="relative mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.back()}
                className="group p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Booking Details
                </h1>
                <p className="text-lg text-gray-500 mt-2 font-medium">
                  #{booking._id?.slice(-8) || 'Unknown'} • {formatDate(booking.checkIn)}
                </p>
              </div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              {getStatusBadge(booking.status)}
            </div>
          </div>
        </div>





        {/* Beautiful Property Images */}
        {booking.listing?.images && booking.listing.images.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {booking.listing.images.slice(0, 3).map((image, index) => (
                <div key={index} className="group relative overflow-hidden rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500">
                  <img
                    src={typeof image === 'string' ? image : image.url || ''}
                    alt={`${booking.listing?.title || 'Property'} ${index + 1}`}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Beautiful Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-3xl p-2 shadow-lg border border-gray-100">
            <nav className="flex space-x-2">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'details', label: 'Details', icon: FileText },
                { id: 'host', label: 'Host', icon: User },
                { id: 'policies', label: 'Policies', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 px-6 rounded-2xl font-medium text-sm flex items-center justify-center space-x-3 transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Beautiful Property Details Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                  <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
                    <div className="flex-shrink-0">
                      <div className="relative group">
                                          <img 
                    src={typeof booking.listing?.images?.[0] === 'string' ? booking.listing.images[0] : booking.listing?.images?.[0]?.url || ''} 
                    alt={booking.listing?.title || 'Property'}
                    className="w-32 h-32 rounded-2xl object-cover shadow-lg group-hover:shadow-2xl transition-all duration-300"
                  />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <h2 className="text-2xl font-bold text-gray-900 truncate">
                          {booking.listing?.title || 'Property Title Not Available'}
                        </h2>
                        {booking.listing?.propertyType && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                            {booking.listing.propertyType}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed mb-4">
                        {booking.listing?.description || 'Description not available'}
                      </p>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <MapPin className="h-5 w-5 text-purple-500" />
                        <span className="text-sm font-medium">
                          {booking.listing?.location?.address || 'Address not available'}
                          {booking.listing?.location?.city && `, ${booking.listing.location.city}`}
                          {booking.listing?.location?.state && `, ${booking.listing.location.state}`}
                          {!booking.listing?.location?.address && !booking.listing?.location?.city && !booking.listing?.location?.state && 'Location details coming soon'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Beautiful Amenities Section */}
                {booking.listing?.amenities && booking.listing.amenities.length > 0 && (
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Amenities & Features</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {booking.listing.amenities.map((amenity, index) => {
                        const IconComponent = getAmenityIcon(amenity);
                        return (
                          <div key={index} className="group flex items-center space-x-4 p-4 rounded-2xl bg-gray-50 hover:bg-purple-50 transition-all duration-300 hover:scale-105">
                            <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                              <IconComponent className="h-5 w-5 text-purple-600 group-hover:text-purple-700" />
                            </div>
                            <span className="text-gray-700 font-medium group-hover:text-purple-700 transition-colors">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Beautiful Stay Details */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Stay Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Check-in</p>
                          <p className="text-lg font-bold text-gray-900">{formatDate(booking.checkIn)}</p>
                          <p className="text-sm text-blue-600 font-medium">After {booking.listing?.checkInTime || '3:00 PM'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="group p-6 rounded-2xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-800 uppercase tracking-wide">Check-out</p>
                          <p className="text-lg font-bold text-gray-900">{formatDate(booking.checkOut)}</p>
                          <p className="text-sm text-green-600 font-medium">Before {booking.listing?.checkOutTime || '11:00 AM'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="group p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-purple-800 uppercase tracking-wide">Guests</p>
                          <p className="text-lg font-bold text-gray-900">
                            {booking.guests && typeof booking.guests === 'object' && 'adults' in booking.guests
                              ? `${(booking.guests as any).adults || 0} adults, ${(booking.guests as any).children || 0} children`
                              : `${booking.guests || 0} guests`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="group p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-orange-800 uppercase tracking-wide">Duration</p>
                          <p className="text-lg font-bold text-gray-900">{nights} night{nights > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requests</h3>
                    <p className="text-gray-600">{booking.specialRequests}</p>
                  </Card>
                )}

                {/* Cancellation Reason */}
                {booking.cancellationReason && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Reason</h3>
                    <p className="text-gray-600">{booking.cancellationReason}</p>
                  </Card>
                )}
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Property Information */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {booking.listing?.bedrooms && (
                      <div className="flex items-center space-x-3">
                        <Bed className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Bedrooms</p>
                          <p className="text-sm text-gray-600">{booking.listing.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {booking.listing?.bathrooms && (
                      <div className="flex items-center space-x-3">
                        <Bath className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Bathrooms</p>
                          <p className="text-sm text-gray-600">{booking.listing.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    {booking.listing?.maxGuests && (
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Max Guests</p>
                          <p className="text-sm text-gray-600">{booking.listing.maxGuests}</p>
                        </div>
                      </div>
                    )}
                    {booking.listing?.propertyType && (
                      <div className="flex items-center space-x-3">
                        <Home className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Property Type</p>
                          <p className="text-sm text-gray-600">{booking.listing.propertyType}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* House Rules */}
                {booking.listing?.houseRules && booking.listing.houseRules.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">House Rules</h3>
                    <div className="space-y-2">
                      {booking.listing.houseRules.map((rule, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-600">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Check-in Instructions */}
                {booking.checkInInstructions && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-in Instructions</h3>
                    <p className="text-gray-600">{booking.checkInInstructions}</p>
                  </Card>
                )}

                {/* House Manual */}
                {booking.houseManual && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">House Manual</h3>
                    <p className="text-gray-600">{booking.houseManual}</p>
                  </Card>
                )}

                {/* Booking Timeline */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CalendarDays className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Booking Created</p>
                        <p className="text-sm text-gray-600">{formatDate(booking.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock4 className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Status</p>
                        <p className="text-sm text-gray-600 capitalize">{booking.status}</p>
                      </div>
                    </div>
                    {booking.payment?.paidAt && (
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Payment Date</p>
                          <p className="text-sm text-gray-600">{formatDate(booking.payment.paidAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Host Tab */}
            {activeTab === 'host' && (
              <div className="space-y-6">
                {/* Host Information */}
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <img 
                      src={booking.host?.profileImage || '/placeholder-avatar.jpg'} 
                      alt={booking.host?.name || 'Host'}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.host?.name || 'Host'}</h3>
                        {booking.host?.isVerified && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{booking.host?.about || 'No bio available'}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Response time: {booking.host?.responseTime || 'N/A'}</span>
                        {booking.host?.totalListings && (
                          <span>{booking.host.totalListings} listings</span>
                        )}
                        {booking.host?.averageRating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>{booking.host.averageRating}</span>
                            <span>({booking.host.totalReviews} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Host Contact */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Host</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">{booking.host?.email || 'Email not available'}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(booking.host?.email || '')}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">{booking.host?.phone || 'Phone not available'}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(booking.host?.phone || '')}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Host
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Host
                    </Button>
                  </div>
                </Card>

                {/* Host Stats */}
                {booking.host?.joinedDate && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Member Since</p>
                        <p className="text-sm text-gray-600">{formatDate(booking.host.joinedDate)}</p>
                      </div>
                      {booking.host.totalListings && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Total Listings</p>
                          <p className="text-sm text-gray-600">{booking.host.totalListings}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Policies Tab */}
            {activeTab === 'policies' && (
              <div className="space-y-6">
                {/* Cancellation Policy */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h3>
                  <div className="flex items-start space-x-3">
                    <policy.icon className={`h-5 w-5 mt-0.5 ${policy.color.replace('bg-', 'text-').replace(' text-', '')}`} />
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
                </Card>

                {/* Check-in/Check-out Times */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-in & Check-out</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Check-in Time</p>
                      <p className="text-sm text-gray-600">{booking.listing?.checkInTime || '3:00 PM'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Check-out Time</p>
                      <p className="text-sm text-gray-600">{booking.listing?.checkOutTime || '11:00 AM'}</p>
                    </div>
                  </div>
                </Card>

                {/* Minimum Stay */}
                {booking.listing?.minNights && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Minimum Nights</p>
                        <p className="text-sm text-gray-600">{booking.listing.minNights} night{booking.listing.minNights > 1 ? 's' : ''}</p>
                      </div>
                      {booking.listing?.maxNights && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">Maximum Nights</p>
                          <p className="text-sm text-gray-600">{booking.listing.maxNights} night{booking.listing.maxNights > 1 ? 's' : ''}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base price</span>
                  <span className="text-gray-900">{formatCurrency(booking.listing?.pricing?.basePrice || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cleaning fee</span>
                  <span className="text-gray-900">{formatCurrency(booking.listing?.pricing?.cleaningFee || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee</span>
                  <span className="text-gray-900">{formatCurrency(booking.listing?.pricing?.serviceFee || 0)}</span>
                </div>
                {booking.listing?.pricing?.securityDeposit && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security deposit</span>
                    <span className="text-gray-900">{formatCurrency(booking.listing.pricing.securityDeposit)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatCurrency(booking.totalAmount || 0)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            {booking.payment && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="text-gray-900">{booking.payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className="text-gray-900 capitalize">{booking.payment.status}</span>
                  </div>
                  {booking.payment.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="text-gray-900 text-xs">{booking.payment.transactionId}</span>
                    </div>
                  )}
                  {booking.payment.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid Date</span>
                      <span className="text-gray-900">{formatDate(booking.payment.paidAt)}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {/* Cancellation Action */}
                {canCancel && (
                  <Button 
                    onClick={() => setShowCancelModal(true)}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </Button>
                )}

                {/* Download Receipt */}
                <Button 
                  onClick={() => window.open(`/api/bookings/${booking._id}/receipt`, '_blank')}
                  variant="outline" 
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>

                {/* Contact Host */}
                <Button 
                  onClick={() => window.open(`mailto:${booking.listing?.host?.email || '#'}`)}
                  variant="outline" 
                  className="w-full border-green-200 text-green-600 hover:bg-green-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Host
                </Button>

                {/* View Property */}
                <Button 
                  onClick={() => window.open(`/rooms/${booking.listing?._id}`, '_blank')}
                  variant="outline" 
                  className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Property
                </Button>

                {/* Copy Booking ID */}
                <Button 
                  onClick={() => copyToClipboard(booking._id)}
                  variant="outline" 
                  className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Booking ID
                </Button>
              </div>
            </Card>

            {/* Cancellation Policy & Refund Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h3>
              <div className="space-y-4">
                {/* Policy Type */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Policy Type</span>
                  <span className="text-sm text-gray-900 capitalize">
                    {booking.listing?.cancellationPolicy?.type || 'moderate'}
                  </span>
                </div>

                {/* Policy Description */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {getCancellationPolicy(booking.listing?.cancellationPolicy?.type || 'moderate').description}
                  </p>
                </div>

                {/* Refund Calculation */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-800">Potential Refund</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(refund.amount)} ({refund.percentage}%)
                    </span>
                  </div>
                  <p className="text-xs text-green-700">
                    Based on current time until check-in
                  </p>
                </div>

                {/* Time Until Check-in */}
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-yellow-800">Time Until Check-in</span>
                    <span className="text-sm text-yellow-700">
                      {Math.ceil((new Date(booking.checkIn).getTime() - new Date().getTime()) / (1000 * 60 * 60))} hours
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Refund Information */}
            {booking.status === 'cancelled' && booking.refundAmount && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Refund Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Refund Amount</span>
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(booking.refundAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="text-gray-900 capitalize">{booking.refundStatus || 'pending'}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Refunds typically take 5-7 business days to appear in your account.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Booking</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Are you sure you want to cancel this booking?
                </p>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <Info className="h-4 w-4 inline mr-1" />
                    You'll receive a refund of {formatCurrency(refund.amount)} ({refund.percentage}% of total)
                  </p>
                </div>
              </div>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Reason for cancellation (optional)"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                rows={3}
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 