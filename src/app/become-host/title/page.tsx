"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';

export default function TitlePage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [title, setTitle] = useState(data.title || '');
  const maxLength = 50;

  const handleNext = () => {
    if (!title.trim()) return;
    updateData({ title: title.trim() });
    router.push('/become-host/description');
  };

  return (
    <OnboardingLayout
      currentMainStep={2}
      currentSubStep="title"
      onNext={handleNext}
      nextDisabled={!title.trim()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Now, let's give your place a title
        </h1>
        <p className="text-gray-500 mb-8">
          Short titles work best. Have fun with it—you can always change it later.
        </p>

        <div className="max-w-lg">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, maxLength))}
            placeholder="Cozy apartment in the heart of the city"
            rows={3}
            className="w-full px-4 py-4 text-2xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
          />
          <div className="flex justify-end mt-2">
            <span className="text-sm text-gray-500">
              {title.length}/{maxLength}
            </span>
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
