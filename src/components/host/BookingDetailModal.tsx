"use client";
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Receipt, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Home,
  Tag,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import Button from '@/components/ui/Button';

interface BookingDetailModalProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (bookingId: string, status: string) => void;
}

interface DetailedBooking {
  _id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  totalAmount: number;
  specialRequests?: string;
  createdAt: string;
  bookingDuration?: 'daily' | 'hourly';
  hourlyExtension?: {
    hours: number;
    rate: number;
    totalHours: number;
  };
  listing?: {
    title: string;
    images: string[];
    description?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
    };
  };
  service?: {
    title: string;
    media: string[];
    description?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
    };
  };
  user: {
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
  host: {
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
  couponApplied?: {
    code: string;
    discountType: string;
    amount: number;
  };
  cancellationPolicy?: string;
  timeSlot?: {
    startTime: string;
    endTime: string;
  };
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  bookingId,
  isOpen,
  onClose,
  onStatusUpdate
}) => {
  const [booking, setBooking] = useState<DetailedBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBookingDetails();
    }
  }, [isOpen, bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getBooking(bookingId);
      
      if (response.success && response.data) {
        setBooking(response.data.booking);
      } else {
        setError('Failed to load booking details');
      }
    } catch (err: any) {
      console.error('Error fetching booking details:', err);
      if (err?.status === 403) {
        setError('You are not authorized to view this booking. Please contact support if you believe this is an error.');
      } else if (err?.status === 404) {
        setError('Booking not found. It may have been deleted or moved.');
      } else {
        setError(err?.message || 'Failed to load booking details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: 'confirmed' | 'cancelled') => {
    try {
      setUpdatingStatus(true);
      
      const response = await apiClient.updateBookingStatus(bookingId, { status });
      
      if (response.success) {
        setBooking(prev => prev ? { ...prev, status } : null);
        onStatusUpdate(bookingId, status);
      } else {
        alert('Failed to update booking status');
      }
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      alert(err?.message || 'Failed to update booking status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <p className="text-sm text-gray-600">Complete booking information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading booking details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchBookingDetails} className="bg-purple-600 hover:bg-purple-700 text-white">
                Try Again
              </Button>
            </div>
          ) : booking ? (
            <div className="space-y-6">
              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(booking.status)}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </span>
                  <span className="text-sm text-gray-600">
                    Created on {formatDateTime(booking.createdAt)}
                  </span>
                </div>

                {/* Action buttons for different booking statuses */}
                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={updatingStatus}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept Booking
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={updatingStatus}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      {updatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel Booking
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={updatingStatus}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      {updatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel Booking
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={updatingStatus}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {updatingStatus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark as Completed
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Property/Service Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      {booking.listing ? <Home className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                      {booking.listing ? 'Property Details' : 'Service Details'}
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {booking.listing?.title || booking.service?.title}
                        </h4>
                        {booking.listing?.description || booking.service?.description ? (
                          <p className="text-sm text-gray-600 mt-1">
                            {booking.listing?.description || booking.service?.description}
                          </p>
                        ) : null}
                      </div>

                      {(booking.listing?.location || booking.service?.location) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {booking.listing?.location?.address || booking.service?.location?.address}
                            {booking.listing?.location?.city || booking.service?.location?.city ? 
                              `, ${booking.listing?.location?.city || booking.service?.location?.city}` : ''
                            }
                          </span>
                        </div>
                      )}

                      {/* Images */}
                      {(booking.listing?.images || booking.service?.media) && (
                        <div className="flex gap-2 overflow-x-auto">
                          {(booking.listing?.images || booking.service?.media)?.slice(0, 3).map((image: any, index: number) => (
                            <img
                              key={index}
                              src={typeof image === 'string' ? image : image?.url}
                              alt={`${booking.listing?.title || booking.service?.title} ${index + 1}`}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Guest Information */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Guest Information
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                          {booking.user.profileImage ? (
                            <img
                              src={booking.user.profileImage}
                              alt={booking.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{booking.user.name}</h4>
                          <p className="text-sm text-gray-600">{booking.user.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>{booking.user.email}</span>
                        </div>
                        {booking.user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{booking.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Booking Details */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Booking Details
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Check-in</p>
                          <p className="font-semibold text-gray-900">
                            {booking.listing ? formatDate(booking.checkIn) : formatDateTime(booking.timeSlot?.startTime || '')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Check-out</p>
                          <p className="font-semibold text-gray-900">
                            {booking.listing ? formatDate(booking.checkOut) : formatDateTime(booking.timeSlot?.endTime || '')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {booking.guests.adults} adults, {booking.guests.children} children, {booking.guests.infants} infants
                        </span>
                      </div>

                      {booking.cancellationPolicy && (
                        <div>
                          <p className="text-sm text-gray-600">Cancellation Policy</p>
                          <p className="font-semibold text-gray-900 capitalize">{booking.cancellationPolicy}</p>
                        </div>
                      )}
                    </div>

                    {/* Hourly Extension Details */}
                    {booking.hourlyExtension && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <h4 className="font-semibold text-blue-900">Hourly Extension</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Extension requested:</span>
                            <span className="text-blue-900 font-medium">{booking.hourlyExtension.hours} hours</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Rate:</span>
                            <span className="text-blue-900 font-medium">{Math.round(booking.hourlyExtension.rate * 100)}% of daily rate</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Total extension hours:</span>
                            <span className="text-blue-900 font-medium">{booking.hourlyExtension.totalHours} hours</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Receipt className="w-5 h-5" />
                      Payment Details
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="text-2xl font-bold text-gray-900">{formatPrice(booking.totalAmount)}</span>
                      </div>

                      {booking.couponApplied && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Discount Applied</span>
                          <span className="text-green-600 font-semibold">
                            -{formatPrice(booking.couponApplied.amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Special Requests
                      </h3>
                      <p className="text-gray-700">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal; 