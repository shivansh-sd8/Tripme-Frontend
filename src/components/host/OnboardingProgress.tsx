"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ONBOARDING_STEPS, TOTAL_MAIN_STEPS } from '@/core/context/OnboardingContext';

interface OnboardingProgressProps {
  currentMainStep: number;
  currentSubStep: string;
}

export default function OnboardingProgress({ currentMainStep, currentSubStep }: OnboardingProgressProps) {
  // Calculate progress within current main step
  const stepInfo = ONBOARDING_STEPS[currentMainStep as keyof typeof ONBOARDING_STEPS];
  const subSteps = stepInfo?.subSteps || [];
  const currentSubStepIndex = (subSteps as readonly string[]).indexOf(currentSubStep);
  const subStepProgress = currentSubStepIndex >= 0 
    ? ((currentSubStepIndex + 1) / subSteps.length) * 100 
    : 0;

  return (
    <div className="w-full">
      {/* Simple progress bar like Airbnb */}
      <div className="h-1 bg-gray-200 w-full">
        <motion.div
          className="h-full bg-black"
          initial={{ width: '0%' }}
          animate={{ 
            width: `${((currentMainStep - 1) / TOTAL_MAIN_STEPS) * 100 + (subStepProgress / TOTAL_MAIN_STEPS)}%` 
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// Step Indicator Component for showing which main step you're on
export function StepIndicator({ currentMainStep }: { currentMainStep: number }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <span className="font-medium">Step {currentMainStep}</span>
      <span>of {TOTAL_MAIN_STEPS}</span>
    </div>
  );
}



