import { Metadata } from "next";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import UserHeader from "@/components/shared/UserHeader";
import Footer from "@/components/shared/Footer";
import KYCSubmissionContent from "@/components/user/KYCSubmissionContent";

export const metadata: Metadata = {
  title: "Become a Host - Identity Verification",
  description: "Complete your identity verification to become a host and start earning",
};

export default function KYCPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <main className="pt-20">
          <KYCSubmissionContent />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
} 