"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, X, Heart, ChevronRight, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Google Maps type declarations
declare global {
  interface Window {
    google: any;
  }
}

interface GoogleMapDisplayProps {
  center: [number, number]; // [lng, lat]
  zoom?: number;
  markerPosition?: [number, number]; // [lng, lat]
  markers?: Array<{
    id: string;
    position: [number, number]; // [lng, lat]
    title?: string;
    price?: number;
    image?: string;
    isHighlighted?: boolean;
    onClick?: () => void;
    property?: any; // Full property data for the card
  }>;
  onMapClick?: (coords: [number, number]) => void;
  onBoundsChange?: (bounds: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  }) => void;
  onCenterChange?: (center: [number, number]) => void;
  height?: string;
  className?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('GOOGLE MAPS API KEY is not set ');
}

const GoogleMapDisplay: React.FC<GoogleMapDisplayProps> = ({
  center,
  zoom = 13,
  markerPosition,
  markers = [],
  onMapClick,
  onBoundsChange,
  onCenterChange,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const lastMarkersRef = useRef<string>('');
  const markersUpdateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [cardPosition, setCardPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();
  

  // Carousel navigation functions
  const goToNextImage = () => {
    if (selectedProperty?.images && selectedProperty.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.images.length);
    }
  };

  const goToPrevImage = () => {
    if (selectedProperty?.images && selectedProperty.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length);
    }
  };

  // Reset image index when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedProperty]);

  // Handle View Details button click
  const handleViewDetails = () => {
    if (selectedProperty?._id) {
      window.open(`/rooms/${selectedProperty._id}`, '_blank');
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Google Maps script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already loaded
    if (window.google && window.google.maps) {
      setIsLoading(false);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoading(false));
      return;
    }

    // Load script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('✅ Google Maps loaded for display');
      console.log('🔧 Google Maps API available:', !!window.google);
      console.log('🔧 Google Maps version:', window.google?.maps?.version);
      setIsLoading(false);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Google Maps');
      console.error('❌ API Key being used:', GOOGLE_MAPS_API_KEY);
      setError('Failed to load Google Maps');
      setIsLoading(false);
    };

    document.head.appendChild(script);
  }, []);

  // Handle center changes without re-initializing the map (only for initial positioning)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;
    
    const currentCenter = mapInstanceRef.current.getCenter();
    if (currentCenter) {
      const currentLat = currentCenter.lat();
      const currentLng = currentCenter.lng();
      const newLat = center[1];
      const newLng = center[0];
      
      // Only pan if the center has changed significantly (> 100m)
      const distance = Math.sqrt(
        Math.pow(currentLng - newLng, 2) + Math.pow(currentLat - newLat, 2)
      );
      
      // Only auto-pan if it's a significant change (like initial load or search change)
      // Don't auto-pan for small changes to allow user to move the map freely
      if (distance > 0.01) { // Increased threshold to 1km
        console.log('🗺️ Smoothly panning map to new search location:', center);
        // Use smooth panning for better user experience
        mapInstanceRef.current.panTo({ lat: newLat, lng: newLng });
      }
    }
  }, [center]);

  // Initialize map ONCE
  useEffect(() => {
    if (!mapRef.current || isLoading || !window.google || mapInstanceRef.current) {
      console.log('🗺️ Skipping map initialization:', { 
        hasMapRef: !!mapRef.current, 
        isLoading, 
        hasGoogle: !!window.google, 
        hasInstance: !!mapInstanceRef.current 
      });
      return;
    }

    console.log('🗺️ Initializing map with center:', center);

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: center[1], lng: center[0] },
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy', // Allow zoom without CMD key
        disableDoubleClickZoom: false,
        scrollwheel: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;
      console.log('✅ Map initialized successfully at:', center);

      // Add click listener (only once)
      if (onMapClick) {
        map.addListener('click', (e: any) => {
          if (e.latLng) {
            onMapClick([e.latLng.lng(), e.latLng.lat()]);
          }
        });
      }
      
      // Add debug map click listener
      map.addListener('click', (e: any) => {
        console.log('🗺️ MAP CLICKED!', e);
      });

      // Add bounds_changed listener for viewport-based filtering (only once)
      if (onBoundsChange) {
        let boundsChangeTimeout: NodeJS.Timeout;
        let lastBounds: string | null = null;

        map.addListener('idle', () => {
          // Debounce and prevent duplicate calls
          clearTimeout(boundsChangeTimeout);
          boundsChangeTimeout = setTimeout(() => {
            const bounds = map.getBounds();
            if (bounds) {
              const ne = bounds.getNorthEast();
              const sw = bounds.getSouthWest();
              const newBounds = {
                ne: { lat: ne.lat(), lng: ne.lng() },
                sw: { lat: sw.lat(), lng: sw.lng() }
              };
              
              // Only trigger if bounds actually changed
              const boundsString = JSON.stringify(newBounds);
              if (boundsString !== lastBounds) {
                lastBounds = boundsString;
                console.log('🗺️ Map bounds updated:', newBounds);
                onBoundsChange(newBounds);
              }
            }
          }, 500); // Debounce for 500ms
        });
      }

      // Add center change listener to track when user moves the map
      if (onCenterChange) {
        let centerChangeTimeout: NodeJS.Timeout;
        let lastCenter: string | null = null;

        map.addListener('center_changed', () => {
          clearTimeout(centerChangeTimeout);
          centerChangeTimeout = setTimeout(() => {
            const currentCenter = map.getCenter();
            if (currentCenter) {
              const newCenter: [number, number] = [currentCenter.lng(), currentCenter.lat()];
              const centerString = JSON.stringify(newCenter);
              
              // Only trigger if center actually changed
              if (centerString !== lastCenter) {
                lastCenter = centerString;
                console.log('🗺️ Map center changed by user:', newCenter);
                onCenterChange(newCenter);
              }
            }
          }, 300); // Debounce for 300ms
        });
      }

      // Note: Removed zoom close functionality to keep card stable during zoom
    } catch (err) {
      console.error('❌ Error initializing map:', err);
      console.error('❌ Map center:', center);
      console.error('❌ Map zoom:', zoom);
      console.error('❌ Map ref:', mapRef.current);
      setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [isLoading]); // Only depend on isLoading - initialize map ONCE

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && window.google) {
      mapInstanceRef.current.setCenter({ lat: center[1], lng: center[0] });
    }
  }, [center]);

  // Add/update markers with throttling and duplicate prevention
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || isLoading) return;

    // Throttle marker updates
    clearTimeout(markersUpdateTimeoutRef.current);
    
    markersUpdateTimeoutRef.current = setTimeout(() => {
      // Check if markers actually changed
      const markersString = JSON.stringify(markers.map(m => ({
        id: m.id,
        pos: m.position,
        highlighted: m.isHighlighted
      })));
      
      if (markersString === lastMarkersRef.current) {
        console.log('🗺️ Markers unchanged, skipping update');
        return;
      }
      
      lastMarkersRef.current = markersString;
      console.log('🗺️ Updating markers:', markers.length);
      console.log('🗺️ Marker data:', markers);

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add single marker position
      if (markerPosition) {
        const marker = new window.google.maps.Marker({
          position: { lat: markerPosition[1], lng: markerPosition[0] },
          map: mapInstanceRef.current,
          title: 'Selected Location',
          animation: window.google.maps.Animation.DROP
        });
        markersRef.current.push(marker);
      }

      // Add multiple markers with custom Airbnb-style price tags
      markers.forEach((markerData, index) => {
        // Create custom SVG icon for price tag
        const priceText = markerData.price ? `₹${markerData.price}` : '₹N/A';
        
        const markerIcon = {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="80" height="36" viewBox="0 0 80 36" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(0,0,0,0.3)"/>
                </filter>
              </defs>
              <g filter="url(#shadow)">
                <rect x="3" y="3" width="74" height="26" rx="13" fill="white" stroke="#e5e7eb" stroke-width="2"/>
                <text x="40" y="20" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#1f2937">${priceText}</text>
                <polygon points="36,29 40,35 44,29" fill="white"/>
                <polygon points="35,29 40,36 45,29" fill="#e5e7eb"/>
              </g>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(80, 36),
          anchor: new window.google.maps.Point(40, 36),
        };

        const marker = new window.google.maps.Marker({
          position: { lat: markerData.position[1], lng: markerData.position[0] },
          map: mapInstanceRef.current!,
          title: markerData.title || '',
          icon: markerIcon,
          animation: markerData.isHighlighted ? window.google.maps.Animation.BOUNCE : undefined,
        });
        

        // Add click listener for map card
        marker.addListener('click', (event: any) => {
          // Use actual property data
          const propertyData = markerData.property;
          setSelectedProperty(propertyData);
          
          // Smart positioning like Airbnb - choose best position relative to marker
          const mapDiv = mapRef.current;
          if (mapDiv) {
            const mapRect = mapDiv.getBoundingClientRect();
            const cardWidth = 320;
            const cardHeight = 200; // Approximate card height
            const padding = 20;
            
            // Get map bounds to calculate relative position
            const map = mapInstanceRef.current;
            const bounds = map.getBounds();
            
            if (bounds) {
              const markerLat = markerData.position[1];
              const markerLng = markerData.position[0];
              
              const ne = bounds.getNorthEast();
              const sw = bounds.getSouthWest();
              
              // Calculate relative position (0 to 1)
              const relativeX = (markerLng - sw.lng()) / (ne.lng() - sw.lng());
              const relativeY = (markerLat - sw.lat()) / (ne.lat() - sw.lat());
              
              // Convert to pixel coordinates for marker position
              const markerX = relativeX * mapRect.width;
              const markerY = relativeY * mapRect.height;
              
              // Calculate available space in each direction
              const spaceRight = mapRect.width - markerX - padding;
              const spaceLeft = markerX - padding;
              const spaceBottom = mapRect.height - markerY - padding;
              const spaceTop = markerY - padding;
              
              let cardX, cardY;
              
              // Smart positioning logic
              if (spaceRight >= cardWidth) {
                // Position to the right of marker
                cardX = markerX + 30;
                cardY = Math.max(padding, markerY - cardHeight / 2);
              } else if (spaceLeft >= cardWidth) {
                // Position to the left of marker
                cardX = markerX - cardWidth - 30;
                cardY = Math.max(padding, markerY - cardHeight / 2);
              } else if (spaceBottom >= cardHeight) {
                // Position below marker
                cardX = Math.max(padding, Math.min(markerX - cardWidth / 2, mapRect.width - cardWidth - padding));
                cardY = markerY + 30;
              } else {
                // Position above marker
                cardX = Math.max(padding, Math.min(markerX - cardWidth / 2, mapRect.width - cardWidth - padding));
                cardY = markerY - cardHeight - 30;
              }
              
              // Ensure card stays within bounds
              cardX = Math.max(padding, Math.min(cardX, mapRect.width - cardWidth - padding));
              cardY = Math.max(padding, Math.min(cardY, mapRect.height - cardHeight - padding));
              
              console.log('🗺️ Smart positioning:', {
                markerPos: { x: markerX, y: markerY },
                cardPos: { x: cardX, y: cardY },
                spaces: { right: spaceRight, left: spaceLeft, bottom: spaceBottom, top: spaceTop }
              });
              
              setCardPosition({
                x: cardX,
                y: cardY
              });
            } else {
              // Fallback to center positioning
              setCardPosition({
                x: mapRect.width / 2 - cardWidth / 2,
                y: mapRect.height * 0.3
              });
            }
          }
        });
        
        markersRef.current.push(marker);
      });
    }, 300); // Throttle marker updates by 300ms
  }, [markerPosition, markers, isLoading]);

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`} 
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-red-50 ${className}`} 
        style={{ height }}
      >
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <div 
        ref={mapRef} 
        className={`w-full ${className}`} 
        style={{ height }}
      />
      
      {/* Property Card Overlay */}
      {selectedProperty && cardPosition && (
        <div
          className="absolute bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden cursor-pointer"
          style={{
            left: `${cardPosition.x}px`,
            top: `${cardPosition.y}px`,
            width: '320px',
            zIndex: 9999
          }}
          onClick={handleViewDetails}
        >
            {/* Image Carousel Section */}
          <div className="relative h-48 bg-gray-100 group">
            {(() => {
              const hasImages = selectedProperty.images && selectedProperty.images.length > 0;
              const currentImage = hasImages ? selectedProperty.images[currentImageIndex] : null;
              const imageUrl = currentImage?.url || currentImage?.secure_url || currentImage;
              
              if (hasImages && imageUrl) {
                return (
                  <Image
                    src={imageUrl}
                    alt={selectedProperty.title || 'Property'}
                    fill
                    className="object-cover"
                  />
                );
              } else {
                return (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-400 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <span className="text-gray-600 text-2xl">🏠</span>
                  </div>
                  <span className="text-gray-600 text-sm font-medium">No Image</span>
                </div>
              </div>
                );
              }
            })()}
            
            {/* Navigation Arrows */}
            {selectedProperty.images && selectedProperty.images.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevImage();
                  }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>
              </>
            )}
            
            {/* Pagination Dots */}
            {selectedProperty.images && selectedProperty.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                {selectedProperty.images.map((_: any, index: number) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full cursor-pointer ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                <Heart className="w-4 h-4 text-gray-700" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProperty(null);
                }}
                className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-base leading-tight flex-1 min-w-0">
                {selectedProperty.title || 'Property'}
              </h3>
              {(selectedProperty.rating || selectedProperty.averageRating) && (
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <span className="text-black">★</span>
                  <span className="text-sm font-medium">
                    {selectedProperty.rating || selectedProperty.averageRating || '4.5'}
                  </span>
                  {selectedProperty.reviewCount && (
                    <span className="text-sm text-gray-500">({selectedProperty.reviewCount})</span>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
              <span>📍</span>
              {selectedProperty.location?.city || selectedProperty.location?.address || 'Location'}, {selectedProperty.location?.state || selectedProperty.location?.country || ''}
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-gray-900">
                  ₹{selectedProperty.pricing?.basePrice || selectedProperty.price || 'N/A'}
                </span>
                <span className="text-gray-600 ml-1">/night</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails();
                }}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapDisplay;
