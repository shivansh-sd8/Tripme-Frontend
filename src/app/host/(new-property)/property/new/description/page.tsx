"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';

export default function DescriptionPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [description, setDescription] = useState(data.description || '');
  const maxLength = 500;

  const handleNext = () => {
    if (!description.trim()) return;
    updateData({ description: description.trim() });
    router.push('/host/property/new/amenities');
  };

  return (
    <OnboardingLayout
      currentMainStep={2}
      currentSubStep="description"
      onNext={handleNext}
      nextDisabled={!description.trim()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Create your description
        </h1>
        <p className="text-gray-500 mb-8">
          Share what makes your place special.
        </p>

        <div className="max-w-lg">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, maxLength))}
            placeholder="You'll have a great time at this comfortable place to stay."
            rows={6}
            className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
          />
          <div className="flex justify-end mt-2">
            <span className="text-sm text-gray-500">
              {description.length}/{maxLength}
            </span>
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
