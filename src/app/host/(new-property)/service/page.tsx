import React from "react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import HostServicesContent from "@/components/host/HostServicesContent";

export default function HostServicePage() {
  return (
    <ProtectedRoute requireHost={true}>
      <HostServicesContent />
    </ProtectedRoute>
  );
} 