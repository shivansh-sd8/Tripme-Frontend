"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Calendar, 
  ChevronDown,
  Globe
} from 'lucide-react';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useAuth } from '@/core/store/auth-context';
import Dropdown from '../ui/Dropdown';

const HostHeader = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      // Logout is handled by the auth service
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <header className={`w-full z-50 fixed top-0 left-0 right-0 transition-all duration-500 ease-in-out ${
      scrolled
        ? 'bg-white border-b border-gray-200 shadow-lg' 
        : 'bg-white border-b border-gray-100'
    }`}> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group relative z-10">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="TripMe"
                width={120}
                height={120}
                className="h-30 w-30 object-contain transition-transform duration-300 group-hover:scale-110"
                priority
              />
            </div>
          </Link>

          {/* Desktop Actions - Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Switch to Travelling Button */}
            <Link href="/">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-200 border border-gray-300 rounded-full">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Switch to Travelling</span>
              </button>
            </Link>
            
            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-200 border border-gray-300 rounded-full"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <Link 
                      href="/user/profile" 
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={20} />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <Link 
                      href="/bookings" 
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Calendar size={20} />
                      <span className="font-medium">My Bookings</span>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <LogOut size={20} />
                      <span className="font-medium">Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Dropdown
                trigger={
                  <button
                    className="flex items-center justify-center gap-2 p-2 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-200 border border-gray-300"
                    aria-haspopup="true"
                  >
                    <Menu size={20} className="text-gray-700" />
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                      <User size={16} className="text-white flex-shrink-0" />
                    </div>
                  </button>
                }
                align="right"
              >
                <div className="py-2 space-y-2">
                  <Link 
                    href="/auth/login" 
                    className="block w-full text-center px-4 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block w-full text-center px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              </Dropdown>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-gray-700" />
            ) : (
              <Menu size={24} className="text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
            <div className="px-4 py-4 space-y-3">
              {/* Switch to Travelling Button */}
              <Link 
                href="/" 
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Globe size={20} />
                <span className="font-medium">Switch to Travelling</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/user/profile" 
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={20} />
                    <span className="font-medium">Profile</span>
                  </Link>
                  <Link 
                    href="/bookings" 
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar size={20} />
                    <span className="font-medium">My Bookings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Sign out</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link 
                    href="/auth/login" 
                    className="block w-full text-center px-4 py-3 rounded-2xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block w-full text-center px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HostHeader; 