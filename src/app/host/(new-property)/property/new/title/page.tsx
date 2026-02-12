"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';
import { useParams, useSearchParams } from "next/navigation";
export default function TitlePage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [title, setTitle] = useState(data.title || '');
  const maxLength = 50;
  const minLength =10;
  const isTooShort = title.trim().length > 0 && title.trim().length < minLength;
  const isTooLong = title.length > maxLength;

   const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id;
    const isEditMode = searchParams.get("mode") === "edit";
    const returnToReview = searchParams.get("return") === "review";


  
  const handleNext = () => {
  if (!title.trim()) return;
  
  updateData({ title: title.trim() });
   if (returnToReview) {
    // Return to review page
    if (isEditMode && id) {
      router.push(`/host/property/${id}/review?mode=edit`);
    } else {
      router.push('/host/property/new/review');
    }
  } else {
    if (isEditMode && id) {
      router.push(`/host/property/${id}/description?mode=edit`);
    } else {
      router.push('/host/property/new/description');
    }
  }
};

 

  return (
    <OnboardingLayout
    flow="property"
      currentMainStep={2}
      currentSubStep="title"
      onNext={handleNext}
      nextDisabled={title.trim().length < minLength || title.trim().length > maxLength}
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
             className={`w-full px-4 py-4 text-lg border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none ${
              isTooShort ? 'border-red-300' : isTooLong ? 'border-red-300' : 'border-gray-300'
            }`}
            // className="w-full px-4 py-4 text-2xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-sm ${isTooShort ? 'text-red-500' : isTooLong ? 'text-red-500' : 'text-gray-500'}`}>
              {isTooShort && `Minimum ${minLength} characters required (${title.trim().length}/${minLength})`}
              {isTooLong && `Maximum ${maxLength} characters exceeded (${title.length}/${maxLength})`}
              {!isTooShort && !isTooLong && `${title.length}/${maxLength} characters`}
            </span>
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
