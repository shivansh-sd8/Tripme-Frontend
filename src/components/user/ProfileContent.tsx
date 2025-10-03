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
  StretchHorizontalIcon
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { apiClient } from '@/lib/api';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-2 py-2 sm:px-4 sm:py-4">
        {/* Mobile Profile Layout */}
        <div className="block sm:hidden w-full min-h-screen pb-24 overflow-x-hidden">
        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col items-center mb-8 animate-fade-in relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 overflow-hidden shadow-xl ring-4 ring-white/50">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name?.[0]?.toUpperCase() || <User size={32} />
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
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{user.name}</div>
              <div className="text-gray-600 text-lg mb-3 capitalize flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
                {user.role || 'Guest'}
              </div>
              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                {/* Host Role Badge */}
                {user.role === 'host' && (
                  <span className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Host
                  </span>
                )}
                
                {/* Identity Verification Status */}
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
          </div>
        </div>
        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 flex flex-col items-center relative group hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">NEW</span>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🧳</span>
            </div>
            <span className="font-semibold text-gray-900 text-center">Past Trips</span>
            <span className="text-xs text-gray-500 mt-1">View your travel history</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 flex flex-col items-center relative group hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">NEW</span>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🧑‍🤝‍🧑</span>
            </div>
            <span className="font-semibold text-gray-900 text-center">Connections</span>
            <span className="text-xs text-gray-500 mt-1">Manage your network</span>
          </div>
        </div>
        {/* Become a Host Card */}
        {user?.role === 'host' ? (
          <button 
            onClick={() => router.push('/host/dashboard')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl p-6 flex items-center gap-4 mb-6 w-full text-left hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🏡</span>
            </div>
            <div>
              <div className="font-bold text-lg">Host Dashboard</div>
              <div className="text-green-100 text-sm">Manage your properties and bookings</div>
            </div>
          </button>
        ) : (
          <button 
            onClick={() => router.push('/user/kyc')}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl shadow-xl p-6 flex items-center gap-4 mb-6 w-full text-left hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🏡</span>
            </div>
            <div>
              <div className="font-bold text-lg">Become a Host</div>
              <div className="text-purple-100 text-sm">Start earning by hosting your space</div>
            </div>
          </button>
        )}
        {/* Settings/Actions List */}
        <div className="bg-white rounded-2xl shadow-md divide-y divide-gray-100 mb-20">
          <button className="w-full flex items-center gap-3 px-5 py-4 text-gray-800 font-medium text-base hover:bg-gray-50 transition-all">
            <Settings size={20} className="text-indigo-400" />
            Account settings
          </button>
          <button className="w-full flex items-center gap-3 px-5 py-4 text-gray-800 font-medium text-base hover:bg-gray-50 transition-all">
            <User size={20} className="text-indigo-400" />
            View profile
          </button>
          <button className="w-full flex items-center gap-3 px-5 py-4 text-gray-800 font-medium text-base hover:bg-gray-50 transition-all">
            <Lock size={20} className="text-indigo-400" />
            Privacy
          </button>
          <button className="w-full flex items-center gap-3 px-5 py-4 text-gray-800 font-medium text-base hover:bg-gray-50 transition-all">
            <Shield size={20} className="text-indigo-400" />
            Get help
          </button>
        </div>
        {/* Floating Switch to Hosting Button (if host) */}
        {user.role === 'host' && (
          <button className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2 rounded-xl shadow-xl text-base font-semibold flex items-center gap-2 animate-fade-in z-50 max-w-xs w-full border border-white/80 justify-center text-center">
            <span className="inline-block rotate-90"><StretchHorizontalIcon /></span>
            Switch to hosting
          </button>
        )}
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
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 group ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700 hover:shadow-md hover:scale-105'
                      }`}
                    >
                      <div className={`p-2 rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
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

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-400/5 to-pink-400/5 rounded-full translate-y-16 -translate-x-16"></div>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">Personal Information</h3>
                      <p className="text-gray-600 mt-1">Update your profile details</p>
                    </div>
              <Button
                variant={isEditing ? "outline" : "ghost"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {isEditing ? (
                  <>
                    <Edit size={16} className="mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit size={16} className="mr-2" />
                          Edit Profile
                  </>
                )}
              </Button>
            </div>

                  {/* Success/Error Messages */}
                  {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-800 font-medium">{success}</p>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-800 font-medium">{error}</p>
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
                      helperText="Email cannot be changed"
                      className="bg-gray-50"
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

                    <Input
                      label="City"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      leftIcon={<MapPin size={20} />}
                      disabled={!isEditing}
                      placeholder="Enter your city"
                    />

                    <Input
                      label="State/Province"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      leftIcon={<MapPin size={20} />}
                      disabled={!isEditing}
                      placeholder="Enter your state or province"
                    />

                    <Input
                      label="Country"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      leftIcon={<MapPin size={20} />}
                      disabled={!isEditing}
                      placeholder="Enter your country"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

              {isEditing && (
                    <div className="flex gap-3 mt-6">
                      <Button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                          </>
                        )}
                  </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                    Cancel
                  </Button>
                </div>
              )}
                </Card>

                {/* Account Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="text-center p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar size={24} className="text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">12</h4>
                    <p className="text-gray-600">Total Bookings</p>
                  </Card>

                  <Card className="text-center p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star size={24} className="text-white" />
            </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">4.8</h4>
                    <p className="text-gray-600">Average Rating</p>
          </Card>


                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Security Settings</h3>
                  <p className="text-gray-600 mt-1">Manage your account security</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Lock size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Change Password</h4>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <Shield size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                  </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <CreditCard size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Payment Methods</h4>
                        <p className="text-sm text-gray-600">Manage your payment options</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                  </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Notification Preferences</h3>
                  <p className="text-gray-600 mt-1">Choose what notifications you receive</p>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Booking Updates', desc: 'Get notified about booking confirmations and changes' },
                    { title: 'New Messages', desc: 'Receive notifications for new messages from hosts' },
                    { title: 'Price Drops', desc: 'Get alerts when prices drop for your favorite items' },
                    { title: 'Travel Recommendations', desc: 'Receive personalized travel suggestions' },
                    { title: 'Promotional Offers', desc: 'Get notified about special deals and promotions' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={index < 3} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* KYC Tab */}
            {activeTab === 'kyc' && (
              <Card>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">Identity Verification</h3>
                  <p className="text-gray-600 mt-1">Complete your KYC to become a host</p>
                </div>

                {/* KYC Status Display */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <Shield size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Verification Status</h4>
                        <p className="text-sm text-gray-600">Current identity verification status</p>
                      </div>
                    </div>
                    <div>
                      {user.kyc?.status === 'verified' ? (
                        <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-full">
                          <Shield size={16} />
                          Identity Verified
                        </span>
                      ) : user.kyc?.status === 'pending' ? (
                        <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-sm font-medium px-4 py-2 rounded-full">
                          <Shield size={16} />
                          Verification Pending
                        </span>
                      ) : user.kyc?.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-2 bg-red-100 text-red-800 text-sm font-medium px-4 py-2 rounded-full">
                          <Shield size={16} />
                          Verification Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 text-sm font-medium px-4 py-2 rounded-full">
                          <Shield size={16} />
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {user.kyc?.status === 'verified' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield size={32} className="text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Identity Verified! 🎉</h4>
                    <p className="text-gray-600 mb-6">
                      Your identity has been successfully verified. You can now become a host and start earning!
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={() => router.push('/become-host')}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        Become a Host
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => router.push('/host/dashboard')}
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        Host Dashboard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield size={32} className="text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Identity</h4>
                    <p className="text-gray-600 mb-6">
                      Submit your identity verification documents to become a host and start earning
                    </p>
                    <Button 
                      onClick={() => router.push('/user/kyc')}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      Submit KYC Documents
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <Card>
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900">My Bookings</h3>
                  <p className="text-gray-600 mt-1">View and manage your travel bookings</p>
                </div>

                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={32} className="text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h4>
                  <p className="text-gray-600 mb-6">Start exploring amazing destinations and book your next adventure!</p>
                  <Button 
                    onClick={() => router.push('/trips')}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Explore Destinations
                  </Button>
                </div>
              </Card>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent; 