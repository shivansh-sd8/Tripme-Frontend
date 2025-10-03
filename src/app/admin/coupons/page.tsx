"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Tag,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  amount: number;
  maxDiscount?: number;
  minBookingAmount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  applicableToListings: any[];
  applicableToServices: any[];
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state for creating/editing coupons
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    amount: '',
    maxDiscount: '',
    minBookingAmount: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    applicableToListings: [] as string[],
    applicableToServices: [] as string[],
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, filterActive, searchTerm]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      
      // Check if token exists - try both possible keys
      const token = localStorage.getItem('tripme_token') || localStorage.getItem('adminToken');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filterActive !== 'all' && { isActive: filterActive }),
        ...(searchTerm && { search: searchTerm })
      });

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCoupons(data.data.coupons);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch coupons:', errorData);
        
        if (response.status === 401) {
          if (errorData.message === 'Invalid token.') {
            alert('Your session has expired. Please log in again.');
            router.push('/admin/login');
          } else {
            console.error('Authentication error:', errorData.message);
          }
        } else {
          console.error('API error:', errorData.message);
        }
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if token exists - try both possible keys
    const token = localStorage.getItem('tripme_token') || localStorage.getItem('adminToken');
    if (!token) {
      alert('No authentication token found. Please log in again.');
      return;
    }
    
    try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
          minBookingAmount: formData.minBookingAmount ? parseFloat(formData.minBookingAmount) : undefined,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          code: '',
          discountType: 'percentage',
          amount: '',
          maxDiscount: '',
          minBookingAmount: '',
          validFrom: '',
          validTo: '',
          usageLimit: '',
          applicableToListings: [],
          applicableToServices: [],
          isActive: true
        });
        fetchCoupons();
      } else {
        const errorData = await response.json();
        console.error('Coupon creation failed:', errorData);
        
        if (response.status === 401) {
          if (errorData.message === 'Invalid token.') {
            alert('Your session has expired. Please log in again.');
            // Redirect to login
            router.push('/admin/login');
          } else {
            alert(`Authentication error: ${errorData.message}`);
          }
        } else {
          alert(`Failed to create coupon: ${errorData.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('tripme_token') || localStorage.getItem('adminToken');
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/${couponId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchCoupons();
      } else {
        const errorData = await response.json();
        console.error('Failed to toggle coupon status:', errorData);
        alert(`Failed to toggle status: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      alert('Network error. Please try again.');
    }
  };

  const deleteCoupon = async (couponId: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const token = localStorage.getItem('tripme_token') || localStorage.getItem('adminToken');
        if (!token) {
          alert('No authentication token found. Please log in again.');
          return;
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/${couponId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchCoupons();
        } else {
          const errorData = await response.json();
          console.error('Failed to delete coupon:', errorData);
          alert(`Failed to delete coupon: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error deleting coupon:', error);
        alert('Network error. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date();
  };

  const debugToken = () => {
    const tripmeToken = localStorage.getItem('tripme_token');
    const adminToken = localStorage.getItem('adminToken');
    const token = tripmeToken || adminToken;
    
    if (!token) {
      alert('No token found in localStorage');
      return;
    }
    
    try {
      // Decode JWT token (without verification)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;
      
      alert('Token Debug Info:\n' +
        '- Token exists: Yes\n' +
        '- Token source: ' + (tripmeToken ? 'tripme_token' : 'adminToken') + '\n' +
        '- Token length: ' + token.length + '\n' +
        '- Expires at: ' + new Date(payload.exp * 1000).toLocaleString() + '\n' +
        '- Is expired: ' + (isExpired ? 'Yes' : 'No') + '\n' +
        '- Current time: ' + new Date(now * 1000).toLocaleString() + '\n' +
        '- User ID: ' + payload.id + '\n' +
        '- Role: ' + payload.role + '\n' +
        '- Time until expiry: ' + Math.floor((payload.exp - now) / 60) + ' minutes');
    } catch (error) {
      alert('Error decoding token: ' + error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Coupon Management
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Create and manage discount coupons for your platform
                </p>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Total: {coupons.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Active: {coupons.filter(c => c.isActive).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Used: {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Tag className="w-10 h-10 text-white" />
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
                    placeholder="Search coupons by code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900"
                >
                  <option value="all">All Coupons</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Coupon</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Coupons Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Validity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Tag className="w-5 h-5 text-purple-400 mr-3" />
                          <div>
                            <div className="text-slate-900 font-medium">{coupon.code}</div>
                            <div className="text-slate-500 text-sm">
                              Created {formatDate(coupon.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900">
                          <div className="flex items-center gap-2 mb-1">
                            {coupon.discountType === 'percentage' ? (
                              <span className="text-green-600 font-semibold text-lg">{coupon.amount}% OFF</span>
                            ) : (
                              <span className="text-green-600 font-semibold text-lg">₹{coupon.amount} OFF</span>
                            )}
                            <span className="text-slate-400 text-sm">({coupon.discountType})</span>
                          </div>
                          {coupon.discountType === 'percentage' && coupon.maxDiscount && (
                            <div className="text-slate-500 text-sm">
                              Max: ₹{coupon.maxDiscount}
                            </div>
                          )}
                          {coupon.minBookingAmount && (
                            <div className="text-slate-500 text-sm">
                              Min booking: ₹{coupon.minBookingAmount}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-sm">
                              {formatDate(coupon.validFrom)} to {formatDate(coupon.validTo)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isExpired(coupon.validTo) ? (
                              <span className="text-red-500 text-sm font-medium">Expired</span>
                            ) : (
                              <span className="text-green-500 text-sm font-medium">Active</span>
                            )}
                            <span className="text-slate-400 text-xs">
                              ({Math.ceil((new Date(coupon.validTo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900">
                          <div className="flex items-center mb-2">
                            <Users className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="font-medium">
                              {coupon.usedCount}
                              {coupon.usageLimit ? ` of ${coupon.usageLimit}` : ' (unlimited)'}
                            </span>
                          </div>
                          {coupon.usageLimit && (
                            <div className="space-y-1">
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-slate-500">
                                {Math.round((coupon.usedCount / coupon.usageLimit) * 100)}% used
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            {coupon.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </span>
                            )}
                          </div>
                          {isExpired(coupon.validTo) && (
                            <div className="text-xs text-red-500 font-medium">
                              Expired
                            </div>
                          )}
                          {coupon.usageLimit && coupon.usedCount >= coupon.usageLimit && (
                            <div className="text-xs text-orange-500 font-medium">
                              Fully Used
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              coupon.isActive 
                                ? 'text-red-500 hover:bg-red-50' 
                                : 'text-green-500 hover:bg-green-50'
                            }`}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {coupon.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteCoupon(coupon._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/80 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors shadow-lg border border-white/20"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/80 text-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors shadow-lg border border-white/20"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Create Coupon Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Create New Coupon</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Coupon Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="SAVE20"
                      className="w-full px-4 py-3 bg-white/80 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    >
                      <option value="percentage">Percentage (e.g., 20% OFF)</option>
                      <option value="fixed">Fixed Amount (e.g., ₹200 OFF)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder={formData.discountType === 'percentage' ? '20' : '500'}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Max Discount {formData.discountType === 'percentage' ? '(Required for %)' : '(Not needed for fixed amount)'}
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder={formData.discountType === 'percentage' ? '1000' : ''}
                      disabled={formData.discountType === 'fixed'}
                      className={`w-full px-4 py-3 bg-white/80 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 ${
                        formData.discountType === 'fixed' ? 'bg-slate-100 text-slate-500' : ''
                      }`}
                    />
                    {formData.discountType === 'percentage' && (
                      <p className="text-xs text-slate-500 mt-1">Maximum discount amount in ₹ (e.g., 20% off but max ₹1000)</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Min Booking Amount (Optional)</label>
                    <input
                      type="number"
                      value={formData.minBookingAmount}
                      onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                      placeholder="2000"
                      className="w-full px-4 py-3 bg-white/80 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Minimum booking amount required to use this coupon</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Usage Limit (Optional)</label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      placeholder="100"
                      className="w-full px-4 py-3 bg-white/80 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Maximum number of times this coupon can be used (leave empty for unlimited)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Valid From</label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Valid To</label>
                    <input
                      type="datetime-local"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      className="w-full px-4 py-3 bg-white/80 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-slate-700/50 border-slate-600/50 rounded focus:ring-purple-500/50"
                  />
                  <label htmlFor="isActive" className="text-sm text-slate-600">
                    Active by default
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg shadow-blue-500/25"
                  >
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
}
