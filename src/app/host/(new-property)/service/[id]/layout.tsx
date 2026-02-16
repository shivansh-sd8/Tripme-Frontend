// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useSearchParams } from "next/navigation";
// import { serviceOnboarding , ServiceContextProvider } from "@/core/context/ServiceContext";
// import OnboardingLayout from "@/components/host/OnboardingLayout";
// import { apiClient } from "@/infrastructure/api/clients/api-client";
// import ProtectedRoute from "@/components/shared/ProtectedRoute";

// export default function ServiceEditLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//    <ServiceContextProvider>
//       <EditLoader>{children}</EditLoader>
//     </ServiceContextProvider>
//   );
// }

//  function EditLoader({ children }: { children: React.ReactNode }) {
//   const { id } = useParams();
//   const searchParams = useSearchParams();
//   const { updateData } = serviceOnboarding();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
 
//   const isEditMode = searchParams.get("mode") === "edit";
 
//   useEffect(() => {
//     if (!isEditMode || !id) {
//       setLoading(false);
//       return;
//     }
 
//     async function loadService() {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const response = await apiClient.getService(id as string);
        
//         if (response.success && response.data) {
//           // Convert backend data to frontend format
//           const serviceData = {
//             title: response.data.title,
//             description: response.data.description,
//             serviceType: response.data.serviceType,
//             location: response.data.location,
//             pricing: response.data.pricing,
//             groupSize: response.data.groupSize,
//             duration: response.data.duration,
//             // Convert media back to photos format
//             photos: {
//               images: response.data.media?.filter((m: any) => m.type === 'image').map((m: any) => m.url) || [],
//               videos: response.data.media?.filter((m: any) => m.type === 'video').map((m: any) => m.url) || []
//             }
//           };
          
//           updateData(serviceData);
//           console.log('✅ Service loaded for editing:', serviceData);
//         } else {
//           setError(response.message || 'Failed to load service');
//         }
//       } catch (err) {
//         console.error('❌ Error loading service:', err);
//         setError('Failed to load service');
//       } finally {
//         setLoading(false);
//       }
//     }
 
//     loadService();
//   }, [id, isEditMode, updateData]);
 
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading service...</p>
//         </div>
//       </div>
//     );
//   }
 
//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-96">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">{error}</p>
//           <button 
//             onClick={() => window.location.reload()} 
//             className="px-4 py-2 bg-black text-white rounded-lg"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }
 
//   return(
//   <ProtectedRoute requireHost>
//   {children}
//   </ProtectedRoute>)
// } 

// // function EditLoader({ children }: { children: React.ReactNode }) {
// //   const { id } = useParams();
// //   const searchParams = useSearchParams();
// //   const { updateData } = serviceOnboarding();

// //   const isEditMode = searchParams.get("mode") === "edit";

// //   useEffect(() => {
// //     if (!isEditMode) return;

// //     async function loadService() {
// //       const res = await fetch(`/api/services/${id}`);
// //       const service = await res.json();

// //       updateData(service);
// //     }

// //     loadService();
// //   }, [id, isEditMode, updateData]);

// //   return <>{children}</>;
// // }


"use client";

import { ServiceContextProvider } from "@/core/context/ServiceContext";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiClient } from "@/infrastructure/api/clients/api-client";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { serviceOnboarding } from "@/core/context/ServiceContext";

export default function ServiceEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServiceContextProvider>
      <EditLoader>{children}</EditLoader>
    </ServiceContextProvider>
  );
}

function EditLoader({ children }: { children: React.ReactNode }) {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { updateData } = serviceOnboarding();

  const [loading, setLoading] = useState(true);
  const isEditMode = searchParams.get("mode") === "edit";

  useEffect(() => {
    if (!isEditMode || !id) {
      setLoading(false);
      return;
    }

    async function loadService() {
      const response = await apiClient.getService(id as string);

      if (response.success && response.data) {
       
 const mappedData = {
    ...response.data.service,
   
    serviceCategory: response.data.service.serviceType || response.data.service.category || response.data.service.serviceCategory,
    title: response.data.service.title,
    description: response.data.service.description,
    location: response.data.service.location,
    photos: {
    images: response.data.service.media?.filter((m: any) => m.type === 'image').map((m: any) => m.url) || [],
    videos: response.data.service.media?.filter((m: any) => m.type === 'video').map((m: any) => m.url) || []
  },
    pricing: response.data.service.pricing,
    groupSize: response.data.service.groupSize,
    duration: response.data.service.duration, 
    // ... other mappings
  };
  console.log(response.data.service);
  console.log(mappedData);
        updateData(mappedData);
      }

      setLoading(false);
    }

    loadService();
  }, [id, isEditMode]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  return <ProtectedRoute requireHost>{children}</ProtectedRoute>;
}
