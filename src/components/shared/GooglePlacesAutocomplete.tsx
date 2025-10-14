"use client";
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface GooglePlacesAutocompleteProps {
  onPlaceSelected: (place: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: [number, number]; // [lng, lat]
  }) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  onPlaceSelected,
  defaultValue = '',
  placeholder = 'Search for a location...',
  className = ''
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if script is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        initAutocomplete();
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', initAutocomplete);
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyB9JgH59f8fK3xzaBfFB6T19u4qGEUeLOM';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      window.initGoogleMaps = () => {
        initAutocomplete();
      };

      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your API key.');
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google) return;

      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'in' }, // Restrict to India
          fields: ['address_components', 'geometry', 'formatted_address', 'name']
        });

        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error initializing autocomplete:', err);
        setError('Failed to initialize location search.');
        setIsLoading(false);
      }
    };

    const handlePlaceSelect = () => {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry) {
        setError('No details available for the selected location.');
        return;
      }

      // Extract address components
      let address = place.formatted_address || '';
      let city = '';
      let state = '';
      let country = '';
      let postalCode = '';

      place.address_components?.forEach((component: any) => {
        const types = component.types;

        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (types.includes('country')) {
          country = component.long_name;
        }
        if (types.includes('postal_code')) {
          postalCode = component.long_name;
        }
      });

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      onPlaceSelected({
        address,
        city,
        state,
        country,
        postalCode,
        coordinates: [lng, lat]
      });
    };

    loadGoogleMapsScript();

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelected]);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          defaultValue={defaultValue}
          placeholder={isLoading ? 'Loading Google Maps...' : placeholder}
          disabled={isLoading || !!error}
          className={`w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 w-5 h-5 animate-spin" />
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      {!error && !isLoading && (
        <p className="text-gray-500 text-xs mt-1">
          Start typing to search for addresses in India
        </p>
      )}
    </div>
  );
};

export default GooglePlacesAutocomplete;


