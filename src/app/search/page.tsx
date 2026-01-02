"use client";
import React, { useEffect, useState, Suspense, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
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
      id: property.host?._id || property.host?.id || '',
      name: property.host?.name || 'Unknown Host',
      avatar: property.host?.profileImage || '',
      isSuperhost: false
    },
    amenities: property.amenities || [],
    tags: property.tags || [],
    maxGuests: property.maxGuests || 1,
    bedrooms: property.bedrooms || 0,
    beds: property.beds || 0,
    bathrooms: property.bathrooms || 0,
    instantBookable: property.instantBookable || false,
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
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const isFetchingRef = useRef(false);
  // Store initial search results so they're never lost (for map markers)
  const initialPropertiesRef = useRef<any[]>([]);

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
        
        // Use larger radius for major cities or default to 50km for better coverage
        const defaultRadius = city && ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune'].includes(city.toLowerCase()) 
          ? '50000' // 50km for major cities
          : '25000'; // 25km for smaller cities
        params.radius = searchParams.get('radius') || defaultRadius;
        
        // Set search center for new searches (allow updates for new location searches)
        const center = [parseFloat(lng), parseFloat(lat)] as [number, number];
        console.log('📍 Setting search center to:', center);
        setSearchCenter(center);
        setMapCenter(center); // Set map center to new search location
        setMapInitialized(false); // Reset map initialization flag
        console.log('📍 Initial radius search:', { lng, lat, radius: params.radius, city });
        } else {
        console.log('❌ No coordinates found in URL, using city-based search');
        // If no coordinates but we have city, rely on backend city-based search
        }

        // Fetch ALL properties within radius for initial display
        console.log('🌐 Making API call with params:', params);
        console.log('🔧 API Client instance:', apiClient);
        console.log('🔧 API Client getListings method:', typeof apiClient.getListings);

      const response = await apiClient.getListings(params);
        console.log('📡 API response:', response);
      
      if (response.success && response.data) {
          const properties = response.data.listings || [];
          
          // If we got very few results with radius search and we have a city, try city-based search as fallback
          if (properties.length < 3 && city && lng && lat) {
            console.log('🔄 Few results from radius search, trying city-based fallback...');
            try {
              const fallbackParams = { ...params };
              delete fallbackParams.lng;
              delete fallbackParams.lat;
              delete fallbackParams.radius;
              fallbackParams.city = city;
              
              const fallbackResponse = await apiClient.getListings(fallbackParams);
              if (fallbackResponse.success && fallbackResponse.data) {
                const fallbackProperties = fallbackResponse.data.listings || [];
                console.log('🏙️ City-based fallback found', fallbackProperties.length, 'properties');
                // Store initial results in ref so they're never lost
                initialPropertiesRef.current = fallbackProperties;
                setAllProperties(fallbackProperties);
                setListings(fallbackProperties);
              } else {
                initialPropertiesRef.current = properties;
                setAllProperties(properties);
                setListings(properties);
              }
            } catch (fallbackError) {
              console.error('❌ City-based fallback failed:', fallbackError);
              initialPropertiesRef.current = properties;
              setAllProperties(properties);
              setListings(properties);
            }
          } else {
            // Store initial results in ref so they're never lost
            initialPropertiesRef.current = properties;
            setAllProperties(properties);
            setListings(properties);
          }
          
          console.log('🗺️ Initial load: Found', properties.length, 'properties within', params.radius, 'radius');
          
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

  // Handle property click from map
  const handlePropertyClick = useCallback((propertyId: string) => {
    console.log('🗺️ Property clicked:', propertyId);
    console.log('🗺️ Available properties:', allProperties.length);
    const property = allProperties.find(p => p._id === propertyId);
    console.log('🗺️ Found property:', property?.title);
    if (property) {
      setSelectedProperty(property);
      setShowPropertyModal(true);
      console.log('🗺️ Modal should be opening now');
    } else {
      console.log('❌ Property not found in allProperties');
    }
  }, [allProperties]);

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
        console.log('🗺️ Viewport fetch successful - found:', properties.length, 'properties');
        
        // FIXED: Only update listings if we found properties in the viewport
        // If viewport search returns empty, use initial properties as fallback
        if (properties.length > 0) {
          setListings(properties);
          setAllProperties(properties);
          console.log('🗺️ Updated listings with viewport results:', properties.length);
        } else {
          console.log('🗺️ Viewport returned 0 results - using initial properties as fallback');
          // Use initial properties for both listings and markers
          if (initialPropertiesRef.current.length > 0) {
            setListings(initialPropertiesRef.current);
            setAllProperties(initialPropertiesRef.current);
            console.log('🗺️ Restored initial properties:', initialPropertiesRef.current.length);
          }
        }
        
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
        // FIXED: Use initial properties as fallback on error
        if (initialPropertiesRef.current.length > 0) {
          setListings(initialPropertiesRef.current);
          setAllProperties(initialPropertiesRef.current);
          console.log('🗺️ Restored initial properties after API error');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching properties with bounds:', error);
      // FIXED: Use initial properties as fallback on error
      if (initialPropertiesRef.current.length > 0) {
        setListings(initialPropertiesRef.current);
        setAllProperties(initialPropertiesRef.current);
        console.log('🗺️ Restored initial properties after fetch error');
      }
    }
  };

  const handleSearch = (location: any, guestsCount?: number, checkInDate?: string, checkOutDate?: string) => {
    // Navigate to search page with new params
    const params = new URLSearchParams();
    params.set('lng', location.coordinates[0].toString());
    params.set('lat', location.coordinates[1].toString());
    // Fix: Use location.value or location.label instead of location.city (which doesn't exist)
    params.set('city', location.value || location.label || '');
    if (guestsCount) params.set('guests', guestsCount.toString());
    if (checkInDate) params.set('checkIn', checkInDate);
    if (checkOutDate) params.set('checkOut', checkOutDate);
    
    router.push(`/search?${params.toString()}`);
  };

  // Memoize markers to prevent recreating on every render
  const mapMarkers = useMemo(() => {
    console.log('🗺️ Creating map markers for properties:', allProperties.length);
    const markers = allProperties.map((property: any) => {
      const marker = {
        id: property._id,
        position: [property.location.coordinates[0], property.location.coordinates[1]] as [number, number],
        title: property.title,
        price: property.pricing?.basePrice,
        image: property.images?.[0]?.url,
        isHighlighted: hoveredPropertyId === property._id,
        onClick: () => handlePropertyClick(property._id),
        property: property // Pass full property data for the card
      };
      console.log('🗺️ Created marker:', { id: marker.id, title: marker.title, hasProperty: !!marker.property });
      return marker;
    });
    console.log('🗺️ Total markers created:', markers.length);
    return markers;
  }, [allProperties, hoveredPropertyId, handlePropertyClick]);

  // Convert properties to Stay format for StayCard
  const stayListings = useMemo(() => {
    return listings.map(convertPropertyToStay);
  }, [listings]);

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onSearch={handleSearch}
        searchExpanded={searchExpanded}
        onSearchToggle={setSearchExpanded}
      />
      
      {/* Main Content: Split View - Clean Airbnb Style */}
      <div className="pt-20">
        <div className="flex h-[calc(100vh-5rem)]">
          {/* Left: Scrollable Property List */}
          <div className="w-full lg:w-1/2 overflow-y-auto pb-8">
            {/* Results Header - Airbnb Style */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">
                  {listings.length > 0 ? `Over ${listings.length} homes` : 'No homes found'}
                </h1>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-pink-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-600">Prices include all fees</span>
                </div>
        </div>
      </div>

            {/* Property Cards - Single Column Layout */}
            <div className="px-6 py-4">
          {loading ? (
                <div className="flex items-center justify-center py-16">
              <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading places...</p>
              </div>
            </div>
              ) : stayListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stayListings.map((stay) => (
                    <StayCard
                      key={stay.id}
                      stay={stay}
                      onMouseEnter={() => setHoveredPropertyId(stay.id)}
                      onMouseLeave={() => setHoveredPropertyId(null)}
                      guests={guests}
                      checkIn={checkIn}
                      checkOut={checkOut}
                     
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No places found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search location or dates.
                </p>
                <button
                  onClick={() => router.push('/')}
                    className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                    Search again
                </button>
              </div>
              )}
            </div>
              </div>

          {/* Right: Map Container with Rounded Borders */}
          <div className="hidden lg:block lg:w-1/2 p-4 pt-8">
            <div className="h-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <GoogleMapDisplay
                center={mapCenter || searchCenter || [78.9629, 20.5937]}
                zoom={(mapCenter || searchCenter) ? 13 : 5}
                markers={mapMarkers}
                onBoundsChange={handleBoundsChange}
                onCenterChange={handleCenterChange}
                height="100%"
                className="w-full h-full rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Property Detail Modal */}
      {showPropertyModal && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100">
            {/* Close Button */}
            <div className="flex justify-end p-6">
              <button
                onClick={() => setShowPropertyModal(false)}
                className="p-3 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Property Content */}
            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Image Gallery */}
                <div className="lg:col-span-2">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
                    {selectedProperty.images && selectedProperty.images.length > 0 ? (
                        <Image
                        src={selectedProperty.images[0].url}
                        alt={selectedProperty.title}
                          fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-gray-500 font-medium">No image available</p>
                        </div>
                        </div>
                      )}
                    
                    {/* Favorite Button */}
                    <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 hover:scale-105 shadow-lg">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      </button>
                  </div>
                    </div>

                    {/* Property Details */}
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                      {selectedProperty.title}
                    </h2>
                    <div className="flex items-center text-gray-600 mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">
                        {selectedProperty.location?.city}, {selectedProperty.location?.state}
                            </span>
                          </div>
                        </div>

                  {/* Rating & Reviews */}
                  {selectedProperty.rating && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-50 rounded-full px-3 py-2">
                        <svg className="w-4 h-4 text-yellow-500 fill-current mr-1" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-gray-900">{selectedProperty.rating}</span>
                        <span className="text-gray-600 ml-1">({selectedProperty.reviewCount || 0} reviews)</span>
                      </div>
                        </div>
                  )}

                  {/* Price */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      ₹{selectedProperty.pricing?.basePrice || 0}
                        </div>
                    <div className="text-gray-600 font-medium">per night</div>
                      </div>

                  {/* Amenities */}
                  {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                        <div>
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg">What this place offers</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedProperty.amenities.slice(0, 8).map((amenity: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-gray-700">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium capitalize">{amenity.replace('-', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <button
                      onClick={() => {
                   console.log('Params:', { guests, checkIn, checkOut });
                    const params = new URLSearchParams();
                     if (guests) params.set('guests', guests.toString());
                      if (checkIn) params.set('checkIn', checkIn);
                      if (checkOut) params.set('checkOut', checkOut);
   
                        setShowPropertyModal(false);
                        router.push(`/rooms/${selectedProperty._id}?${params.toString()}`);
                      }}
                      className="w-full bg-gradient-to-r from-gray-900 to-black text-white py-4 px-6 rounded-2xl font-semibold hover:from-gray-800 hover:to-gray-900 transition-all duration-200 hover:scale-[1.02] shadow-lg"
                    >
                      View Full Details
                    </button>
                    <button
                      onClick={() => setShowPropertyModal(false)}
                      className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-2xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}