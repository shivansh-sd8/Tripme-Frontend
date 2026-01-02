import { Metadata } from "next";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import HostHeader from "@/components/shared/HostHeader";
import Footer from "@/components/shared/Footer";
import BecomeHostContent from "@/components/host/BecomeHostContent";

export const metadata: Metadata = {
  title: "Become a Host",
  description: "Start hosting your property or service on TripMe and earn money",
};

export default function BecomeHostPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <HostHeader />
        <main className="pt-20">
          <BecomeHostContent />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
} 