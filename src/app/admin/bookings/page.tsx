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
    const booking = bookings.find(b => b._id === bookingId || b.id === bookingId);
    if (booking) {
      // Create a detailed view modal or redirect to detailed page
      const details = `
Booking Details:
- ID: ${booking._id || booking.id}
- User: ${booking.user?.name} (${booking.user?.email})
- Host: ${booking.host?.name} (${booking.host?.email})
- Property: ${booking.listing?.title || booking.service?.title || 'N/A'}
- Check-in: ${new Date(booking.checkIn).toLocaleDateString()}
- Check-out: ${new Date(booking.checkOut).toLocaleDateString()}
- Guests: ${booking.guests?.adults || 0} adults, ${booking.guests?.children || 0} children
- Status: ${booking.status}
- Total Amount: ₹${(booking.totalAmount || 0).toLocaleString()}
- Payment Status: ${booking.paymentStatus || 'N/A'}
- Created: ${new Date(booking.createdAt).toLocaleDateString()}
${booking.refundAmount ? `- Refunded: ₹${booking.refundAmount.toLocaleString()}` : ''}
      `;
      alert(details);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Bookings
                </h1>
                <p className="mt-2 text-xs md:text-lg text-gray-600">
                  Manage all bookings and handle refunds
                </p>
               <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
  {/* Total Bookings */}
  <div className="flex items-center gap-2 shrink-0">
    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
    <span className="text-[11px] md:text-sm font-medium text-gray-600">
      Total: {bookings.length}
    </span>
  </div>

  {/* Confirmed Bookings */}
  <div className="flex items-center gap-2 shrink-0">
    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
    <span className="text-[11px] md:text-sm font-medium text-gray-600">
      Confirmed: {bookings.filter(b => b.status === 'confirmed').length}
    </span>
  </div>

  {/* Pending Bookings */}
  <div className="flex items-center gap-2 shrink-0">
    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
    <span className="text-[11px] md:text-sm font-medium text-gray-600">
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
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900 min-w-[120px] md:w-[150px]"
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
  {filteredBookings.map((booking) => (
    <div 
      key={booking._id || booking.id} 
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 md:p-6 hover:bg-white/90 hover:shadow-2xl transition-all duration-300 flex flex-col"
    >
      {/* 1. ID & Status Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <h3 className="text-sm md:text-lg font-bold text-gray-900 truncate">
            #{booking._id?.slice(-8) || booking.id?.slice(-8)}
          </h3>
          <p className="text-[10px] md:text-sm text-gray-500">
            {new Date(booking.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="shrink-0 scale-90 md:scale-100 origin-right">
          {getStatusBadge(booking.status)}
        </div>
      </div>

      {/* 2. Compact Info Section */}
      <div className="space-y-3">
        {/* Guest & Host (Side-by-side on tablet, stacked on mobile) */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 shrink-0 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-gray-400">Guest</p>
              <p className="text-xs font-semibold text-gray-900 truncate">{booking.user?.name || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0 border-t xs:border-t-0 xs:border-l border-gray-200 pt-2 xs:pt-0 xs:pl-3">
            <div className="w-8 h-8 shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-gray-400">Host</p>
              <p className="text-xs font-semibold text-gray-900 truncate">{booking.host?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Property & Dates */}
        <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                {booking.listing?.title || booking.service?.title || 'N/A'}
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Amount Section */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <span className="text-xs font-bold text-gray-600 uppercase">Total</span>
          <div className="text-right">
            <span className="text-base md:text-lg font-bold text-green-600">
              ₹{(booking.totalAmount || 0).toLocaleString()}
            </span>
            {booking.refundAmount && (
              <p className="text-[10px] text-red-600 font-medium">
                Refund: ₹{booking.refundAmount.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => handleView(booking._id || booking.id)}
          className="flex-1 bg-white border border-purple-200 text-purple-700 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-50 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </button>
        {booking.status === 'confirmed' && (
          <button
            onClick={() => handleRefund(booking._id || booking.id)}
            className="flex-1 bg-orange-50 text-orange-700 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-100 transition-all border border-orange-100 flex items-center justify-center gap-2 active:scale-95"
          >
            <DollarSign className="w-4 h-4" />
            <span>Refund</span>
          </button>
        )}
      </div>
    </div>
  ))}
</div>
        </div>
      </div>
    </AdminLayout>
  );
} 