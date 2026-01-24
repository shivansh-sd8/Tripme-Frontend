"use client";

import { X, Star } from "lucide-react";

interface ReviewsBottomSheetProps {
  open: boolean;
  onClose: () => void;
  reviews: any[];
}

export default function ReviewsBottomSheet({
  open,
  onClose,
  reviews,
}: ReviewsBottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 sm:hidden">
      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">

        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">
            All reviews ({reviews.length})
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {reviews.map((review, i) => (
            <div key={i} className="border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{review.rating}</span>
              </div>
              <p className="text-sm text-gray-700">{review.comment}</p>
              <p className="text-xs text-gray-500 mt-2">— {review.user}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
