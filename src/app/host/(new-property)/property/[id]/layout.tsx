

"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiClient } from "@/infrastructure/api/clients/api-client";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { OnboardingProvider, useOnboarding } from "@/core/context/OnboardingContext";

export default function ServiceEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <EditLoader>{children}</EditLoader>
    </OnboardingProvider>
  );
}

function EditLoader({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { updateData } = useOnboarding();

  const [loading, setLoading] = useState(true);
  const isEditMode = searchParams.get("mode") === "edit";

  useEffect(() => {
    if (!isEditMode || !id) {
      setLoading(false);
      return;
    }

    async function loadListing() {
      const response = await apiClient.getListing(id as string);

      if (response.success && response.data) {
       
       const mappedData ={
        ...response.data.listing,
        propertyType : response.data.listing.placeType ,
        photos : response.data.listing.images
       }
       console.log(response.data.listing.images);
        console.log(response.data);
        updateData(mappedData);
      }

      setLoading(false);
    }

    loadListing();
  }, [id, isEditMode]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return <ProtectedRoute requireHost>{children}</ProtectedRoute>;
}
