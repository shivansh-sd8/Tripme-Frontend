import { Metadata } from "next";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import UserHeader from "@/components/shared/UserHeader";
import Footer from "@/components/shared/Footer";
import ProfileContent from "@/components/user/ProfileContent";
import ProfileRouter from "@/components/user/profileRoutes";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your TripMe profile and account settings",
};

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <main className="pt-20">
          <ProfileRouter />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
} 