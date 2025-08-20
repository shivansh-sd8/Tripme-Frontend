import { Metadata } from "next";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import HostDashboardContent from "@/components/host/HostDashboardContent";

export const metadata: Metadata = {
  title: "Host Dashboard",
  description: "Manage your properties, services, and bookings",
};

export default function HostDashboardPage() {
  return (
    <ProtectedRoute requireHost={true}>
      <HostDashboardContent />
    </ProtectedRoute>
  );
} 