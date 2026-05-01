"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Redirect to new Airbnb-style onboarding flow, preserving any redirect param via sessionStorage
export default function Step1Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectAfter = searchParams.get('redirect');

  useEffect(() => {
    // Store the post-registration destination so step-5 can pick it up without chaining params through every URL
    if (redirectAfter) {
      sessionStorage.setItem('hostOnboardingRedirect', redirectAfter);
    } else {
      sessionStorage.removeItem('hostOnboardingRedirect');
    }
    router.replace('/become-host/about-your-place');
  }, [router, redirectAfter]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
