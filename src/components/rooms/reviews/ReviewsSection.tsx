"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import ReviewsHorizontalList from "./ReviewsHorizontalList";
import ReviewsBottomSheet from "./ReviewsBottomSheet";

interface ReviewsSectionProps {
  property: any;
}

export default function ReviewsSection({ property }: ReviewsSectionProps) {
  const [open, setOpen] = useState(false);
  const reviews = property.reviews || [];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-5 sm:p-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
            Reviews
          </h2>
        </div>

        <div className="flex items-center gap-1 text-sm sm:text-base">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{property.rating || 4.5}</span>
          <span className="text-gray-500">
            ({property.reviewCount || reviews.length})
          </span>
        </div>
      </div>

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="text-center py-10">
          <div className="text-5xl mb-3">⭐</div>
          <h3 className="text-lg font-semibold">No reviews yet</h3>
          <p className="text-sm text-gray-600">
            Be the first to review this property!
          </p>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <>
          <ReviewsHorizontalList reviews={reviews} />

          {reviews.length > 5 && (
            <button
              onClick={() => setOpen(true)}
              className="mt-4 w-full sm:hidden rounded-xl border border-gray-300 py-3 text-sm font-medium hover:bg-gray-50"
            >
              Show all {reviews.length} reviews
            </button>
          )}
        </>
      )}

      <ReviewsBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        reviews={reviews}
      />
    </div>
  );
}
