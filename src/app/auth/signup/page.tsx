"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone } from 'lucide-react';
import { validateForm, signupSchema } from '@/shared/utils/validation';
import { SignupFormData } from '@/shared/types';
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

export default function SignupPage() {
  const router = useRouter();
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean) => {
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

  // Don't show signup page if user is already authenticated
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
    console.log('Form submission started');
    console.log('Form data:', formData);
    
    setLoading(true);
    setErrors({});

    // Validate form
    const validation = validateForm(signupSchema, formData);
    console.log('Validation result:', validation);
    
    if (!validation.success) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    // Additional validation for password confirmation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      console.log('Making API call to signup...');
      
      // Call real API for signup
      const response = await apiClient.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        acceptTerms: formData.agreeToTerms,
        role: 'guest', // Add default role
      });
      
      console.log('API response:', response);
      
      // Store token and user data in localStorage
      if (response.success && response.data) {
        // Update global auth state
        login(response.data.user, response.data.token);
        
        // Redirect based on user role
        if (response.data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setErrors({ general: response.message || 'Signup failed. Please try again.' });
      }
    } catch (error: unknown) {
      console.error('Signup error:', error);
      
      const errorObj = error as { status?: number; message?: string; details?: { errors?: Array<{ field?: string; message: string }> } };
      
      console.error('Error details:', errorObj.details);
      console.error('Error status:', errorObj.status);
      console.error('Error message:', errorObj.message);
      
      if (errorObj.status === 400) {
        // Handle validation errors
        if (errorObj.message === 'Validation error' && errorObj.details) {
          // Map backend validation errors to form fields
          const fieldErrors: Record<string, string> = {};
          
          if (errorObj.details.errors) {
            errorObj.details.errors.forEach((err: { field?: string; message: string }) => {
              // Map backend field names to frontend field names
              let fieldName = err.field;
              if (fieldName === 'acceptTerms') {
                fieldName = 'agreeToTerms';
              }
              fieldErrors[fieldName] = err.message;
            });
          }
          
          // If no specific field errors, show general validation message
          if (Object.keys(fieldErrors).length === 0) {
            setErrors({ general: 'Please check your input and try again.' });
          } else {
            setErrors(fieldErrors);
          }
        } else {
          setErrors({ general: errorObj.message || 'Please check your input and try again.' });
        }
      } else if (errorObj.status === 409) {
        setErrors({ email: 'An account with this email already exists.' });
      } else {
        setErrors({ general: 'Signup failed. Please try again.' });
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
      <div className="w-full lg:w-1/2 flex items-start justify-center p-4 overflow-y-auto pt-16">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border-0">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="TripMe Logo" 
                className="h-20 w-auto"
              />
            </div>
          </Link>
          <p className="text-gray-600">Create your account to get started</p>
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

          {/* Name field */}
          <Input
            label="Full name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
            leftIcon={<User size={20} />}
            error={errors.name}
            required
          />

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

          {/* Phone field */}
          <Input
            label="Phone number (optional)"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
            leftIcon={<Phone size={20} />}
            error={errors.phone}
            helperText="Enter your phone number (optional)"
          />

          {/* Password field */}
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
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
            helperText="At least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)"
            required
          />

          {/* Confirm Password field */}
          <Input
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('confirmPassword', e.target.value)}
            leftIcon={<Lock size={20} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
            error={errors.confirmPassword}
            required
          />

          {/* Terms and conditions */}
          <Checkbox
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            label="I agree to the"
            error={errors.agreeToTerms}
          >
            {' '}
            <Link href="/terms" className="text-purple-600 hover:text-purple-700 hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-purple-600 hover:text-purple-700 hover:underline">
              Privacy Policy
            </Link>
          </Checkbox>

          {/* Submit button */}
          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
            <ArrowRight size={20} className="ml-2" />
          </Button>

          {/* Divider */}
          <Divider text="or continue with" />

          {/* Social signup buttons */}
          <div className="space-y-3">
            <GoogleLoginButton onError={handleGoogleError} onSuccess={handleGoogleSuccess} />
          </div>

          {/* Sign in link */}
          <div className="text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link 
              href="/auth/login" 
              className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </Form>
        </div>
      </div>
    </div>
  );
} 