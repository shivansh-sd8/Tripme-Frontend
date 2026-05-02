"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Edit,
  Shield,
  Bell,
  Lock,
  CreditCard,
  Heart,
  Calendar,
  MapPin,
  Star,
  Settings,
  LogOut,
  Plus,
  Home,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { apiClient } from '@/lib/api';
import { apiClient as infraApiClient } from '@/infrastructure/api/clients/api-client';

const ProfileContent: React.FC = () => {
  const { user, logout, updateUser, refreshUser } = useAuth();
  const router = useRouter();

  // Debug logging to check user KYC status
  React.useEffect(() => {
    if (user) {
      console.log('🔍 User KYC Debug:', {
        user: user,
        kyc: user.kyc,
        kycStatus: user.kyc?.status,
        isVerified: user.isVerified
      });
    }
  }, [user]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Email verification banner state
  const [verifBannerDismissed, setVerifBannerDismissed] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<any[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsBookingsLoading(true);
      const response = await apiClient.getBookings();
      setBookings(response.data?.bookings || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendLoading(true);
    setResendError(null);
    setResendSuccess(false);
    try {
      const res = await infraApiClient.resendVerificationEmail(user.email);
      if (res.success) {
        setResendSuccess(true);
      } else {
        setResendError(res.message || 'Failed to resend email. Try again.');
      }
    } catch (err: any) {
      setResendError(err.message || 'Failed to resend email. Try again.');
    } finally {
      setResendLoading(false);
    }
  };
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: (user as any)?.bio || '',
    location: (user as any)?.location?.address || '',
    city: (user as any)?.location?.city || '',
    state: (user as any)?.location?.state || '',
    country: (user as any)?.location?.country || '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: (user as any)?.bio || '',
        location: (user as any)?.location?.address || '',
        city: (user as any)?.location?.city || '',
        state: (user as any)?.location?.state || '',
        country: (user as any)?.location?.country || '',
      });
    }
  }, [user]);

  // Refresh user data when component mounts to ensure we have the latest role
  useEffect(() => {
    if (user) {
      // Only refresh once when component mounts
      const shouldRefresh = user.role === 'guest';
      if (shouldRefresh) {
        refreshUser();
      }
    }
  }, []); // Empty dependency array - only run once on mount

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Only include fields that have values
      const updateData: any = {};

      if (formData.name.trim()) updateData.name = formData.name.trim();
      if (formData.phone.trim()) updateData.phone = formData.phone.trim();
      if (formData.bio.trim()) updateData.bio = formData.bio.trim();

      // Only include location if at least one field has a value
      const locationFields = [formData.location, formData.city, formData.state, formData.country];
      if (locationFields.some(field => field.trim())) {
        updateData.location = {
          type: 'Point',
          coordinates: [0, 0], // Default coordinates
          address: formData.location.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          country: formData.country.trim() || undefined,
        };
      }

      // Only proceed if there's data to update
      if (Object.keys(updateData).length === 0) {
        setError('Please fill in at least one field to update');
        return;
      }

      const response = await apiClient.updateProfile(updateData);

      if (response.success && response.data?.user) {
        updateUser(response.data.user);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');

      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: (user as any)?.bio || '',
        location: (user as any)?.location?.address || '',
        city: (user as any)?.location?.city || '',
        state: (user as any)?.location?.state || '',
        country: (user as any)?.location?.country || '',
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('tripme_token');

      if (!token) {
        throw new Error('No authentication token found. Please sign in again.');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update profile with new image URL
        const updateResponse = await apiClient.updateProfile({ profileImage: data.data.url });
        if (updateResponse.success) {
          setProfileImage(data.data.url);
          setSuccess('Profile image updated successfully!');
          // Update user context
          updateUser({ ...user, profileImage: data.data.url });
        } else {
          throw new Error('Failed to update profile with new image');
        }
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(`Failed to upload image: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'kyc', label: 'Identity Verification', icon: Shield },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your profile details</p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-blue-50 text-[#4285f4] hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {/* Success/Error Messages */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-medium">
                  {success}
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  leftIcon={<User size={20} />}
                  disabled={!isEditing}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  leftIcon={<Mail size={20} />}
                  disabled={true}
                  helperText={user.isVerified ? 'Email verified' : 'Email not verified'}
                  className={user.isVerified ? 'bg-green-50/50' : 'bg-amber-50/50'}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  leftIcon={<Phone size={20} />}
                  disabled={!isEditing}
                />
                <Input
                  label="Address"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  leftIcon={<MapPin size={20} />}
                  disabled={!isEditing}
                  placeholder="Enter your address"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    disabled={!isEditing}
                  />
                  <Input
                    label="State"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <Input
                  label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  leftIcon={<MapPin size={20} />}
                  disabled={!isEditing}
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:text-gray-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {isEditing && (
                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none bg-[#4285F4] hover:bg-blue-600 text-white rounded-2xl"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none rounded-2xl"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 text-center">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar size={20} />
                </div>
                <div className="text-xl font-bold text-gray-900">12</div>
                <div className="text-xs text-gray-500 font-medium">Total Bookings</div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 text-center">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star size={20} />
                </div>
                <div className="text-xl font-bold text-gray-900">4.8</div>
                <div className="text-xs text-gray-500 font-medium">Avg Rating</div>
              </div>
            </div>
          </div>
        );

      case 'kyc':
        return (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Identity Verification</h3>
              <p className="text-sm text-gray-500 mt-1">Complete your KYC to become a host</p>
            </div>

            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-[#4285F4] rounded-full flex items-center justify-center">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Verification Status</h4>
                    <p className="text-xs text-gray-500">Current identity verification status</p>
                  </div>
                </div>
                <div className="flex">
                  {user.kyc?.status === 'verified' ? (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
                      <CheckCircle size={14} /> Verified
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-4 py-2 rounded-full">
                      {user.kyc?.status || 'Not Verified'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {user.kyc?.status === 'verified' ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={40} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Verified! 🎉</h4>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Your identity is confirmed. You can now manage your properties and bookings as a host.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => router.push('/become-host')} className="bg-[#4285F4] text-white rounded-2xl px-8">Become a Host</Button>
                  <Button variant="outline" onClick={() => router.push('/host/dashboard')} className="rounded-2xl px-8">Host Dashboard</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-blue-50 text-[#4285F4] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={40} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Verify Your Identity</h4>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Submit your identity documents to unlock hosting features and build trust.
                </p>
                <Button onClick={() => router.push('/user/kyc')} className="bg-[#4285F4] text-white rounded-2xl px-8 w-full sm:w-auto">
                  Submit KYC Documents
                </Button>
              </div>
            )}
          </div>
        );

      case 'security':
        return (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Security Settings</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your account security and authentication</p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Change Password', desc: 'Update your account password', icon: Lock, action: 'Change' },
                { title: 'Two-Factor Auth', desc: 'Add extra layer of security', icon: Shield, action: 'Enable' },
                { title: 'Payment Methods', desc: 'Manage your payment options', icon: CreditCard, action: 'Manage' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 border border-gray-100 rounded-3xl hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 text-gray-400 group-hover:text-[#4285F4] group-hover:bg-blue-50 rounded-2xl flex items-center justify-center transition-all">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <button className="text-[#4285F4] text-sm font-bold px-4 py-2 hover:bg-blue-50 rounded-xl transition-all">
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500 mt-1">Choose how you want to be notified</p>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Booking Updates', desc: 'Status of your requests and payments' },
                { title: 'New Messages', desc: 'Chat alerts from hosts and support' },
                { title: 'Price Alerts', desc: 'When items in your wishlist drop in price' },
                { title: 'Promotional', desc: 'Special offers and travel tips' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 border border-gray-100 rounded-3xl">
                  <div>
                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4285F4]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">My Bookings</h3>
              <p className="text-sm text-gray-500 mt-1">View and manage your reservations</p>
            </div>

            {isBookingsLoading ? (
              <div className="py-12 flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-[#4285F4] rounded-full animate-spin mb-4" />
                <p className="text-sm text-gray-500">Loading your trips...</p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const isService = booking.bookingType === 'service';
                  const title = isService ? booking.service?.title : booking.propertyId?.title;
                  const image = isService ? booking.service?.media?.[0]?.url : booking.propertyId?.images?.[0];
                  
                  return (
                    <div 
                      key={booking._id} 
                      onClick={() => router.push(`/bookings/${booking._id}`)}
                      className="group flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={image || '/logo.png'} 
                          alt={title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 truncate">{title || 'Tripme Booking'}</h4>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                          <Calendar size={12} />
                          <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="text-sm font-bold text-[#4285F4]">
                            {formatPrice(booking.totalAmount)}
                          </div>
                          <div className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                            ID: {booking._id.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                  <Calendar size={40} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">No bookings yet</h4>
                <p className="text-sm text-gray-500 mb-8">Start exploring beautiful places in Bharat</p>
                <Button onClick={() => router.push('/search')} className="bg-[#4285F4] text-white rounded-2xl px-8">
                  Explore Rooms
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Email Verification Banner */}
        {!user.isVerified && !verifBannerDismissed && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-md">
            <div className="flex items-start gap-4 p-4 sm:p-5">
              <div className="mt-0.5 flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-amber-900 text-sm sm:text-base">
                  Please verify your email address
                </h4>
                <p className="text-amber-700 text-xs sm:text-sm mt-0.5">
                  We sent a verification link to{' '}
                  <span className="font-medium">{user.email}</span>. Check your inbox and click the link to unlock all features.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {resendSuccess ? (
                    <span className="inline-flex items-center gap-1.5 text-green-700 text-xs font-medium bg-green-100 px-3 py-1.5 rounded-full">
                      <CheckCircle size={14} />
                      Verification email sent!
                    </span>
                  ) : (
                    <button
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 shadow-sm"
                    >
                      <RefreshCw size={13} className={resendLoading ? 'animate-spin' : ''} />
                      {resendLoading ? 'Sending...' : 'Resend verification email'}
                    </button>
                  )}
                  {resendError && (
                    <span className="text-red-600 text-xs font-medium">{resendError}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setVerifBannerDismissed(true)}
                className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
                aria-label="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Profile Layout */}
        <div className="block sm:hidden w-full pb-24">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col items-center mb-6 animate-fade-in relative overflow-hidden">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-[#4285F4] to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-xl ring-4 ring-blue-50">
                {profileImage ? (
                  <img src={profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name?.[0]?.toUpperCase() || <User size={32} />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 bg-white text-[#4285F4] p-2.5 rounded-full shadow-lg border border-blue-50 cursor-pointer">
                {isUploadingImage ? (
                  <div className="w-4 h-4 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera size={16} />
                )}
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{user.email}</p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {user.role === 'host' && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Host</span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.kyc?.status === 'verified' ? 'bg-blue-100 text-[#4285F4]' : 'bg-gray-100 text-gray-500'}`}>
                  {user.kyc?.status === 'verified' ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar mb-6 -mx-4 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-[#4285F4] text-white shadow-lg shadow-blue-100' 
                      : 'bg-white text-gray-600 border border-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-bold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Shared Tab Content for Mobile */}
          <div className="animate-fade-in">
            {renderTabContent()}
          </div>

          {/* Mobile Specific Bottom Actions */}
          <div className="mt-8 space-y-4">
            {user.role === 'host' ? (
              <button
                onClick={() => router.push('/host/dashboard')}
                className="w-full bg-green-500 text-white p-5 rounded-3xl flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Home size={20} /></div>
                  <div className="text-left">
                    <div className="font-bold">Host Dashboard</div>
                    <div className="text-xs text-green-100">Manage your properties</div>
                  </div>
                </div>
                <Plus className="rotate-45" size={20} />
              </button>
            ) : (
              <button
                onClick={() => router.push('/become-host')}
                className="w-full bg-[#4285F4] text-white p-5 rounded-3xl flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"><Plus size={20} /></div>
                  <div className="text-left">
                    <div className="font-bold">Become a Host</div>
                    <div className="text-xs text-blue-100">Start earning today</div>
                  </div>
                </div>
                <Plus className="rotate-45" size={20} />
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              className="w-full py-4 text-red-500 font-bold flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
      {/* Desktop view (unchanged) */}
      <div className="hidden sm:block">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-cyan-400/10 rounded-full translate-y-12 -translate-x-12"></div>

              {/* Profile Summary */}
              <div className="text-center mb-8 relative z-10">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl overflow-hidden ring-4 ring-white/50">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={36} className="text-white" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-white text-purple-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 cursor-pointer ring-2 ring-purple-100">
                    {isUploadingImage ? (
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera size={18} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
                <p className="text-gray-600 text-base mb-4">{user.email}</p>

                {/* Badges Row */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                  {/* Host Role Badge */}
                  {user.role === 'host' && (
                    <span className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Host
                    </span>
                  )}

                  {/* Identity Verification Badge */}
                  {user.kyc?.status === 'verified' ? (
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full border border-green-200 shadow-sm">
                      <Shield size={14} />
                      Identity Verified
                    </span>
                  ) : user.kyc?.status === 'pending' ? (
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full border border-yellow-200 shadow-sm">
                      <Shield size={14} />
                      Verification Pending
                    </span>
                  ) : user.kyc?.status === 'rejected' ? (
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-rose-100 text-red-800 text-sm font-semibold px-4 py-2 rounded-full border border-red-200 shadow-sm">
                      <Shield size={14} />
                      Verification Rejected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 text-sm font-semibold px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                      <Shield size={14} />
                      Not Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 group ${activeTab === tab.id
                          ? 'bg-[#4285F4] hover:bg-[#3367D6] text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700 hover:shadow-md hover:scale-105'
                        }`}
                    >
                      <div className={`p-2 rounded-xl transition-all duration-300 ${activeTab === tab.id
                          ? 'bg-white/20'
                          : 'bg-gray-100 group-hover:bg-purple-100'
                        }`}>
                        <Icon size={20} className="flex-shrink-0" />
                      </div>
                      <span className="font-semibold text-base">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Actions */}
              {user.role === 'host' && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                      onClick={() => router.push('/host/dashboard')}
                    >
                      <Home size={16} className="mr-2" />
                      Host Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-gray-700 hover:text-purple-700 hover:bg-purple-50"
                      onClick={() => router.push('/host/property/new')}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Property
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Desktop Content Area */}
          <div className="lg:col-span-3">
            <div className="animate-fade-in">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent; 