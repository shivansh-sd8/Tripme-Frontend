
import { Star, Heart, MessageCircle, Flag, User, Calendar } from "lucide-react";
import { Review } from "@/shared/types";
import { useState } from "react";
// interface ReviewCardProps {
//   review: {
//     rating: number;
//     comment: string;
//     user: string;
//   };
// }

interface ReviewCardProps {
  review: Review;
  showResponse?: boolean;
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  canRespond?: boolean;
  onResponse?: (reviewId: string, response: string) => void;
}

export default function ReviewCard({
   review,
   showResponse,
   onHelpful,
   onReport,
   canRespond,
   onResponse,
   }: ReviewCardProps) {

   const [isHelpful, setIsHelpful] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState("");
 
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };
 
  const handleHelpful = () => {
    setIsHelpful(!isHelpful);
    onHelpful?.(review._id);
  };
 
  const handleSubmitResponse = () => {
    if (responseText.trim()) {
      onResponse?.(review._id, responseText);
      setResponseText("");
      setShowResponseForm(false);
    }
  };
  // return (
  //   // <div className="min-w-[280px] sm:min-w-0 bg-white rounded-2xl p-4 shadow-sm border">
  //   //   <div className="flex items-center gap-2 mb-2">
  //   //     <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
  //   //     <span className="text-sm font-medium">{review.rating}</span>
  //   //   </div>

  //   //   <p className="text-gray-700 text-sm line-clamp-4">
  //   //     {review.comment}
  //   //   </p>

  //   //   <p className="text-xs text-gray-500 mt-3">
  //   //     — {review.user}
  //   //   </p>
  //   // </div>

  //    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
  //     {/* Header */}
  //     <div className="flex items-start justify-between mb-4">
  //       <div className="flex items-center gap-3">
  //         <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
  //           {review.reviewer.profileImage ? (
  //             <img 
  //               src={review.reviewer.profileImage} 
  //               alt={review.reviewer.name}
  //               className="w-full h-full rounded-full object-cover"
  //             />
  //           ) : (
  //             <User className="w-5 h-5 text-gray-500" />
  //           )}
  //         </div>
  //         <div>
  //           <div className="flex items-center gap-2">
  //             <h4 className="font-medium text-gray-900">{review.reviewer.name}</h4>
  //             {review.isVerified && (
  //               <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
  //                 Verified Stay
  //               </span>
  //             )}
  //           </div>
  //           <div className="flex items-center gap-2 text-sm text-gray-500">
  //             <Calendar className="w-3 h-3" />
  //             <span>{review.createdAt ? formatDate(review.createdAt) : ""}</span>
  //           </div>
  //         </div>
  //       </div>
        
  //       {/* Overall Rating */}
  //       <div className="flex items-center gap-1">
  //         <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
  //         <span className="font-medium">{review.rating.overall}</span>
  //       </div>
  //     </div>
 
  //     {/* Category Ratings */}
  //     {/* <div className="grid grid-cols-3 gap-2 mb-4">
  //       {Object.entries(review.rating).slice(1).map(([category, rating]) => (
  //         <div key={category} className="flex items-center gap-2">
  //           <span className="text-xs text-gray-600 capitalize">
  //             {category.replace(/([A-Z])/g, ' $1').trim()}:
  //           </span>
  //           <div className="flex">
  //             {[1, 2, 3, 4, 5].map((star) => (
  //               <Star
  //                 key={star}
  //                 className={`w-3 h-3 ${
  //                   star <= rating 
  //                     ? 'fill-yellow-400 text-yellow-400' 
  //                     : 'text-gray-300'
  //                 }`}
  //               />
  //             ))}
  //           </div>
  //         </div>
  //       ))}
  //     </div> */}
 
  //     {/* Review Images */}
  //     {review.images && review.images.length > 0 && (
  //       <div className="flex gap-2 mb-4">
  //         {review.images.slice(0, 4).map((image, index) => (
  //           <img
  //             key={index}
  //             src={image}
  //             alt={`Review photo ${index + 1}`}
  //             className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80"
  //           />
  //         ))}
  //         {review.images.length > 4 && (
  //           <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-600">
  //             +{review.images.length - 4}
  //           </div>
  //         )}
  //       </div>
  //     )}
 
  //     {/* Comment */}
  //     <p className="text-gray-700 text-sm mb-4 leading-relaxed">
  //       {review.comment}
  //     </p>
 
  //     {/* Host Response */}
  //     {showResponse && review.response && (
  //       <div className="bg-gray-50 rounded-xl p-4 mb-4">
  //         <div className="flex items-center gap-2 mb-2">
  //           <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
  //             <span className="text-white text-xs font-medium">H</span>
  //           </div>
  //           <span className="text-sm font-medium text-gray-900">
  //             Response from {review.response.respondedBy.name}
  //           </span>
  //           <span className="text-xs text-gray-500">
  //             {formatDate(review.response.respondedAt)}
  //           </span>
  //         </div>
  //         <p className="text-sm text-gray-700">{review.response.comment}</p>
  //       </div>
  //     )}
 
  //     {/* Response Form for Host */}
  //     {canRespond && !review.response && (
  //       <div className="mb-4">
  //         {!showResponseForm ? (
  //           <button
  //             onClick={() => setShowResponseForm(true)}
  //             className="text-sm text-blue-600 hover:text-blue-700 font-medium"
  //           >
  //             Respond to review
  //           </button>
  //         ) : (
  //           <div className="space-y-3">
  //             <textarea
  //               value={responseText}
  //               onChange={(e) => setResponseText(e.target.value)}
  //               placeholder="Write a response to this review..."
  //               className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  //               rows={3}
  //             />
  //             <div className="flex gap-2">
  //               <button
  //                 onClick={handleSubmitResponse}
  //                 className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
  //               >
  //                 Submit Response
  //               </button>
  //               <button
  //                 onClick={() => {
  //                   setShowResponseForm(false);
  //                   setResponseText("");
  //                 }}
  //                 className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg"
  //               >
  //                 Cancel
  //               </button>
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     )}
 
  //     {/* Actions */}
  //     <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
  //       <button
  //         onClick={handleHelpful}
  //         className={`flex items-center gap-1 text-sm ${
  //           isHelpful ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
  //         }`}
  //       >
  //         <Heart className={`w-4 h-4 ${isHelpful ? 'fill-current' : ''}`} />
  //         <span>Helpful ({review.helpfulCount})</span>
  //       </button>
        
  //       <button
  //         onClick={() => onReport?.(review._id)}
  //         className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
  //       >
  //         <Flag className="w-4 h-4" />
  //         <span>Report</span>
  //       </button>
  //     </div>
  //   </div>
  // );
return (
  <div className="bg-white pb-6 border-b border-gray-100">

    {/* HEADER */}
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
        {review.reviewer?.profileImage ? (
          <img
            src={review.reviewer.profileImage}
            alt={review.reviewer?.name || "Guest"}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-5 h-5 text-gray-500" />
        )}
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 leading-tight">
          {review.reviewer?.name || "Guest"}
        </h4>

        {/* <p className="text-xs text-gray-500">
          1 year on Tripme
        </p> */}
      </div>
    </div>

    {/* RATING + DATE (AIRBNB STYLE) */}
    <div className="flex items-center gap-2 text-sm mb-3">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-3 h-3 ${
              s <= review.rating.overall
                ? "fill-black text-black"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>

      <span className="text-gray-500">
        • {review.createdAt ? formatDate(review.createdAt) : ""}
      </span>
    </div>

    {/* REVIEW TEXT */}
    <p className="text-gray-800 text-sm leading-6 line-clamp-4">
      {review.comment}
    </p>

    {/* SHOW MORE */}
    <button className="text-sm underline mt-2 font-medium">
      Show more
    </button>

    {/* HOST RESPONSE */}
    {showResponse && review.response && (
      <div className="mt-4 bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-900 mb-1">
          Response from {review.response.respondedBy?.name || "Host"}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          {review.response.respondedAt ? formatDate(review.response.respondedAt) : ""}
        </p>
        <p className="text-sm text-gray-700">
          {review.response.comment}
        </p>
      </div>
    )}

    {/* ACTIONS */}
    <div className="flex items-center gap-4 mt-4 text-sm">
      <button
        onClick={handleHelpful}
        className={`flex items-center gap-1 ${
          isHelpful
            ? "text-gray-900"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <Heart className={`w-4 h-4 ${isHelpful ? "fill-current" : ""}`} />
        Helpful ({review.helpfulCount})
      </button>

      <button
        onClick={() => onReport?.(review._id)}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
      >
        <Flag className="w-4 h-4" />
        Report
      </button>
    </div>
  </div>
);


}

