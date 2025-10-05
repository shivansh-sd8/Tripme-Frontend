"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, MapPin, Users, Clock, CheckCircle, Clock4, X } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useAuth } from '@/core/store/auth-context';
import Button from '@/components/ui/Button';

interface Booking {
  _id: string;
  propertyId: {
    _id: string;
    title: string;
    images: string[];
    location: {
      city: string;
      state: string;
    };
    host: string | { _id: string; name: string };
  };
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  specialRequests?: string;
}

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
      return <Clock4 className="w-4 h-4" />;
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Clock4 className="w-4 h-4" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatPrice = (amount: number, currency: string = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);


  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated, router]);

  // Check for success parameter
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessMessage(true);
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBookings();
      setBookings(response.data?.bookings || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };





  const filterBookings = (bookings: Booking[]) => {
    const now = new Date();
    if (activeTab === 'upcoming') {
      return bookings.filter(booking => 
        new Date(booking.checkIn) > now && booking.status !== 'cancelled'
      );
    } else {
      return bookings.filter(booking => 
        new Date(booking.checkIn) <= now || booking.status === 'cancelled'
      );
    }
  };

  const filteredBookings = filterBookings(bookings);

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-28 sm:pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 pt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">My Bookings</h1>
            <p className="text-gray-600 text-lg">Manage your upcoming and past trips</p>
          </div>

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Booking Confirmed!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your booking has been successfully created and payment processed.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="ml-auto text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-10">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming Trips
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                activeTab === 'past'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past Trips
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600">Loading your bookings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading bookings</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={fetchBookings} className="bg-indigo-600 hover:bg-indigo-700">
                Try Again
              </Button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab === 'upcoming' ? 'upcoming' : 'past'} bookings
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming trips planned."
                  : "You haven't completed any trips yet."
                }
              </p>
              {activeTab === 'upcoming' && (
                <Button 
                  onClick={() => router.push('/search')}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Start Planning
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row items-center md:items-stretch">
                  <div className="w-full md:w-48 h-40 md:h-auto flex-shrink-0 flex items-center justify-center bg-gray-100">
                    <img
                      src={booking.propertyId?.images?.[0] || '/logo.png'}
                      alt={booking.propertyId?.title || 'Property'}
                      className="w-full h-full object-cover rounded-2xl md:rounded-none"
                    />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {booking.propertyId?.title || 'Property'}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.propertyId?.location?.city || ''}{booking.propertyId?.location?.city && booking.propertyId?.location?.state ? ', ' : ''}{booking.propertyId?.location?.state || ''}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>Check-in: {formatDate(booking.checkIn)}</span>
                        <span>Check-out: {formatDate(booking.checkOut)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Users className="w-4 h-4" />
                        <span>{booking.guests.adults + booking.guests.children + booking.guests.infants} guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>Status:</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>{getStatusIcon(booking.status)}{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <span>Total:</span>
                        <span>{formatPrice(booking.totalAmount)}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        onClick={() => router.push(`/bookings/${booking._id}`)}
                      >
                        View Details
                      </Button>
                      {booking.propertyId?._id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                          onClick={() => router.push(`/rooms/${booking.propertyId._id}`)}
                        >
                          Go to Property
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>



      <Footer />
    </div>
  );
} 