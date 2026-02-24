"use client";

import React, { createContext, useContext, useState } from "react";

interface UIContextType {
  hideBottomNav: boolean;
  setHideBottomNav: (value: boolean) => void;

  hideHeader: boolean;
  setHideHeader: (v: boolean) => void;

  setAvailabilityChecked?: (v: boolean) => void;
  availabilityChecked: boolean;

  availabilityError: string;
  setAvailabilityError: (v: string) => void;

  availabilityLoading: boolean;
  setAvailabilityLoading: (v: boolean) => void;

  setSelectionStep?: (v: 'checkin' | 'checkout' | 'complete') => void;
  selectionStep?: 'checkin' | 'checkout' | 'complete';

  bookingLoading: boolean;
  setBookingLoading: (v: boolean) => void;

  


}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [hideBottomNav, setHideBottomNav] = useState(false);
   const [hideHeader, setHideHeader] = useState(false);
   const [availabilityChecked, setAvailabilityChecked] = useState(false);
   const [availabilityError, setAvailabilityError] = useState('');
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [selectionStep, setSelectionStep] = useState<'checkin' | 'checkout' | 'complete'>('checkin');
    const [bookingLoading, setBookingLoading] = useState(false);


  return (
    <UIContext.Provider value={{ hideBottomNav, setHideBottomNav,
     hideHeader, setHideHeader , 
     availabilityChecked, setAvailabilityChecked,
      availabilityError, setAvailabilityError, 
      availabilityLoading, setAvailabilityLoading ,
      selectionStep, setSelectionStep,
      bookingLoading, setBookingLoading
      }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
}
