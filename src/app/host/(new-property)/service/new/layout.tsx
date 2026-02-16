// import { ServiceDraftProvider } from "@/components/host/ServiceContext";
// import ProtectedRoute from "@/components/shared/ProtectedRoute";
// import { OnboardingProvider } from "@/core/context/OnboardingContext";

// export default function Layout({ children }: any) {
//   return (
//     <ProtectedRoute>
//     {/* <ServiceDraftProvider>
//       {children}
//     </ServiceDraftProvider> */}
//      <OnboardingProvider flow="service">
//         <ServiceDraftProvider>
//             {children}
//           </ServiceDraftProvider>
//           </OnboardingProvider>

//     </ProtectedRoute>
//   );
// }


"use client";


import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ServiceContextProvider } from "@/core/context/ServiceContext";
import Image from "next/image";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function ServiceNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   
     <ProtectedRoute>
      <ServiceContextProvider >  
        {children}  
      </ServiceContextProvider>
    </ProtectedRoute>
  );
}
