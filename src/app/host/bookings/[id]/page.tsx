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
  CheckCircle2
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
    propertyType: string;
    amenities: string[];
    checkInTime: string;
    checkOutTime: string;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
  };
  service?: {
    _id: string;
    title: string;
    media: Array<{
      url: string;
      type: string;
    }>;
    description: string;
    pricing: {
      basePrice: number;
      currency: string;
    };
  };
  bookingType: 'property' | 'service';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  checkIn: string;
  checkOut: string;
  timeSlot?: {
    startTime: string;
    endTime: string;
  };
  checkInTime: string;
  checkOutTime: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  totalAmount: number;
  taxAmount: number;
  serviceFee: number;
  cleaningFee: number;
  securityDeposit: number;
  currency: string;
  cancellationPolicy: string;
  specialRequests?: string;
  paymentStatus: string;
  refundAmount: number;
  refunded: boolean;
  refundStatus: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: {
    _id: string;
    name: string;
  };
  checkInNotes?: string;
  createdAt: string;
  updatedAt: string;
  receiptId: string;
}

export default function HostBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [booking, setBooking] = useState<HostBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'guest' | 'actions' | 'payment'>('overview');

  const bookingId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [isAuthenticated, bookingId, router]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getBooking(bookingId);
      
      if (response.success && response.data?.booking) {
        setBooking(response.data.booking);
      } else {
        setError('Failed to load booking details');
      }
    } catch (err: any) {
      console.error('Error fetching booking details:', err);
      setError(err?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking) return;
    
    try {
      setUpdatingStatus(newStatus);
      
      const response = await apiClient.updateBookingStatus(booking._id, newStatus);
      
      if (response.success) {
        setBooking(prev => prev ? { ...prev, status: newStatus as any } : null);
      } else {
        alert('Failed to update booking status');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(err?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCheckIn = async () => {
    if (!booking) return;
    
    try {
      const response = await apiClient.checkInGuest(booking._id, 'Guest checked in by host');
      
      if (response.success) {
        setBooking(prev => prev ? { 
          ...prev, 
          checkedIn: true, 
          checkedInAt: new Date().toISOString(),
          checkedInBy: { _id: user?._id || '', name: user?.name || '' }
        } : null);
      } else {
        alert('Failed to check in guest');
      }
    } catch (err: any) {
      console.error('Error checking in guest:', err);
      alert(err?.message || 'Failed to check in guest');
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="pt-28 sm:pt-32 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading booking details</h2>
                <p className="text-gray-600">Fetching booking information...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="pt-28 sm:pt-32 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
                <Button onClick={fetchBookingDetails} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <main className="pt-28 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Host Booking Details
                </h1>
                <p className="text-gray-600 mt-1">Manage this guest's booking</p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full border-2 font-medium text-sm">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                <span className="ml-2 capitalize">{booking.status}</span>
              </span>
            </div>
          </div>

          {/* Beautiful Tabs */}
          <div className="mb-8">
            <div className="bg-white rounded-3xl p-2 shadow-lg border border-gray-100">
              <nav className="flex space-x-2">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'guest', label: 'Guest Info', icon: User },
                  { id: 'actions', label: 'Actions', icon: CheckCircle },
                  { id: 'payment', label: 'Payment', icon: CreditCard }
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
                  {/* Property/Service Details */}
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                        <Home className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {booking.bookingType === 'property' ? 'Property Details' : 'Service Details'}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-4">
                          {booking.listing?.title || booking.service?.title}
                        </h4>
                        <p className="text-gray-600 mb-6">
                          {booking.listing?.description || booking.service?.description}
                        </p>
                        
                        {booking.listing && (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-5 w-5 text-purple-500" />
                              <span className="text-gray-700">
                                {booking.listing.location.address}, {booking.listing.location.city}, {booking.listing.location.state}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Users className="h-5 w-5 text-purple-500" />
                              <span className="text-gray-700">
                                {booking.listing.bedrooms} bedrooms, {booking.listing.bathrooms} bathrooms
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <span className="text-gray-600 font-medium">Check-in</span>
                          <span className="font-semibold text-gray-900">{formatDate(booking.checkIn)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <span className="text-gray-600 font-medium">Check-out</span>
                          <span className="font-semibold text-gray-900">{formatDate(booking.checkOut)}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <span className="text-gray-600 font-medium">Guests</span>
                          <span className="font-semibold text-gray-900">
                            {booking.guests.adults + booking.guests.children + booking.guests.infants}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <span className="text-gray-600 font-medium">Total Amount</span>
                          <span className="font-semibold text-gray-900">{formatPrice(booking.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl">
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Special Requests</h3>
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Guest Info Tab */}
              {activeTab === 'guest' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Guest Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                            {booking.user.profileImage ? (
                              <img 
                                src={booking.user.profileImage} 
                                alt={booking.user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900">{booking.user.name}</h4>
                            <p className="text-gray-600">Guest</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-blue-500" />
                            <span className="text-gray-700">{booking.user.email}</span>
                          </div>
                          {booking.user.phone && (
                            <div className="flex items-center space-x-3">
                              <Phone className="h-5 w-5 text-blue-500" />
                              <span className="text-gray-700">{booking.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-gray-900 mb-4">Guest Details</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Adults</span>
                            <span className="font-medium">{booking.guests.adults}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Children</span>
                            <span className="font-medium">{booking.guests.children}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Infants</span>
                            <span className="font-medium">{booking.guests.infants}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions Tab */}
              {activeTab === 'actions' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Booking Actions</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Status Update */}
                      <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-gray-900">Update Status</h5>
                        <div className="space-y-3">
                          {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                            <Button
                              key={status}
                              onClick={() => handleStatusUpdate(status)}
                              disabled={updatingStatus === status || booking.status === status}
                              variant={booking.status === status ? 'default' : 'outline'}
                              className={`w-full justify-start ${
                                booking.status === status 
                                  ? 'bg-purple-600 text-white' 
                                  : 'hover:bg-purple-50 hover:border-purple-300'
                              }`}
                            >
                              {updatingStatus === status ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                getStatusIcon(status)
                              )}
                              <span className="ml-2 capitalize">{status}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Check-in */}
                      <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-gray-900">Guest Check-in</h5>
                        <div className="space-y-3">
                          {!booking.checkedIn ? (
                            <Button
                              onClick={handleCheckIn}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Check In Guest
                            </Button>
                          ) : (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-green-800 font-medium">Guest Checked In</span>
                              </div>
                              <p className="text-green-700 text-sm mt-1">
                                {formatDateTime(booking.checkedInAt || '')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Tab */}
              {activeTab === 'payment' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Payment Details</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h5 className="text-lg font-semibold text-gray-900">Payment Status</h5>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Status</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                booking.paymentStatus === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h5 className="text-lg font-semibold text-gray-900">Receipt</h5>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-600 text-sm">Receipt ID</p>
                            <p className="font-mono text-gray-900">{booking.receiptId}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-6">
                        <h5 className="text-lg font-semibold text-gray-900 mb-4">Fee Breakdown</h5>
                        <div className="space-y-3">
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Base Amount</span>
                            <span className="font-medium">{formatPrice(booking.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Service Fee</span>
                            <span className="font-medium">{formatPrice(booking.serviceFee)}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Cleaning Fee</span>
                            <span className="font-medium">{formatPrice(booking.cleaningFee)}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Security Deposit</span>
                            <span className="font-medium">{formatPrice(booking.securityDeposit)}</span>
                          </div>
                          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Platform Fee</span>
                            <span className="font-medium">{formatPrice(booking.platformFee || 0)}</span>
                          </div>
                          <div className="border-t border-gray-200 pt-3">
                            <div className="flex justify-between">
                              <span className="text-lg font-semibold text-gray-900">Total</span>
                              <span className="text-lg font-semibold text-gray-900">{formatPrice(booking.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push(`/host/bookings`)}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Bookings
                  </Button>
                  
                  <Button
                    onClick={() => window.open(`mailto:${booking.user.email}`, '_blank')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Guest
                  </Button>
                  
                  {booking.user.phone && (
                    <Button
                      onClick={() => window.open(`tel:${booking.user.phone}`, '_blank')}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Guest
                    </Button>
                  )}
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-900">{formatDate(booking.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-900">{formatDate(booking.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cancellation Policy</span>
                    <span className="text-gray-900 capitalize">{booking.cancellationPolicy}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
