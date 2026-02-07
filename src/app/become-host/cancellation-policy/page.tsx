"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';

const cancellationPolicies = [
  {
    id: 'flexible',
    name: 'Flexible',
    description: 'Full refund up to 24 hours before check-in',
    details: 'Guests can cancel up to 24 hours before check-in and get a full refund. Cancellations within 24 hours are non-refundable.',
  },
  {
    id: 'moderate',
    name: 'Moderate',
    description: 'Full refund up to 5 days before check-in',
    details: 'Guests can cancel up to 5 days before check-in and get a full refund. Cancellations within 5 days are 50% refundable.',
  },
  {
    id: 'strict',
    name: 'Strict',
    description: 'Full refund up to 14 days before check-in',
    details: 'Guests can cancel up to 14 days before check-in and get a full refund. Cancellations within 14 days are non-refundable.',
  },
];

export default function CancellationPolicyPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selectedPolicy, setSelectedPolicy] = useState('flexible');

  const handleNext = () => {
    router.push('/become-host/review');
  };

  return (
    <OnboardingLayout
      currentMainStep={3}
      currentSubStep="cancellation-policy"
      onNext={handleNext}
      showBackButton={true}
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Choose your cancellation policy
          </h1>
          <p className="text-gray-600 mb-8">
            Select the cancellation policy that works best for your listing.
          </p>

          <div className="space-y-4">
            {cancellationPolicies.map((policy) => (
              <div
                key={policy.id}
                onClick={() => setSelectedPolicy(policy.id)}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedPolicy === policy.id
                    ? 'border-black bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {policy.name}
                    </h3>
                    <p className="text-gray-600 mt-1">{policy.description}</p>
                    <p className="text-sm text-gray-500 mt-2">{policy.details}</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPolicy === policy.id
                        ? 'border-black'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedPolicy === policy.id && (
                      <div className="w-3 h-3 rounded-full bg-black" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}