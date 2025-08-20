"use client";
import React, { useEffect, useState, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { MapPin, Star, Users, Heart, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useAuth } from '@/core/store/auth-context';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import 'leaflet/dist/leaflet.css';

// Custom CSS for enhanced popups
const customPopupStyles = `
  .custom-popup .leaflet-popup-content-wrapper {
    background: transparent;
    box-shadow: none;
    border-radius: 16px;
    overflow: hidden;
  }
  .custom-popup .leaflet-popup-content {
    margin: 0;
    padding: 0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  }
  .custom-popup .leaflet-popup-tip {
    background: white;
    box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  }
  .custom-popup .leaflet-popup-close-button {
    display: none !important;
  }
`;
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, ChevronDown } from 'lucide-react';

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Helper for marker icon (Leaflet default icon fix for Next.js)
let markerIcon: any;
let getPriceBubbleIcon: any;

// Initialize Leaflet components on client side only
if (typeof window !== 'undefined') {
  const L = require('leaflet');
  
  markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  // Helper to create a price bubble icon
  getPriceBubbleIcon = (price: number | string, highlighted: boolean) => {
    return L.divIcon({
      className: '',
      html: `<div style="
        background: ${highlighted ? '#a259ff' : 'white'};
        color: ${highlighted ? 'white' : '#7c3aed'};
        border: 2px solid #a259ff;
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(80,0,120,0.10);
        font-weight: bold;
        font-size: 15px;
        padding: 6px 16px;
        min-width: 80px;
        text-align: center;
        transition: background 0.2s, color 0.2s;
        white-space: nowrap;
        ">
        ₹${price}
      </div>`
    });
  };
}

// Enhanced Popup Component with Carousel
function EnhancedPopup({ listing }: { listing: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get date range from search parameters
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  
  // Calculate number of nights
  const calculateNights = () => {
    if (checkIn && checkOut) {
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 1; // Default to 1 night if no dates selected
  };

  const nights = calculateNights();

  const nextImage = () => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing.images && listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="w-80 p-0 bg-white rounded-2xl shadow-xl overflow-hidden pr-3">
      {/* Image Carousel */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={listing.images?.[currentImageIndex] || listing.images?.[0] || '/logo.png'}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Arrows */}
        {listing.images && listing.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft size={14} className="text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
              aria-label="Next image"
            >
              <ChevronRight size={14} className="text-gray-700" />
            </button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {listing.images.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          <button className="bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200">
            <Heart size={14} className="text-gray-700" />
          </button>
          <button 
            className="bg-white/90 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              // Trigger the Leaflet close button
              const closeButton = e.currentTarget.closest('.leaflet-popup')?.querySelector('.leaflet-popup-close-button') as HTMLElement;
              if (closeButton) {
                closeButton.click();
              }
            }}
          >
            <X size={14} className="text-gray-700" />
          </button>
        </div>
      </div>
      
      {/* Property Details */}
      <div className="p-4 bg-white">
        {/* Title and Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1 line-clamp-1">
            {listing.title}
          </h3>
          {listing.rating && (
            <div className="flex items-center gap-1 ml-2">
              <Star size={12} className="fill-black text-black" />
              <span className="text-xs font-medium text-gray-900">
                {listing.rating} ({listing.reviews?.length || 0})
              </span>
            </div>
          )}
        </div>
        
        {/* Key Features */}
        <div className="space-y-1 mb-3">
          {listing.amenities && listing.amenities.length > 0 && (
            <p className="text-xs text-gray-600">
              {listing.amenities.slice(0, 2).join(' + ')}
            </p>
          )}
          {listing.bedrooms && (
            <p className="text-xs text-gray-600">
              {listing.bedrooms} bed{listing.bedrooms > 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-sm font-bold text-gray-900">
            ₹{((listing.pricing?.basePrice || 0) * nights).toLocaleString()}
          </span>
          {listing.pricing?.originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              ₹{((listing.pricing.originalPrice || 0) * nights).toLocaleString()}
            </span>
          )}
          <span className="text-xs text-gray-600">
            for {nights} night{nights > 1 ? 's' : ''}
          </span>
        </div>
        
        {/* View Details Button */}
        <button
          onClick={() => router.push(`/rooms/${listing._id}`)}
          className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 text-xs"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

// Enhanced Stay Card for the search page
function EnhancedStayCard({ stay }: { stay: any }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuth();
  
  // Check if current user is the host of this property
  const isOwnProperty = user && stay.host && (
    typeof stay.host === 'string' 
      ? stay.host === user._id 
      : stay.host._id === user._id || stay.host.id === user._id
  );

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stay.images && stay.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % stay.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stay.images && stay.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + stay.images.length) % stay.images.length);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer group border border-gray-100"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={stay.images?.[currentImageIndex] || stay.images?.[0] || '/logo.png'}
          alt={stay.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Navigation Arrows - Only show if multiple images */}
        {stay.images && stay.images.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            
            {/* Next Button */}
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {stay.images.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
        >
          <Heart
            size={20}
            className={`transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>
        
        {/* Property Type Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-full">
            {stay.type || 'Property'}
          </span>
          {isOwnProperty && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
              Your Property
            </span>
          )}
        </div>

        {/* Rating Badge */}
        {stay.rating && (
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-gray-900">{stay.rating}</span>
            </div>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3 z-30">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
            <span className="text-emerald-600 font-bold text-base">₹</span>
            <span className="text-sm font-bold ml-1 text-gray-900">
              {stay.pricing?.basePrice?.toLocaleString?.() || stay.pricing?.basePrice || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <MapPin size={14} />
          <span className="truncate">
            {stay.location?.city}, {stay.location?.state}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {stay.title}
        </h3>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {stay.maxGuests && (
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>Up to {stay.maxGuests} guests</span>
            </div>
          )}
          {stay.bedrooms && (
            <div className="flex items-center gap-1">
              <span>🛏️</span>
              <span>{stay.bedrooms} bed{stay.bedrooms > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {stay.amenities && stay.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {stay.amenities.slice(0, 3).map((amenity: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full"
              >
                {amenity}
              </span>
            ))}
            {stay.amenities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
                +{stay.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-xl">
              {formatPrice(stay.pricing?.basePrice || 0, stay.pricing?.currency || 'INR')}
            </span>
            <span className="text-sm text-gray-600"> / night</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isOwnProperty ? (
              <Button 
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={(e) => {
                  e.stopPropagation();
                  if (typeof window !== 'undefined') {
                    window.location.href = `/host/property/${stay._id}/edit`;
                  }
                }}
              >
                Edit Property
              </Button>
            ) : (
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                View Details
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Group stays by city
function groupByCity(listings: any[]) {
  const grouped: Record<string, any[]> = {};
  listings.forEach((stay) => {
    const city = stay.location?.city || 'Other';
    if (!grouped[city]) grouped[city] = [];
    grouped[city].push(stay);
  });
  return grouped;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed unused state variables
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Logout is handled by the auth service
      logout();
      if (router) router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get search parameters from URL
  const cityFromQuery = searchParams.get('location.city') || '';

  // Refresh user data when component mounts to ensure we have the latest role
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Only refresh once when component mounts
      const shouldRefresh = !user || user.role === 'guest';
      if (shouldRefresh) {
        refreshUser();
      }
    }
  }, [isAuthenticated, isLoading]); // Removed refreshUser from dependencies

  // Parse search params
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const params: any = {};
      // Get city and coordinates from URL
      const city = searchParams.get('location.city');
      const lng = searchParams.get('location[coordinates][0]');
      const lat = searchParams.get('location[coordinates][1]');
      if (city) params['location.city'] = city;
      if (lng && lat) {
        params['location[coordinates][0]'] = lng;
        params['location[coordinates][1]'] = lat;
        setMapCenter([parseFloat(lat), parseFloat(lng)]);
      }
      
      // Always fetch listings - if no city specified, show all available listings
      const res = await apiClient.getListings(params);
      let data: any[] = [];
      if (res?.data?.listings && Array.isArray(res.data.listings)) {
        data = res.data.listings;
      } else if (res?.data && Array.isArray(res.data)) {
        data = res.data;
      } else {
        data = [];
      }
      
      setListings(data);
      
      // Set map center based on listings if no specific coordinates provided
      if (!mapCenter && data.length > 0) {
        const firstListing = data[0];
        if (firstListing.location?.coordinates) {
          setMapCenter([firstListing.location.coordinates[1], firstListing.location.coordinates[0]]);
        }
      }
      
      setLoading(false);
    };
    fetchListings();
    // eslint-disable-next-line
  }, [searchParams]);

  // Scroll to highlighted card
  useEffect(() => {
    if (highlightedId && listRef.current) {
      const el = document.getElementById(`stay-card-${highlightedId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedId]);

  // Add custom CSS for popups
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = customPopupStyles;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Use the same Header component as home page */}
      <Header />

      {/* Main content: grid + map - Add top padding to account for fixed header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 pt-48 pb-16">
        {/* Stays grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 pt-2 pb-12 pr-0 lg:pr-8">
          <div className="col-span-full mb-4">
            <span className="text-base sm:text-lg font-medium text-gray-800">
              {cityFromQuery ? `Over ${listings.length} places in ${cityFromQuery}` : `${listings.length} places available`}
            </span>
            <span className="bg-pink-100 text-pink-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ml-2">Prices include all fees</span>
          </div>
                      {loading ? (
              <div className="col-span-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200"></div>
                    <div className="p-4 sm:p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="flex justify-between items-center pt-4">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 px-6">
              {/* Beautiful No Results Design */}
              <div className="max-w-md mx-auto text-center">
                {/* Illustration */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full flex items-center justify-center">
                      <MapPin className="w-10 h-10 text-purple-600" />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                  </div>
                </div>

                {/* Main Message */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4 font-display">
                  Exploring New Horizons
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed font-body">
                  Our team is working hard to bring amazing stays to {cityFromQuery || 'this location'}. 
                  We're constantly expanding our network of hosts and properties.
                </p>

                {/* Progress Indicator */}
                <div className="bg-gray-100 rounded-full p-1 mb-8 max-w-xs mx-auto">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full w-3/4"></div>
                </div>
                <p className="text-sm text-gray-500 mb-8">
                  We're actively working with local hosts to add properties here
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={() => router.push('/search')}
                  >
                    Explore Other Destinations
                  </Button>
                  {user?.role === 'host' ? (
                    <Button 
                      className="bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                      onClick={() => router.push('/host/dashboard')}
                    >
                      Host Dashboard
                    </Button>
                  ) : (
                    <Button 
                      className="bg-white border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                      onClick={() => router.push('/become-host')}
                    >
                      Become a Host
                    </Button>
                  )}
                </div>

                {/* Additional Info */}
                <div className="mt-12 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                  <h3 className="font-semibold text-gray-900 mb-3">What's happening?</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Verifying local hosts and properties</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Setting up quality standards</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Preparing for your amazing stay</span>
                    </div>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">Get notified when we're ready!</h4>
                  <p className="text-sm text-gray-600 mb-4">We'll let you know as soon as stays become available in this area.</p>
                  <div className="flex gap-2">
                    <Input 
                      type="email" 
                      placeholder="Enter your email"
                      className="flex-1"
                    />
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                      Notify Me
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            listings.map((listing) => (
              <div
                key={listing._id}
                id={`stay-card-${listing._id}`}
                className="relative transition-all duration-300 hover:scale-[1.025] cursor-pointer"
                onMouseEnter={() => setHighlightedId(listing._id)}
                onMouseLeave={() => setHighlightedId(null)}
                onClick={() => router.push(`/rooms/${listing._id}`)}
              >
                <EnhancedStayCard stay={listing} />
              </div>
            ))
          )}
        </div>
                {/* Map: responsive design */}
        {listings.length > 0 && (
          <>
            {/* Mobile Map - Full width, below cards */}
            <div className="lg:hidden w-full h-[400px] rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-200 mb-8">
              <div className="w-full h-full flex flex-col">
                <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Map View</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Explore properties in {cityFromQuery || 'this area'}</p>
                </div>
                <div className="flex-1 relative">
                {typeof window !== 'undefined' ? (
                  <MapContainer
                    center={mapCenter || [20.5937, 78.9629]}
                    zoom={mapCenter ? 10 : 5}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    className="z-10"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    {listings.map((listing) => (
                      listing.location?.coordinates && (
                        <Marker
                          key={listing._id}
                          position={[listing.location.coordinates[1], listing.location.coordinates[0]]}
                          icon={getPriceBubbleIcon(listing.pricing?.basePrice?.toLocaleString() || listing.pricing?.basePrice || 'N/A', highlightedId === listing._id)}
                          eventHandlers={{
                            mouseover: () => setHighlightedId(listing._id),
                            mouseout: () => setHighlightedId(null),
                          }}
                        >
                          <Popup className="custom-popup" closeButton={true}>
                            <EnhancedPopup listing={listing} />
                          </Popup>
                        </Marker>
                      )
                    ))}
                  </MapContainer>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base">Map loading...</p>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Desktop Map - Fixed on the right */}
            <div className="hidden lg:block w-[550px] h-[600px] sticky top-[120px] rounded-2xl overflow-hidden shadow-2xl bg-white border-l border-gray-200 mb-8" style={{ boxShadow: '-8px 0 32px -8px rgba(80,0,120,0.15)' }}>
              <div className="w-full h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="font-semibold text-gray-900">Map View</h3>
                  <p className="text-sm text-gray-600">Explore properties {cityFromQuery ? `in ${cityFromQuery}` : 'available'}</p>
                </div>
                <div className="flex-1 relative">
                {typeof window !== 'undefined' ? (
                  <MapContainer
                    center={mapCenter || [20.5937, 78.9629]}
                    zoom={mapCenter ? 12 : 5}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    className="z-10"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    {listings.map((listing) => (
                      listing.location?.coordinates && (
                        <Marker
                          key={listing._id}
                          position={[listing.location.coordinates[1], listing.location.coordinates[0]]}
                          icon={getPriceBubbleIcon(listing.pricing?.basePrice?.toLocaleString() || listing.pricing?.basePrice || 'N/A', highlightedId === listing._id)}
                          eventHandlers={{
                            mouseover: () => setHighlightedId(listing._id),
                            mouseout: () => setHighlightedId(null),
                          }}
                        >
                          <Popup className="custom-popup" closeButton={true}>
                            <EnhancedPopup listing={listing} />
                          </Popup>
                        </Marker>
                      )
                    ))}
                  </MapContainer>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Map loading...</p>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Footer for consistency */}
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search results...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
} 