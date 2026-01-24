import { Metadata } from "next";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PropertyForm from "@/components/host/PropertyForm";
import BecomeHostLanding from "@/components/host/BecomeHostLanding";
import RedirectOnboarding from "./redirect-onbording";
import HostHeader from "@/components/shared/HostHeader";

export const metadata: Metadata = {
  title: "Add New Property",
  description: "Create a new property listing on TripMe",
};

export default function NewPropertyPage() {
  return (
    <ProtectedRoute requireHost={true}>
       <HostHeader />
       <main className="pt-20">
          <RedirectOnboarding />
        </main>
     
      {/* <BecomeHostLanding /> */}
    </ProtectedRoute>
  );
} 

{/* <div className="min-h-screen bg-gray-50">
        <HostHeader />
        <main className="pt-20">
          <BecomeHostLanding />
        </main>
        <Footer />
      </div> */}

