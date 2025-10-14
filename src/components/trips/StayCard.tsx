import React from 'react';
import Image from 'next/image';
import { Heart, Star, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Stay } from '@/types';
import { formatPrice } from '@/shared/utils/pricingUtils';
import Card from '../ui/Card';

interface StayCardProps {
  stay: Stay;
  onFavorite?: (stayId: string) => void;
  isFavorite?: boolean;
  className?: string;
}

const StayCard: React.FC<StayCardProps> = ({
  stay,
  onFavorite,
  isFavorite = false,
  className
}) => {
  const [currentImage, setCurrentImage] = React.useState(0);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(stay.id);
  };

  // Example badge logic (customize as needed)
  const badge = stay.tags?.includes('superhost')
    ? 'Superhost'
    : stay.tags?.includes('favourite')
    ? 'Guest favourite'
    : null;

  const totalImages = stay.images.length;
  const showArrows = totalImages > 1;

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <Card
      variant="elevated"
      padding="none"
      className={`group cursor-pointer overflow-hidden bg-white rounded-3xl shadow-xl transition-transform duration-300 hover:scale-[1.025] hover:shadow-2xl ${className}`}
      style={{ minHeight: 380, maxWidth: 370 }}
    >
      {/* Image Section */}
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-t-3xl">
        <Image
          src={stay.images[currentImage]}
          alt={stay.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Image navigation arrows */}
        {showArrows && (
          <>
            <button
              onClick={goToPrev}
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-white rounded-full shadow-lg p-2 z-20 hover:bg-gray-100 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} className="text-gray-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-white rounded-full shadow-lg p-2 z-20 hover:bg-gray-100 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={22} className="text-gray-700" />
            </button>
            {/* Image indicator dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {stay.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === currentImage ? 'bg-purple-600' : 'bg-white border border-gray-300'}`}
                />
              ))}
            </div>
          </>
        )}
        {/* Badge */}
        {badge && (
          <span className="absolute top-3 left-3 bg-white text-xs font-semibold px-3 py-1 rounded-full shadow-md z-10">
            {badge}
          </span>
        )}
        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
        >
          <Heart
            size={22}
            className={`transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 pb-5 flex flex-col gap-1">
        {/* Title & Rating */}
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{stay.title}</h3>
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-900">{stay.rating}</span>
            <span className="text-xs text-gray-500">({stay.reviewCount})</span>
          </div>
        </div>
        {/* Subtitle/location */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
          <MapPin size={14} />
          <span>{stay.location.city}, {stay.location.state}</span>
        </div>
        {/* Capacity */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
          <Users size={13} />
          <span>Up to {stay.maxGuests} guests</span>
        </div>
        {/* Tags (as pills, below location/capacity) */}
        {stay.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-1">
            {stay.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-purple-50 text-xs font-medium text-purple-700 rounded-full border border-purple-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* Price */}
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="font-bold text-base text-gray-900">
              {formatPrice(stay.price.amount, stay.price.currency)}
            </span>
            <span className="text-xs text-gray-500"> / night</span>
          </div>
          {stay.instantBookable && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Instant Book
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StayCard; 