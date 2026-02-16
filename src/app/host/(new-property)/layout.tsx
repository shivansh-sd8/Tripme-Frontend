"use client";

import { OnboardingProvider } from "@/core/context/OnboardingContext";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { ServiceContextProvider } from "@/core/context/ServiceContext";
// import OnboardingHeader from "@/components/shared/OnboardingHeader";

export default function NewPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireHost>
      <OnboardingProvider>
        <ServiceContextProvider>
        <div className="min-h-screen bg-white">
          {/* <OnboardingHeader /> */}
          <main >{children}</main>
        </div>
        </ServiceContextProvider>
      </OnboardingProvider>
    </ProtectedRoute>
  );
}
