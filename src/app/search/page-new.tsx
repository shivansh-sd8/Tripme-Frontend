"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin, Star, Users, Heart, IndianRupee, Bed, Bath } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import GoogleMapsSearch from '@/components/search/GoogleMapsSearch';
import GoogleMapsPropertiesDisplay from '@/components/search/GoogleMapsPropertiesDisplay';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useAuth } from '@/core/store/auth-context';
import Image from 'next/image';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [searchCenter, setSearchCenter] = useState<[number, number] | undefined>();

  // Get search parameters from URL
  const lng = searchParams.get('lng');
  const lat = searchParams.get('lat');
  const city = searchParams.get('city');
  const guests = searchParams.get('guests');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const radius = searchParams.get('radius') || '20000'; // 20km default

  useEffect(() => {
    fetchProperties();
  }, [lng, lat, city, guests, checkIn, checkOut]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params: any = {
        limit: 100,
        sortBy: 'rating.average',
        sortOrder: 'desc'
      };

      // Priority: Use coordinates if available
      if (lng && lat) {
        params.lng = lng;
        params.lat = lat;
        params.radius = radius;
        setSearchCenter([parseFloat(lng), parseFloat(lat)]);
      } else if (city) {
        params.city = city;
      }

      if (guests) params.guests = guests;
      if (checkIn) params.checkIn = checkIn;
      if (checkOut) params.checkOut = checkOut;

      console.log('🔍 Searching with params:', params);

      const response = await apiClient.getListings(params);
      
      if (response.success && response.data) {
        setListings(response.data.listings || []);
        console.log('✅ Found properties:', response.data.listings?.length || 0);
      } else {
        console.error('❌ Search failed:', response.message);
        setListings([]);
      }
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (location: any, guestsCount?: number, checkInDate?: string, checkOutDate?: string) => {
    // Navigate to search page with new params
    const params = new URLSearchParams();
    params.set('lng', location.coordinates[0].toString());
    params.set('lat', location.coordinates[1].toString());
    params.set('city', location.city);
    if (guestsCount) params.set('guests', guestsCount.toString());
    if (checkInDate) params.set('checkIn', checkInDate);
    if (checkOutDate) params.set('checkOut', checkOutDate);
    
    router.push(`/search?${params.toString()}`);
  };

  const handlePropertyClick = (propertyId: string) => {
    // Build URL with search params preserved
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    
    const url = `/rooms/${propertyId}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Bar - Sticky */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <GoogleMapsSearch
            onSearch={handleSearch}
            initialLocation={city || ''}
            initialGuests={guests ? parseInt(guests) : undefined}
          />
        </div>
      </div>

      {/* Main Content: Split View */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left: Property List */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Searching properties...</p>
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search location or increasing the search radius.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Back to Homepage
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {listings.length} {listings.length === 1 ? 'property' : 'properties'} found
                </h2>
                {city && (
                  <p className="text-gray-600 mt-1">
                    in {city}
                  </p>
                )}
              </div>

              {listings.map((listing) => (
                <div
                  key={listing._id}
                  onMouseEnter={() => setHoveredPropertyId(listing._id)}
                  onMouseLeave={() => setHoveredPropertyId(null)}
                  onClick={() => handlePropertyClick(listing._id)}
                  className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                    hoveredPropertyId === listing._id ? 'ring-2 ring-purple-500 scale-[1.02]' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Property Image */}
                    <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0">
                      {listing.images && listing.images.length > 0 ? (
                        <Image
                          src={listing.images[0].url}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to wishlist logic
                        }}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                            {listing.title}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="line-clamp-1">
                              {listing.location?.city}, {listing.location?.state}
                            </span>
                          </div>
                        </div>
                        {listing.rating?.average > 0 && (
                          <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold text-gray-900">
                              {listing.rating.average.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-600">
                              ({listing.reviewCount || 0})
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {listing.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{listing.maxGuests} guests</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{listing.bedrooms} bedrooms</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{listing.bathrooms} bathrooms</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-5 h-5 text-purple-600" />
                            <span className="text-2xl font-bold text-purple-600">
                              {listing.pricing?.basePrice?.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">per night</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyClick(listing._id);
                          }}
                          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Google Maps */}
        <div className="hidden lg:block lg:w-1/2 sticky top-0 h-[calc(100vh-200px)]">
          <GoogleMapsPropertiesDisplay
            properties={listings}
            center={searchCenter}
            zoom={12}
            highlightedPropertyId={hoveredPropertyId}
            onPropertyClick={handlePropertyClick}
            height="100%"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}


