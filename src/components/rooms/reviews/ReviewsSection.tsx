
"use client";

import { useState, useEffect } from "react";
import { Crown, Star } from "lucide-react";
import ReviewsHorizontalList from "./ReviewsHorizontalList";
import ReviewsBottomSheet from "./ReviewsBottomSheet";
import ReviewSummary from "./ReviewSummary";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";
import { ReviewService } from "@/core/services/review.service";

import { Review, ReviewSummary as ReviewSummaryType } from "@/shared/types";

interface ReviewsSectionProps {
  property: any;
  userBooking?: any; // User's booking for this property
  isHost?: boolean;
}

export default function ReviewsSection({ 
  property, 
  userBooking,
  isHost = false 
}: ReviewsSectionProps) {
  const [open, setOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummaryType | null>(null);
  const [reviews, setReviews] = useState<Review[]>(property.reviews || []);
  const [loading, setLoading] = useState(false);

  const reviewService = ReviewService.getInstance();

  useEffect(() => {
    loadReviewSummary();
  }, [property._id]);

  useEffect(() => {
  loadReviews();
}, [property._id]);

const loadReviews = async () => {
  try {
    setLoading(true);
    const response = await reviewService.getListingReviews(property._id);
    if (response.success && response.data) {
      setReviews(response.data.reviews || response.data || []);
    }
  } catch (error) {
    console.error('Failed to load reviews:', error);
  } finally {
    setLoading(false);
  }
};

  const loadReviewSummary = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getPropertyReviewSummary(property._id);
      if (response.success && response.data) {
        setReviewSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to load review summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData: any) => {
    if (!userBooking) return;
    
    try {
      const response = await reviewService.createReview(userBooking._id, reviewData);
      if (response.success && response.data) {
        setReviews(prev => [response.data!, ...prev]);
        setShowReviewForm(false);
        await loadReviewSummary(); // Refresh summary
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleResponse = async (reviewId: string, response: string) => {
    try {
      const res = await reviewService.respondToReview(reviewId, response);
      if (res.success && res.data) {
        setReviews(prev => 
          prev.map(review => 
            review._id === reviewId ? res.data! : review
          )
        );
      }
    } catch (error) {
      console.error('Failed to respond to review:', error);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await reviewService.markReviewHelpful(reviewId);
      setReviews(prev => 
        prev.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulCount: review.helpfulCount + 1 }
            : review
        )
      );
    } catch (error) {
      console.error('Failed to mark review helpful:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      {/* {reviewSummary && (
        <ReviewSummary summary={reviewSummary}  />
      )} */}

      {reviewSummary && (
  <ReviewSummary 
    summary={reviewSummary}
    badge={property?.badges?.highlight[0] || []}
  />
)}

      {/* Reviews Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-5 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#4285f4] rounded-xl flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900">
              Reviews
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Write Review Button */}
            {userBooking && !userBooking.review && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Write a Review
              </button>
            )}

            {/* Rating Display */}
            <div className="flex items-center gap-1 text-sm sm:text-base">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">
                {reviewSummary?.averageRating || property.rating || 0}
              </span>
              <span className="text-gray-500">
                ({reviewSummary?.totalReviews || property.reviewCount || reviews.length})
              </span>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="mb-6">
            <ReviewForm
              bookingId={userBooking._id}
              propertyTitle={property.title}
              onSubmit={handleSubmitReview}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}

        {/* Empty State */}
        {reviews.length === 0 && !showReviewForm && (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">⭐</div>
            <h3 className="text-lg font-semibold">No reviews yet</h3>
            <p className="text-sm text-gray-600">
              Be the first to review this property!
            </p>
          </div>
        )}

        {/* Reviews List */}
        {/* {reviews.length > 0 && !showReviewForm && (
          <>
            <div className="space-y-4 mb-6">
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onHelpful={handleHelpful}
                  canRespond={isHost}
                  onResponse={handleResponse}
                />
              ))}
            </div>

            {reviews.length > 3 && (
              <button
                onClick={() => setOpen(true)}
                className="w-full sm:hidden rounded-xl border border-gray-300 py-3 text-sm font-medium hover:bg-gray-50"
              >
                Show all {reviews.length} reviews
              </button>
            )}
          </>
        )} */}

        {/* Reviews List */}
{reviews.length > 0 && !showReviewForm && (
  <>
    {/* MOBILE — horizontal scroll */}
    <div className="md:hidden">
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
        {reviews.slice(0, 8).map((review) => (
          <div
            key={review._id}
            className="min-w-[85%] snap-start"
          >
            <ReviewCard
              review={review}
              onHelpful={handleHelpful}
              canRespond={isHost}
              onResponse={handleResponse}
            />
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {reviews.length > 8 && (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 w-full rounded-xl border border-gray-300 py-3 text-sm font-medium hover:bg-gray-50"
        >
          Show all {reviews.length} reviews
        </button>
      )}
    </div>

    {/* DESKTOP — 2 column grid */}
    <div className="hidden md:grid grid-cols-2 gap-6 mb-6">
      {reviews.map((review) => (
        <ReviewCard
          key={review._id}
          review={review}
          onHelpful={handleHelpful}
          canRespond={isHost}
          onResponse={handleResponse}
        />
      ))}
    </div>
  </>
)}


        <ReviewsBottomSheet
          open={open}
          onClose={() => setOpen(false)}
          reviews={reviews}
        />
      </div>
    </div>
  );
}