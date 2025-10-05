"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Phone,
  Mail,
  MessageSquare,
  User,
  Home,
  CreditCard,
  Loader2,
  Eye,
  CheckCircle2,
  Calendar,
  Star,
  Shield,
  Download,
  Copy,
  Trash2,
  Info,
  FileText
} from 'lucide-react';

import Button from '@/components/ui/Button';
import { apiClient } from '@/infrastructure/api/clients/api-client';

interface HostBookingDetails {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profileImage: string;
  };
  listing?: {
    _id: string;
    title: string;
    images: Array<{
      url: string;
      publicId: string;
      isPrimary: boolean;
    }>;
    description: string;
    location: {
      address: string;
      city: string;
      state: string;
      country: string;
    };
    pricing: {
      basePrice: number;
      cleaningFee: number;
      serviceFee: number;
      securityDeposit: number;
      currency: string;
    };
    amenities: string[];
    houseRules: string[];
    cancellationPolicy: {
      type: 'flexible' | 'moderate' | 'strict' | 'super_strict';
      description: string;
    };
    host: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      profileImage: string;
    };
    propertyType?: string;
    checkInTime?: string;
    checkOutTime?: string;
  };
  service?: {
    _id: string;
    title: string;
    description: string;
    media: Array<{
      url: string;
      type: 'image' | 'video';
    }>;
    pricing: {
      basePrice: number;
      perPersonPrice?: number;
      currency: string;
    };
    provider: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      profileImage: string;
    };
    serviceType: string;
    duration: {
      value: number;
      unit: 'minutes' | 'hours' | 'days';
    };
    location: {
      address: string;
      city: string;
      state: string;
      country: string;
    };
    cancellationPolicy?: {
      type: 'flexible' | 'moderate' | 'strict' | 'super_strict';
      description: string;
    };
  };
  checkIn: string;
  checkOut: string;
  checkInTime?: string;
  checkOutTime?: string;
  timeSlot?: {
    startTime: string;
    endTime: string;
  };
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
  bookingType: 'property' | 'service';
  bookingDuration?: 'daily' | 'hourly';
  receiptId?: string;
  hourlyExtension?: {
    hours: number;
    rate: number;
    totalHours: number;
  };
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

export default function HostBookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState<HostBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
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

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return;
    
    try {
      setUpdatingStatus(true);
      const response = await apiClient.updateBookingStatus(booking._id, newStatus);
      
      if (response.success) {
        setBooking(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCheckIn = async () => {
    if (!booking) return;
    
    try {
      setUpdatingStatus(true);
      const response = await apiClient.checkInGuest(booking._id);
      
      if (response.success) {
        setBooking(prev => prev ? { ...prev, checkedIn: true } : null);
      }
    } catch (error) {
      console.error('Error checking in guest:', error);
    } finally {
      setUpdatingStatus(false);
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {/* Left Column - Property & Guest Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property/Service Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="relative">
                {(booking.listing?.images?.[0]?.url || booking.service?.media?.[0]?.url) ? (
                  <img
                    src={booking.listing?.images?.[0]?.url || booking.service?.media?.[0]?.url}
                    alt={booking.listing?.title || booking.service?.title}
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
                      {booking.listing?.title || booking.service?.title || 'Property/Service Title'}
                    </h2>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>
                        {booking.listing?.location?.address || booking.service?.location?.address || 'Location not specified'}
              </span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <User className="w-4 h-4 mr-2" />
                      <span>
                        {booking.bookingType === 'property' ? 'Property' : 'Service'} Booking
                      </span>
                    </div>
            </div>
          </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {booking.listing?.description || booking.service?.description || 'No description available.'}
                  </p>
                      </div>
            </div>
          </div>

            {/* Guest Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Guest Information
                      </h3>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                      </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{booking.user.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{booking.user.email}</p>
                  {booking.user.phone && (
                    <p className="text-sm text-gray-500 mb-3">{booking.user.phone}</p>
                  )}
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
                      <div className="text-xs text-blue-600">
                        {booking.timeSlot ? formatTime(booking.timeSlot.startTime) : (booking.listing?.checkInTime || '3:00 PM')}
                            </div>
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
                        {booking.timeSlot ? formatTime(booking.timeSlot.endTime) : (booking.checkOutTime || booking.listing?.checkOutTime || '11:00 AM')}
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
                    <div className="text-sm font-semibold text-gray-900">
                      {booking.timeSlot ? 
                        `${Math.ceil((new Date(booking.timeSlot.endTime).getTime() - new Date(booking.timeSlot.startTime).getTime()) / (1000 * 60 * 60))} hours` :
                        `${nights} night${nights !== 1 ? 's' : ''}`
                      }
                    </div>
                        </div>
                      </div>
                    </div>
                  </div>

            {/* Special Requests Card */}
                  {booking.specialRequests && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-gray-600" />
                  Special Requests
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{booking.specialRequests}</p>
                        </div>
                        )}

            {/* Detailed Booking Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Booking Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Booking ID</span>
                    <span className="text-sm font-mono text-gray-900">{booking._id}</span>
                      </div>
                      
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Booking Type</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{booking.bookingType}</span>
                    </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Duration Type</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{booking.bookingDuration || 'daily'}</span>
                </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm text-gray-900">
                      {new Date(booking._id).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                          </span>
                      </div>
                    </div>
                    
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Receipt ID</span>
                    <span className="text-sm font-mono text-gray-900">{booking.receiptId || 'N/A'}</span>
                              </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Currency</span>
                    <span className="text-sm font-medium text-gray-900">{booking.currency || 'INR'}</span>
                          </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Cancellation Policy</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {booking.listing?.cancellationPolicy?.type || booking.service?.cancellationPolicy?.type || 'moderate'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Check-in Status</span>
                    <span className={`text-sm font-medium ${
                      booking.checkedIn ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {booking.checkedIn ? 'Checked In' : 'Not Checked In'}
                    </span>
                        </div>
                      </div>
                          </div>
                        </div>

            {/* Hourly Extension Details */}
            {booking.hourlyExtension && booking.hourlyExtension.hours > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gray-600" />
                  Hourly Extension Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-800 mb-1">Extension Hours</div>
                    <div className="text-lg font-bold text-blue-900">{booking.hourlyExtension.hours} hours</div>
                    </div>
                    
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-green-800 mb-1">Rate</div>
                    <div className="text-lg font-bold text-green-900">
                      {Math.round((booking.hourlyExtension.rate || 0) * 100)}% of daily rate
                              </div>
                          </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-purple-800 mb-1">Total Hours</div>
                    <div className="text-lg font-bold text-purple-900">{booking.hourlyExtension.totalHours} hours</div>
                          </div>
                        </div>
              </div>
            )}

            {/* Contact Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-gray-600" />
                Guest Contact Information
              </h3>
                        
                        <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Email</span>
                          </div>
                  <span className="text-sm font-medium text-gray-900">{booking.user.email}</span>
                </div>
                
                          {booking.user.phone && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Phone</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{booking.user.phone}</span>
                            </div>
                          )}
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Full Name</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{booking.user.name}</span>
                </div>
                        </div>
                      </div>
                      
            {/* Special Requests Card */}
            {booking.specialRequests && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-gray-600" />
                  Special Requests
                </h3>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">{booking.specialRequests}</p>
                          </div>
                          </div>
            )}

            {/* Cancellation Information */}
            {booking.status === 'cancelled' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  Cancellation Details
                </h3>
                
                        <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Cancelled At</span>
                    <span className="text-sm text-gray-900">
                      {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </span>
                          </div>
                  
                  {booking.cancellationReason && (
                    <div className="py-2">
                      <span className="text-sm text-gray-600 block mb-2">Reason</span>
                      <p className="text-sm text-gray-900 bg-red-50 p-3 rounded-lg">{booking.cancellationReason}</p>
                          </div>
                  )}
                  
                  {(booking.refundAmount || 0) > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Refund Amount</span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(booking.refundAmount || 0)}
                      </span>
                          </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Refund Status</span>
                    <span className={`text-sm font-medium ${
                      booking.refundStatus === 'completed' ? 'text-green-600' : 
                      booking.refundStatus === 'pending' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`}>
                      {booking.refundStatus ? booking.refundStatus.charAt(0).toUpperCase() + booking.refundStatus.slice(1) : 'N/A'}
                    </span>
                        </div>
                      </div>
                    </div>
              )}

            {/* Amenities Card */}
            {booking.listing?.amenities && booking.listing.amenities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-gray-600" />
                  Property Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {booking.listing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                      <span className="text-sm text-gray-700">{amenity}</span>
                      </div>
                  ))}
                  </div>
                </div>
              )}

            {/* House Rules Card */}
            {booking.listing?.houseRules && booking.listing.houseRules.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-gray-600" />
                  House Rules
                </h3>
                <div className="space-y-2">
                  {booking.listing.houseRules.map((rule, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rule}</span>
                      </div>
                          ))}
                        </div>
              </div>
            )}
                    </div>
                    
          {/* Right Column - Pricing & Actions */}
          <div className="space-y-6">
            {/* Comprehensive Price Breakdown Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                Complete Price Breakdown
              </h3>
              
                      <div className="space-y-4">
                {/* Revenue Section */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3">Revenue Breakdown</h4>
                  <div className="space-y-2">
                    {/* Base Amount */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-700">Base Amount</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.pricingBreakdown?.hostBreakdown?.baseAmount || booking.listing?.pricing?.basePrice || booking.service?.pricing?.basePrice || 0)}
                      </span>
                              </div>
                    
                    {/* Cleaning Fee */}
                    {(booking.pricingBreakdown?.hostBreakdown?.cleaningFee || booking.listing?.pricing?.cleaningFee || 0) > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-700">Cleaning Fee</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.pricingBreakdown?.hostBreakdown?.cleaningFee || booking.listing?.pricing?.cleaningFee || 0)}
                        </span>
                            </div>
                          )}
                    
                    {/* Service Fee */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-700">Service Fee</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.pricingBreakdown?.hostBreakdown?.serviceFee || booking.listing?.pricing?.serviceFee || booking.service?.pricing?.basePrice || 0)}
                      </span>
                        </div>
                    
                    {/* Security Deposit */}
                    {(booking.pricingBreakdown?.hostBreakdown?.securityDeposit || booking.listing?.pricing?.securityDeposit || 0) > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-700">Security Deposit</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.pricingBreakdown?.hostBreakdown?.securityDeposit || booking.listing?.pricing?.securityDeposit || 0)}
                        </span>
                      </div>
                    )}
                    
                    {/* Hourly Extension */}
                    {(booking.pricingBreakdown?.hostBreakdown?.hourlyExtension || 0) > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-700">Hourly Extension</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.pricingBreakdown?.hostBreakdown?.hourlyExtension || 0)}
                        </span>
                              </div>
              )}

                    {/* Discount Applied */}
                    {(booking.pricingBreakdown?.hostBreakdown?.discountAmount || booking.discountAmount || 0) > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-700">Discount Applied</span>
                        <span className="text-sm font-medium text-green-600">
                          -{formatCurrency(booking.pricingBreakdown?.hostBreakdown?.discountAmount || booking.discountAmount || 0)}
                        </span>
                            </div>
                          )}
                    
                    {/* Subtotal */}
                    <div className="border-t border-blue-200 pt-2 mt-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm font-semibold text-blue-800">Subtotal</span>
                        <span className="text-sm font-bold text-blue-800">
                          {formatCurrency(booking.pricingBreakdown?.hostBreakdown?.subtotal || booking.subtotal || 0)}
                              </span>
                        </div>
                      </div>
                    </div>
                  </div>
                        
                {/* Platform Fees Section */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-orange-800 mb-3">Platform Fees</h4>
                  <div className="space-y-2">
                    {/* Platform Fee */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-700">Platform Fee ({booking.pricingBreakdown?.hostBreakdown?.subtotal > 0 ? Math.round((booking.pricingBreakdown?.platformBreakdown?.platformFee || 0) / booking.pricingBreakdown?.hostBreakdown?.subtotal * 100) : 0}%)</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.pricingBreakdown?.hostBreakdown?.platformFee || booking.platformFee || 0)}
                      </span>
                </div>
                    
                    {/* Processing Fee */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-700">Processing Fee</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.pricingBreakdown?.platformBreakdown?.processingFee || booking.processingFee || 0)}
                      </span>
                      </div>
                      
                    {/* GST */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-700">GST (18%)</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.pricingBreakdown?.platformBreakdown?.gst || booking.gst || 0)}
                      </span>
                          </div>
                          </div>
                    </div>
                    
                {/* Host Earning Section */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-800 mb-3">Your Earnings</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-base font-semibold text-green-800">Total Host Earning</span>
                      <span className="text-lg font-bold text-green-800">
                        {formatCurrency(booking.pricingBreakdown?.hostBreakdown?.hostEarning || booking.hostFee || 0)}
                              </span>
                          </div>
                    <div className="text-xs text-green-700">
                      After platform fees and taxes
                            </div>
                          </div>
                        </div>
                        
                {/* Customer Payment Section */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-purple-800 mb-3">Customer Payment</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-700">Total Amount Paid</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.pricingBreakdown?.customerBreakdown?.totalAmount || booking.totalAmount || 0)}
                      </span>
                        </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-700">Payment Status</span>
                      <span className={`text-sm font-medium ${
                        booking.paymentStatus === 'paid' ? 'text-green-600' : 
                        booking.paymentStatus === 'pending' ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1)}
                      </span>
                      </div>
                    </div>
                          </div>
                        </div>
                      </div>
                      
            {/* Payment Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                Payment Information
              </h3>
              
                        <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Payment Status</span>
                  <span className={`text-sm font-medium ${
                    booking.paymentStatus === 'paid' ? 'text-green-600' : 
                    booking.paymentStatus === 'pending' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1)}
                  </span>
                          </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                          </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Your Earning</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatCurrency(booking.pricingBreakdown?.hostBreakdown?.hostEarning || booking.hostFee || 0)}
                  </span>
                          </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Platform Fee</span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(booking.pricingBreakdown?.hostBreakdown?.platformFee || booking.platformFee || 0)}
                  </span>
                          </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Processing Fee</span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(booking.pricingBreakdown?.platformBreakdown?.processingFee || booking.processingFee || 0)}
                  </span>
                          </div>
                            </div>
                          </div>

            {/* Refund Information Card */}
            {((booking.refundAmount || 0) > 0 || booking.refunded) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <XCircle className="w-5 h-5 mr-2 text-gray-600" />
                  Refund Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Refund Amount</span>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(booking.refundAmount || 0)}
                    </span>
                        </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Refund Status</span>
                    <span className={`text-sm font-medium ${
                      booking.refundStatus === 'completed' ? 'text-green-600' : 
                      booking.refundStatus === 'pending' ? 'text-yellow-600' : 
                      'text-gray-600'
                    }`}>
                      {booking.refundStatus ? booking.refundStatus.charAt(0).toUpperCase() + booking.refundStatus.slice(1) : 'N/A'}
                    </span>
                      </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Refunded</span>
                    <span className={`text-sm font-medium ${
                      booking.refunded ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {booking.refunded ? 'Yes' : 'No'}
                    </span>
                    </div>
                  </div>
                </div>
              )}

            {/* Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
                <div className="space-y-3">
                {booking.status === 'pending' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      <span>Accept Booking</span>
                    </button>
                    
                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Booking</span>
                    </button>
                  </div>
                )}
                
                {booking.status === 'confirmed' && !booking.checkedIn && (
                  <button
                    onClick={handleCheckIn}
                    disabled={updatingStatus}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Check In Guest</span>
                  </button>
                )}
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download Receipt</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Copy className="w-4 h-4" />
                  <span>Copy Booking ID</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Guest</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>Call Guest</span>
                </button>
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
                  <span className="text-sm text-gray-600">Booking Type</span>
                  <span className="text-sm text-gray-900 capitalize">{booking.bookingType}</span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Booking</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to reject this booking?
              </p>
              <div className="p-3 bg-yellow-50 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  <Info className="h-4 w-4 inline mr-1" />
                  The guest will receive a full refund automatically.
                </p>
              </div>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Reason for rejection (optional)"
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
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={updatingStatus}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? 'Rejecting...' : 'Reject Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
