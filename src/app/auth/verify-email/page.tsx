"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setVerificationStatus('error');
          setMessage('No verification token provided. Please check your email for the complete verification link.');
          setIsLoading(false);
          return;
        }

        console.log('Verifying email with token:', token);
        
        // Call backend API to verify email
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/verify-email/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log('Verification response:', data);

        if (response.ok && data.success) {
          setVerificationStatus('success');
          setMessage('Email verified successfully! You can now log in to your account.');
        } else {
          setVerificationStatus('error');
          setMessage(data.message || 'Email verification failed. Please try again or contact support.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage('An error occurred during verification. Please try again or contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="TripMe Logo" 
                className="h-12 w-auto"
              />
            </div>
          </Link>
        </div>

        {/* Status Icon */}
        <div className="mb-6">
          {verificationStatus === 'success' ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          )}
        </div>

        {/* Status Message */}
        <h1 className={`text-2xl font-bold mb-4 ${
          verificationStatus === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
          {verificationStatus === 'success' ? 'Email Verified!' : 'Verification Failed'}
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          {verificationStatus === 'success' ? (
            <Link
              href="/auth/login"
              className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Continue to Login
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Try Signing Up Again
              </Link>
              <Link
                href="/auth/login"
                className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Go to Login
              </Link>
            </>
          )}
          
          <Link
            href="/"
            className="block w-full bg-transparent text-purple-600 py-3 px-4 rounded-lg font-medium border border-purple-600 hover:bg-purple-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Help Text */}
        {verificationStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              If you continue to have issues, please contact our support team or check that you&apos;re using the complete verification link from your email.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
