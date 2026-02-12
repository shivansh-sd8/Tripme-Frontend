import { Metadata } from "next";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import RedirectToServices from "./redirect-services";
import ServiceForm from "@/components/host/ServiceForm";
import HostHeader from "@/components/shared/HostHeader";

export const metadata: Metadata = {
  title: "Add New Service",
  description: "Create a new service listing on TripMe",
};

export default function NewServicePage() {
  return (
    <ProtectedRoute requireHost={true}>
      
       <main className="pt-20">
                <RedirectToServices />
               </main>
       
      {/* <ServiceForm /> */}
    </ProtectedRoute>
  );
} 


