import React from 'react';
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import HostListingsContent from '@/components/host/HostListingsContent';

export default function HostListingsPage() {
  return (
    <ProtectedRoute requireHost={true}>
      <HostListingsContent />
    </ProtectedRoute>
  );
} 