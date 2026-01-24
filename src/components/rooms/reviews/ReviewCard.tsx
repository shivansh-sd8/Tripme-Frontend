import { Star } from "lucide-react";

interface ReviewCardProps {
  review: {
    rating: number;
    comment: string;
    user: string;
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="min-w-[280px] sm:min-w-0 bg-white rounded-2xl p-4 shadow-sm border">
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{review.rating}</span>
      </div>

      <p className="text-gray-700 text-sm line-clamp-4">
        {review.comment}
      </p>

      <p className="text-xs text-gray-500 mt-3">
        — {review.user}
      </p>
    </div>
  );
}
