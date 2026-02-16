"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';
import { useParams, useSearchParams } from "next/navigation";
export default function DescriptionPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [description, setDescription] = useState(data.description || '');
  const maxLength = 500;
const minLength = 50;
   const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id;
    const isEditMode = searchParams.get("mode") === "edit";
    const returnToReview = searchParams.get("return") === "review";


    
  const isTooShort = description.trim().length > 0 && description.trim().length < minLength;
  const isTooLong = description.length > maxLength;

  const handleNext = () => {
    if (!description.trim()) return;
    updateData({ description: description.trim() });
 if (returnToReview) {
    // Return to review page
    if (isEditMode && id) {
      router.push(`/host/property/${id}/review?mode=edit`);
    } else {
      router.push('/host/property/new/review');
    }
  } else {
     if (isEditMode && id) {
    router.push(`/host/property/${id}/amenities?mode=edit`);
  } else {
    router.push('/host/property/new/amenities');
  }
  }
   
  };

  return (
    <OnboardingLayout
    flow="property"
      currentMainStep={2}
      currentSubStep="description"
      onNext={handleNext}
       nextDisabled={description.trim().length < minLength || description.trim().length > maxLength}
      // nextDisabled={!description.trim() || isTooShort || isTooLong}
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
             className={`w-full px-4 py-4 text-lg border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none ${
              isTooShort ? 'border-red-300' : isTooLong ? 'border-red-300' : 'border-gray-300'
            }`}
            // className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
          />
          <div className="flex justify-end mt-2">
            <div className="flex justify-between items-center mt-2">
            <span className={`text-sm ${isTooShort ? 'text-red-500' : isTooLong ? 'text-red-500' : 'text-gray-500'}`}>
              {isTooShort && `Minimum ${minLength} characters required (${description.trim().length}/${minLength})`}
              {isTooLong && `Maximum ${maxLength} characters exceeded (${description.length}/${maxLength})`}
              {!isTooShort && !isTooLong && `${description.length}/${maxLength} characters`}
            </span>
          </div>
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
