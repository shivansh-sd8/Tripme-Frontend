"use client";

import React, { createContext, useContext, useState } from "react";

interface UIContextType {
  hideBottomNav: boolean;
  setHideBottomNav: (value: boolean) => void;

  hideHeader: boolean;
  setHideHeader: (v: boolean) => void;

}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [hideBottomNav, setHideBottomNav] = useState(false);
   const [hideHeader, setHideHeader] = useState(false);

  return (
    <UIContext.Provider value={{ hideBottomNav, setHideBottomNav, hideHeader, setHideHeader }}>
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
