"use client";
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/core/store/auth-context';
import { apiClient } from '@/lib/api';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  Home,
  BookOpen,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

export default function AdminAnalytics() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({
    revenue: { total: 0, growth: 0 },
    users: { total: 0, growth: 0 },
    bookings: { total: 0, growth: 0 },
    properties: { total: 0, growth: 0 },
    monthlyRevenue: [],
    topDestinations: [],
    userGrowth: [],
    bookingTrends: []
  });

  useEffect(() => {
    if (isAdmin) {
      fetchAnalyticsData();
    }
  }, [isAdmin, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/analytics?timeRange=${timeRange}`);
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Detailed insights and performance metrics for TripMe platform
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{analyticsData.revenue.total.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {analyticsData.revenue.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${analyticsData.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.revenue.growth >= 0 ? '+' : ''}{analyticsData.revenue.growth}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.users.total.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {analyticsData.users.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${analyticsData.users.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.users.growth >= 0 ? '+' : ''}{analyticsData.users.growth}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.bookings.total.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {analyticsData.bookings.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${analyticsData.bookings.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.bookings.growth >= 0 ? '+' : ''}{analyticsData.bookings.growth}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Properties</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.properties.total.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {analyticsData.properties.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${analyticsData.properties.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.properties.growth >= 0 ? '+' : ''}{analyticsData.properties.growth}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <Button variant="outline" size="sm">
                <LineChart className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Revenue chart will be displayed here</p>
              </div>
            </div>
          </Card>

          {/* User Growth Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">User growth chart will be displayed here</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Analytics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Analytics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium">456 (80.4%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium">67 (11.8%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cancelled</span>
                <span className="text-sm font-medium">44 (7.8%)</span>
              </div>
            </div>
          </Card>

          {/* Property Analytics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Analytics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Published</span>
                <span className="text-sm font-medium">67 (75.3%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Draft</span>
                <span className="text-sm font-medium">15 (16.9%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Suspended</span>
                <span className="text-sm font-medium">7 (7.8%)</span>
              </div>
            </div>
          </Card>

          {/* User Analytics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Analytics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Guests</span>
                <span className="text-sm font-medium">892 (72.3%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hosts</span>
                <span className="text-sm font-medium">342 (27.7%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verified Hosts</span>
                <span className="text-sm font-medium">298 (87.1%)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Geographic Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
            <Button variant="outline" size="sm">
              <PieChart className="w-4 h-4 mr-2" />
              View Map
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Mumbai</h4>
              <p className="text-2xl font-bold text-blue-600">34%</p>
              <p className="text-sm text-blue-600">456 bookings</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Delhi</h4>
              <p className="text-2xl font-bold text-green-600">28%</p>
              <p className="text-sm text-green-600">378 bookings</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900">Bangalore</h4>
              <p className="text-2xl font-bold text-purple-600">22%</p>
              <p className="text-sm text-purple-600">298 bookings</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900">Others</h4>
              <p className="text-2xl font-bold text-orange-600">16%</p>
              <p className="text-sm text-orange-600">215 bookings</p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
} 