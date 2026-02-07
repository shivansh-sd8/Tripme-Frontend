"use client";
import React from 'react';
import { use } from 'react';
// import EditProvider from '@/core/context/EditContext';
import OnboardingLayout from '@/components/host/OnboardingLayout';

interface PropertyEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PropertyEditPage({ params }: PropertyEditPageProps) {
  const { id } = use(params);
  
  return (
    <EditProvider propertyId={id}>
      <OnboardingLayout 
        currentMainStep={1}
        isEditMode={true}
      >
        {/* Edit steps will go here */}
      </OnboardingLayout>
    </EditProvider>
  );
}