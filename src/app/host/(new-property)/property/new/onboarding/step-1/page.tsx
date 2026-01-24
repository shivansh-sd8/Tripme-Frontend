"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to new Airbnb-style onboarding flow
export default function Step1Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new onboarding flow
    router.replace('/host/property/new/about-your-place');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}

