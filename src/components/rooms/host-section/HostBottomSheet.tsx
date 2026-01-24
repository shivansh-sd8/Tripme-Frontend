// "use client";

// import { X } from "lucide-react";
// import { useRouter } from "next/navigation";
// import HostProfileCard from "./HostProfileCard";
// import HostReviews from "./HostReviews";

// export default function HostBottomSheet() {
//   const router = useRouter();

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40">
//       <div className="absolute bottom-0 w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto p-5">
        
//         {/* Close */}
//         <button
//           onClick={() => router.back()}
//           className="absolute right-4 top-4"
//         >
//           <X className="w-6 h-6" />
//         </button>

//         <HostProfileCard />
//         <HostReviews />
//       </div>
//     </div>
//   );
// }


"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import HostProfileCard from "./HostProfileCard";
import HostReviews from "./HostReviews";

export default function HostBottomSheet({ host }: { host: any }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto p-5">
        
        {/* Close Button */}
        <button
          onClick={() => router.back()}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Host Profile Content */}
        <div className="mt-8">
          <HostProfileCard host={host} />
          <HostReviews hostId={host._id} />
        </div>
      </div>
    </div>
  );
}