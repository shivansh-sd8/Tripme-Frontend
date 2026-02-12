"use client";
import { id } from 'date-fns/locale';
import React, { createContext, useContext, useState, ReactNode ,useEffect } from 'react';

export type PropertyType = 'entire' | 'private' | 'shared' | 'experience';
export type StructureType = 'house' | 'apartment' | 'guesthouse' | 'hotel' | 'villa' | 'cottage' | 'cabin' | 'farm' | 'boat' | 'camper' | 'treehouse' | 'tent' | 'castle' | 'other';

// Airbnb-style 3 main steps with sub-steps
export const ONBOARDING_STEPS = {
  1: {
    title: 'Tell us about your place',
    description: 'Share some basic info, such as where it is and how many guests can stay.',
    subSteps: ['about-your-place', 'structure', 'privacy-type', 'floor-plan', 'location'],
  },
  2: {
    title: 'Make it stand out',
    description: "Add 5 or more photos plus a title and description – we'll help you out.",
    subSteps: ['photos', 'title', 'description', 'amenities'],
  },
  3: {
    title: 'Finish up and publish',
    description: 'Choose a starting price, verify a few details, then publish your listing.',
    subSteps: ['pricing', 'price-summary','house-rules', 'booking-settings', 'kyc', 'review'],
  },
} as const;

export const TOTAL_MAIN_STEPS = 3;

export interface OnboardingData {
  listingId?: string;
  // Step 1: About your place
  structureType?: StructureType;
  propertyType?: PropertyType;
  floorPlan?: {
    guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
  };
  location?: {
    address: string;
    city: string;
    state: string;
    country: string;
    pincode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  // Step 2: Make it stand out
  photos?: string[];
  title?: string;
  description?: string;
  amenities?: string[];
  // Step 3: Finish up
  pricing?: {
    basePrice: number;
    currency: string;
    extraGuestPrice?: number;
    cleaningFee?: number;
    securityDeposit?: number;
    serviceFee?: number;
    weeklyDiscount?: number;
    monthlyDiscount?: number;
    weekendPremium?: number;
    anytimeCheckInEnabled?: boolean;
    anytimeCheckInPrice?: number;
  };
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  houseRules?: {
    common :[]
    additional:[]
  };
  hourlyBooking?: {
    enabled: boolean;
    minStayDays: number;
    hourlyRates: {
      sixHours: number;
      twelveHours: number;
      eighteenHours: number;
    };
  };
  availability?: {
    minNights: number;
    maxNights: number;
    instantBook: boolean;
  };
}

export type StepInfo = {
  title: string;
  description: string;
  subSteps: readonly string[];
};

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  resetData: () => void;
  // Main step (1, 2, or 3)
  currentMainStep: number;
  setCurrentMainStep: (step: number) => void;
  // Sub-step within main step (e.g., 'about-your-place', 'structure', etc.)
  currentSubStep: string;
  setCurrentSubStep: (subStep: string) => void;
  // Helper to get progress
  getProgress: () => { mainStep: number; subStepIndex: number; totalSubSteps: number; overallProgress: number };
  // Navigation helpers
  goToNextSubStep: () => string | null;
  goToPrevSubStep: () => string | null;
  getCurrentStepInfo: () => StepInfo;
 
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
   const [data, setData] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('propertyOnboardingData');
      return savedData ? JSON.parse(savedData) : {};
    }
    return {};
  });
  const [currentMainStep, setCurrentMainStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('propertyMainStep');
      return savedStep ? parseInt(savedStep) : 1;
    }
    return 1;
  });
  
  const [currentSubStep, setCurrentSubStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('propertySubStep');
      return savedStep || 'about-your-place';
    }
    return 'about-your-place';
  });

  

    // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && data) {
      localStorage.setItem('propertyOnboardingData', JSON.stringify(data));
    }
  }, [data]);

    useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('propertyMainStep', currentMainStep.toString());
    }
  }, [currentMainStep]);
 
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('propertySubStep', currentSubStep);
    }
  }, [currentSubStep]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const resetData = () => {
    setData({});
    setCurrentMainStep(1);
    setCurrentSubStep('about-your-place');
     if (typeof window !== 'undefined') {
      localStorage.removeItem('propertyOnboardingData');
      localStorage.removeItem('propertyMainStep');
      localStorage.removeItem('propertySubStep');
    }
  };

  const getCurrentStepInfo = () => {
    return ONBOARDING_STEPS[currentMainStep as keyof typeof ONBOARDING_STEPS];
  };

  const getProgress = () => {
    const stepInfo = getCurrentStepInfo();
    const subStepIndex = (stepInfo.subSteps as readonly string[]).indexOf(currentSubStep);
    const totalSubSteps = stepInfo.subSteps.length;
    
    // Calculate overall progress across all steps
    let completedSubSteps = 0;
    let totalAllSubSteps = 0;
    
    for (let i = 1; i <= TOTAL_MAIN_STEPS; i++) {
      const step = ONBOARDING_STEPS[i as keyof typeof ONBOARDING_STEPS];
      totalAllSubSteps += step.subSteps.length;
      
      if (i < currentMainStep) {
        completedSubSteps += step.subSteps.length;
      } else if (i === currentMainStep) {
        completedSubSteps += subStepIndex;
      }
    }
    
    const overallProgress = (completedSubSteps / totalAllSubSteps) * 100;
    
    return {
      mainStep: currentMainStep,
      subStepIndex: subStepIndex >= 0 ? subStepIndex : 0,
      totalSubSteps,
      overallProgress,
    };
  };

  const goToNextSubStep = (): string | null => {
    const stepInfo = getCurrentStepInfo();
    const currentIndex = (stepInfo.subSteps as readonly string[]).indexOf(currentSubStep);
    
     const isNewPropertyFlow =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/host/property/new");

  const baseUrl = isNewPropertyFlow
    ? "/host/property/new"
    : "/become-host";

    if (currentIndex < stepInfo.subSteps.length - 1) {
      // Move to next sub-step within current main step
      const nextSubStep = stepInfo.subSteps[currentIndex + 1];
      setCurrentSubStep(nextSubStep);
      return `${baseUrl}/${nextSubStep}`;
    } else if (currentMainStep < TOTAL_MAIN_STEPS) {
      // Move to first sub-step of next main step
      const nextMainStep = currentMainStep + 1;
      const nextStepInfo = ONBOARDING_STEPS[nextMainStep as keyof typeof ONBOARDING_STEPS];
      const firstSubStep = nextStepInfo.subSteps[0];
      setCurrentMainStep(nextMainStep);
      setCurrentSubStep(firstSubStep);
      return `${baseUrl}/${firstSubStep}`;
    }
    
    // Completed all steps
    return null;
  };

 

//   const goToPrevSubStep = (): string | null => {
//   const stepInfo = getCurrentStepInfo();
//   const currentIndex = stepInfo.subSteps.indexOf(currentSubStep);

//   const isNewPropertyFlow =
//     typeof window !== "undefined" &&
//     window.location.pathname.startsWith("/host/property/new");

//   const baseUrl = isNewPropertyFlow
//     ? "/host/property/new"
//     : "/become-host";

//   if (currentIndex > 0) {
//     // Move to previous sub-step within current main step
//     const prevSubStep = stepInfo.subSteps[currentIndex - 1];
//     setCurrentSubStep(prevSubStep);
//     return `${baseUrl}/${prevSubStep}`;
//   }

//   if (currentMainStep > 1) {
//     // Move to last sub-step of previous main step
//     const prevMainStep = currentMainStep - 1;
//     const prevStepInfo =
//       ONBOARDING_STEPS[prevMainStep as keyof typeof ONBOARDING_STEPS];

//     const lastSubStep =
//       prevStepInfo.subSteps[prevStepInfo.subSteps.length - 1];

//     setCurrentMainStep(prevMainStep);
//     setCurrentSubStep(lastSubStep);

//     return `${baseUrl}/${lastSubStep}`;
//   }

//   return null;
// };

const goToPrevSubStep = (): string | null => {
  const stepInfo = getCurrentStepInfo();
  const currentIndex = stepInfo.subSteps.indexOf(currentSubStep);

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  let baseUrl = "/host/property/new";

  if (pathname.startsWith("/host/property/new")) {
    baseUrl = "/host/property/new";
  } else if (pathname.startsWith("/host/property/")) {
    const segments = pathname.split("/");
    const propertyId = segments[3]; // /host/property/{id}/...
    baseUrl = `/host/property/${propertyId}`;
  }

  const search =
    typeof window !== "undefined" ? window.location.search : "";

  // 🔹 Previous sub-step in same main step
  if (currentIndex > 0) {
    const prevSubStep = stepInfo.subSteps[currentIndex - 1];
    setCurrentSubStep(prevSubStep);
    return `${baseUrl}/${prevSubStep}${search}`;
  }

  // 🔹 Move to previous main step
  if (currentMainStep > 1) {
    const prevMainStep = currentMainStep - 1;
    setCurrentMainStep(prevMainStep);

    const prevStepInfo =
      ONBOARDING_STEPS[
        prevMainStep as keyof typeof ONBOARDING_STEPS
      ];

    const lastSubStep =
      prevStepInfo.subSteps[prevStepInfo.subSteps.length - 1];

    setCurrentSubStep(lastSubStep);

    return `${baseUrl}/${lastSubStep}${search}`;
  }

  return null;
};

  return (
    <OnboardingContext.Provider
      value={{
        data,
        updateData,
        resetData,
        currentMainStep,
        setCurrentMainStep,
        currentSubStep,
        setCurrentSubStep,
        getProgress,
        goToNextSubStep,
        goToPrevSubStep,
        getCurrentStepInfo,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

