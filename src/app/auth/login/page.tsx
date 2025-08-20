"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { validateForm, loginSchema } from '@/shared/utils/validation';
import { LoginFormData } from '@/shared/types';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useAuth } from '@/core/store/auth-context';
import Form from '@/components/ui/Form';
import Input from '@/components/ui/Input';
import Button from '@/shared/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Divider from '@/components/ui/Divider';
import Carousel from '@/components/ui/Carousel';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import { carouselImages } from '@/data/destinations';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isAuthenticated, isLoading } = useAuth();
  
  // Get redirect URL from search params
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState<string>('');

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'super-admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGoogleError = (error: string) => {
    setGoogleError(error);
  };

  const handleGoogleSuccess = () => {
    setGoogleError('');
    // Google login redirect is handled in GoogleLoginButton component
  };

  // Show loading if checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login page if user is already authenticated
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate form
    const validation = validateForm(loginSchema, formData);
    if (!validation.success) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    try {
      // Call real API for login
      const response = await apiClient.login(formData.email, formData.password);
      
      // Store token and user data in localStorage
      if (response.success && response.data) {
        // Update global auth state
        login(response.data.user, response.data.token);
        
        // Redirect based on user role or redirect parameter
        if (response.data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push(redirectTo);
        }
      } else {
        setErrors({ general: response.message || 'Login failed. Please try again.' });
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      const errorObj = error as { status?: number; message?: string; details?: { errors?: Array<{ field?: string; message: string }> } };
      
      if (errorObj.status === 401) {
        setErrors({ general: 'Invalid email or password.' });
      } else if (errorObj.status === 400) {
        // Handle validation errors
        if (errorObj.message === 'Validation error' && errorObj.details) {
          const fieldErrors: Record<string, string> = {};
          
          if (errorObj.details.errors) {
            errorObj.details.errors.forEach((err: { field?: string; message: string }) => {
              if (err.field) {
                fieldErrors[err.field] = err.message;
              }
            });
          }
          
          if (Object.keys(fieldErrors).length === 0) {
            setErrors({ general: 'Please check your input and try again.' });
          } else {
            setErrors(fieldErrors);
          }
        } else {
          setErrors({ general: errorObj.message || 'Please check your input and try again.' });
        }
      } else if (errorObj.status === 0) {
        setErrors({ general: 'Network error. Please check your connection.' });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Left Side - Carousel */}
      <div className="hidden lg:block lg:w-1/2 h-screen">
        <Carousel images={carouselImages} />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="TripMe Logo" 
                className="h-12 w-auto"
              />
            </div>
          </Link>
          <p className="text-gray-600">Welcome back! Sign in to your account</p>
        </div>

        <Form
          variant="auth"
          onSubmit={handleSubmit}
          className="relative"
        >
          {/* General error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Google error */}
          {googleError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{googleError}</p>
            </div>
          )}

          {/* Email field */}
          <Input
            label="Email address"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
            leftIcon={<Mail size={20} />}
            error={errors.email}
            required
          />

          {/* Password field */}
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
            leftIcon={<Lock size={20} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
            error={errors.password}
            required
          />

          {/* Remember me and forgot password */}
          <div className="flex items-center justify-between">
            <Checkbox
              checked={formData.rememberMe}
              onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
              label="Remember me"
            />
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
            <ArrowRight size={20} className="ml-2" />
          </Button>

          {/* Divider */}
          <Divider text="or continue with" />

          {/* Social login buttons */}
          <div className="space-y-3">
            <GoogleLoginButton onError={handleGoogleError} onSuccess={handleGoogleSuccess} />
          </div>

          {/* Sign up link */}
          <div className="text-center text-gray-600 text-sm">
            Don&apos;t have an account?{' '}
            <Link 
              href="/auth/signup" 
              className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </div>
        </Form>
        </div>
      </div>
    </div>
  );
} 