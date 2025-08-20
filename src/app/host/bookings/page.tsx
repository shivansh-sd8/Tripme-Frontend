"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  User,
  Home,
  Receipt,
  Sparkles,
  Loader2,
  Filter,
  Search
} from 'lucide-react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { apiClient } from '@/infrastructure/api/clients/api-client';

interface Booking {
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
  listing?: {
    title: string;
    images: string[];
  };
  service?: {
    title: string;
    media: string[];
  };
  user: {
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
  // Fee breakdown
  serviceFee?: number;
  cleaningFee?: number;
  securityDeposit?: number;
  platformFee?: number;
  hostFee?: number;
  discountAmount?: number;
  paymentStatus?: string;
  // Check-in status
  checkedIn?: boolean;
  checkedInAt?: string;
  checkedInBy?: {
    _id: string;
    name: string;
  };
  checkInNotes?: string;
}

const HostBookingsPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getHostBookings();
      
      if (response.success && response.data) {
        setBookings(response.data.bookings || []);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: 'confirmed' | 'cancelled', reason?: string) => {
    try {
      setUpdatingBooking(bookingId);
      
      const response = await apiClient.updateBookingStatus(bookingId, { status, reason });
      
      if (response.success) {
        // Update the booking in the local state
        setBookings(prev => prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status }
            : booking
        ));
      } else {
        alert('Failed to update booking status');
      }
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      alert(err?.message || 'Failed to update booking status');
    } finally {
      setUpdatingBooking(null);
    }
  };

  const handleViewDetails = (bookingId: string) => {
    router.push(`/host/bookings/${bookingId}`);
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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric'
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

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch = booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.listing?.title || booking.service?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading bookings</h2>
          <p className="text-gray-600">Fetching your booking requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchBookings} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Booking Requests
                    </h1>
                    <p className="text-gray-600">Manage incoming booking requests</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => router.push('/host/dashboard')}
                  variant="outline"
                  className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Receipt className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0))}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">₹</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Filter className="w-3 h-3 text-white" />
                </div>
                Search & Filter
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by guest name or property..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200 hover:shadow-md"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200 hover:shadow-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Receipt className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No bookings found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {bookings.length === 0 
                  ? "You haven't received any booking requests yet. Promote your listings to get more bookings."
                  : "No bookings match your current filters. Try adjusting your search criteria."
                }
              </p>
              <Button 
                onClick={() => router.push('/host/listings')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Manage Listings
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <Card 
                  key={booking._id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* Left side - Booking details */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Property/Service Image */}
                          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={
                                (booking.listing?.images?.[0] as any)?.url || 
                                (typeof booking.listing?.images?.[0] === 'string' ? booking.listing.images[0] : null) ||
                                (booking.service?.media?.[0] as any)?.url ||
                                (typeof booking.service?.media?.[0] === 'string' ? booking.service.media[0] : null) ||
                                '/placeholder-property.jpg'
                              }
                              alt={booking.listing?.title || booking.service?.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Booking Details */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {booking.listing?.title || booking.service?.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {booking.user.name} • {booking.guests.adults} guests
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                              <span className="font-semibold text-gray-900">{formatPrice(booking.totalAmount)}</span>
                            </div>
                            
                            {/* Check-in Status */}
                            {booking.checkedIn && (
                              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-green-700 font-medium">Guest Checked In</span>
                                </div>
                                <p className="text-xs text-green-600 mt-1">
                                  {formatDateTime(booking.checkedInAt || '')}
                                </p>
                              </div>
                            )}
                            
                            {/* Earnings Display */}
                            {booking.hostFee && booking.hostFee > 0 && (
                              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-green-700 font-medium">Your Earning:</span>
                                  <span className="text-green-800 font-bold">{formatPrice(booking.hostFee)}</span>
                                </div>
                                <p className="text-xs text-green-600">After 15% platform fee</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side - Actions and Price */}
                      <div className="lg:text-right">
                        <div className="mb-4">
                          <p className="text-2xl font-bold text-gray-900">{formatPrice(booking.totalAmount)}</p>
                          <p className="text-sm text-gray-600">Total Amount</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          {/* View Details Button */}
                          <Button
                            onClick={() => handleViewDetails(booking._id)}
                            variant="outline"
                            className="border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>

                          {/* Status-specific actions */}
                          {booking.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                disabled={updatingBooking === booking._id}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 hover:shadow-lg"
                              >
                                {updatingBooking === booking._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Accept
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                disabled={updatingBooking === booking._id}
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50 font-semibold py-2 px-4 rounded-xl transition-all duration-200"
                              >
                                {updatingBooking === booking._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {booking.status === 'confirmed' && (
                            <div className="flex flex-col gap-2">
                              <div className="text-green-600 font-semibold">
                                <CheckCircle className="w-5 h-5 inline mr-1" />
                                Confirmed
                              </div>
                              <Button
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                disabled={updatingBooking === booking._id}
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-700 hover:bg-red-50 text-xs"
                              >
                                {updatingBooking === booking._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {booking.status === 'cancelled' && (
                            <div className="text-red-600 font-semibold">
                              <XCircle className="w-5 h-5 inline mr-1" />
                              Cancelled
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

export default HostBookingsPage; 