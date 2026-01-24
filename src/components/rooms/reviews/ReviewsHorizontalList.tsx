import ReviewCard from "./ReviewCard";

interface ReviewsHorizontalListProps {
  reviews: any[];
}

export default function ReviewsHorizontalList({ reviews }: ReviewsHorizontalListProps) {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3">
      {reviews.slice(0, 5).map((review, i) => (
        <ReviewCard key={i} review={review} />
      ))}
    </div>
  );
}
