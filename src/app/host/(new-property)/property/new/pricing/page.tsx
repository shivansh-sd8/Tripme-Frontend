"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';
import { useParams, useSearchParams } from "next/navigation";
export default function PricingIntroPage() {
  const router = useRouter();

   const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id;
    const isEditMode = searchParams.get("mode") === "edit";
    const returnToReview = searchParams.get("return") === "review";

  const handleNext = () => {

    if(isEditMode && id) {
    router.push(`/host/property/${id}/set-availability?mode=edit`);
    } else {
     router.push('/host/property/new/availability');
    }
   
  };

  return (
    <OnboardingLayout
    flow="property"
      currentMainStep={3}
      currentSubStep="pricing"
      onNext={handleNext}
      showBackButton={true}
    >
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl text-center"
        >
          <p className="text-lg text-gray-500 mb-4">Step 3</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 leading-tight">
            Finish up and publish
          </h1>
          <p className="text-lg text-gray-600">
            Finally, you'll set your nightly price. Answer a few quick questions and publish when you're ready.
          </p>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
}
