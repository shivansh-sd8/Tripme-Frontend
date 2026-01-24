// "use client";

// import { useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { useHostStore } from "@/core/store/useHostStore";
// import HostBottomSheet from "@/components/rooms/host-section/HostBottomSheet";
// import HostDesktopLayout from "@/components/rooms/host-section/HostDesktopLayout";

// export default function HostPage() {
//   const params = useParams();
//   const hostId = params.id as string;
//   const host = useHostStore((s) => s.host);
//   const router = useRouter();

//   useEffect(() => {
//     if (!host) {
//       router.back(); // fallback if refreshed
//     }
//   }, [host, router]);

//   if (!host) {
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <p className="text-gray-500">Host data unavailable</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Mobile */}
//       <div className="lg:hidden">
//         <HostBottomSheet host={host} />
//       </div>

//       {/* Desktop */}
//       <div className="hidden lg:block">
//         <HostDesktopLayout host={host} />
//       </div>
//     </>
//   );
// }

"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useHostContext } from "@/core/store/useHostStore";
import HostBottomSheet from "@/components/rooms/host-section/HostBottomSheet";
import HostDesktopLayout from "@/components/rooms/host-section/HostDesktopLayout";

export default function HostPage() {
  const params = useParams();
  const hostId = params.id as string;
  const { host, loading, error, fetchHost } = useHostContext();
  const router = useRouter();

  useEffect(() => {
    if (hostId && !host && !loading) {
      fetchHost(hostId);
    }
  }, [hostId, host, loading, fetchHost]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading host profile...</p>
        </div>
      </div>
    );
  }

  if (error || !host) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Host not found'}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Bottom Sheet Style */}
      <div className="lg:hidden">
        <HostBottomSheet host={host} />
      </div>

      {/* Desktop View - Full Page Layout */}
      <div className="hidden lg:block">
        <HostDesktopLayout host={host} />
      </div>
    </>
  );
}