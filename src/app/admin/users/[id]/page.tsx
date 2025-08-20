"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { 
  ArrowLeft,
  User,
  Calendar,
  CreditCard,
  Star,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Home,
  MessageSquare,
  Heart,
  FileText,
  Eye,
  EyeOff,
  Ban,
  UserCheck,
  UserX
} from 'lucide-react';

interface UserDetails {
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'guest' | 'host' | 'admin';
    accountStatus: 'active' | 'suspended' | 'pending';
    profileImage?: string;
    createdAt: string;
    lastLogin?: string;
    kyc?: {
      status: string;
      submittedAt?: string;
    };
  };
  properties: any[];
  bookings: any[];
  reviews: any[];
  payments: any[];
  kycDetails?: any;
  notifications: any[];
  wishlist: any[];
  statistics: {
    totalBookings: number;
    totalProperties: number;
    totalReviews: number;
    totalPayments: number;
    totalSpending: number;
    totalEarnings: number;
  };
  recentActivity: any[];
}

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getUserDetails(userId);
        
        if (response.success && response.data) {
          // Safely set user details with fallbacks
          const data = response.data;
          setUserDetails({
            user: data.user || {},
            properties: data.properties || [],
            bookings: data.bookings || [],
            reviews: data.reviews || [],
            payments: data.payments || [],
            kycDetails: data.kycDetails || null,
            notifications: data.notifications || [],
            wishlist: data.wishlist || [],
            statistics: {
              totalBookings: data.statistics?.totalBookings || 0,
              totalProperties: data.statistics?.totalProperties || 0,
              totalReviews: data.statistics?.totalReviews || 0,
              totalPayments: data.statistics?.totalPayments || 0,
              totalSpending: data.statistics?.totalSpending || 0,
              totalEarnings: data.statistics?.totalEarnings || 0
            },
            recentActivity: data.recentActivity || []
          });
        } else {
          console.error('Failed to fetch user details');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleSuspendAccount = async () => {
    try {
      const response = await apiClient.updateUserStatus(userId, 'suspended', suspendReason);
      if (response.success) {
        setUserDetails(prev => prev ? {
          ...prev,
          user: { ...prev.user, accountStatus: 'suspended' }
        } : null);
        setShowSuspendModal(false);
        setSuspendReason('');
      }
    } catch (error) {
      console.error('Error suspending account:', error);
    }
  };

  const handleActivateAccount = async () => {
    try {
      const response = await apiClient.updateUserStatus(userId, 'active');
      if (response.success) {
        setUserDetails(prev => prev ? {
          ...prev,
          user: { ...prev.user, accountStatus: 'active' }
        } : null);
      }
    } catch (error) {
      console.error('Error activating account:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>;
      case 'suspended':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Suspended
        </span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>;
      case 'host':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Home className="w-3 h-3 mr-1" />
          Host
        </span>;
      case 'guest':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <User className="w-3 h-3 mr-1" />
          Guest
        </span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!userDetails) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">User not found</h2>
          <p className="text-gray-500 mt-2">The user you're looking for doesn't exist.</p>
        </div>
      </AdminLayout>
    );
  }

  const { user, statistics, properties, bookings, reviews, payments, kycDetails, notifications, wishlist, recentActivity } = userDetails;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
              <p className="text-sm text-gray-500">Manage user account and view activity</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            {user?.accountStatus === 'active' ? (
              <button
                onClick={() => setShowSuspendModal(true)}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <Ban className="h-4 w-4 mr-2" />
                Suspend Account
              </button>
            ) : (
              <button
                onClick={handleActivateAccount}
                className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Activate Account
              </button>
            )}
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-purple-500 flex items-center justify-center">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user?.name || 'User'} className="h-20 w-20 rounded-full" />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'Unknown User'}</h2>
                {getRoleBadge(user?.role || 'guest')}
                {getStatusBadge(user?.accountStatus || 'pending')}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {user?.email || 'No email'}
                  </div>
                  {user?.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown date'}
                  </div>
                  {user?.lastLogin && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      Last login: {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {(statistics?.totalBookings || 0)} bookings
                  </div>
                  {user?.role === 'host' && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Home className="h-4 w-4 mr-2" />
                      {(statistics?.totalProperties || 0)} properties
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 mr-2" />
                    {(statistics?.totalReviews || 0)} reviews
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {user?.role === 'guest' ? 
                      `₹${(statistics?.totalSpending || 0).toLocaleString()} spent` :
                      `₹${(statistics?.totalEarnings || 0).toLocaleString()} earned`
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'bookings', label: 'Bookings', icon: Calendar },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'reviews', label: 'Reviews', icon: Star },
                ...(user?.role === 'host' ? [{ id: 'properties', label: 'Properties', icon: Home }] : []),
                { id: 'activity', label: 'Activity', icon: Clock }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Total Bookings</p>
                        <p className="text-2xl font-bold text-blue-900">{statistics?.totalBookings || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Star className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Total Reviews</p>
                        <p className="text-2xl font-bold text-green-900">{statistics?.totalReviews || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">
                          {user?.role === 'guest' ? 'Total Spent' : 'Total Earned'}
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          ₹{user?.role === 'guest' ? 
                            (statistics?.totalSpending || 0).toLocaleString() :
                            (statistics?.totalEarnings || 0).toLocaleString()
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {user?.role === 'host' && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Home className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">Total Properties</p>
                        <p className="text-2xl font-bold text-yellow-900">{statistics?.totalProperties || 0}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* KYC Status */}
                {user?.kyc && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">KYC Status</h3>
                    <div className="flex items-center space-x-2">
                      {user.kyc.status === 'verified' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : user.kyc.status === 'pending' ? (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {(user.kyc.status || 'unknown').charAt(0).toUpperCase() + (user.kyc.status || 'unknown').slice(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
                {(bookings || []).length > 0 ? (
                  <div className="space-y-4">
                    {(bookings || []).slice(0, 10).map((booking) => (
                      <div key={booking._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {booking.listing?.title || 'Unknown Property'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'Unknown date'} - {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'Unknown date'}
                            </p>
                            <p className="text-sm text-gray-500">Status: {booking.status || 'unknown'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">₹{booking.totalAmount || 0}</p>
                            <p className="text-sm text-gray-500">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No bookings found.</p>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
                {(payments || []).length > 0 ? (
                  <div className="space-y-4">
                    {(payments || []).slice(0, 10).map((payment) => (
                      <div key={payment._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">Payment #{payment.transactionId || 'Unknown'}</h4>
                            <p className="text-sm text-gray-500">Status: {payment.status || 'unknown'}</p>
                            <p className="text-sm text-gray-500">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">₹{payment.amount || 0}</p>
                            <p className="text-sm text-gray-500">{payment.paymentMethod || 'Unknown'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No payments found.</p>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Reviews</h3>
                {(reviews || []).length > 0 ? (
                  <div className="space-y-4">
                    {(reviews || []).slice(0, 10).map((review) => (
                      <div key={review._id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {review.reviewer?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{review.reviewer?.name || 'Anonymous'}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 mt-1">{review.comment || 'No comment'}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews found.</p>
                )}
              </div>
            )}

            {/* Properties Tab (Host only) */}
            {activeTab === 'properties' && user?.role === 'host' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Properties</h3>
                {(properties || []).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(properties || []).map((property) => (
                      <div key={property._id} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">{property.title || 'Untitled Property'}</h4>
                        <p className="text-sm text-gray-500">Status: {property.status || 'unknown'}</p>
                        <p className="text-sm text-gray-500">₹{property.pricing?.basePrice || 0}/night</p>
                        <p className="text-sm text-gray-500">
                          {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No properties found.</p>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                {(recentActivity || []).length > 0 ? (
                  <div className="space-y-4">
                    {(recentActivity || []).map((activity, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {activity.type === 'booking' && <Calendar className="h-5 w-5 text-blue-600" />}
                            {activity.type === 'review' && <Star className="h-5 w-5 text-yellow-600" />}
                            {activity.type === 'payment' && <CreditCard className="h-5 w-5 text-green-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.type === 'booking' && 'Made a booking'}
                              {activity.type === 'review' && 'Left a review'}
                              {activity.type === 'payment' && 'Made a payment'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.date ? new Date(activity.date).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent activity.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Suspend Account Modal */}
        {showSuspendModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Suspend Account</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to suspend this user's account? They will not be able to access the platform.
                </p>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="Reason for suspension (optional)"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                />
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => setShowSuspendModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSuspendAccount}
                    className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                  >
                    Suspend Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 