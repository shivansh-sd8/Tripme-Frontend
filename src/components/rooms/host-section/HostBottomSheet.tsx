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


// "use client";

// import { X } from "lucide-react";
// import { useRouter } from "next/navigation";
// import HostProfileCard from "./HostProfileCard";
// import HostReviews from "./HostReviews";

// export default function HostBottomSheet({ host }: { host: any }) {
//   const router = useRouter();

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40">
//       <div className="absolute bottom-0 w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto p-5">
        
//         {/* Close Button */}
//         <button
//           onClick={() => router.back()}
//           className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
//         >
//           <X className="w-6 h-6" />
//         </button>

//         {/* Host Profile Content */}
//         <div className="mt-8">
//           <HostProfileCard host={host} />
//           <HostReviews hostId={host._id} />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HostBottomSheet({ host }: { host: any }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl h-[90vh] overflow-y-auto p-5">
        
        {/* Close */}
        <button
          onClick={() => router.back()}
          className="absolute right-4 top-4"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Host Profile Content */}
        <div className="mt-8">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={host.profileImage || '/default-avatar.jpg'} 
              alt={host.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">{host.name}</h2>
              <p className="text-gray-600">Host</p>
              {host.isSuperhost && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                  Superhost
                </span>
              )}
            </div>
          </div>

          {/* Host Details */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-gray-600">{host.bio || 'No bio available'}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Contact</h3>
              <p className="text-gray-600">{host.email}</p>
              <p className="text-gray-600">{host.phone}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Stats</h3>
              <div className="flex gap-4 text-sm">
                <span>⭐ {host.rating || 0} rating</span>
                <span>📝 {host.reviewCount || 0} reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}