"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import { authService } from '@/core/services/auth.service';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Home, 
  BookOpen, 
  Shield, 
  CreditCard, 
  Star, 
  Settings,
  Menu,
  X,
  LogOut,
  BarChart3,
  Bell,
  Search,
  ChevronDown,
  Tag
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [kycPendingCount, setKycPendingCount] = useState(0);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Fetch KYC pending count
  const fetchKycPendingCount = async () => {
    try {
      const response = await apiClient.getAdminKYCVerifications({ status: 'pending' });
      if (response.success && response.data) {
        setKycPendingCount(response.data.kyc?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching KYC pending count:', error);
    }
  };

  // Check if user is admin (including super-admin) - use useEffect to avoid setState during render
  useEffect(() => {
    console.log('🔐 AdminLayout - User:', user);
    console.log('🔐 AdminLayout - User role:', user?.role);
    
    // Check if user is admin or super-admin
    const isAdminUser = user && (user.role === 'admin' || user.role === 'super-admin');
    
    if (!isAdminUser) {
      console.log('🔐 AdminLayout - User is not admin, redirecting to admin login');
      router.push('/admin/login');
    } else {
      console.log('🔐 AdminLayout - User is admin, rendering dashboard');
      // Fetch KYC count when user is admin
      fetchKycPendingCount();
    }
  }, [user, router]);

  // Don't render if user is not admin
  const isAdminUser = user && (user.role === 'admin' || user.role === 'super-admin');
  if (!isAdminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Users', href: '/admin/users', icon: Users, badge: null },
    { name: 'Hosts', href: '/admin/hosts', icon: UserCheck, badge: null },
    { name: 'Listings', href: '/admin/listings', icon: Home, badge: null },
    { name: 'Bookings', href: '/admin/bookings', icon: BookOpen, badge: null },
    { name: 'KYC', href: '/admin/kyc', icon: Shield, badge: kycPendingCount > 0 ? kycPendingCount.toString() : null },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard, badge: null },
    { name: 'Reviews', href: '/admin/reviews', icon: Star, badge: null },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, badge: null },
    { name: 'Settings', href: '/admin/settings', icon: Settings, badge: null },
    { name: 'Coupons', href: '/admin/coupons', icon: Tag, badge: null },
  ];

  const handleLogout = async () => {
    try {
      // Use admin-specific logout to clear admin tokens and invalidate session
      await authService.adminLogout();
      // Also call the regular logout to clear user state
      logout();
      router.push('/admin/login');
    } catch (error) {
      console.error('Admin logout error:', error);
      // Even if logout fails, clear local state and redirect
      logout();
      router.push('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50">
          <div className="flex h-20 items-center justify-between px-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-32 bg-white rounded-xl flex items-center justify-center p-3 shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-rotate-1 transition-all duration-500 ease-out animate-bounce hover:animate-none group">
                <div className="relative overflow-hidden">
                  <img src="/logo.png" alt="TripMe" className="h-10 w-28 object-contain transform group-hover:scale-110 transition-transform duration-500 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'
                      }`}
                    />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-700/50 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">Super Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50">
          <div className="flex h-20 items-center px-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-32 bg-white rounded-xl flex items-center justify-center p-3 shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-rotate-1 transition-all duration-500 ease-out animate-bounce hover:animate-none group">
                <div className="relative overflow-hidden">
                  <img src="/logo.png" alt="TripMe" className="h-10 w-28 object-contain transform group-hover:scale-110 transition-transform duration-500 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </div>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'
                      }`}
                    />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-700/50 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">Super Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl transition-all duration-200"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-slate-700/50 bg-slate-800/95 backdrop-blur-xl px-6 shadow-lg">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-400 lg:hidden hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 lg:hidden">
            <div className="h-10 w-28 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-rotate-1 transition-all duration-500 ease-out animate-bounce hover:animate-none group">
              <div className="relative overflow-hidden">
                <img src="/logo.png" alt="TripMe" className="h-8 w-24 object-contain transform group-hover:scale-110 transition-transform duration-500 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              </div>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="flex flex-1 items-center gap-x-4">
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search anything..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-xl bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">Super Admin</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-xl py-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 