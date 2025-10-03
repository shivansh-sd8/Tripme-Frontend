"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { 
  Eye, 
  DollarSign,
  Search,
  Filter,
  Calendar,
  Users
} from 'lucide-react';

interface Booking {
  id: string;
  _id: string;
  user: {
    name: string;
    email: string;
  };
  host: {
    name: string;
    email: string;
  };
  listing?: {
    title: string;
  };
  service?: {
    title: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  createdAt: string;
  refundAmount?: number;
  refundDate?: string;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getAdminBookings();
        
        if (response.success && response.data) {
          // The backend returns { bookings: [...], pagination: {...} }
          setBookings(response.data.bookings || []);
        } else {
          // Fallback to mock data if API fails
          console.warn('Admin bookings API failed, using fallback data');
          setBookings([]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        // Fallback to empty array on error
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = (bookings || []).filter(booking => {
    const matchesSearch = (booking._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.host?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (booking.listing?.title || booking.service?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Confirmed
        </span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Cancelled
        </span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Completed
        </span>;
      case 'refunded':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Refunded
        </span>;
      default:
        return null;
    }
  };

  const handleView = (bookingId: string) => {
    // TODO: Implement view logic - could open a modal with detailed booking info

  };

  const handleRefund = async (bookingId: string) => {
    const amount = prompt('Enter refund amount:');
    const reason = prompt('Enter refund reason:');
    
    if (amount && reason) {
      try {
        const response = await apiClient.refundBooking(bookingId, parseFloat(amount), reason);
        if (response.success) {
          // Update the booking in the local state
          setBookings(bookings.map(booking => 
            (booking._id || booking.id) === bookingId 
              ? { 
                  ...booking, 
                  status: 'refunded' as const,
                  refundAmount: parseFloat(amount),
                  refundDate: new Date().toISOString()
                }
              : booking
          ));
        }
      } catch (error) {
        console.error('Error processing refund:', error);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg">Loading bookings...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Bookings
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Manage all bookings and handle refunds
                </p>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Total: {bookings.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Confirmed: {bookings.filter(b => b.status === 'confirmed').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Pending: {bookings.filter(b => b.status === 'pending').length}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by booking ID, guest, host, or property..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id || booking.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:bg-white/90 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Booking #{booking._id?.slice(-8) || booking.id?.slice(-8)}</h3>
                    <p className="text-sm text-gray-600">{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="space-y-4">
                  {/* Guest Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{booking.user?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{booking.user?.email || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Host Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{booking.host?.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{booking.host?.email || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Property/Service */}
                  <div className="p-3 bg-gray-100/50 rounded-xl">
                    <p className="text-sm font-medium text-gray-900">Property/Service</p>
                    <p className="text-sm text-gray-600">{booking.listing?.title || booking.service?.title || 'N/A'}</p>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-600">{booking.guests?.adults || booking.guests || 0} guest{(booking.guests?.adults || booking.guests || 0) !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Total Amount</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">₹{(booking.totalAmount || 0).toLocaleString()}</span>
                      {booking.refundAmount && (
                        <div className="text-xs text-red-600">
                          Refunded: ₹{(booking.refundAmount || 0).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handleView(booking._id || booking.id)}
                      className="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-xl hover:bg-purple-200 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleRefund(booking._id || booking.id)}
                        className="flex-1 bg-orange-100 text-orange-700 px-4 py-2 rounded-xl hover:bg-orange-200 transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>Refund</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 