"use client";

import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Custom property marker icon using home.png (same as PropertyForm)
// Create icon only on client side to avoid SSR issues
const createPropertyMarkerIcon = () => {
  if (typeof window === 'undefined') return null;
  return new L.Icon({
    iconUrl: '/home.png',
    iconSize: [48, 60],
    iconAnchor: [24, 60],
    popupAnchor: [0, -60],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    shadowSize: [61, 61],
    shadowAnchor: [18, 61],
  });
};

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

export default function PropertyMap({ 
  address, 
  city, 
  state, 
  country = 'India',
  coordinates 
}: PropertyMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

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
  const mapCenter: [number, number] = [coords.lat, coords.lng];

  // Debug logging
  useEffect(() => {
    console.log('PropertyMap coordinates:', {
      received: coordinates,
      processed: coords,
      mapCenter
    });
  }, [coordinates, coords, mapCenter]);

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

  return (
    <div className="w-full">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Property Location</h3>
              <p className="text-sm text-gray-600">{address}, {city}, {state}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={getDirections}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
            <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Map unavailable</p>
                <p className="text-sm text-gray-500 mb-3">
                  {!coords.lat || !coords.lng || isNaN(coords.lat) || isNaN(coords.lng) 
                    ? 'Invalid coordinates' 
                    : 'Unable to load map'
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
          ) : !isClient ? (
            <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : (
            <div className="h-96 bg-gray-100 rounded-xl overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={mapCenter}
                  icon={createPropertyMarkerIcon()}
                >
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-900 mb-1">Property Location</h3>
                      <p className="text-sm text-gray-600">{address}</p>
                      <p className="text-sm text-gray-500">{city}, {state}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Getting There</h4>
              <p className="text-sm text-gray-600 mb-2">
                The property is located in {city}, {state}. Use the directions button above to get turn-by-turn navigation.
              </p>
              <div className="text-xs text-gray-500">
                <p>• Check-in: {city} city center</p>
                <p>• Nearest airport: {city} Airport</p>
                <p>• Public transport available nearby</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
