"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { validateForm, forgotPasswordSchema } from '@/lib/validation';
import { ForgotPasswordFormData } from '@/types';
import { apiClient } from '@/lib/api';
import Form from '@/components/ui/Form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof ForgotPasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate form
    const validation = validateForm(forgotPasswordSchema, formData);
    if (!validation.success) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    try {
      // Call real API for forgot password
      const response = await apiClient.forgotPassword(formData.email);
      
      if (response.success) {
        setSuccess(true);
      } else {
        setErrors({ general: response.message || 'Failed to send reset email. Please try again.' });
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error.status === 404) {
        setErrors({ general: 'No account found with this email address.' });
      } else {
      setErrors({ general: 'Failed to send reset email. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <Form variant="auth" className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Check your email
            </h1>
            
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{formData.email}</strong>
            </p>
            
            <p className="text-sm text-gray-500 mb-8">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setSuccess(false)}
                className="text-purple-600 hover:text-purple-700 underline"
              >
                try again
              </button>
            </p>
            
            <Link href="/auth/login">
              <Button variant="outline" size="md" className="w-full">
                <ArrowLeft size={20} className="mr-2" />
                Back to login
              </Button>
            </Link>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      {/* Left Side - Static Image */}
      <div className="hidden lg:block lg:w-1/2 h-screen">
        <div className="h-full w-full relative">
          <img
            src="https://images.unsplash.com/photo-1564498711737-dd2a17af2428?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Rishikesh Ganges"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40"></div>
          
          {/* Details Box */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-2">Laxman Jhula</h3>
              <div className="flex items-center text-white/90 mb-2">
                <span className="text-sm">Rishikesh, Uttarakhand</span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                Spiritual capital of India where the Ganges flows through the Himalayas. 
                A perfect place to find inner peace and reset your journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md py-8">
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
          <p className="text-gray-600">Reset your password</p>
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

          <div className="text-center mb-6">
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Email field */}
          <Input
            label="Email address"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            leftIcon={<Mail size={20} />}
            error={errors.email}
            required
          />

          {/* Submit button */}
          <Button
            type="submit"
            size="lg"
            loading={loading}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send reset link'}
            <ArrowRight size={20} className="ml-2" />
          </Button>

          {/* Back to login */}
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
            >
              ← Back to login
            </Link>
          </div>
        </Form>
        </div>
      </div>
    </div>
  );
} 