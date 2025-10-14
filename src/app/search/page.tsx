"use client";
import React, { useEffect, useState, Suspense, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useAuth } from '@/core/store/auth-context';
import GoogleMapDisplay from '@/components/shared/GoogleMapDisplay';
import StayCard from '@/components/trips/StayCard';
import { Stay, Property } from '@/types';

// Helper function to convert Property to Stay type for StayCard
const convertPropertyToStay = (property: any): Stay => {
  return {
    id: property._id,
    title: property.title,
    description: property.description,
    images: property.images?.map((img: any) => img.url || img) || [],
    location: {
      city: property.location?.city || '',
      state: property.location?.state || '',
      country: property.location?.country || 'India',
      coordinates: property.location?.coordinates || [0, 0]
    },
    price: {
      amount: property.pricing?.basePrice || 0,
      currency: property.pricing?.currency || 'INR'
    },
    rating: property.rating?.average || 0,
    reviewCount: property.reviewCount || 0,
    host: {
      name: property.host?.name || 'Unknown Host',
      avatar: property.host?.profileImage || '',
      isSuperhost: false
    },
    amenities: property.amenities || [],
    features: property.features || [],
    tags: property.tags || [],
    maxGuests: property.maxGuests || 1,
    bedrooms: property.bedrooms || 0,
    beds: property.beds || 0,
    bathrooms: property.bathrooms || 0,
    cancellationPolicy: property.cancellationPolicy || 'moderate',
    instantBookable: property.instantBookable || false,
    isWishlisted: false,
    createdAt: new Date(property.createdAt),
    updatedAt: new Date(property.updatedAt)
  };
};

function SearchPageContent() {
  console.log('🎯 SearchPageContent component rendered');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [listings, setListings] = useState<any[]>([]); // Filtered listings for cards (based on viewport)
  const [allProperties, setAllProperties] = useState<any[]>([]); // All properties for map
  const [loading, setLoading] = useState(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [searchCenter, setSearchCenter] = useState<[number, number] | undefined>();
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>();
  const [mapBounds, setMapBounds] = useState<{
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  } | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const isFetchingRef = useRef(false);

  // Get search parameters from URL
  const lng = searchParams.get('lng');
  const lat = searchParams.get('lat');
  const city = searchParams.get('city');
  const guests = searchParams.get('guests');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  console.log('🔍 URL Search Params:', { lng, lat, city, guests, checkIn, checkOut });

  // Fetch properties when search parameters change
  useEffect(() => {
    const fetchProperties = async () => {
      // Prevent multiple simultaneous calls
      if (isFetchingRef.current) {
        console.log('🚫 Already fetching, skipping...');
        return;
      }
      
      try {
        console.log('🚀 useEffect triggered - fetching properties');
        console.log('📋 Search params:', { lng, lat, city, guests, checkIn, checkOut });
        isFetchingRef.current = true;
      setLoading(true);
      
        // Build query parameters
      const params: any = {
        limit: 100,
          sortBy: 'createdAt',
        sortOrder: 'desc'
      };

        // Add search filters
        if (guests) params.guests = guests;
        if (checkIn) params.checkIn = checkIn;
        if (checkOut) params.checkOut = checkOut;
        if (city) params.city = city;

        // CRITICAL: Add location-based search if coordinates provided
      if (lng && lat) {
        console.log('✅ Coordinates found in URL:', { lng, lat });
        params.lng = lng;
        params.lat = lat;
          params.radius = searchParams.get('radius') || '10000'; // Use URL radius or default 10km
        // Set search center for new searches (allow updates for new location searches)
        const center = [parseFloat(lng), parseFloat(lat)] as [number, number];
        console.log('📍 Setting search center to:', center);
        setSearchCenter(center);
        setMapCenter(center); // Set map center to new search location
        setMapInitialized(false); // Reset map initialization flag
        console.log('📍 Initial radius search:', { lng, lat, radius: params.radius });
        } else {
        console.log('❌ No coordinates found in URL');
        }

        // Fetch ALL properties within 10km radius for initial display
        console.log('🌐 Making API call with params:', params);
        console.log('🔧 API Client instance:', apiClient);
        console.log('🔧 API Client getListings method:', typeof apiClient.getListings);

      const response = await apiClient.getListings(params);
        console.log('📡 API response:', response);
      
      if (response.success && response.data) {
          const properties = response.data.listings || [];
          setAllProperties(properties); // Store all properties for map markers
          setListings(properties); // Show all properties initially
          console.log('🗺️ Initial load: Found', properties.length, 'properties within 10km radius');
          
          // Add a small delay before enabling bounds filtering to prevent race conditions
          setTimeout(() => {
            setInitialLoadComplete(true);
            setMapInitialized(true);
            console.log('✅ Initial load complete - viewport filtering now enabled');
          }, 1000); // 1 second delay
          
          // Debug: Log each property's location
          properties.forEach((prop: any, index: number) => {
            console.log(`📍 Initial Property ${index + 1}:`, {
              title: prop.title,
              city: prop.location?.city,
              coordinates: prop.location?.coordinates,
              distance: prop.distance ? `${(prop.distance / 1000).toFixed(2)}km` : 'N/A'
            });
          });
        } else {
          console.error('❌ API response failed:', response);
          setListings([]);
          setAllProperties([]);
        }
      } catch (error) {
        console.error('❌ Error fetching properties:', error);
        setListings([]);
        setAllProperties([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchProperties();
  }, [lng, lat, city, guests, checkIn, checkOut]);

  // Memoized bounds change handler
  const handleBoundsChange = useCallback((bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => {
    console.log('🗺️ Bounds changed callback received');
    
    // Only update bounds if they've changed significantly
    if (mapBounds) {
      const currentBounds = `${mapBounds.sw.lng},${mapBounds.sw.lat},${mapBounds.ne.lng},${mapBounds.ne.lat}`;
      const newBounds = `${bounds.sw.lng},${bounds.sw.lat},${bounds.ne.lng},${bounds.ne.lat}`;
      
      // Only update if bounds changed by more than 5% (to prevent micro-adjustments)
      const latDiff = Math.abs(mapBounds.ne.lat - bounds.ne.lat) + Math.abs(mapBounds.sw.lat - bounds.sw.lat);
      const lngDiff = Math.abs(mapBounds.ne.lng - bounds.ne.lng) + Math.abs(mapBounds.sw.lng - bounds.sw.lng);
      
      if (latDiff < 0.01 && lngDiff < 0.01) {
        console.log('🗺️ Bounds change too small, ignoring');
        return;
      }
    }
    
    setMapBounds(bounds);
  }, [mapBounds]);

  // Handle map center changes (when user moves the map)
  const handleCenterChange = useCallback((center: [number, number]) => {
    console.log('🗺️ Map center changed by user:', center);
    setMapCenter(center);
  }, []);

  // Handle viewport changes - refetch properties based on map bounds (always active after initial load)
  useEffect(() => {
    console.log('🔄 Bounds effect triggered:', { mapBounds: !!mapBounds, initialLoadComplete });
    if (mapBounds && initialLoadComplete) {
      console.log('🗺️ Map bounds changed, filtering properties by viewport');
      const bounds = `${mapBounds.sw.lng},${mapBounds.sw.lat},${mapBounds.ne.lng},${mapBounds.ne.lat}`;
      fetchPropertiesWithBounds(bounds);
    } else if (mapBounds && !initialLoadComplete) {
      console.log('🗺️ Initial map bounds set, will start filtering after initial load');
    } else {
      console.log('🗺️ No bounds or initial load not complete');
    }
  }, [mapBounds, initialLoadComplete]);

  const fetchPropertiesWithBounds = async (bounds: string) => {
    try {
      console.log('🗺️ Fetching properties for map viewport:', bounds);

      // Use dedicated map endpoint - NO city filter, only geospatial!
      const params = new URLSearchParams({
        bounds: bounds,
      });

      // Add only guest filter (no city/text filters)
      if (guests) params.append('guests', guests);
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/listings/map?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('🗺️ Map API response:', data);

      if (data.success && data.data) {
        const properties = data.data.listings || [];
        console.log('🗺️ Viewport fetch successful - updating properties with:', properties.length, 'properties');
        
        // CRITICAL: Only update listings, keep allProperties for map markers
        setListings(properties);
        
        // Update allProperties only if we have new properties to show on map
        if (properties.length > 0) {
          setAllProperties(properties);
        }
        
        console.log('🗺️ Loaded properties in viewport:', properties.length);
        
        // Log each property for debugging
        properties.forEach((prop: any, index: number) => {
          console.log(`📍 Map Property ${index + 1}:`, {
            title: prop.title,
            city: prop.location?.city,
            coordinates: prop.location?.coordinates
          });
        });
      } else {
        console.error('❌ Map API error:', data.error);
        // Don't clear allProperties - keep initial results visible on map
        setListings([]);
      }
    } catch (error) {
      console.error('❌ Error fetching properties with bounds:', error);
      // Don't clear allProperties - keep initial results visible on map
      setListings([]);
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

  // Memoize markers to prevent recreating on every render
  const mapMarkers = useMemo(() => {
    return allProperties.map((property: any) => ({
      id: property._id,
      position: [property.location.coordinates[0], property.location.coordinates[1]] as [number, number],
      title: property.title,
      price: property.pricing?.basePrice,
      image: property.images?.[0]?.url,
      isHighlighted: hoveredPropertyId === property._id,
      onClick: () => handlePropertyClick(property._id)
    }));
  }, [allProperties, hoveredPropertyId]);

  // Convert properties to Stay format for StayCard
  const stayListings = useMemo(() => {
    return listings.map(convertPropertyToStay);
  }, [listings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header onSearch={handleSearch} />
      
      {/* Main Content: Split View - Fixed below header */}
      <div className="pt-32 lg:pt-36">
        <div className="flex gap-6 px-4 lg:px-6 max-w-[2000px] mx-auto">
          {/* Left: Scrollable Property List */}
          <div className="w-full lg:w-1/2 overflow-y-auto max-h-[calc(100vh-10rem)] pb-8 custom-scrollbar">
            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {listings.length} {listings.length === 1 ? 'property' : 'properties'}
                </h1>
      </div>

              {/* Info Message */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-lg border border-blue-200">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span className="font-medium text-blue-900">
                  Showing properties in visible area - zoom or pan to explore different regions
                </span>
              </div>
            </div>

            {/* Property Cards - 1 column for better map view */}
            <div className="grid grid-cols-1 gap-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading properties...</p>
                  </div>
                </div>
              ) : stayListings.length > 0 ? (
                stayListings.map((stay) => (
                  <StayCard
                    key={stay.id}
                    stay={stay}
                    onMouseEnter={() => setHoveredPropertyId(stay.id)}
                    onMouseLeave={() => setHoveredPropertyId(null)}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                  <p className="text-gray-600 mb-6">
                  Try adjusting your search location or increasing the search radius.
                </p>
                <button
                  onClick={() => router.push('/')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Back to Homepage
                </button>
              </div>
              )}
            </div>
              </div>

          {/* Right: Always Visible Map */}
          <div className="hidden lg:block lg:w-1/2">
            <div className="sticky top-32 h-[calc(100vh-10rem)]">
              <div className="h-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden p-2">
                <GoogleMapDisplay
                  center={mapCenter || searchCenter || [78.9629, 20.5937]} // Use mapCenter if user moved map, otherwise searchCenter
                  zoom={(mapCenter || searchCenter) ? 13 : 5} // Zoom 13 = ~10km scale for specific search, Zoom 5 = country view
                  markers={mapMarkers}
                  onBoundsChange={handleBoundsChange}
                  onCenterChange={handleCenterChange}
                  height="100%"
                  className="rounded-2xl overflow-hidden"
                />
                      </div>
                    </div>
                  </div>
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