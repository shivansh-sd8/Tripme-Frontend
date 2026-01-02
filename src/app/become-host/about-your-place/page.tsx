"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';

export default function AboutYourPlacePage() {
  const router = useRouter();
  const { goToNextSubStep } = useOnboarding();

  const handleNext = () => {
    router.push('/become-host/structure');
  };

  return (
    <OnboardingLayout
      currentMainStep={1}
      currentSubStep="about-your-place"
      onNext={handleNext}
      showBackButton={false}
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl text-center"
        >
          <p className="text-lg text-gray-500 mb-4">Step 1</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 leading-tight">
            Tell us about your place
          </h1>
          <p className="text-lg text-gray-600">
            In this step, we'll ask you which type of property you have and if guests will book the entire place or just a room. Then let us know the location and how many guests can stay.
          </p>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}
