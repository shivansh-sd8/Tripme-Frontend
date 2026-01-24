import { Metadata } from "next";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import ServiceForm from "@/components/host/ServiceForm";

export const metadata: Metadata = {
  title: "Add New Service",
  description: "Create a new service listing on TripMe",
};

export default function NewServicePage() {
  return (
    <ProtectedRoute requireHost={true}>
      <ServiceForm />
    </ProtectedRoute>
  );
} 


