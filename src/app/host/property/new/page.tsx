import { Metadata } from "next";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PropertyForm from "@/components/host/PropertyForm";

export const metadata: Metadata = {
  title: "Add New Property",
  description: "Create a new property listing on TripMe",
};

export default function NewPropertyPage() {
  return (
    <ProtectedRoute requireHost={true}>
      <PropertyForm />
    </ProtectedRoute>
  );
} 