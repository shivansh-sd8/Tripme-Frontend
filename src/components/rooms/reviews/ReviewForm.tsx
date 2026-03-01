"use client";

import { useState } from "react";
import { Star, Upload, X } from "lucide-react";
import { ReviewFormData, Review } from "@/shared/types";

interface ReviewFormProps {
  bookingId: string;
  propertyTitle: string;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ReviewFormData>;
}

export default function ReviewForm({
  bookingId,
  propertyTitle,
  onSubmit,
  onCancel,
  initialData
}: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: {
      overall: initialData?.rating?.overall || 0,
      cleanliness: initialData?.rating?.cleanliness || 0,
      communication: initialData?.rating?.communication || 0,
      checkIn: initialData?.rating?.checkIn || 0,
      accuracy: initialData?.rating?.accuracy || 0,
      location: initialData?.rating?.location || 0,
      value: initialData?.rating?.value || 0,
    },
    comment: initialData?.comment || "",
    images: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const categories = [
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'communication', label: 'Communication' },
    { key: 'checkIn', label: 'Check-in' },
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'location', label: 'Location' },
    { key: 'value', label: 'Value' }
  ];

  const handleRatingChange = (category: keyof ReviewFormData['rating'], value: number) => {
    setFormData(prev => ({
      ...prev,
      rating: {
        ...prev.rating,
        [category]: value
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...(formData.images || []), ...files];
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = Object.values(formData.rating).reduce((sum, val) => sum + val, 0) / 6;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-gray-900">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Review your stay at {propertyTitle}
      </h3>
      <p className="text-gray-600 mb-6">
        Share your experience to help other travelers
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Overall Rating
          </label>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange('overall', star)}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= formData.rating.overall
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-lg font-medium">{averageRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Category Ratings */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Detailed Ratings
          </label>
          <div className="space-y-3">
            {categories.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 w-24">{label}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(key as keyof ReviewFormData['rating'], star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= formData.rating[key as keyof ReviewFormData['rating']]
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Your Review
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Describe your experience at this property..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Photos (optional)
          </label>
          <div className="space-y-3">
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Upload ${index + 1}`}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Add photos</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || formData.rating.overall === 0 || !formData.comment.trim()}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}