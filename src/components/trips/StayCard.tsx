import React from 'react';
import Image from 'next/image';
import { Heart, Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Stay } from '@/types';
import { formatCurrency } from '@/shared/constants/pricing.constants';

interface StayCardProps {
  stay: Stay;
  onFavorite?: (stayId: string) => void;
  isFavorite?: boolean;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  checkIn?: string;
  checkOut?: string;
  guest?: number;

}

const StayCard: React.FC<StayCardProps> = ({
  stay,
  onFavorite,
  isFavorite = false,
  className,
  onMouseEnter,
  onMouseLeave,
  checkIn,
  checkOut,
  guest
}) => {
  const [currentImage, setCurrentImage] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(stay.id);
  };

  // Enhanced badge logic
  const badge = stay.tags?.includes('superhost')
    ? { text: 'Superhost', color: 'bg-gradient-to-r from-purple-600 to-pink-600' }
    : stay.tags?.includes('favourite')
    ? { text: 'Guest favorite', color: 'bg-gradient-to-r from-orange-500 to-red-500' }
    : stay.tags?.includes('new')
    ? { text: 'New', color: 'bg-gradient-to-r from-green-500 to-emerald-500' }
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

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave?.();
  };



  const handleCardClick = () => {
  const params = new URLSearchParams();
  params.append('checkIn', checkIn || '');
  params.append('checkOut', checkOut || '');
  params.append('guest', guest?.toString() || '');

  window.open(`/rooms/${stay.id}?${params.toString()}`, '_blank');
    // Open property page in new tab
    
  };
const priceAmount =
  stay.price?.amount ;

const currency =
  stay.price?.currency || "INR";

  const imageSrc =
  typeof stay.images?.[currentImage] === "string"
    ? stay.images[currentImage]
    : stay.images?.[currentImage]?.url;

  

  return (
    <div
      className={`group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      {/* Vertical Layout - Airbnb Style */}
      <div className="w-full">
        {/* Image Section - Top */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            // src={stay.images[currentImage]}
            src={imageSrc || "/placeholder.jpg"}
            alt={stay.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Image Navigation Arrows */}
          {showArrows && isHovered && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={16} className="text-gray-700" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={16} className="text-gray-700" />
              </button>
            </>
          )}
          
          {/* Image Dots */}
          {showArrows && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {stay.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImage ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 hover:scale-110 shadow-lg"
          >
            <Heart
              size={18}
              className={`transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700 hover:text-red-500'
              }`}
            />
          </button>
          
          {/* Badge */}
          {badge && (
            <div className={`absolute top-4 left-4 ${badge.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg`}>
              {badge.text}
            </div>
          )}
        </div>

        {/* Content Section - Bottom */}
        <div className="p-4 space-y-2">
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-gray-700 transition-colors">
                {stay.title}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-500 truncate">
                  {stay.location.city}, {stay.location.state}
                </p>
              </div>
            </div>
            {stay.rating > 0 && (
              <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1 flex-shrink-0">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-900">{stay.rating}</span>
              </div>
            )}
          </div>
          
          {/* Property Details */}
          <div className="text-sm text-gray-600">
            {stay.bedrooms > 0 && `${stay.bedrooms} bedroom${stay.bedrooms > 1 ? 's' : ''}`}
            {stay.bedrooms > 0 && stay.beds > 0 && ' · '}
            {stay.beds > 0 && `${stay.beds} bed${stay.beds > 1 ? 's' : ''}`}
          </div>
          
          {/* Price */}

         {priceAmount &&( <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(stay.price.amount, stay.price.currency)}
            </span>
            <span className="text-sm text-gray-600 font-medium">night</span>
          </div> )}
        </div>
      </div>
    </div>
  );
};

export default StayCard; 