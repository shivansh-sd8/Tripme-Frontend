"use client";

import { OnboardingProvider } from "@/core/context/OnboardingContext";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
// import OnboardingHeader from "@/components/shared/OnboardingHeader";

export default function NewPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireHost>
      <OnboardingProvider>
        <div className="min-h-screen bg-white">
          {/* <OnboardingHeader /> */}
          <main >{children}</main>
        </div>
      </OnboardingProvider>
    </ProtectedRoute>
  );
}
