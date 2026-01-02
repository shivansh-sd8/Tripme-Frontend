"use client";
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Home, MapPin, Building2 } from 'lucide-react';
import { useAuth } from '@/core/store/auth-context';
import { useOnboarding } from '@/core/context/OnboardingContext';
import { apiClient } from '@/lib/api';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { propertyTypes } from '@/components/host/PropertyTypeCard';

export default function Step5Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUser, refreshUser } = useAuth();
  const { data, resetData } = useOnboarding();
  const listingId = searchParams?.get('listingId');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedPropertyType = propertyTypes.find((pt) => pt.type === data.propertyType);

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // If user is already a host, skip the becomeHost API call
      if (user?.role === 'host') {
        setSuccess(true);
        resetData();
        
        // If continuing an existing listing, redirect to edit that listing
        // Otherwise, redirect to dashboard
        setTimeout(() => {
          if (listingId) {
            router.push(`/host/property/${listingId}`);
          } else {
            router.push('/host/dashboard');
          }
        }, 2000);
        return;
      }

      // Call the becomeHost API for new hosts
      const response = await apiClient.becomeHost();

      if (response.success && response.data?.user) {
        updateUser(response.data.user);
        setSuccess(true);
        
        // Reset onboarding data
        resetData();

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/host/dashboard');
        }, 3000);
      } else {
        setError(response.message || 'Failed to become a host. Please try again.');
      }
    } catch (err: any) {
      console.error('Become host error:', err);
      if (err?.code === 'UNAUTHORIZED' || err?.status === 401) {
        setError('Please log in to become a host.');
      } else if (err?.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err?.message || 'Failed to become a host. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout currentStep={5}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Review & Complete
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Review your information and complete your host application
          </p>
        </div>

        <AnimatePresence>
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-8 md:p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Congratulations! 🎉
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  You're now a host! Redirecting to your dashboard...
                </p>
                <div className="flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
                </div>
              </Card>
            </motion.div>
          ) : (
            <Card className="p-8">
              {/* Review Summary */}
              <div className="space-y-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Information</h2>

                {/* Property Type */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FFF5F5] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-[#FF385C]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-500 mb-1">Property Type</h3>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedPropertyType?.title || 'Not selected'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedPropertyType?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {data.location && (
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#FFF5F5] rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-[#FF385C]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-500 mb-1">Location</h3>
                        <p className="text-lg font-semibold text-gray-900">
                          {data.location.address}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {data.location.city}, {data.location.state}, {data.location.country}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <p className="text-sm text-red-800">{error}</p>
                </motion.div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After completing your application, you'll be able to create listings,
                  manage bookings, and start earning money. You can always update your information later.
                </p>
              </div>

              {/* Complete Button */}
              <div className="flex justify-end">
                <motion.div
                  whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                >
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-8 py-4 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Completing...
                      </>
                    ) : (
                      <>
                        Complete Application
                        <CheckCircle className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </Card>
          )}
        </AnimatePresence>
      </motion.div>
    </OnboardingLayout>
  );
}

