// import HostProfileCard from "./HostProfileCard";
// import HostReviews from "./HostReviews";

// export default function HostDesktopLayout() {
//   return (
//     <div className="max-w-6xl mx-auto px-8 py-12">
//       <div className="grid grid-cols-[380px_1fr] gap-12">
//         <HostProfileCard />
//         <HostReviews />
//       </div>
//     </div>
//   );
// }

// import HostProfileCard from "./HostProfileCard";
// import HostReviews from "./HostReviews";

// export default function HostDesktopLayout({ host }: { host: any }) {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Full page host profile content */}
//       <div className="max-w-6xl mx-auto px-8 py-12">
//         <HostProfileCard host={host} />
//         <HostReviews hostId={host._id} />
//       </div>
//     </div>
//   );
// }


// import { useRouter } from "next/navigation";
// import { ArrowLeft } from "lucide-react";

// export default function HostDesktopLayout({ host }: { host: any }) {

//   const router = useRouter();
//   return (
//     <div className="min-h-screen bg-gray-50">

//          <div className="max-w-6xl mx-auto px-8 pt-8">
//         <button
//           onClick={() => router.back()}
//           className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           Back
//         </button>
//       </div>
//       {/* Full page host profile content */}
//       <div className="max-w-6xl mx-auto px-8 py-12">
        
//         {/* Host Profile Section */}
//         <div className="bg-white rounded-2xl shadow p-8 mb-8">
//           <div className="flex items-start gap-8">
//             <img 
//               src={host.profileImage || '/default-avatar.jpg'} 
//               alt={host.name}
//               className="w-32 h-32 rounded-full object-cover"
//             />
//             <div className="flex-1">
//               <h1 className="text-3xl font-bold mb-2">{host.name}</h1>
//               <p className="text-gray-600 mb-4">Host</p>
              
//               {host.isSuperhost && (
//                 <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-4">
//                   ⭐ Superhost
//                 </span>
//               )}

//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <div>
//                   <h3 className="font-semibold mb-1">Rating</h3>
//                   <p className="text-2xl">⭐ {host.rating || 0}</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold mb-1">Reviews</h3>
//                   <p className="text-2xl">📝 {host.reviewCount || 0}</p>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="font-semibold mb-2">About</h3>
//                 <p className="text-gray-600">{host.bio || 'No bio available'}</p>
//               </div>

//               <div className="mt-6">
//                 <h3 className="font-semibold mb-2">Contact</h3>
//                 <p className="text-gray-600">📧 {host.email}</p>
//                 <p className="text-gray-600">📱 {host.phone}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats Section */}
//         <div className="bg-white rounded-2xl shadow p-8">
//           <h2 className="text-2xl font-bold mb-6">Host Statistics</h2>
//           <div className="grid grid-cols-4 gap-6">
//             <div className="text-center">
//               <div className="text-3xl mb-2">⭐</div>
//               <div className="font-semibold">{host.rating || 0}</div>
//               <div className="text-gray-600 text-sm">Rating</div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl mb-2">📝</div>
//               <div className="font-semibold">{host.reviewCount || 0}</div>
//               <div className="text-gray-600 text-sm">Reviews</div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl mb-2">🏠</div>
//               <div className="font-semibold">{host.listings?.length || 0}</div>
//               <div className="text-gray-600 text-sm">Listings</div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl mb-2">⚡</div>
//               <div className="font-semibold">{host.responseRate || 0}%</div>
//               <div className="text-gray-600 text-sm">Response Rate</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import StayCard from "@/components/trips/StayCard";

export default function HostDesktopLayout({ host,hostListings }: { host: any,hostListings:any[] }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-8 pt-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Full page host profile content */}
      <div className="max-w-6xl mx-auto px-8 pb-12">
        
        {/* Host Profile Section */}
        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <div className="flex items-start gap-8">
            <img 
              src={host.profileImage || '/default-avatar.jpg'} 
              alt={host.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{host.name}</h1>
              <p className="text-gray-600 mb-4">Host</p>
              
              {host.isSuperhost && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mb-4">
                  ⭐ Superhost
                </span>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-1">Rating</h3>
                  <p className="text-2xl">⭐ {host.rating || 0}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Reviews</h3>
                  <p className="text-2xl">📝 {host.reviewCount || 0}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-gray-600">{host.bio || 'No bio available'}</p>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Contact</h3>
                <p className="text-gray-600">📧 {host.email}</p>
                <p className="text-gray-600">📱 {host.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Host Statistics</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-semibold">{host.rating || 0}</div>
              <div className="text-gray-600 text-sm">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <div className="font-semibold">{host.reviewCount || 0}</div>
              <div className="text-gray-600 text-sm">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏠</div>
              <div className="font-semibold">
                 {hostListings?.length || 0}
              </div>
              <div className="text-gray-600 text-sm">Listings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-semibold">{host.responseRate || 0}%</div>
              <div className="text-gray-600 text-sm">Response Rate</div>
            </div>
          </div>
        </div>

        {/* host listing */}
        <section className="mt-12">
          <h2 className="font-bold text-2xl mb-6">Host Listings</h2>
         
            <div className="relative mt-6">
                                
                                   <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                     
                                       {hostListings?.map((Hostlisting: any) => (
                                         <div key={Hostlisting._id} className="flex-shrink-0">
                                           <StayCard
                                             stay={Hostlisting}
                                             className="w-72"
      
                                           />
                                         </div>
                                       ))}  
                                   
                                   </div>
                                  
                                 
                               </div>
        </section>
      </div>
    </div>
  );
}