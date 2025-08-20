"use client";
import React from 'react';
import Image from 'next/image';
import { Heart, MapPin, Users, Clock, Briefcase } from 'lucide-react';
import Card from '../ui/Card';
import Link from 'next/link';

interface ServiceCardProps {
  service: {
    _id: string;
    title: string;
    media: { url: string }[];
    pricing: {
      basePrice: number;
      currency: string;
    };
    location: {
      city: string;
      state: string;
    };
    groupSize: {
      max: number;
    };
    duration: {
      value: number;
      unit: string;
    };
    serviceType: string;
    description: string;
  };
  onFavorite?: (serviceId: string) => void;
  isFavorite?: boolean;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onFavorite,
  isFavorite = false,
  className
}) => {
  const formatPrice = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(service._id);
  };

  return (
    <Link href={`/services/${service._id}`} passHref legacyBehavior>
      <a style={{ textDecoration: 'none', color: 'inherit' }}>
        <Card 
          variant="elevated" 
          padding="none" 
          className={`group cursor-pointer overflow-hidden ${className}`}
        >
          {/* Image Section */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={service.media?.[0]?.url || '/placeholder-service.jpg'}
              alt={service.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Favorite Button */}
            <button
              onClick={handleFavorite}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
            >
              <Heart
                size={20}
                className={`transition-colors ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
            
            {/* Service Type Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-purple-700 rounded-full">
                {service.serviceType}
              </span>
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-emerald-600 font-bold text-sm">₹</span>
                <span className="text-xs font-semibold ml-1">{formatPrice(service.pricing.basePrice, service.pricing.currency).replace('₹', '')}</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <MapPin size={14} />
              <span>{service.location.city}, {service.location.state}</span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
              {service.title}
            </h3>

            {/* Service Details */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>Max {service.groupSize.max}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{service.duration.value} {service.duration.unit}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {service.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-900">
                  {formatPrice(service.pricing.basePrice, service.pricing.currency)}
                </span>
                <span className="text-sm text-gray-600"> / service</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Briefcase size={14} className="text-purple-600" />
                <span className="text-xs text-purple-600 font-medium">
                  {service.serviceType}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </a>
    </Link>
  );
};

export default ServiceCard; 