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
  guests?: number;
  onCardClick?: (stay: Stay) => void;
  varient?: "default" | "compact" | "featured";
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
  guests,
  onCardClick,
  varient = "default"
}) => {
  const [currentImage, setCurrentImage] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const stayId = stay.id || (stay as any)._id;
    if (stayId) {
      onFavorite?.(stayId);
    }
  };

  // Enhanced badge logic
  const isSuperhost = stay.tags?.includes('superhost') || stay.host?.isSuperhost;
  const isGuestFavorite = stay.tags?.includes('favourite') || stay.tags?.includes('top-rated') || (stay as any).isTopRated;
  const isFeatured = stay.tags?.includes('featured') || (stay as any).isFeatured;
  const isWeekendDeal = stay.tags?.includes('weekend-deal');
  const isNew = stay.tags?.includes('new') || (stay.createdAt && (new Date().getTime() - new Date(stay.createdAt).getTime()) < 14 * 24 * 60 * 60 * 1000);

  const badge = isSuperhost
    ? { text: 'Superhost', color: 'bg-gradient-to-r from-purple-600 to-pink-600' }
    : isGuestFavorite
    ? { text: 'Guest favorite', color: 'bg-gradient-to-r from-orange-500 to-red-500' }
    : isWeekendDeal
    ? { text: 'Weekend Deal', color: 'bg-gradient-to-r from-orange-400 to-amber-600' }
    : isFeatured
    ? { text: 'Featured', color: 'bg-gradient-to-r from-blue-600 to-cyan-600' }
    : isNew
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
  const stayId = stay.id || (stay as any)._id;
  if (!stayId) {
    onCardClick?.(stay);
    return;
  }

  try {
    const RECENT_PROPERTIES_KEY = 'tripme_recent_properties';
    const MAX_RECENT_PROPERTIES = 8;
    const stored = localStorage.getItem(RECENT_PROPERTIES_KEY);
    const recent = stored ? JSON.parse(stored) : [];
    const filtered = recent.filter((item: any) => (item.id || item._id) !== stayId);
    const recentProperty = {
      ...stay,
      id: stayId,
      viewedAt: new Date().toISOString()
    };
    const updated = [recentProperty, ...filtered].slice(0, MAX_RECENT_PROPERTIES);
    localStorage.setItem(RECENT_PROPERTIES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent property:', error);
  }

  onCardClick?.(stay);
  const params = new URLSearchParams();
  params.append('checkIn', checkIn || '');
  params.append('checkOut', checkOut || '');
  params.append('guests', guests?.toString() || '');

  window.open(`/rooms/${stayId}?${params.toString()}`, '_blank');
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
        <div className="relative  aspect-[4/3] w-full overflow-hidden">
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
          {showArrows && varient != "featured" && (
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
            className="absolute top-2 right-2 md:top-4 md:right-4 p-1 md:p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 hover:scale-110 shadow-lg z-30 pointer-events-auto"
            aria-label="Add to favorites"
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
            <div className={`absolute top-4 left-4 ${badge.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg z-20`}>
              {badge.text}
            </div>
          )}
        </div>

        {/* Content Section - Bottom */}
        <div className="p-2 space-y-[2px] md:p-4 space-y-1 md:space-y-2">
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-1 md:gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-xs md:text-base leading-tight  line-clamp-1 h-[16px] group-hover:text-gray-700 transition-colors">
                {stay.title}
              </h3>
              { varient == "featured" &&( 
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-[#4285f4] flex-shrink-0" />
                <p className="text-xs md:text-sm text-gray-500 truncate">
                  {stay.location.city}, {stay.location.state}
                </p>
              </div>
)}
            </div>
            {/* {stay.rating > 0 && (
              <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1 flex-shrink-0">
                <Star  className=" w-2 h-2 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] md:text-sm font-semibold text-gray-900">{stay.rating}</span>
              </div>
            )} */}
          </div>
          
          {/* Property Details */}
          <div className="text-[10px] md:text-sm text-gray-600">
            {stay.bedrooms > 0 && `${stay.bedrooms} bedroom${stay.bedrooms > 1 ? 's' : ''}`}
            {stay.bedrooms > 0 && stay.beds > 0 && ' · '}
            {/* {stay.beds > 0 && `${stay.beds} bed${stay.beds > 1 ? 's' : ''}`} */}
             {stay.rating > 0 ? (
        
          <span>★{stay.rating}</span>
      
      ) : (
        <span className="invisible">★ 0</span>
      )}
          </div>
          
          {/* Price */}

         {priceAmount &&( <div className="flex items-baseline gap-1">
            <span className="text-xs md:text-lg font-bold text-gray-900">
              {formatCurrency(stay.price.amount, stay.price.currency)}
            </span>
            <span className="text-xs md:text-sm text-gray-600 font-medium">night</span>
          </div> )}
        </div>
      </div>
    </div>
  );
};

export default StayCard; 
