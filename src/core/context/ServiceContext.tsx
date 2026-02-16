"use client";
import React, { createContext, useContext, useState,useEffect, ReactNode } from 'react';


export const SERVICE_ONBOARDING_STEPS = {
  1: {
    title: "What service do you provide?",
    description: "Choose the service you want to offer.",
    subSteps: ["categories"],
  },
  2: {
    title: "Describe your service",
    description: "Help guests understand what you offer.",
    subSteps: ["title", "description"],
  },
  3: {
    title: "Set the details",
    description: "Location, pricing, and availability.",
    subSteps: ["location", "media", "duration", "groupSize", "pricing", "review"],
  },
} as const;

export const TOTAL_MAIN_STEPS = 3;

export interface ServiceOnboardingData {
 serviceId?: string;
  // Step 1: Service category
  serviceCategory?: string;
  // Step 2: Service details
  title?: string;
  description?: string;
  // Step 3: Service details
  location?: {
    coordinates:{
      lat: number;
      lng: number;
    };
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  pricing?: {
    basePrice: number;
    currency: string;
    perPersonPrice:number;
    minPrice: number;
    maxPrice: number;
  };
  groupSize?: {
    min: number;
    max: number;
  };
  duration?: {
    minDuration: number;
    maxDuration: number;
    unit: "minutes" | "hours" | "days";
  };
  photos?: {
    images: string[];
    videos: string[];
  };
  review?: {
    rating: number;
    reviews: number;
  };
}

export type StepInfo = {
  title: string;
  description: string;
  subSteps: readonly string[];
};


interface ServiceContextType {
  data: ServiceOnboardingData;
  updateData: (updates: Partial<ServiceOnboardingData>) => void;
  resetData: () => void;
  // Main step (1, 2, or 3)
  currentMainStep: number;
  setCurrentMainStep: (step: number) => void;
  currentSubStep: string;
  setCurrentSubStep: (subStep: string) => void;
  // Helper to get progress
  getProgress: () => { mainStep: number; subStepIndex: number; totalSubSteps: number; overallProgress: number };
  // Navigation helpers
  goToNextSubStep: () => string | null;
  goToPrevSubStep: () => string | null;
  getCurrentStepInfo: () => StepInfo;
 
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);
export function ServiceContextProvider({children}: {children: React.ReactNode}) {

    // const [data, setData] = useState<ServiceOnboardingData>({});
    const [data, setData] = useState<ServiceOnboardingData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem('serviceDraft');
        return savedData ? JSON.parse(savedData) : {};
      } catch (error) {
        console.error('Error loading saved data:', error);
        return {};
      }
    }
    return {};
  });


  const [currentMainStep, setCurrentMainStep] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedStep = localStorage.getItem('serviceStep');
        return savedStep ? JSON.parse(savedStep).mainStep : 1;
      } catch (error) {
        return 1;
      }
    }
    return 1;
  });
 
  const [currentSubStep, setCurrentSubStep] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedStep = localStorage.getItem('serviceStep');
        return savedStep ? JSON.parse(savedStep).subStep : 'categories';
      } catch (error) {
        return 'categories';
      }
    }
    return 'categories';
  });
 
  // ✅ Save data whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('serviceDraft', JSON.stringify(data));
    }
  }, [data]);
 
  // ✅ Save step whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('serviceStep', JSON.stringify({
        mainStep: currentMainStep,
        subStep: currentSubStep
      }));
    }
  }, [currentMainStep, currentSubStep]);
 
  // ✅ Update resetData to clear all saved data
 
    //  const [currentMainStep, setCurrentMainStep] = useState(1);
    //   const [currentSubStep, setCurrentSubStep] = useState('categories');


//     const goToNextSubStep = (): string | null => {
//     const stepInfo = getCurrentStepInfo();
//     const currentIndex = (stepInfo.subSteps as readonly string[]).indexOf(currentSubStep);
    
//      const isNewServiceFlow =
//     typeof window !== "undefined" &&
//     window.location.pathname.startsWith("/host/service/new");

//   const baseUrl = isNewServiceFlow
//     ? "/host/service/new"
//     : "/become-host";

//     if (currentIndex < stepInfo.subSteps.length - 1) {
//       // Move to next sub-step within current main step
//       const nextSubStep = stepInfo.subSteps[currentIndex + 1];
//       setCurrentSubStep(nextSubStep);
//       return `${baseUrl}/${nextSubStep}`;
//     } else if (currentMainStep < TOTAL_MAIN_STEPS) {
//       // Move to first sub-step of next main step
//       const nextMainStep = currentMainStep + 1;
//       const nextStepInfo = SERVICE_ONBOARDING_STEPS[nextMainStep as keyof typeof SERVICE_ONBOARDING_STEPS];
//       const firstSubStep = nextStepInfo.subSteps[0];
//       setCurrentMainStep(nextMainStep);
//       setCurrentSubStep(firstSubStep);
//       return `${baseUrl}/${firstSubStep}`;
//     }
    
//     // Completed all steps
//     return null;
//   };

// const goToNextSubStep = (): string | null => {
//   const stepInfo = getCurrentStepInfo();
//   const currentIndex = stepInfo.subSteps.indexOf(currentSubStep);
  
//   console.log('🔜 Current step:', { currentMainStep, currentSubStep, currentIndex });
//        const isNewServiceFlow =
//     typeof window !== "undefined" &&
//     window.location.pathname.startsWith("/host/service/new");

//   const baseUrl = isNewServiceFlow
//     ? "/host/service/new"
//     : "/become-host";
//   if (currentIndex < stepInfo.subSteps.length - 1) {
//     // Next sub-step in same main step
//     const nextSubStep = stepInfo.subSteps[currentIndex + 1];
//     setCurrentSubStep(nextSubStep);
//     return `${baseUrl}/${nextSubStep}`;
//   } else if (currentMainStep < TOTAL_MAIN_STEPS) {
//     // ✅ Move to first sub-step of next main step
//     const nextMainStep = currentMainStep + 1;
//     setCurrentMainStep(nextMainStep);
    
//     const nextStepInfo = SERVICE_ONBOARDING_STEPS[nextMainStep as keyof typeof SERVICE_ONBOARDING_STEPS];
//     const nextSubStep = nextStepInfo.subSteps[0];
//     setCurrentSubStep(nextSubStep);
    
//     console.log('🔜 Moving to main step:', nextMainStep, 'sub-step:', nextSubStep);
    
//     return `${baseUrl}/${nextSubStep}`;
//   }
  
//   return null;
// };
const goToNextSubStep = (): string | null => {
  const stepInfo = getCurrentStepInfo();
  const currentIndex = stepInfo.subSteps.indexOf(currentSubStep);

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  let baseUrl = "/host/service/new";

  if (pathname.startsWith("/host/service/new")) {
    baseUrl = "/host/service/new";
  } else if (pathname.startsWith("/host/service/")) {
    const segments = pathname.split("/");
    const serviceId = segments[3];
    baseUrl = `/host/service/${serviceId}`;
  }

  const search =
    typeof window !== "undefined" ? window.location.search : "";

  // Next sub-step
  if (currentIndex < stepInfo.subSteps.length - 1) {
    const nextSubStep = stepInfo.subSteps[currentIndex + 1];
    setCurrentSubStep(nextSubStep);
    return `${baseUrl}/${nextSubStep}${search}`;
  }

  // Next main step
  if (currentMainStep < TOTAL_MAIN_STEPS) {
    const nextMainStep = currentMainStep + 1;
    setCurrentMainStep(nextMainStep);

    const nextStepInfo =
      SERVICE_ONBOARDING_STEPS[nextMainStep as keyof typeof SERVICE_ONBOARDING_STEPS];

    const nextSubStep = nextStepInfo.subSteps[0];
    setCurrentSubStep(nextSubStep);

    return `${baseUrl}/${nextSubStep}${search}`;
  }

  return null;
};


  const getCurrentStepInfo = () => {
     return SERVICE_ONBOARDING_STEPS[currentMainStep as keyof typeof SERVICE_ONBOARDING_STEPS];
   };

//   const goToPrevSubStep = (): string | null => {
//   const stepInfo = getCurrentStepInfo();
//   const currentIndex = stepInfo.subSteps.indexOf(currentSubStep);

//   const isNewServiceFlow =
//     typeof window !== "undefined" &&
//     window.location.pathname.startsWith("/host/service/new");

//   const baseUrl = isNewServiceFlow
//     ? "/host/service/new"
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
//       SERVICE_ONBOARDING_STEPS[prevMainStep as keyof typeof SERVICE_ONBOARDING_STEPS];

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

  let baseUrl = "/host/service/new";

  if (pathname.startsWith("/host/service/new")) {
    baseUrl = "/host/service/new";
  } else if (pathname.startsWith("/host/service/")) {
    const segments = pathname.split("/");
    const serviceId = segments[3]; // /host/service/{id}/...
    baseUrl = `/host/service/${serviceId}`;
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
      SERVICE_ONBOARDING_STEPS[
        prevMainStep as keyof typeof SERVICE_ONBOARDING_STEPS
      ];

    const lastSubStep =
      prevStepInfo.subSteps[prevStepInfo.subSteps.length - 1];

    setCurrentSubStep(lastSubStep);

    return `${baseUrl}/${lastSubStep}${search}`;
  }

  return null;
};


 useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('serviceDraft', JSON.stringify(data));
    }
  }, [data]);

 const getProgress = () => {
    const stepInfo = getCurrentStepInfo();
    const subStepIndex = (stepInfo.subSteps as readonly string[]).indexOf(currentSubStep);
    const totalSubSteps = stepInfo.subSteps.length;
    
    // Calculate overall progress across all steps
    let completedSubSteps = 0;
    let totalAllSubSteps = 0;
    
    for (let i = 1; i <= TOTAL_MAIN_STEPS; i++) {
      const step = SERVICE_ONBOARDING_STEPS[i as keyof typeof SERVICE_ONBOARDING_STEPS];
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

       const updateData = (updates: Partial<ServiceOnboardingData>) => {
          setData((prev) => ({
            ...prev,
            ...updates,
          }));
        };
      


// const [currentSubStep, setCurrentSubStep] = useState(() => {
//     if (typeof window !== 'undefined') {
//       try {
//         const savedStep = localStorage.getItem('serviceStep');
//         return savedStep ? JSON.parse(savedStep).subStep : 'categories';
//       } catch (error) {
//         return 'categories';
//       }
//     }
//     return 'categories';
//   });

 // ✅ Save data whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('serviceDraft', JSON.stringify(data));
    }
  }, [data]);

useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('serviceStep', JSON.stringify({
        mainStep: currentMainStep,
        subStep: currentSubStep
      }));
    }
  }, [currentMainStep, currentSubStep]);

 const resetData = () => {
    setData({});
    setCurrentMainStep(1);
    setCurrentSubStep('categories');
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('serviceDraft');
      localStorage.removeItem('serviceStep');
    }
  };
  return (
    <ServiceContext.Provider value={
        {data,
        updateData, 
        resetData,
         currentMainStep, 
         currentSubStep, 
         setCurrentMainStep, 
         setCurrentSubStep,
         getProgress, 
         goToNextSubStep, 
         goToPrevSubStep, 
         getCurrentStepInfo
        }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function serviceOnboarding() {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('service context must be used within an ServiceContextProvider');
  }
  return context;
}
