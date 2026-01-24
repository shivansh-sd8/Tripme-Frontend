// // import { ShieldCheck, Star } from "lucide-react";

// // export default function HostProfileCard() {
// //   return (
// //     <div className="bg-white rounded-2xl shadow p-6">
// //       <img
// //         src="/host.jpg"
// //         className="w-28 h-28 rounded-full mx-auto"
// //       />

// //       <h2 className="text-2xl font-bold text-center mt-4">
// //         Dhanraj
// //       </h2>

// //       <div className="flex justify-center gap-6 mt-4 text-center">
// //         <div>
// //           <p className="font-semibold">206</p>
// //           <p className="text-sm text-gray-600">Reviews</p>
// //         </div>
// //         <div>
// //           <p className="font-semibold">4.96 ★</p>
// //           <p className="text-sm text-gray-600">Rating</p>
// //         </div>
// //         <div>
// //           <p className="font-semibold">8</p>
// //           <p className="text-sm text-gray-600">Months hosting</p>
// //         </div>
// //       </div>

// //       <div className="flex items-center justify-center gap-2 mt-4 text-sm">
// //         <ShieldCheck className="w-4 h-4" />
// //         Superhost · Identity verified
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import Link from "next/link";
// import { Star, Users } from "lucide-react";

// export default function HostProfileCard({ host }: { host: any }) {
//   return (
//     <Link href={`/user/host/${host.id}`} className="block">
//       <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
//         <div className="flex items-center gap-4">
//           <div className="w-16 h-16 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center">
//             {host.profileImage ? (
//               <img src={host.profileImage} className="w-full h-full object-cover" />
//             ) : (
//               <Users className="w-8 h-8 text-indigo-600" />
//             )}
//           </div>

//           <div className="flex-1">
//             <h3 className="font-semibold text-lg">
//               {host.name}
//             </h3>

//             <div className="text-sm text-gray-600 flex items-center gap-1">
//               <Star className="w-4 h-4 fill-black" />
//               {host.rating} · {host.reviewCount} reviews
//             </div>

//             <p className="text-sm text-gray-500">
//               {new Date(host.createdAt).getFullYear()} on TripMe
//             </p>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }


"use client";

import { ShieldCheck, Star, MapPin, Globe, Calendar, Users } from "lucide-react";

export default function HostProfileCard({ host }: { host: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {/* Host Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
          {host.profileImage ? (
            <img src={host.profileImage} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{host.name}</h2>
            {host.isSuperhost && (
              <div className="flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm font-medium">
                <ShieldCheck className="w-4 h-4" />
                Superhost
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{host.rating || 4.5}</span>
              <span>· {host.reviewCount || 0} reviews</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Host since {new Date(host.createdAt).getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Host Bio */}
      {host.bio && (
        <p className="text-gray-700 mb-6">{host.bio}</p>
      )}

      {/* Host Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {host.responseRate && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold">{host.responseRate}%</p>
            <p className="text-sm text-gray-600">Response rate</p>
          </div>
        )}
        {host.responseTime && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold">{host.responseTime}</p>
            <p className="text-sm text-gray-600">Response time</p>
          </div>
        )}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold">{host.listings?.length || 0}</p>
          <p className="text-sm text-gray-600">Properties</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex flex-wrap gap-4">
        {host.location?.city && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{host.location.city}, {host.location.state}</span>
          </div>
        )}
        {host.languages && host.languages.length > 0 && (
          <div className="flex items-center gap-2 text-gray-600">
            <Globe className="w-4 h-4" />
            <span>Speaks {host.languages.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}