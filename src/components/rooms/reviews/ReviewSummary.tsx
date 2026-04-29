// import { Star } from "lucide-react";
// import { ReviewSummary } from "@/shared/types";

// interface ReviewSummaryProps {
//   summary: ReviewSummary;
// }

// export default function ReviewSummary({ summary }: ReviewSummaryProps) {
//   const categories = [
//     { key: 'cleanliness', label: 'Cleanliness' },
//     { key: 'communication', label: 'Communication' },
//     { key: 'checkIn', label: 'Check-in' },
//     { key: 'accuracy', label: 'Accuracy' },
//     { key: 'location', label: 'Location' },
//     { key: 'value', label: 'Value' }
//   ];

//   const totalPercentage = summary.totalReviews > 0 ? 100 : 0;

//   return (
//     <div className="bg-white rounded-2xl p-6 shadow-sm border">
//       <h3 className="text-xl font-semibold text-gray-900 mb-6">
//         Rating Summary
//       </h3>

//       {/* Overall Rating */}
//       <div className="flex items-center gap-4 mb-8">
//         <div className="text-center">
//           <div className="text-5xl font-bold text-gray-900">
//             {summary.averageRating.toFixed(1)}
//           </div>
//           <div className="flex items-center gap-1 justify-center mt-2">
//             {[1, 2, 3, 4, 5].map((star) => (
//               <Star
//                 key={star}
//                 className={`w-5 h-5 ${
//                   star <= Math.round(summary.averageRating)
//                     ? 'fill-yellow-400 text-yellow-400'
//                     : 'text-gray-300'
//                 }`}
//               />
//             ))}
//           </div>
//           <div className="text-sm text-gray-600 mt-1">
//             {summary.totalReviews} reviews
//           </div>
//         </div>

//         {/* Rating Breakdown */}
//         <div className="flex-1 space-y-2">
//           {[5, 4, 3, 2, 1].map((rating) => {
//             const count = summary.ratingBreakdown[rating as keyof typeof summary.ratingBreakdown];
//             const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
            
//             return (
//               <div key={rating} className="flex items-center gap-3">
//                 <div className="flex items-center gap-1 w-16">
//                   <span className="text-sm">{rating}</span>
//                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                 </div>
//                 <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
//                   <div
//                     className="bg-yellow-400 h-full rounded-full transition-all duration-300"
//                     style={{ width: `${percentage}%` }}
//                   />
//                 </div>
//                 <span className="text-sm text-gray-600 w-12 text-right">
//                   {count}
//                 </span>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Category Ratings */}
//       <div className="border-t pt-6">
//         <h4 className="font-medium text-gray-900 mb-4">Category Ratings</h4>
//         <div className="grid grid-cols-2 gap-4">
//           {categories.map(({ key, label }) => {
//             const rating = summary.categoryAverages[key as keyof typeof summary.categoryAverages];
            
//             return (
//               <div key={key} className="flex items-center justify-between">
//                 <span className="text-sm text-gray-700">{label}</span>
//                 <div className="flex items-center gap-2">
//                   <div className="flex">
//                     {[1, 2, 3, 4, 5].map((star) => (
//                       <Star
//                         key={star}
//                         className={`w-3 h-3 ${
//                           star <= Math.round(rating)
//                             ? 'fill-yellow-400 text-yellow-400'
//                             : 'text-gray-300'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   <span className="text-sm font-medium">{rating.toFixed(1)}</span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import {
  Sparkles,
  ShieldCheck,
  KeyRound,
  MessageSquare,
  Map,
  BadgeCheck,
  Tags,
  Crown
} from "lucide-react";

import { ReviewSummary } from "@/shared/types";

interface ReviewSummaryProps {
  summary: ReviewSummary;
  badge: any;
}


export default function ReviewSummaryAirbnb({ summary,badge }: ReviewSummaryProps) {
  const categories = [
    { key: "cleanliness", label: "Cleanliness", icon: Sparkles },
    { key: "accuracy", label: "Accuracy", icon: BadgeCheck },
    { key: "checkIn", label: "Check-in", icon: KeyRound },
    { key: "communication", label: "Communication", icon: MessageSquare },
    { key: "location", label: "Location", icon: Map },
    { key: "value", label: "Value", icon: Tags },
  ];

  const heroBadge = badge;

  return (
    <section className="bg-white rounded-2xl border-white/20 shadow-sm p-8">
      {/* TOP SECTION */}
      <div className="flex flex-col items-center text-center mb-10">
       

        <div className="text-2xl md:4xl font-semibold text-gray-900">
          {summary.averageRating.toFixed(2)}
        </div>
            
       <h3 className="flex items-center justify-center gap-2 text-4xl font-semibold mt-4">
           <span className="text-yellow-500 text-2xl">
      {badge.icon}
    </span>

    {badge.label}
    </h3>

        <p className="text-gray-600 mt-2 max-w-lg">
          This home is a guest favourite based on ratings, reviews and
          reliability.
        </p>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-7 border-t pt-8 gap-6">

        {/* LEFT — Overall rating bars */}
        <div className="lg:col-span-2">
          <h4 className="text-lg font-semibold mb-4">Overall rating</h4>

          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              summary.ratingBreakdown[
                rating as keyof typeof summary.ratingBreakdown
              ];

            const percentage =
              summary.totalReviews > 0
                ? (count / summary.totalReviews) * 100
                : 0;

            return (
              <div key={rating} className="flex items-center gap-3 mb-2">
                <span className="w-3 text-sm">{rating}</span>

                <div className="flex-1 bg-gray-200 h-1 rounded-full">
                  <div
                    className="bg-gray-900 h-1 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT — Category scores */}
        <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map(({ key, label, icon: Icon }) => {
            const rating =
              summary.categoryAverages[
                key as keyof typeof summary.categoryAverages
              ];

            return (
              <div
                key={key}
                className="flex flex-col justify-between border-l pl-6"
              >
                <div>
                  <h5 className="text-sm text-gray-600">{label}</h5>
                  <p className="text-2xl font-semibold text-gray-900">
                    {rating.toFixed(1)}
                  </p>
                </div>

                <Icon className="w-6 h-6 text-gray-800 mt-4" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
