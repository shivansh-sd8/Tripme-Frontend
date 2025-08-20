"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useAuth } from '@/core/store/auth-context';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { 
  Users, 
  UserCheck, 
  Home, 
  BookOpen, 
  DollarSign, 
  Star, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Settings,
  BarChart3,
  Activity,
  Shield,
  Award,
  Calendar,
  CreditCard,
  MessageSquare,
  FileText,
  Zap,
  Target,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  Filter,
  Search,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Wallet,
  Briefcase
} from 'lucide-react';

interface DashboardStats {
  users: {
    total: number;
    newThisMonth: number;
    pendingKYC: number;
    totalHosts: number;
    activeHosts: number;
    growthRate: number;
  };
  properties: {
    total: number;
    pendingApprovals: number;
    active: number;
    suspended: number;
  };
  bookings: {
    total: number;
    thisMonth: number;
    pending: number;
    completed: number;
    cancelled: number;
    growthRate: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    platformFees: number;
    netRevenue: number;
    pendingPayouts: number;
    totalPayouts: number;
    growthRate: number;
  };
  reviews: {
    total: number;
    averageRating: number;
  };
  services: {
    total: number;
    active: number;
  };
}

interface RecentActivity {
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    kyc?: any;
  }>;
  bookings: Array<{
    _id: string;
    user: { _id: string; name: string; email: string };
    host: { _id: string; name: string; email: string };
    listing?: { _id: string; title: string };
    status: string;
    createdAt: string;
  }>;
  properties: Array<{
    _id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
  payments: Array<{
    _id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

interface SystemHealth {
  database: string;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  activeConnections: number;
}

interface QuickActions {
  pendingKYCCount: number;
  pendingPropertiesCount: number;
  pendingBookingsCount: number;
  pendingPayoutsCount: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    users: {
      total: 0,
      newThisMonth: 0,
      pendingKYC: 0,
      totalHosts: 0,
      activeHosts: 0,
      growthRate: 0
    },
    properties: {
      total: 0,
      pendingApprovals: 0,
      active: 0,
      suspended: 0
    },
    bookings: {
      total: 0,
      thisMonth: 0,
      pending: 0,
      completed: 0,
      cancelled: 0,
      growthRate: 0
    },
    revenue: {
      total: 0,
      thisMonth: 0,
      platformFees: 0,
      netRevenue: 0,
      pendingPayouts: 0,
      totalPayouts: 0,
      growthRate: 0
    },
    reviews: {
      total: 0,
      averageRating: 0
    },
    services: {
      total: 0,
      active: 0
    }
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity>({
    users: [],
    bookings: [],
    properties: [],
    payments: []
  });

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'connected',
    uptime: 0,
    memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0, arrayBuffers: 0 },
    activeConnections: 0
  });

  const [quickActions, setQuickActions] = useState<QuickActions>({
    pendingKYCCount: 0,
    pendingPropertiesCount: 0,
    pendingBookingsCount: 0,
    pendingPayoutsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats from API
        try {
          const statsResponse = await apiClient.getAdminDashboardStats();
          if (statsResponse.success) {
            const data = statsResponse.data;
            setStats({
              users: {
                total: data.users?.total || 0,
                newThisMonth: data.users?.newThisMonth || 0,
                pendingKYC: data.users?.pendingKYC || 0,
                totalHosts: data.users?.totalHosts || 0,
                activeHosts: data.users?.activeHosts || 0,
                growthRate: data.users?.growthRate || 0
              },
              properties: {
                total: data.properties?.total || 0,
                pendingApprovals: data.properties?.pendingApprovals || 0,
                active: data.properties?.active || 0,
                suspended: data.properties?.suspended || 0
              },
              bookings: {
                total: data.bookings?.total || 0,
                thisMonth: data.bookings?.thisMonth || 0,
                pending: data.bookings?.pending || 0,
                completed: data.bookings?.completed || 0,
                cancelled: data.bookings?.cancelled || 0,
                growthRate: data.bookings?.growthRate || 0
              },
              revenue: {
                total: data.revenue?.total || 0,
                thisMonth: data.revenue?.thisMonth || 0,
                platformFees: data.revenue?.platformFees || 0,
                netRevenue: data.revenue?.netRevenue || 0,
                pendingPayouts: data.revenue?.pendingPayouts || 0,
                totalPayouts: data.revenue?.totalPayouts || 0,
                growthRate: data.revenue?.growthRate || 0
              },
              reviews: {
                total: data.reviews?.total || 0,
                averageRating: data.reviews?.averageRating || 0
              },
              services: {
                total: data.services?.total || 0,
                active: data.services?.active || 0
              }
            });

            setQuickActions({
              pendingKYCCount: data.users?.pendingKYC || 0,
              pendingPropertiesCount: data.properties?.pendingApprovals || 0,
              pendingBookingsCount: data.bookings?.pending || 0,
              pendingPayoutsCount: data.revenue?.pendingPayouts || 0
            });
          }
        } catch (error) {
          console.error('Failed to fetch dashboard stats:', error);
          // Keep default state with zeros
          // You could also show a toast notification here
        }

        // Fetch recent activities
        try {
          const activitiesResponse = await apiClient.get('/admin/activities/recent');
          if (activitiesResponse.success) {
            setRecentActivities(activitiesResponse.data);
          }
        } catch (error) {
          console.warn('Failed to fetch recent activities:', error);
          // Keep default empty state
        }

        // Fetch system health
        try {
          const healthResponse = await apiClient.get('/admin/system/health');
          if (healthResponse.success) {
            setSystemHealth(healthResponse.data);
          }
        } catch (error) {
          console.warn('Failed to fetch system health:', error);
          // Keep default state
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              change > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {change > 0 ? <TrendingUpIcon className="h-4 w-4 mr-1" /> : <TrendingDownIcon className="h-4 w-4 mr-1" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, count, icon: Icon, color, onClick }: any) => (
    <button
      onClick={onClick}
      className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 hover:border-purple-500/50 transition-all duration-300 group text-left w-full"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{count}</p>
        </div>
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </button>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-6"></div>
            <p className="text-slate-300 text-lg">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-2">Welcome back! Here's what's happening with your platform.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Quick Action</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={formatNumber(stats.users.total)}
            change={stats.users.growthRate}
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.revenue.total)}
            change={stats.revenue.growthRate}
            icon={DollarSign}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            title="Active Bookings"
            value={stats.bookings.total}
            change={stats.bookings.growthRate}
            icon={BookOpen}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="Properties"
            value={stats.properties.total}
            change={null}
            icon={Home}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Platform Fees"
            value={formatCurrency(stats.revenue.platformFees)}
            change={null}
            icon={CreditCard}
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <StatCard
            title="Net Revenue"
            value={formatCurrency(stats.revenue.netRevenue)}
            change={null}
            icon={TrendingUp}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            title="Total Payouts"
            value={formatCurrency(stats.revenue.totalPayouts)}
            change={null}
            icon={Wallet}
            color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          />
          <StatCard
            title="Services"
            value={stats.services.total}
            change={null}
            icon={Briefcase}
            color="bg-gradient-to-br from-rose-500 to-rose-600"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              title="Pending KYC"
              count={quickActions.pendingKYCCount}
              icon={Shield}
              color="bg-gradient-to-br from-yellow-500 to-yellow-600"
              onClick={() => router.push('/admin/kyc')}
            />
            <QuickActionCard
              title="Pending Properties"
              count={quickActions.pendingPropertiesCount}
              icon={Home}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              onClick={() => router.push('/admin/listings')}
            />
            <QuickActionCard
              title="Pending Bookings"
              count={quickActions.pendingBookingsCount}
              icon={BookOpen}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              onClick={() => router.push('/admin/bookings')}
            />
            <QuickActionCard
              title="Pending Payouts"
              count={quickActions.pendingPayoutsCount}
              icon={CreditCard}
              color="bg-gradient-to-br from-green-500 to-green-600"
              onClick={() => router.push('/admin/payments')}
            />
          </div>
        </div>

        {/* Comprehensive Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users & Properties Overview */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Users & Properties Overview</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-blue-400">{stats.users.total}</div>
                  <div className="text-slate-400 text-sm">Total Users</div>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-green-400">{stats.users.newThisMonth}</div>
                  <div className="text-slate-400 text-sm">New This Month</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-purple-400">{stats.users.totalHosts}</div>
                  <div className="text-slate-400 text-sm">Total Hosts</div>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-400">{stats.users.activeHosts}</div>
                  <div className="text-slate-400 text-sm">Active Hosts</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-orange-400">{stats.properties.total}</div>
                  <div className="text-slate-400 text-sm">Total Properties</div>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-400">{stats.properties.active}</div>
                  <div className="text-slate-400 text-sm">Active Properties</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings & Services Overview */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Bookings & Services Overview</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-purple-400">{stats.bookings.total}</div>
                  <div className="text-slate-400 text-sm">Total Bookings</div>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-green-400">{stats.bookings.thisMonth}</div>
                  <div className="text-slate-400 text-sm">This Month</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-xl font-bold text-yellow-400">{stats.bookings.pending}</div>
                  <div className="text-slate-400 text-xs">Pending</div>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-xl font-bold text-emerald-400">{stats.bookings.completed}</div>
                  <div className="text-slate-400 text-xs">Completed</div>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-xl font-bold text-red-400">{stats.bookings.cancelled}</div>
                  <div className="text-slate-400 text-xs">Cancelled</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-rose-400">{stats.services.total}</div>
                  <div className="text-slate-400 text-sm">Total Services</div>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-400">{stats.services.active}</div>
                  <div className="text-slate-400 text-sm">Active Services</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.users.slice(0, 3).map((user, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{user.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-slate-400 text-sm">{user.role} • {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  {user.kyc?.status === 'pending' && (
                    <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">KYC Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`h-3 w-3 rounded-full ${systemHealth.database === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-white">Database</span>
                </div>
                <span className="text-slate-400 text-sm capitalize">{systemHealth.database}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                <span className="text-white">Uptime</span>
                <span className="text-slate-400 text-sm">{Math.floor(systemHealth.uptime / 3600)}h {Math.floor((systemHealth.uptime % 3600) / 60)}m</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                <span className="text-white">Memory Usage</span>
                <span className="text-slate-400 text-sm">{Math.round(systemHealth.memoryUsage.heapUsed / 1024 / 1024)}MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.reviews.averageRating}</div>
              <div className="text-slate-400 text-sm mt-1">Average Rating</div>
              <div className="flex items-center justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(stats.reviews.averageRating) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} />
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats.users.activeHosts}</div>
              <div className="text-slate-400 text-sm mt-1">Active Hosts</div>
              <div className="text-green-400 text-sm mt-1">+{stats.users.growthRate}% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{formatCurrency(stats.revenue.thisMonth)}</div>
              <div className="text-slate-400 text-sm mt-1">This Month Revenue</div>
              <div className="text-green-400 text-sm mt-1">+{stats.revenue.growthRate}% from last month</div>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Financial Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <div className="text-2xl font-bold text-green-400">{formatCurrency(stats.revenue.total)}</div>
              <div className="text-slate-400 text-sm mt-1">Total Revenue</div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <div className="text-2xl font-bold text-blue-400">{formatCurrency(stats.revenue.platformFees)}</div>
              <div className="text-slate-400 text-sm mt-1">Platform Fees</div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <div className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.revenue.netRevenue)}</div>
              <div className="text-slate-400 text-sm mt-1">Net Revenue</div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <div className="text-2xl font-bold text-cyan-400">{formatCurrency(stats.revenue.totalPayouts)}</div>
              <div className="text-slate-400 text-sm mt-1">Total Payouts</div>
            </div>
          </div>
          
          {/* Revenue Composition Chart */}
          <div className="mt-6 p-4 bg-slate-700/30 rounded-xl">
            <h4 className="text-white font-medium mb-4">Revenue Composition</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Platform Fees</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ width: `${(stats.revenue.platformFees / stats.revenue.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-300 text-sm w-16 text-right">{formatCurrency(stats.revenue.platformFees)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Host Payouts</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-cyan-400 h-2 rounded-full" 
                      style={{ width: `${(stats.revenue.totalPayouts / stats.revenue.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-300 text-sm w-16 text-right">{formatCurrency(stats.revenue.totalPayouts)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Net Revenue</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-emerald-400 h-2 rounded-full" 
                      style={{ width: `${(stats.revenue.netRevenue / stats.revenue.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-300 text-sm w-16 text-right">{formatCurrency(stats.revenue.netRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 