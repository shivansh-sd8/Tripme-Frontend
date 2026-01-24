"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Search, Check, X, Loader2, ChevronRight } from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Types for location data
interface PlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationDetails {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

type Step = 'search' | 'confirm' | 'pin';

export default function LocationPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  
  // Current step in the location flow
  const [step, setStep] = useState<Step>('search');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Location state
  const [location, setLocation] = useState<LocationDetails>({
    address: data.location?.address || '',
    city: data.location?.city || '',
    state: data.location?.state || '',
    country: data.location?.country || 'India',
    pincode: data.location?.pincode || '',
    coordinates: data.location?.coordinates || { lat: 20.5937, lng: 78.9629 }, // Default to India center
  });
  
  // UI state
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const initMap = () => {
      if ((window as any).google?.maps) {
        setMapLoaded(true);
      }
    };

    if (typeof window !== 'undefined') {
      // Check if already loaded
      if ((window as any).google?.maps) {
        setMapLoaded(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', initMap);
        return;
      }

      // Load the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, []);

  // Initialize map when loaded
  useEffect(() => {
    const google = (window as any).google;
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current || !google?.maps) {
      return;
    }
    
    const map = new google.maps.Map(mapRef.current, {
      center: location.coordinates,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });
    
    mapInstanceRef.current = map;
    
    // Create marker
    const marker = new google.maps.Marker({
      position: location.coordinates,
      map,
      draggable: step === 'pin',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#FF385C',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3,
      },
    });
    
    markerRef.current = marker;
    
    // Initialize services
    autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
    placesServiceRef.current = new google.maps.places.PlacesService(map);
    geocoderRef.current = new google.maps.Geocoder();
    
    // Handle marker drag
    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      if (pos) {
        reverseGeocode(pos.lat(), pos.lng());
      }
    });
  }, [mapLoaded, step]);

  // Update marker draggable state based on step
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setDraggable(step === 'pin');
    }
  }, [step]);

  // Search for places
  const searchPlaces = useCallback((query: string) => {
    if (!autocompleteServiceRef.current || query.length < 3) {
      setSuggestions([]);
      return;
    }
    
    setIsSearching(true);
    const google = (window as any).google;
    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'in' }, // Restrict to India
        types: ['address'],
      },
      (predictions: any, status: any) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions as PlaceSuggestion[]);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      }
    );
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchPlaces(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchPlaces]);

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    
    try {
      const response = await geocoderRef.current.geocode({
        location: { lat, lng },
      });
      
      if (response.results[0]) {
        const result = response.results[0];
        const addressComponents = result.address_components;
        
        let city = '';
        let state = '';
        let country = '';
        let pincode = '';
        let streetAddress = '';
        
        addressComponents.forEach((component: any) => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('country')) {
            country = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            pincode = component.long_name;
          }
          if (component.types.includes('street_number') || component.types.includes('route') || component.types.includes('sublocality')) {
            streetAddress += (streetAddress ? ', ' : '') + component.long_name;
          }
        });
        
        setLocation({
          address: streetAddress || result.formatted_address,
          city,
          state,
          country,
          pincode,
          coordinates: { lat, lng },
        });
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  };

  // Select a place from suggestions
  const selectPlace = (suggestion: PlaceSuggestion) => {
    if (!placesServiceRef.current) return;
    
    setShowSuggestions(false);
    setSearchQuery(suggestion.description);
    
    const google = (window as any).google;
    placesServiceRef.current.getDetails(
      {
        placeId: suggestion.place_id,
        fields: ['geometry', 'address_components', 'formatted_address'],
      },
      (place: any, status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          // Update map
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(17);
            markerRef.current.setPosition({ lat, lng });
          }
          
          // Parse address components
          const addressComponents = place.address_components || [];
          let city = '';
          let state = '';
          let country = '';
          let pincode = '';
          let streetAddress = '';
          
          addressComponents.forEach((component: any) => {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (component.types.includes('country')) {
              country = component.long_name;
            }
            if (component.types.includes('postal_code')) {
              pincode = component.long_name;
            }
            if (component.types.includes('street_number') || component.types.includes('route') || component.types.includes('sublocality_level_1') || component.types.includes('sublocality_level_2')) {
              streetAddress += (streetAddress ? ', ' : '') + component.long_name;
            }
          });
          
          setLocation({
            address: streetAddress || place.formatted_address || '',
            city,
            state,
            country,
            pincode,
            coordinates: { lat, lng },
          });
          
          setStep('confirm');
        }
      }
    );
  };

  // Use current location
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsLoadingLocation(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update map
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter({ lat: latitude, lng: longitude });
          mapInstanceRef.current.setZoom(17);
          markerRef.current.setPosition({ lat: latitude, lng: longitude });
        }
        
        // Reverse geocode
        reverseGeocode(latitude, longitude);
        setIsLoadingLocation(false);
        setStep('confirm');
      },
      (err) => {
        setIsLoadingLocation(false);
        setError('Unable to get your location. Please enter address manually.');
        console.error('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Validation
  const isValid = location.address.length >= 5 && location.city && location.state && location.country;

  // Handle next
  const handleNext = () => {
    if (step === 'confirm') {
      setStep('pin');
      return;
    }
    
    if (step === 'pin' && isValid) {
      updateData({
        location: {
          address: location.address,
          city: location.city,
          state: location.state,
          country: location.country,
          pincode: location.pincode,
          coordinates: location.coordinates,
        },
      });
      router.push('/host/property/new/photos');
    }
  };

  // Handle back within location flow
  const handleBack = () => {
    if (step === 'pin') {
      setStep('confirm');
    } else if (step === 'confirm') {
      setStep('search');
    } else {
      router.push('/host/property/new/floor-plan');
    }
  };

  // Get next button label
  const getNextLabel = () => {
    if (step === 'confirm') return 'Looks good';
    if (step === 'pin') return 'Confirm location';
    return 'Next';
  };

  return (
    <OnboardingLayout
      currentMainStep={1}
      currentSubStep="location"
      onNext={handleNext}
      onBack={handleBack}
      nextDisabled={step === 'search' || (step === 'pin' && !isValid)}
      nextLabel={getNextLabel()}
    >
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Left side - Form */}
        <div className="flex-1 max-w-lg">
          <AnimatePresence mode="wait">
            {step === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                  Where's your place located?
                </h1>
                <p className="text-gray-500 mb-8">
                  Your address is only shared with guests after they've made a reservation.
                </p>

                {/* Search input */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Enter your address"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:border-gray-900 outline-none transition-all text-lg"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                </div>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                    >
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.place_id}
                          onClick={() => selectPlace(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                        >
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {suggestion.structured_formatting.main_text}
                            </p>
                            <p className="text-sm text-gray-500">
                              {suggestion.structured_formatting.secondary_text}
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Use current location button */}
                <button
                  onClick={useCurrentLocation}
                  disabled={isLoadingLocation}
                  className="w-full flex items-center gap-3 px-4 py-4 border-2 border-gray-300 rounded-xl hover:border-gray-900 transition-all group"
                >
                  {isLoadingLocation ? (
                    <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  )}
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">
                    {isLoadingLocation ? 'Getting your location...' : 'Use my current location'}
                  </span>
                </button>

                {error && (
                  <p className="mt-4 text-sm text-red-600">{error}</p>
                )}
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                  Is this the right location?
                </h1>
                <p className="text-gray-500 mb-8">
                  If needed, you can adjust the pin on the map in the next step.
                </p>

                {/* Address display */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{location.address}</p>
                      <p className="text-gray-600 mt-1">
                        {[location.city, location.state, location.pincode, location.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Edit fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street address
                    </label>
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={location.city}
                        onChange={(e) => setLocation({ ...location, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={location.state}
                        onChange={(e) => setLocation({ ...location, state: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={location.pincode}
                        onChange={(e) => setLocation({ ...location, pincode: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={location.country}
                        onChange={(e) => setLocation({ ...location, country: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'pin' && (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                  Is the pin in the right spot?
                </h1>
                <p className="text-gray-500 mb-8">
                  Drag the pin to adjust the exact location of your place. This helps guests find you.
                </p>

                {/* Final address display */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{location.address}</p>
                      <p className="text-sm text-green-700">
                        {[location.city, location.state, location.pincode].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  <strong>Tip:</strong> Drag the pin on the map to mark the exact entrance to your property.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side - Map */}
        <div className="flex-1 min-h-[400px] lg:min-h-0">
          <div
            ref={mapRef}
            className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-gray-100"
          >
            {!mapLoaded && (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
