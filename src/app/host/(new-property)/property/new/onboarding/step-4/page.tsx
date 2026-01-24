"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/core/store/auth-context';
import { useOnboarding } from '@/core/context/OnboardingContext';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Step4Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { data } = useOnboarding();
  const listingId = searchParams?.get('listingId');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkKYC = async () => {
      setIsChecking(true);
      try {
        await refreshUser(true);
      } catch (error) {
        console.error('Error checking KYC status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkKYC();
  }, [refreshUser]);

  const kycStatus = user?.kyc?.status;
  const isKYCVerified = kycStatus === 'verified';
  const isKYCPending = kycStatus === 'pending';
  const isKYCRejected = kycStatus === 'rejected';
  const isKYCNotSubmitted = !kycStatus || kycStatus === 'not_submitted';

  const handleContinue = () => {
    if (isKYCVerified) {
      const nextUrl = listingId 
        ? `/host/property/new/onboarding/step-5?listingId=${listingId}`
        : '/host/property/new/onboarding/step-5';
      router.push(nextUrl);
    } else if (isKYCNotSubmitted || isKYCRejected) {
      router.push('/user/kyc');
    }
  };

  if (isChecking) {
    return (
      <OnboardingLayout currentStep={4}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
            <p className="text-gray-600">Checking verification status...</p>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout currentStep={4}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Verification Check
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We need to verify your identity before you can start hosting
          </p>
        </div>

        <Card className="p-8">
          {isKYCVerified ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Complete!
              </h2>
              <p className="text-gray-600 mb-8">
                Your identity has been verified. You're all set to continue with the onboarding process.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleContinue}
                  className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-8 py-4 text-lg font-semibold rounded-lg"
                  size="lg"
                >
                  Continue to Final Step
                </Button>
              </motion.div>
            </motion.div>
          ) : isKYCPending ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Under Review
              </h2>
              <p className="text-gray-600 mb-8">
                Your KYC documents are currently under review. We'll notify you once verification is complete.
                This usually takes 24-48 hours.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Please wait for your verification to be approved before continuing.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verification Required
              </h2>
              <p className="text-gray-600 mb-8">
                {isKYCRejected
                  ? 'Your previous verification was rejected. Please resubmit your KYC documents.'
                  : 'Please complete your identity verification to continue.'}
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleContinue}
                  className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-8 py-4 text-lg font-semibold rounded-lg"
                  size="lg"
                >
                  {isKYCRejected ? 'Resubmit KYC Documents' : 'Complete Verification'}
                </Button>
              </motion.div>
            </div>
          )}
        </Card>
      </motion.div>
    </OnboardingLayout>
  );
}

