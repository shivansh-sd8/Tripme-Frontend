"use client";
import React, { useState, useEffect } from "react";
import HostHeader from "@/components/shared/HostHeader";
import Footer from "@/components/shared/Footer";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import HostingDashboard from "@/components/host/HostingDashboard";
import BecomeHostIntro from "@/components/host/BecomeHostIntro";
import Button from "@/components/ui/Button";
import { useAuth } from "@/core/store/auth-context";
import { useRouter } from "next/navigation";
import { apiClient } from "@/infrastructure/api/clients/api-client";

export default function HostingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hasListings, setHasListings] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const checkListings = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      // If user is a host, check for existing listings
      if (user?.role === "host") {
        try {
          const response = await apiClient.getMyListings();
          if (response.success && response.data) {
            const data = response.data as any;
            const listings = data.listings || (Array.isArray(data) ? data : []);
            setHasListings(listings.length > 0);
          } else {
            setHasListings(false);
          }
        } catch (err) {
          console.error("Error checking listings:", err);
          setHasListings(false);
        }
      } else {
        // Non-host users should see the intro
        setShowIntro(true);
      }
      setLoading(false);
    };

    checkListings();
  }, [user, isAuthenticated]);

  const handleGetStarted = () => {
    router.push("/become-host/onboarding/step-1");
  };

  const handleCreateNewListing = () => {
    router.push("/become-host/onboarding/step-1");
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // If user is not a host, show the intro page
  if (user?.role !== "host" || showIntro) {
    return (
      <ProtectedRoute requireAuth={true}>
        <BecomeHostIntro 
          onGetStarted={handleGetStarted} 
          onExit={() => router.push("/")}
        />
      </ProtectedRoute>
    );
  }

  // User is a host - show the hosting dashboard
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen bg-white flex flex-col">
        <HostHeader />
        <main className="pt-24 flex-1">
          <HostingDashboard onCreateNewListing={handleCreateNewListing} />
        </main>
      </div>
    </ProtectedRoute>
  );
}

