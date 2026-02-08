"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import { 
  Home, 
  Briefcase, 
  Calendar, 
  Plus,
  Eye,
  RefreshCw, 
  CheckCircle, 
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  MapPin,
  Activity,
  Award,
  Target,
  ChevronDown
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { apiClient } from '@/infrastructure/api/clients/api-client';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalEarnings: number;
  recentBookings: RecentBooking[];
  occupancyRate?: number;
  currentBookings?: number;
}

interface RecentBooking {
  _id: string;
  user: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  listing?: {
    _id: string;
    title: string;
    images?: string[];
  };
  service?: {
    _id: string;
    title: string;
    media?: string[];
  };
  checkIn?: Date;
  checkOut?: Date;
  timeSlot?: {
    startTime: Date;
    endTime: Date;
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  totalAmount: number;
  createdAt: Date;
}

const HostDashboardContent: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    recentBookings: [],
    occupancyRate: 0,
    currentBookings: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
      
      // Fetch dashboard stats
        const response = await apiClient.getDashboardStats();
      
      if (response.success && response.data) {
        // Handle different response structures
        let dashboardData: any = response.data;
        
        // If the response has a nested stats object
        if (response.data && typeof response.data === 'object' && 'stats' in response.data) {
          dashboardData = response.data.stats;
        }
        
        // Ensure all required fields exist with defaults
        const processedStats: DashboardStats = {
          totalListings: dashboardData?.totalListings || 0,
          activeListings: dashboardData?.activeListings || 0,
          totalServices: dashboardData?.totalServices || 0,
          activeServices: dashboardData?.activeServices || 0,
          totalBookings: dashboardData?.totalBookings || 0,
          pendingBookings: dashboardData?.pendingBookings || 0,
          completedBookings: dashboardData?.completedBookings || 0,
          totalEarnings: dashboardData?.totalEarnings || 0,
          recentBookings: dashboardData?.recentBookings || [],
          occupancyRate: dashboardData?.occupancyRate || 0,
          currentBookings: dashboardData?.currentBookings || 0
        };
        
        setStats(processedStats);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
        setError(err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate occupancy rate properly
  const calculateOccupancyRate = () => {
    // Use the occupancy rate from backend if available, otherwise calculate based on current bookings
    if (stats.occupancyRate !== undefined) {
      return stats.occupancyRate;
    }
    
    // Fallback calculation
    if (stats.activeListings === 0) return 0;
    return Math.round((stats.currentBookings || 0) / stats.activeListings * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading your dashboard</h2>
            <p className="text-gray-600">Gathering your latest insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl p-8 max-w-md mx-auto shadow-xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is a host
  if (user?.role !== 'host') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl p-8 max-w-md mx-auto shadow-xl">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Become a Host</h3>
              <p className="text-gray-600 mb-6">Start earning by hosting guests and offering services</p>
              <Button onClick={() => router.push('/become-host')} className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Get Started
            </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const occupancyRate = calculateOccupancyRate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
    <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
        <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-display">
                    {getGreeting()}, {user?.name?.split(' ')[0]}!
                  </h1>
                  <p className="text-gray-600 font-body">Here's your business overview for today</p>
                </div>
              </div>
        </div>
            
            <div className="flex items-center gap-3">
              {/* Quick Navigation Dropdown */}
              <div className="relative group">
        <Button 
          variant="outline" 
                  className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <span>Quick Links</span>
                  <ChevronDown className="w-4 h-4 text-purple-600 transition-transform duration-300 group-hover:rotate-180" />
                </Button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-sm border border-purple-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Quick Navigation</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="ghost"
                        onClick={() => router.push('/host/bookings')}
                        className="group h-12 bg-white/60 hover:bg-white hover:shadow-md text-gray-700 font-medium rounded-lg transition-all duration-200 hover:scale-105 border border-purple-100 hover:border-purple-200"
        >
                        <div className="flex flex-col items-center gap-1">
                          <Calendar className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-xs font-semibold">Bookings</span>
                        </div>
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => router.push('/host/listings')}
                        className="group h-12 bg-white/60 hover:bg-white hover:shadow-md text-gray-700 font-medium rounded-lg transition-all duration-200 hover:scale-105 border border-purple-100 hover:border-purple-200"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Home className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-xs font-semibold">Listings</span>
                        </div>
        </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => router.push('/host/service')}
                        className="group h-12 bg-white/60 hover:bg-white hover:shadow-md text-gray-700 font-medium rounded-lg transition-all duration-200 hover:scale-105 border border-purple-100 hover:border-purple-200"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Briefcase className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-xs font-semibold">Services</span>
                        </div>
          </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => router.push('/user/profile')}
                        className="group h-12 bg-white/60 hover:bg-white hover:shadow-md text-gray-700 font-medium rounded-lg transition-all duration-200 hover:scale-105 border border-purple-100 hover:border-purple-200"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Users className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                          <span className="text-xs font-semibold">Profile</span>
                        </div>
          </Button>
                    </div>
                  </div>
        </div>
      </div>

              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                {refreshing ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Listings */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="flex items-center justify-between">
              <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalListings}</p>
                <div className="flex items-center text-sm text-emerald-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>{stats.activeListings} active</span>
                </div>
            </div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <Home className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>

          {/* Total Services */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="flex items-center justify-between">
              <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalServices}</p>
                <div className="flex items-center text-sm text-emerald-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span>{stats.activeServices} active</span>
                </div>
            </div>
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>

          {/* Total Bookings */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="flex items-center justify-between">
              <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                <div className="flex items-center text-sm text-amber-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{stats.pendingBookings} pending</span>
                </div>
            </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>

          {/* Total Earnings */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="flex items-center justify-between">
              <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(stats.totalEarnings)}</p>
                <div className="flex items-center text-sm text-emerald-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>This month</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <IndianRupee className="w-8 h-8 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-purple-200/50 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 font-heading">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </div>
              Quick Actions
            </h2>
            
            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Button 
                onClick={() => router.push('/host/property/new/onboarding/step-1')}
                className="group h-20 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-2xl transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 shadow-xl overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">Add Property</div>
                    <div className="text-xs opacity-90">Create new listing</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={() => router.push('/host/service/new')}
                className="group h-20 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium rounded-2xl transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 shadow-xl overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg">Add Service</div>
                    <div className="text-xs opacity-90">Offer new service</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => router.push('/host/listings')}
                className="group h-20 bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-300 hover:bg-white hover:shadow-2xl text-gray-700 font-medium rounded-2xl transition-all duration-500 hover:scale-105 shadow-xl"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Home className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-md md:text-lg">Manage Listings</div>
                    <div className="text-xs opacity-70">View & edit properties</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => router.push('/host/service')}
                className="group h-20 bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-300 hover:bg-white hover:shadow-2xl text-gray-700 font-medium rounded-2xl transition-all duration-500 hover:scale-105 shadow-xl"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Briefcase className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-md md:text-lg">Manage Services</div>
                    <div className="text-xs opacity-70">View & edit services</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
      </div>

        {/* Recent Activity & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 font-heading">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-white" />
                  </div>
                  Recent Bookings
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/host/bookings')}
                  className="text-sm border-purple-200 hover:bg-purple-50 hover:scale-105 transition-all duration-300"
                >
                View All
              </Button>
            </div>

              {stats.recentBookings.length > 0 ? (
            <div className="space-y-4">
                  {stats.recentBookings.slice(0, 5).map((booking, index) => (
                    <div 
                      key={booking._id} 
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 rounded-xl hover:from-purple-100/50 hover:to-indigo-100/50 transition-all duration-300 border border-purple-100/50 hover:border-purple-200/50 hover:scale-[1.02]"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {booking.user?.name || booking.user?.fullName || 'Guest'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {booking.listing?.title || booking.service?.title}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {formatDate(new Date(booking.createdAt))}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {formatPrice(booking.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent bookings</p>
                  <p className="text-sm text-gray-500">Bookings will appear here once guests start booking</p>
                </div>
              )}
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-6">
            {/* Occupancy Rate */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Occupancy Rate</h3>
                <Activity className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {occupancyRate}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {stats.currentBookings || 0} of {stats.activeListings} properties booked
                </p>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"></div>
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Home className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-600">Current Bookings</span>
                  </div>
                  <span className="font-semibold text-gray-800">{stats.currentBookings || 0}</span>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm text-gray-600">Active Services</span>
                  </div>
                  <span className="font-semibold text-gray-800">{stats.activeServices}</span>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm text-gray-600">Pending Bookings</span>
                  </div>
                  <span className="font-semibold text-gray-800">{stats.pendingBookings}</span>
            </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
        </div>
                    <span className="text-sm text-gray-600">Monthly Earnings</span>
              </div>
                  <span className="font-semibold text-gray-800">{formatPrice(stats.totalEarnings)}</span>
              </div>
            </div>
          </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboardContent; 