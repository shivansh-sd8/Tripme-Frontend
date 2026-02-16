"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import Image from 'next/image';
import OnboardingProgress, { StepIndicator } from './OnboardingProgress';
import { useOnboarding, ONBOARDING_STEPS } from '@/core/context/OnboardingContext';
import { serviceOnboarding ,SERVICE_ONBOARDING_STEPS  } from '@/core/context/ServiceContext';
import Button from '../ui/Button';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentMainStep: number;
  currentSubStep: string;
  onBack?: () => void;
  onNext?: () => void;
  showBackButton?: boolean;
  showNextButton?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  flow: "property" | "service";
}

export default function OnboardingLayout({
  children,
  currentMainStep,
  currentSubStep,
  flow,
  // onBack,
  onNext,
  showBackButton = true,
  showNextButton = true,
  nextDisabled = false,
  nextLabel = 'Next',
}: OnboardingLayoutProps) {
  const router = useRouter();
  // const { goToPrevSubStep, setCurrentMainStep, setCurrentSubStep } = useOnboarding();
const onboarding =
  flow === "service"
    ? serviceOnboarding()
    : useOnboarding();

    const {
  goToPrevSubStep,
  setCurrentMainStep,
  setCurrentSubStep,
} = onboarding;
  // Sync context state when component mounts
  React.useEffect(() => {
    setCurrentMainStep(currentMainStep);
    setCurrentSubStep(currentSubStep);
  }, [currentMainStep, currentSubStep, setCurrentMainStep, setCurrentSubStep]);

  // const handleBack = () => {
  //   if (onBack) {
  //     onBack();
  //   } else {
  //     const prevUrl = goToPrevSubStep();
  //     if (prevUrl) {
  //       router.push(prevUrl);
  //     } else {
  //       router.push('/');
  //     }
  //   }
  // };

  const handleBack = () => {
  const prevUrl = goToPrevSubStep();

  if (prevUrl) {
    router.push(prevUrl);
  } else {
    // Airbnb behavior: exit onboarding only on first step
    router.push("/host/dashboard");
  }
};


  const handleExit = () => {
    router.push('/host/dashboard');
  };

  // const isFirstSubStep = () => {
  //   const stepInfo = ONBOARDING_STEPS[currentMainStep as keyof typeof ONBOARDING_STEPS];
  //   return currentMainStep === 1 && stepInfo.subSteps[0] === currentSubStep;
  // };

  const STEPS =
  flow === "service"
    ? SERVICE_ONBOARDING_STEPS
    : ONBOARDING_STEPS;

const isFirstSubStep = () => {
  const stepInfo = STEPS[currentMainStep as keyof typeof STEPS];
  return currentMainStep === 1 && stepInfo.subSteps[0] === currentSubStep;
};


  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Image
              src="/logo.png"
              alt="TripMe"
              width={100}
              height={40}
              className="h-10 w-auto object-contain"
            />
            
            {/* Exit button */}
            <button
              onClick={handleExit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <OnboardingProgress currentMainStep={currentMainStep} currentSubStep={currentSubStep} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
          {children}
        </div>
      </main>

      {/* Footer with navigation */}
      <footer className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            {showBackButton && !isFirstSubStep() ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:underline font-medium transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            
            {/* Next button */}
            {showNextButton && onNext && (
              <Button
                onClick={onNext}
                disabled={nextDisabled}
                className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {nextLabel}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}



