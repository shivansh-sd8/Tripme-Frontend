"use client";
import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/core/context/OnboardingContext';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import PropertyTypeCard, { propertyTypes } from '@/components/host/PropertyTypeCard';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api';

export default function Step2Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, updateData } = useOnboarding();
  const listingId = searchParams?.get('listingId');

  // Load existing listing data if listingId is provided
  useEffect(() => {
    if (listingId && !data.propertyType) {
      loadExistingListing(listingId);
    }
  }, [listingId]);

  const loadExistingListing = async (id: string) => {
    try {
      // Note: You may need to add a getListingById API method
      // For now, we'll use the data already loaded from ExistingListingsCheck
      updateData({ listingId: id });
    } catch (error) {
      console.error('Error loading listing:', error);
    }
  };

  const handleSelect = (type: typeof propertyTypes[0]['type']) => {
    updateData({ propertyType: type });
  };

  const handleNext = () => {
    if (!data.propertyType) {
      alert('Please select a property type');
      return;
    }
    router.push('/become-host/onboarding/step-3');
  };

  return (
    <OnboardingLayout currentStep={2}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What type of space will you host?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the option that best describes your hosting setup
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {propertyTypes.map((type) => (
            <PropertyTypeCard
              key={type.type}
              type={type.type}
              title={type.title}
              description={type.description}
              icon={type.icon}
              selected={data.propertyType === type.type}
              onSelect={() => handleSelect(type.type)}
            />
          ))}
        </div>

        <div className="flex justify-end">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleNext}
              disabled={!data.propertyType}
              className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-8 py-4 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              Continue
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}

