'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/core/store/auth-context';

import { authService } from '@/core/services/auth.service';
import { Shield, Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';

interface AdminLoginForm {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<AdminLoginForm>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<AdminLoginForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if admin is already logged in and redirect to dashboard
  useEffect(() => {
    const checkAuthStatus = () => {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      // Check if user is already authenticated and is an admin
      if (currentUser && token && (currentUser.role === 'admin' || currentUser.role === 'super-admin')) {
        console.log('🔐 Admin already logged in, redirecting to dashboard...');
        router.push('/admin/dashboard');
        return;
      }
      
      // If not authenticated, show the login form
      setIsCheckingAuth(false);
    };

    // Small delay to ensure auth context is initialized
    const timer = setTimeout(checkAuthStatus, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminLoginForm> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      console.log('🔐 Attempting admin login...');
      const data = await authService.adminLogin(formData.email, formData.password);
      console.log('🔐 Admin login response:', data);

      if (data.success) {
        // Update auth context with admin user data
        if (data.data?.admin && data.data?.token) {
          login(data.data.admin, data.data.token);
          console.log('🔐 Admin user logged in via auth context');
        }
        
        setMessage({
          type: 'success',
          text: 'Login successful! Redirecting to dashboard...'
        });
        
        // Add a small delay to ensure state is properly set
        setTimeout(() => {
          console.log('🔄 Redirecting to admin dashboard...');
          router.push('/admin/dashboard');
        }, 1000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Login failed'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof AdminLoginForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Admin Portal
          </h2>
          <p className="text-slate-300 text-lg">
            Secure access to platform management
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-12 pr-4 py-4 border ${
                    errors.email ? 'border-red-500' : 'border-slate-600'
                  } rounded-xl bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-12 pr-12 py-4 border ${
                    errors.password ? 'border-red-500' : 'border-slate-600'
                  } rounded-xl bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-xl border ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-current mr-3"></span>
                  {message.text}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center">
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-slate-400">
              Need an admin account?{' '}
              <Link 
                href="/admin/signup" 
                className="font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200 hover:underline"
              >
                Sign up here
              </Link>
            </p>
            <p className="text-sm">
              <Link 
                href="/" 
                className="font-medium text-slate-400 hover:text-white transition-colors duration-200 hover:underline"
              >
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-slate-500 text-sm">
            <Shield className="h-4 w-4" />
            <span>🔒 Enterprise-grade security</span>
          </div>
        </div>
      </div>
    </div>
  );
}
