"use client";

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

// Google Maps type declarations
declare global {
  interface Window {
    google: any;
  }
}

interface PropertyMapProps {
  address: string;
  city: string;
  state: string;
  country?: string;
  coordinates?: [number, number] | { lat: number; lng: number };
}

// Default coordinates for major Indian cities if not provided
const getDefaultCoordinates = (cityName: string) => {
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Delhi': { lat: 28.7041, lng: 77.1025 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Jaipur': { lat: 26.9124, lng: 75.7873 },
    'Goa': { lat: 15.2993, lng: 74.1240 },
    'Kochi': { lat: 9.9312, lng: 76.2673 },
    'Kerala': { lat: 10.8505, lng: 76.2711 },
    'Rajasthan': { lat: 27.0238, lng: 74.2179 },
    'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
    'Uttarakhand': { lat: 30.0668, lng: 79.0193 },
    'Kashmir': { lat: 34.0837, lng: 74.7973 },
    'Ladakh': { lat: 34.1526, lng: 77.5771 },
    'Sikkim': { lat: 27.5330, lng: 88.5122 },
    'Meghalaya': { lat: 25.4670, lng: 91.3662 },
    'Assam': { lat: 26.2006, lng: 92.9376 },
    'Manipur': { lat: 24.6637, lng: 93.9063 },
    'Nagaland': { lat: 26.1584, lng: 94.5624 },
    'Mizoram': { lat: 23.1645, lng: 92.9376 },
    'Tripura': { lat: 23.9408, lng: 91.9882 },
    'Arunachal Pradesh': { lat: 28.2180, lng: 94.7278 },
    'Odisha': { lat: 20.9517, lng: 85.0985 },
    'Jharkhand': { lat: 23.6102, lng: 85.2799 },
    'Chhattisgarh': { lat: 21.2787, lng: 81.8661 },
    'Madhya Pradesh': { lat: 22.9734, lng: 75.8069 },
    'Gujarat': { lat: 23.0225, lng: 72.5714 },
    'Maharashtra': { lat: 19.7515, lng: 75.7139 },
    'Karnataka': { lat: 15.3173, lng: 75.7139 },
    'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
    'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
    'Telangana': { lat: 18.1124, lng: 79.0193 },
    'West Bengal': { lat: 22.9868, lng: 87.8550 },
    'Bihar': { lat: 25.0961, lng: 85.3131 },
    'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
    'Punjab': { lat: 31.1471, lng: 75.3412 },
    'Haryana': { lat: 29.0588, lng: 76.0856 },
    'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
    'Uttarakhand': { lat: 30.0668, lng: 79.0193 },
    'Jammu and Kashmir': { lat: 34.0837, lng: 74.7973 },
    'Ladakh': { lat: 34.1526, lng: 77.5771 },
    'Ghaziabad': { lat: 28.6692, lng: 77.4538 }
  };

  return cityCoords[cityName] || { lat: 28.6139, lng: 77.2090 }; // Default to Delhi
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyB9JgH59f8fK3xzaBfFB6T19u4qGEUeLOM';

export default function PropertyMap({ 
  address, 
  city, 
  state, 
  country = 'India',
  coordinates 
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapContainerReady, setMapContainerReady] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle coordinates conversion
  const getCoordinates = () => {
    if (!coordinates) {
      return getDefaultCoordinates(city);
    }
    
    // If coordinates is an array [longitude, latitude] (database format)
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      const [lng, lat] = coordinates;
      if (typeof lng === 'number' && typeof lat === 'number' && !isNaN(lng) && !isNaN(lat)) {
        return { lat, lng };
      }
    }
    
    // If coordinates is an object {lat, lng}
    if (typeof coordinates === 'object' && 'lat' in coordinates && 'lng' in coordinates) {
      const { lat, lng } = coordinates;
      if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    // Fallback to default coordinates
    return getDefaultCoordinates(city);
  };

  const coords = getCoordinates();

  // Load Google Maps script
  useEffect(() => {
    if (!isClient) return;

    if (!GOOGLE_MAPS_API_KEY) {
      setMapError('Google Maps API key is not configured');
      setIsLoading(false);
      return;
    }

    // Check if already loaded
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps already loaded');
      setIsLoading(false);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('⏳ Google Maps script already loading, waiting...');
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkLoaded);
          console.log('✅ Google Maps loaded (existing script)');
          setIsLoading(false);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!window.google || !window.google.maps) {
          setMapError('Failed to load Google Maps');
          setIsLoading(false);
        }
      }, 10000);
      
      return;
    }

    // Load Google Maps script
    console.log('🔄 Loading Google Maps script...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Maps loaded successfully');
      setIsLoading(false);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Google Maps');
      setMapError('Failed to load Google Maps. Please check your API key.');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
  }, [isClient]);

  // Initialize map when Google Maps is loaded and mapRef is ready
  useEffect(() => {
    if (!isClient) {
      console.log('⏳ Waiting for client...');
      return;
    }

    if (!window.google || !window.google.maps) {
      console.log('⏳ Waiting for Google Maps...');
      return;
    }

    if (mapInstanceRef.current) {
      console.log('✅ Map already initialized');
      return;
    }

    if (!mapContainerReady || !mapRef.current) {
      console.log('⏳ Waiting for map container...', { mapContainerReady, hasRef: !!mapRef.current });
      return;
    }


    // Get current coordinates
    const currentCoords = getCoordinates();
    
    if (!currentCoords.lat || !currentCoords.lng || isNaN(currentCoords.lat) || isNaN(currentCoords.lng)) {
      console.warn('⚠️ Invalid coordinates, cannot initialize map:', currentCoords);
      return;
    }

    console.log('🗺️ Initializing Google Map with coordinates:', currentCoords);
    console.log('🗺️ Map container ready:', !!mapRef.current);
    console.log('🗺️ Map container dimensions:', mapRef.current?.offsetWidth, 'x', mapRef.current?.offsetHeight);

    try {
      
      // Create map instance
      // const map = new window.google.maps.Map(mapRef.current, {
      //   center: { lat: currentCoords.lat, lng: currentCoords.lng },
      //   zoom: 14,
      //   mapTypeControl: true,
      //   streetViewControl: true,
      //   fullscreenControl: true,
      //   zoomControl: true,
      //   styles: [
      //     {
      //       featureType: 'poi',
      //       elementType: 'labels',
      //       stylers: [{ visibility: 'on' }]
      //     }
      //   ]
      // });
   
      const map = new window.google.maps.Map(mapRef.current, {
              center: { lat: currentCoords.lat, lng: currentCoords.lng },
              zoom: 15,
              styles: airbnbMapStyle,
              disableDefaultUI: true,
              zoomControl: true,
              gestureHandling: "greedy",
              scrollwheel: false,
            });


      mapInstanceRef.current = map;

      // Create custom marker icon (using home icon)
      // const markerIcon = {
      //   url: '/home.png',
      //   scaledSize: new window.google.maps.Size(48, 60),
      //   anchor: new window.google.maps.Point(24, 60),
      //   origin: new window.google.maps.Point(0, 0)
      // };

      // // Create marker
      // const marker = new window.google.maps.Marker({
      //   position: { lat: currentCoords.lat, lng: currentCoords.lng },
      //   map: map,
      //   title: `${address}, ${city}, ${state}`,
      //   icon: markerIcon,
      //   animation: window.google.maps.Animation.DROP
      // });

      const markerDiv = document.createElement("div");
markerDiv.innerHTML = `
  <div style="
    background:white;
    padding:6px 14px;
    border-radius:999px;
    font-weight:600;
    box-shadow:0 4px 12px rgba(0,0,0,0.2);
    cursor:pointer;
  ">
    ₹3,200
  </div>
`;

class PriceMarker extends window.google.maps.OverlayView {
  position;
  div;

  constructor(position) {
    super();
    this.position = position;
  }

  onAdd() {
    this.div = markerDiv;
    this.getPanes().overlayMouseTarget.appendChild(this.div);
  }

  draw() {
    const point = this.getProjection().fromLatLngToDivPixel(
      new window.google.maps.LatLng(this.position)
    );
    this.div.style.position = "absolute";
    this.div.style.left = point.x + "px";
    this.div.style.top = point.y + "px";
  }
}

new PriceMarker({ lat: currentCoords.lat, lng: currentCoords.lng }).setMap(map);


      markerRef.current = markerDiv;

      // Create info window
     <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4">
  <h3 className="font-semibold text-lg">{address}</h3>
  <p className="text-sm text-gray-600">{city}, {state}</p>
  <p className="mt-2 font-bold">₹3,200 / night</p>
</div>


      // infoWindowRef.current = infoWindow;

      // Open info window on marker click
      // markerDiv.addListener('click', () => {
      //   infoWindow.open(map, marker);
      // });

      // // Open info window initially
      // infoWindow.open(map, marker);

        console.log('✅ Google Map initialized successfully');
        setIsLoading(false);
        setMapError(null);
      } catch (error) {
        console.error('❌ Error initializing Google Map:', error);
        console.error('Error details:', error);
        setMapError('Failed to initialize map: ' + (error instanceof Error ? error.message : String(error)));
        setIsLoading(false);
      }
  }, [isClient, mapContainerReady, coords.lat, coords.lng, address, city, state]);

  // Update map when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && infoWindowRef.current && window.google) {
      const newPosition = { lat: coords.lat, lng: coords.lng };
      mapInstanceRef.current.setCenter(newPosition);
      markerRef.current.setPosition(newPosition);
      
      // Update info window content
      infoWindowRef.current.setContent(`
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 4px; color: #1f2937;">Property Location</h3>
          <p style="margin: 0; color: #4b5563; font-size: 14px;">${address}</p>
          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px;">${city}, ${state}</p>
        </div>
      `);
      
      infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
    }
  }, [coords.lat, coords.lng, address, city, state]);

  // Debug logging
  useEffect(() => {
    console.log('PropertyMap coordinates:', {
      received: coordinates,
      processed: coords,
    });
  }, [coordinates, coords]);

  const openInMaps = () => {
    const query = encodeURIComponent(`${address}, ${city}, ${state}, ${country}`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapsUrl, '_blank');
  };

  const getDirections = () => {
    const query = encodeURIComponent(`${address}, ${city}, ${state}, ${country}`);
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    window.open(directionsUrl, '_blank');
  };

  const airbnbMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#dceef2" }]
  },
];


  return (
    <div className="w-full">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-20 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            {/* <div>
              <h3 className="text-lg font-bold text-gray-900">Property Location</h3>
              <p className="text-sm text-gray-600">{address}, {city}, {state}</p>
            </div> */}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={getDirections}
              className="w-full sm:w-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Navigation className="w-4 h-4" />
              Directions
            </button>
            <button
              onClick={openInMaps}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Maps
            </button>
          </div>
        </div>

        <div className="relative">
          {mapError || !coords.lat || !coords.lng || isNaN(coords.lat) || isNaN(coords.lng) ? (
            <div className="h-100 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Map unavailable</p>
                <p className="text-sm text-gray-500 mb-3">
                  {!GOOGLE_MAPS_API_KEY 
                    ? 'Google Maps API key not configured' 
                    : !coords.lat || !coords.lng || isNaN(coords.lat) || isNaN(coords.lng) 
                    ? 'Invalid coordinates' 
                    : mapError || 'Unable to load map'
                  }
                </p>
                <button
                  onClick={openInMaps}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Open in Google Maps
                </button>
              </div>
            </div>
          ) : !isClient || isLoading ? (
            <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : (
            <div 
              ref={(el) => {
                mapRef.current = el;
                if (el && !mapContainerReady) {
                  setMapContainerReady(true);
                }
              }}
              className="h-[320px] sm:h-96 bg-gray-100 rounded-xl overflow-hidden"
              style={{ 
                minHeight: '384px',
                width: '100%',
                height: '100%'
              }}
            />
          )}
        </div>

      
      </div>
    </div>
  );
}


  {/* <div className="mt-4  p-3 sm:p-4  bg-blue-50 rounded-xl">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1  text-sm sm:text-base">Getting There</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                The property is located in {city}, {state}. Use the directions button above to get turn-by-turn navigation.
              </p>
              <div className="text-xs text-gray-500">
                <p>• Check-in: {city} city center</p>
                <p>• Nearest airport: {city} Airport</p>
                <p>• Public transport available nearby</p>
              </div>
            </div>
          </div>
        </div> */}