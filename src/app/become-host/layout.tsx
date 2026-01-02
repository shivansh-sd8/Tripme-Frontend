"use client";
import React from 'react';
import { OnboardingProvider } from '@/core/context/OnboardingContext';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function BecomeHostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <OnboardingProvider>
        {children}
      </OnboardingProvider>
    </ProtectedRoute>
  );
}
