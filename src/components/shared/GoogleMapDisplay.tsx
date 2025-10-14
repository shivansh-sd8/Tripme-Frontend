"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

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

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyB9JgH59f8fK3xzaBfFB6T19u4qGEUeLOM';

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
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const lastMarkersRef = useRef<string>('');
  const markersUpdateTimeoutRef = useRef<NodeJS.Timeout>();
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
      setIsLoading(false);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Google Maps');
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
    if (!mapRef.current || isLoading || !window.google || mapInstanceRef.current) return;

    console.log('🗺️ Initializing map with center:', center);

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: center[1], lng: center[0] },
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;
      console.log('✅ Map initialized at:', center);

      // Add click listener (only once)
      if (onMapClick) {
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onMapClick([e.latLng.lng(), e.latLng.lat()]);
          }
        });
      }

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
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
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

      // Add multiple markers
      markers.forEach((markerData) => {
        const marker = new window.google.maps.Marker({
          position: { lat: markerData.position[1], lng: markerData.position[0] },
          map: mapInstanceRef.current!,
          title: markerData.title || '',
          animation: markerData.isHighlighted ? window.google.maps.Animation.BOUNCE : undefined,
          label: markerData.price ? {
            text: `₹${markerData.price}`,
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'bold'
          } : undefined,
        });

        // Add click listener
        if (markerData.onClick) {
          marker.addListener('click', markerData.onClick);
        }

        // Add info window with property details
        if (markerData.title || markerData.image) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                ${markerData.image ? `<img src="${markerData.image}" alt="${markerData.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ''}
                ${markerData.title ? `<h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${markerData.title}</h3>` : ''}
                ${markerData.price ? `<p style="margin: 0; font-size: 14px; font-weight: 600; color: #7c3aed;">₹${markerData.price}/night</p>` : ''}
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current!, marker);
            if (markerData.onClick) markerData.onClick();
          });
        }

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
    <div 
      ref={mapRef} 
      className={`w-full ${className}`} 
      style={{ height }}
    />
  );
};

export default GoogleMapDisplay;
