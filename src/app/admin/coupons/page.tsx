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
        setTotalPages(Math.ceil(data.data.total / 10));
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
      
      alert(`Token Debug Info:
- Token exists: Yes
- Token source: ${tripmeToken ? 'tripme_token' : 'adminToken'}
- Token length: ${token.length}
- Expires at: ${new Date(payload.exp * 1000).toLocaleString()}
- Is expired: ${isExpired ? 'Yes' : 'No'}
- Current time: ${new Date(now * 1000).toLocaleString()}
- User ID: ${payload.id}
- Role: ${payload.role}
- Time until expiry: ${Math.floor((payload.exp - now) / 60)} minutes`);
    } catch (error) {
      alert(`Error decoding token: ${error.message}`);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Coupon Management</h1>
            <p className="text-slate-400">Create and manage discount coupons for your platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={debugToken}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              title="Debug token information"
            >
              Debug Token
            </button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-200 rounded-xl shadow-lg shadow-purple-500/25"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Coupon
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search coupons by code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">All Coupons</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Validity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Tag className="w-5 h-5 text-purple-400 mr-3" />
                          <div>
                            <div className="text-white font-medium">{coupon.code}</div>
                            <div className="text-slate-400 text-sm">
                              Created {formatDate(coupon.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">
                          {coupon.discountType === 'percentage' ? (
                            <span className="text-green-400 font-medium">{coupon.amount}% OFF</span>
                          ) : (
                            <span className="text-green-400 font-medium">₹{coupon.amount} OFF</span>
                          )}
                        </div>
                        {coupon.maxDiscount && (
                          <div className="text-slate-400 text-sm">
                            Max: ₹{coupon.maxDiscount}
                          </div>
                        )}
                        {coupon.minBookingAmount && (
                          <div className="text-slate-400 text-sm">
                            Min: ₹{coupon.minBookingAmount}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                            {formatDate(coupon.validFrom)} - {formatDate(coupon.validTo)}
                          </div>
                          {isExpired(coupon.validTo) && (
                            <span className="text-red-400 text-sm">Expired</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">
                          <div className="flex items-center mb-1">
                            <Users className="w-4 h-4 text-slate-400 mr-2" />
                            {coupon.usedCount}
                            {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                          </div>
                          {coupon.usageLimit && (
                            <div className="w-full bg-slate-600 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              coupon.isActive 
                                ? 'text-red-400 hover:bg-red-400/10' 
                                : 'text-green-400 hover:bg-green-400/10'
                            }`}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {coupon.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => deleteCoupon(coupon._id)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
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
                className="px-4 py-2 bg-slate-700/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-700/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600/50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Create Coupon Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Coupon</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Coupon Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="SAVE20"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {formData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder={formData.discountType === 'percentage' ? '20' : '500'}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Discount (Optional)</label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="1000"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Min Booking Amount (Optional)</label>
                    <input
                      type="number"
                      value={formData.minBookingAmount}
                      onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                      placeholder="2000"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Usage Limit (Optional)</label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      placeholder="100"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Valid From</label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Valid To</label>
                    <input
                      type="datetime-local"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                  <label htmlFor="isActive" className="text-sm text-slate-300">
                    Active by default
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-slate-600/50 text-white rounded-xl hover:bg-slate-500/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-purple-500/25"
                  >
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
