"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, MapPin, Calendar, Users, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateRange } from 'react-date-range';
import { addDays, format } from 'date-fns';
import AsyncSelect from 'react-select/async';
import { RangeKeyDict } from 'react-date-range';
import { createPortal } from 'react-dom';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { cn } from '@/lib/utils';
import { searchCalendarStyles } from '@/styles/calendars';

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyB9JgH59f8fK3xzaBfFB6T19u4qGEUeLOM';

const formatDate = (date: Date) => format(date, 'dd MMM');

// Timezone-safe date formatting for storage and URL parameters
const formatDateForStorage = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Timezone-safe date parsing from storage and URL parameters
const parseDateFromStorage = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface AirbnbSearchFormProps {
  variant?: 'default' | 'compact';
  initialValues?: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
  className?: string;
  activeCategory?: 'homes' | 'services';
  onSearch?: (location: any, guestsCount?: number, checkInDate?: string, checkOutDate?: string) => void;
}

interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
}

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    minHeight: 'unset',
    height: '2.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    color: '#1e293b',
    paddingLeft: 0,
    '&:hover': {
      border: 'none',
    },
    '&:focus-within': {
      border: 'none',
      boxShadow: 'none',
    },
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: 0,
    paddingLeft: 0,
  }),
  input: (provided: any) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#94a3b8',
    fontWeight: 400,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#1e293b',
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: '#6366f1',
    paddingRight: 0,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  menu: (provided: any) => ({
    ...provided,
    zIndex: 50,
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    background: '#fff',
    padding: '8px 0',
    marginTop: 8,
    border: '1px solid #e5e7eb',
    animation: 'slideDown 0.2s ease-out',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? 'rgba(99,102,241,0.1)'
      : '#fff',
    color: state.isSelected ? '#6366f1' : '#1e293b',
    padding: '12px 16px',
    fontWeight: state.isSelected ? 600 : 500,
    fontSize: '1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    margin: '0 8px',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: state.isSelected ? 'rgba(99,102,241,0.15)' : '#f3f4f6',
    },
  }),
};

// Ensure Google Maps script is loaded
function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('✅ Google Maps already loaded');
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('⏳ Google Maps script already loading, waiting...');
      existingScript.addEventListener('load', () => {
        console.log('✅ Google Maps loaded (existing script)');
        resolve();
      });
      existingScript.addEventListener('error', () => {
        console.error('❌ Failed to load Google Maps (existing script)');
        reject(new Error('Failed to load Google Maps'));
      });
      return;
    }

    // Load the script
    console.log('🔄 Loading Google Maps script...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('✅ Google Maps loaded successfully');
      resolve();
    };

    script.onerror = () => {
      console.error('❌ Failed to load Google Maps script');
      reject(new Error('Failed to load Google Maps'));
    };

    document.head.appendChild(script);
  });
}

// Google Maps Places Autocomplete using JavaScript API
async function fetchPlacesGoogle(inputValue: string): Promise<any[]> {
  if (!inputValue || inputValue.length < 2) {
    console.log('⚠️ Input too short:', inputValue);
    return [];
  }

  try {
    // Ensure Google Maps is loaded
    await loadGoogleMapsScript();

    return new Promise((resolve) => {
      // Double check after loading
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error('❌ Google Maps JavaScript API not loaded after script load');
        resolve([]);
        return;
      }

      console.log('🔍 Fetching places for:', inputValue);

      // Use AutocompleteService from Google Maps JavaScript API
      const service = new window.google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(
        {
          input: inputValue,
          componentRestrictions: { country: 'in' },
          types: ['geocode'] // Match the working PropertyForm - includes all address types
        },
        (predictions, status) => {
          console.log('📍 Google Places API status:', status);
          console.log('📍 Predictions:', predictions);

          if (status !== window.google.maps.places.PlacesServiceStatus.OK) {
            console.log('⚠️ Google Places API returned non-OK status:', status);
            resolve([]);
            return;
          }

          if (!predictions || predictions.length === 0) {
            console.log('⚠️ No predictions returned');
            resolve([]);
            return;
          }

          // Map predictions to our format
          const options = predictions.map((prediction: any) => ({
            value: prediction.structured_formatting?.main_text || prediction.description,
            label: prediction.description,
            placeId: prediction.place_id,
            type: prediction.types?.[0] || 'locality',
            coordinates: null, // Will be fetched when user selects
          }));

          console.log('✅ Mapped options:', options.length, 'results');
          resolve(options);
        }
      );
    });
  } catch (error) {
    console.error('❌ Error in fetchPlacesGoogle:', error);
    return [];
  }
}

// Debounce utility
function debounce<F extends (...args: any[]) => void>(func: F, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const AirbnbSearchForm: React.FC<AirbnbSearchFormProps> = ({ 
  variant = 'default', 
  initialValues, 
  className,
  activeCategory = 'homes',
  onSearch
}) => {
  const [isCompact, setIsCompact] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeField, setActiveField] = useState<'where' | 'checkin' | 'checkout' | 'who' | 'service' | null>(null);
  const [selectedService, setSelectedService] = useState<{ value: string; label: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ value: string; label: string; coordinates?: [number, number]; type?: string } | null>(
    initialValues?.location ? { value: initialValues.location, label: initialValues.location } : null
  );
  
  // Override activeCategory based on current route
  const currentCategory = pathname === '/services' ? 'services' : activeCategory;
  const [dateRange, setDateRange] = useState({
    startDate: initialValues?.checkIn ? new Date(initialValues.checkIn) : new Date(),
    endDate: initialValues?.checkOut ? new Date(initialValues.checkOut) : addDays(new Date(), 1),
    key: 'selection',
  });
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);
  const [guestCounts, setGuestCounts] = useState<GuestCounts>({
    adults: Math.max(1, initialValues?.guests || 2),
    children: 0,
    infants: 0
  });

  useEffect(() => {
  let lastScrollY = window.scrollY;

  const onScroll = () => {
    const currentScrollY = window.scrollY;

    // Hide when scrolling DOWN
    if (currentScrollY > lastScrollY && currentScrollY > 120) {
      setIsHidden(true);
    } 
    // Show when scrolling UP
    else {
      setIsHidden(false);
    }

    // Compact after small scroll
    setIsCompact(currentScrollY > 80);

    lastScrollY = currentScrollY;
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);


  // Update form when initialValues change
  useEffect(() => {
    if (initialValues?.location) {
      setSelectedCity({ value: initialValues.location, label: initialValues.location });
    }
    if (initialValues?.checkIn) {
      setDateRange(prev => ({ ...prev, startDate: new Date(initialValues.checkIn!) }));
    }
    if (initialValues?.checkOut) {
      setDateRange(prev => ({ ...prev, endDate: new Date(initialValues.checkOut!) }));
    }
    if (initialValues?.guests) {
      setGuestCounts(prev => ({ ...prev, adults: Math.max(1, initialValues.guests!) }));
    }
  }, [initialValues]);

  const [dateFlexibility, setDateFlexibility] = useState<'exact' | '1' | '2' | '3' | '7' | '14'>('exact');
  const [recentSearches, setRecentSearches] = useState<Array<{ location: string; dates?: string }>>([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  
  // Service options for Services category
  const serviceOptions = [
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'security', label: 'Security' },
    { value: 'concierge', label: 'Concierge' },
    { value: 'catering', label: 'Catering' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'photography', label: 'Photography' },
    { value: 'event-planning', label: 'Event Planning' }
  ];

  const [suggestedDestinations, setSuggestedDestinations] = useState<Array<{ label: string; description: string; icon?: React.ReactNode }>>([
    {
      label: 'Nearby',
      description: 'Find what\'s around you',
      icon: <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">🧭</div>
    },
    {
      label: 'North Goa, Goa',
      description: 'Popular beach destination',
      icon: <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">🏖️</div>
    },
    {
      label: 'New Delhi, Delhi',
      description: 'For sights like India Gate',
      icon: <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">🏛️</div>
    },
    {
      label: 'Pune City, Maharashtra',
      description: 'Popular with travellers near you',
      icon: <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">🌊</div>
    },
    {
      label: 'Mumbai, Maharashtra',
      description: 'For its top-notch dining',
      icon: <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">🌊</div>
    },
    {
      label: 'Jaipur, Rajasthan',
      description: 'For its stunning architecture',
      icon: <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">🏛️</div>
    },
    {
      label: 'Puducherry, Puducherry',
      description: 'Popular beach destination',
      icon: <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">🏖️</div>
    }
  ]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tripme_recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (error) {
          console.error('Error parsing recent searches:', error);
        }
      }
    }
  }, []);

  // Load search state on component mount and when searchParams change
  useEffect(() => {
    loadSearchState();
  }, [searchParams]);

  // Auto-save search state when data changes
  useEffect(() => {
    if (selectedCity) {
      saveSearchState();
    }
  }, [selectedCity, dateRange, guestCounts]);

  // Save search to recent searches
  const saveRecentSearch = (location: string, dates?: string) => {
    const newSearch = { location, dates };
    const updated = [newSearch, ...recentSearches.filter(s => s.location !== location)].slice(0, 5);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tripme_recent_searches', JSON.stringify(updated));
    }
  };

  // Save current search state to localStorage
  const saveSearchState = () => {
    if (typeof window !== 'undefined' && selectedCity && dateRange.startDate && dateRange.endDate) {
      const searchState = {
        location: selectedCity.label,
        checkIn: formatDateForStorage(dateRange.startDate),
        checkOut: formatDateForStorage(dateRange.endDate),
        guests: totalGuests,
        adults: guestCounts.adults,
        children: guestCounts.children,
        infants: guestCounts.infants
      };
      localStorage.setItem('tripme_current_search', JSON.stringify(searchState));
    }
  };

  // Load search state from localStorage and URL parameters
  const loadSearchState = () => {
    if (typeof window !== 'undefined') {
      // First try to load from URL parameters (higher priority)
      const cityFromUrl = searchParams.get('city');
      const checkInFromUrl = searchParams.get('checkIn');
      const checkOutFromUrl = searchParams.get('checkOut');
      const adultsFromUrl = searchParams.get('adults');
      const childrenFromUrl = searchParams.get('children');
      const infantsFromUrl = searchParams.get('infants');
      
      if (cityFromUrl || checkInFromUrl || checkOutFromUrl) {
        // Load from URL parameters
        // Ignore "undefined" string which can occur from buggy URLs
        if (cityFromUrl && cityFromUrl !== 'undefined') {
          setSelectedCity({ value: cityFromUrl, label: cityFromUrl });
        }
        if (checkInFromUrl && checkOutFromUrl) {
          setDateRange({
            startDate: parseDateFromStorage(checkInFromUrl),
            endDate: parseDateFromStorage(checkOutFromUrl),
            key: 'selection'
          });
        }
        if (adultsFromUrl || childrenFromUrl || infantsFromUrl) {
          setGuestCounts({
            adults: parseInt(adultsFromUrl || '1'),
            children: parseInt(childrenFromUrl || '0'),
            infants: parseInt(infantsFromUrl || '0')
          });
        }
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('tripme_current_search');
        if (saved) {
          try {
            const searchState = JSON.parse(saved);
            // Only set city if it's a valid value (not undefined or empty)
            if (searchState.location && searchState.location !== 'undefined') {
              setSelectedCity({ value: searchState.location, label: searchState.location });
            }
            setDateRange({
              startDate: parseDateFromStorage(searchState.checkIn),
              endDate: parseDateFromStorage(searchState.checkOut),
              key: 'selection'
            });
            setGuestCounts({
              adults: searchState.adults || 1,
              children: searchState.children || 0,
              infants: searchState.infants || 0
            });
          } catch (error) {
            console.error('Error loading search state:', error);
          }
        }
      }
    }
  };

  // Calculate total guests
  const totalGuests = guestCounts.adults + guestCounts.children + guestCounts.infants;

  // Debounced loadOptions for react-select/async
  const debouncedLoadOptions = useRef(
    debounce((inputValue: string, callback: (options: any[]) => void) => {
      fetchPlacesGoogle(inputValue).then(callback);
    }, 400)
  ).current;

  // Detect user's current location
  const detectCurrentLocation = async () => {
    console.log('🚀 detectCurrentLocation function called!');
    
    if (!navigator.geolocation) {
      console.log('❌ Geolocation not supported');
      alert('Geolocation is not supported by this browser.');
      return;
    }

    console.log('🌍 Starting location detection...');
    setIsDetectingLocation(true);

    try {
      // Check if we have permission (if supported by browser)
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          
          if (permission.state === 'denied') {
            alert('📍 Location access is denied!\n\nTo use the "Nearby" feature:\n1. Click the location icon in your browser\'s address bar\n2. Select "Allow" for location access\n3. Refresh the page and try again');
            setIsDetectingLocation(false);
            return;
          }
        } catch (permissionError) {
          console.log('Permissions API not fully supported, proceeding with geolocation request');
        }
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          (error) => {
            console.error('Geolocation error:', error);
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject(new Error('Location access denied by user. Please allow location access and try again.'));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error('Location information is unavailable. Please try again.'));
                break;
              case error.TIMEOUT:
                reject(new Error('Location request timed out. Please try again.'));
                break;
              default:
                reject(new Error('An unknown error occurred while retrieving location.'));
                break;
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get city name using Google Maps Geocoding API
      const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&result_type=locality|sublocality|administrative_area_level_2`;

      const response = await fetch(reverseGeocodeUrl);
      const data = await response.json();

      console.log('Google Reverse geocoding response:', data);

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        console.log('Selected result:', result);
        
        // Extract city name from Google Maps address components
        let cityName = 'Current Location';
        
        if (result.address_components) {
          // Find locality (city name) from address components
          const locality = result.address_components.find((component: any) => 
            component.types.includes('locality')
          );
          
          if (locality) {
            cityName = locality.long_name;
          } else {
            // Fallback: try sublocality or administrative_area_level_2
            const sublocality = result.address_components.find((component: any) => 
              component.types.includes('sublocality') || 
              component.types.includes('sublocality_level_1') ||
              component.types.includes('administrative_area_level_2')
            );
            if (sublocality) {
              cityName = sublocality.long_name;
            } else {
              // Last fallback: use formatted_address first part
              const addressParts = result.formatted_address.split(', ');
              if (addressParts.length > 0) {
                cityName = addressParts[0];
              }
            }
          }
        }
        
        console.log('Extracted city name:', cityName);
        
        // Ensure we have a valid city name
        if (cityName && cityName !== 'Current Location' && cityName !== 'Nearby') {
          setSelectedCity({
            value: cityName,
            label: cityName,
            coordinates: [longitude, latitude],
            type: 'current_location'
          });
          
          console.log('✅ Location detected successfully:', cityName);
        } else {
          console.log('❌ Could not extract valid city name, using coordinates');
          // Fallback: use coordinates as city name
          const coordLabel = `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
          setSelectedCity({
            value: coordLabel,
            label: coordLabel,
            coordinates: [longitude, latitude],
            type: 'current_location'
          });
        }
        
        // Auto-focus on dates after location selection
        setTimeout(() => {
          setActiveField('checkin');
        }, 100);
      } else {
        throw new Error('Could not determine location');
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      
      // Show specific error message based on the error type
      if (error instanceof Error) {
        if (error.message.includes('denied')) {
          alert('📍 Location access denied!\n\nTo use the "Nearby" feature:\n1. Click the location icon in your browser\'s address bar\n2. Select "Allow" for location access\n3. Refresh the page and try again');
        } else if (error.message.includes('timeout')) {
          alert('⏱️ Location request timed out!\n\nPlease check your internet connection and try again.');
        } else if (error.message.includes('unavailable')) {
          alert('❌ Location unavailable!\n\nPlease ensure your device\'s location services are enabled and try again.');
        } else {
          alert(`❌ ${error.message}\n\nPlease try searching manually or check your browser settings.`);
        }
      } else {
        alert('❌ Unable to detect your location. Please search manually.');
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Custom calendar styles are now handled in globals.css

  // Load Google Maps JavaScript API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('✅ Google Maps already loaded');
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('⏳ Google Maps script already added, waiting for load...');
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Maps JavaScript API loaded successfully');
    };

    script.onerror = () => {
      console.error('❌ Failed to load Google Maps JavaScript API');
    };

    document.head.appendChild(script);
  }, []);

  // Function to get coordinates for a city name
  const getCityCoordinates = async (cityName: string): Promise<[number, number] | null> => {
    if (!window.google?.maps?.places?.PlacesService) {
      console.log('Google Places API not available, skipping coordinate lookup');
      return null;
    }

    try {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      return new Promise((resolve) => {
        service.textSearch({
          query: cityName,
          fields: ['geometry', 'formatted_address']
        }, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const place = results[0];
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
              console.log(`📍 Found coordinates for ${cityName}:`, [lng, lat]);
              resolve([lng, lat]);
            } else {
              resolve(null);
            }
          } else {
            console.log(`❌ Could not find coordinates for ${cityName}`);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  };

  // Test function for debugging (can be called from browser console)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testLocationDetection = detectCurrentLocation;
      (window as any).getCityCoordinates = getCityCoordinates;
      // Google Maps API test function (for debugging)
      (window as any).testGoogleMapsAPI = async (lat: number, lng: number) => {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
        console.log('Testing Google Maps API with URL:', url);
        const response = await fetch(url);
        const data = await response.json();
        console.log('Google Maps API response:', data);
        return data;
      };
    }
  }, []);

  // Clear search input when dropdown opens
  useEffect(() => {
    if (activeField === 'where') {
      setSearchInputValue('');
    }
  }, [activeField]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return;
    
    // Save current search state before navigating
    saveSearchState();
    
    // If Services category is selected, redirect to services page
    if (currentCategory === 'services') {
      const params = new URLSearchParams();
      if (selectedCity) {
        params.append('city', selectedCity.value);
      }
      if (selectedService) {
        params.append('serviceType', selectedService.value);
      }
      const servicesUrl = `/services${params.toString() ? `?${params.toString()}` : ''}`;
      router.push(servicesUrl);
      saveRecentSearch(selectedCity.label, `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`);
      return;
    }
    
    // For Homes category, use the existing search logic
    const params = new URLSearchParams({
      guests: totalGuests.toString(),
      adults: guestCounts.adults.toString(),
      children: guestCounts.children.toString(),
      infants: guestCounts.infants.toString(),
      checkIn: formatDateForStorage(dateRange.startDate),
      checkOut: formatDateForStorage(dateRange.endDate),
      category: currentCategory,
    });

    // Always add city to URL parameters if selectedCity exists
    if (selectedCity) {
      params.append('city', selectedCity.value);
      
      let coordinates = selectedCity.coordinates;
      
      // If coordinates are not available, try to get them
      if (!coordinates || coordinates.length !== 2) {
        console.log('📍 No coordinates found for', selectedCity.value, '- attempting to get them...');
        coordinates = await getCityCoordinates(selectedCity.value);
        
        // Update selectedCity with coordinates if found
        if (coordinates) {
          setSelectedCity(prev => prev ? { ...prev, coordinates } : null);
        }
      }
      
      // If coordinates are available, also add them for more precise geospatial search
      if (coordinates && coordinates.length === 2) {
        params.append('lng', String(coordinates[0])); // Longitude
        params.append('lat', String(coordinates[1])); // Latitude
        params.append('radius', '10000'); // 10km initial radius (in meters)
        console.log('✅ Adding coordinates to URL:', coordinates);
      } else {
        console.log('❌ No coordinates available for', selectedCity.value);
      }
    }

    // If onSearch prop is provided, call it instead of navigating
    if (onSearch) {
      onSearch(selectedCity, totalGuests, formatDateForStorage(dateRange.startDate), formatDateForStorage(dateRange.endDate));
    } else {
      const searchUrl = `/search?${params.toString()}`;
      router.push(searchUrl);
    }
    saveRecentSearch(selectedCity.label, `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`);
  };

  // Guest selection helpers
  const updateGuestCount = (type: keyof GuestCounts, increment: boolean) => {
    setGuestCounts(prev => {
      const newCounts = { ...prev };
      if (increment) {
        if (type === 'adults') {
          newCounts.adults = Math.min(16, newCounts.adults + 1);
        } else if (type === 'children') {
          newCounts.children = Math.min(10, newCounts.children + 1);
        } else if (type === 'infants') {
          newCounts.infants = Math.min(5, newCounts.infants + 1);
        }
      } else {
        if (type === 'adults') {
          newCounts.adults = Math.max(1, newCounts.adults - 1);
        } else if (type === 'children') {
          newCounts.children = Math.max(0, newCounts.children - 1);
        } else if (type === 'infants') {
          newCounts.infants = Math.max(0, newCounts.infants - 1);
        }
      }
      return newCounts;
    });
  };

  // Generate guest display text
  const getGuestDisplayText = () => {
    const parts = [];
    if (guestCounts.adults > 0) {
      parts.push(`${guestCounts.adults} adult${guestCounts.adults > 1 ? 's' : ''}`);
    }
    if (guestCounts.children > 0) {
      parts.push(`${guestCounts.children} child${guestCounts.children > 1 ? 'ren' : ''}`);
    }
    if (guestCounts.infants > 0) {
      parts.push(`${guestCounts.infants} infant${guestCounts.infants > 1 ? 's' : ''}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Add guests';
  };

  // Close overlays on outside click (but not on scroll)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-form-container')) {
        setActiveField(null);
      }
    }
    
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveField(null);
      }
    }

    if (activeField) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Don't add scroll listener - overlays should stay open when scrolling
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeField]);

  return (
    <div className={cn("search-form-container relative w-full", className)}>
      {/* Main Search Bar - Airbnb Style */}
      <form
        onSubmit={handleSearch}
        className={cn(
          "flex rounded-full  items-center transition-all duration-300",
            // isCompact ? "min-h-[44px]" : "min-h-[56px]",
             isHidden && "h-0 opacity-0 -translate-y-6 pointer-events-none",
    !isHidden && "opacity-100 translate-y-0",
          activeField 
            ? "bg-[#EBEBEB] shadow-[0_3px_12px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.08)]" 
            : "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] border border-gray-200 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)]"
          
        )}
      >
        {/* Where Field */}
        <div className="flex-1 min-w-0 relative">
          <button
            type="button"
            onClick={() => setActiveField(activeField === 'where' ? null : 'where')}
            className={cn(
              "w-full px-8 py-3.5 text-left transition-all duration-200 rounded-full flex flex-col justify-center",
              // isCompact ? "px-4 py-2" : "px-8 py-3.5",
              activeField === 'where' 
                ? "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.12)]" 
                : activeField 
                  ? "hover:bg-[#DDDDDD]" 
                  : "hover:bg-gray-100"
            )}
          >
             <div className="text-xs font-semibold text-gray-800">Where</div>
           
            <div className={cn(
              "text-sm truncate mt-0.5",
              selectedCity ? "text-gray-800" : "text-gray-400"
            )}>
              {selectedCity ? selectedCity.label : 'Search destinations'}
            </div>
          </button>
        </div>

        {/* Divider - hide when any field is active */}
        <div className={cn(
          "h-8 w-px flex-shrink-0 transition-opacity duration-200",
          activeField ? "bg-transparent" : "bg-gray-300"
        )}></div>

        {/* When Field */}
        <div className="flex-1 min-w-0 relative">
          <button
            type="button"
            onClick={() => {
              setActiveField(activeField === 'checkin' ? null : 'checkin');
              if (activeField !== 'checkin') {
                setIsSelectingStartDate(true);
              }
            }}
            className={cn(
              "w-full px-8 py-3.5 text-left transition-all duration-200 rounded-full flex flex-col justify-center",
              
              (activeField === 'checkin' || activeField === 'checkout')
                ? "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.12)]" 
                : activeField 
                  ? "hover:bg-[#DDDDDD]" 
                  : "hover:bg-gray-100"
            )}
          >
             <div className="text-xs font-semibold text-gray-800">Date</div>
            <div className={cn(
              "text-sm truncate mt-0.5",
              dateRange.startDate && dateRange.endDate ? "text-gray-800" : "text-gray-400"
            )}>
              {dateRange.startDate && dateRange.endDate 
                ? `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`
                : 'Add dates'
              }
            </div>
          </button>
        </div>

        {/* Divider - hide when any field is active */}
        <div className={cn(
          "h-8 w-px flex-shrink-0 transition-opacity duration-200",
          activeField ? "bg-transparent" : "bg-gray-300"
        )}></div>

        {/* Who Field + Search Button */}
        <div className="flex items-center flex-1 min-w-0">
          {currentCategory === 'services' ? (
            <button
              type="button"
              onClick={() => setActiveField(activeField === 'service' ? null : 'service')}
              className={cn(
                "flex-1 px-8 py-3.5 text-left transition-all duration-200 rounded-full flex flex-col justify-center",
                activeField === 'service' 
                  ? "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.12)]" 
                  : activeField 
                    ? "hover:bg-[#DDDDDD]" 
                    : "hover:bg-gray-100"
              )}
            >
              <div className="text-xs font-semibold text-gray-800">Service</div>
              <div className={cn(
                "text-sm truncate mt-0.5",
                selectedService ? "text-gray-800" : "text-gray-400"
              )}>
                {selectedService ? selectedService.label : 'Add service'}
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveField(activeField === 'who' ? null : 'who')}
              className={cn(
                "flex-1 px-8 py-3.5 text-left transition-all duration-200 rounded-full flex flex-col justify-center",
                
                activeField === 'who' 
                  ? "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.12)]" 
                  : activeField 
                    ? "hover:bg-[#DDDDDD]" 
                    : "hover:bg-gray-100"
              )}
            >
              <div className="text-xs font-semibold text-gray-800">Who</div>
              <div className={cn(
                "text-sm truncate mt-0.5",
                guestCounts.adults > 1 || guestCounts.children > 0 || guestCounts.infants > 0 ? "text-gray-800" : "text-gray-400"
              )}>
                {getGuestDisplayText()}
              </div>
            </button>
          )}

          {/* Search Button - Airbnb Pink Pill */}
          <button
            type="submit"
            className="mr-2 h-12 px-5 bg-[#FF385C] hover:bg-[#E31C5F] text-white rounded-full flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.04] active:scale-[0.98] font-medium shadow-sm"
          >
            <Search size={16} strokeWidth={2.5} />
            <span className="text-sm font-medium">Search</span>
          </button>
        </div>
      </form>

      {/* Where Overlay */}
      {activeField === 'where' && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 search-overlay w-96">
          <div className="p-6">
            <div className="text-lg font-semibold text-gray-900 mb-4">Search destinations</div>
            
            {/* Search Input */}
            <div className="relative mb-6">
              <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3">
                <Search className="text-gray-400 mr-3" size={20} />
                <AsyncSelect
                  cacheOptions
                  loadOptions={debouncedLoadOptions}
                  defaultOptions={false}
                  value={null} // Always null so it doesn't show selected value in input
                  inputValue={searchInputValue}
                  onInputChange={(newValue) => setSearchInputValue(newValue)}
                  onChange={async (option) => {
                    const opt = option as { value: string; label: string; coordinates?: [number, number]; type?: string; placeId?: string };
                    
                    // If we have a placeId, fetch coordinates from Google Places
                    if (opt.placeId && window.google && window.google.maps) {
                      const service = new window.google.maps.places.PlacesService(
                        document.createElement('div')
                      );
                      
                      service.getDetails(
                        {
                          placeId: opt.placeId,
                          fields: ['geometry', 'formatted_address', 'name']
                        },
                        (place, status) => {
                          if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
                            const lat = place.geometry.location?.lat();
                            const lng = place.geometry.location?.lng();
                            
                            setSelectedCity({
                              value: opt.value,
                              label: opt.label,
                              coordinates: lng && lat ? [lng, lat] : undefined,
                              type: opt.type
                            });
                          } else {
                            // Fallback: set without coordinates
                            setSelectedCity({ value: opt.value, label: opt.label, type: opt.type });
                          }
                        }
                      );
                    } else {
                      // No placeId, just set the city
                      setSelectedCity({ value: opt.value, label: opt.label, coordinates: opt.coordinates, type: opt.type });
                    }
                    
                    setSearchInputValue(''); // Clear input after selection
                    setActiveField(null);
                    // Auto-focus on dates after location selection
                    setTimeout(() => {
                      setActiveField('checkin');
                    }, 100);
                  }}
                  onFocus={() => {
                    // Clear input when focused
                    setSearchInputValue('');
                  }}
                  placeholder="Search destinations"
                  styles={{
                    ...customSelectStyles,
                    menuPortal: (base: any) => ({ ...base, zIndex: 60 })
                  }}
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
                  isSearchable
                  menuPlacement="auto"
                  className="w-full"
                  components={{ DropdownIndicator: () => null }}
                />
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-96 overflow-y-auto px-6 pb-6">
            {/* Suggested Destinations */}
            <div className="space-y-2">
              {suggestedDestinations.map((dest, idx) => (
                <button
                  key={dest.label}
                  type="button"
                  className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                  onClick={() => {
                    if (dest.label === 'Nearby') {
                      // For Nearby button, detect location instead of setting "Nearby"
                      console.log('🔘 Dropdown Nearby button clicked!');
                      detectCurrentLocation();
                      setActiveField(null);
                    } else {
                      // For other destinations, use normal behavior
                    setSelectedCity({ value: dest.label, label: dest.label });
                    setActiveField(null);
                    // Auto-focus on dates after location selection
                    setTimeout(() => {
                      setActiveField('checkin');
                    }, 100);
                    }
                  }}
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100">
                    {dest.label === 'Nearby' && isDetectingLocation ? (
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      dest.icon
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {dest.label === 'Nearby' && isDetectingLocation ? 'Detecting location...' : dest.label}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {dest.label === 'Nearby' && isDetectingLocation ? 'Please wait while we find your location' : dest.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm font-semibold text-gray-700 mb-3">Recent searches</div>
                <div className="space-y-2">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={search.location + idx}
                      type="button"
                      className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                      onClick={() => {
                        setSelectedCity({ value: search.location, label: search.location });
                        setActiveField(null);
                        // Auto-focus on dates after location selection
                        setTimeout(() => {
                          setActiveField('checkin');
                        }, 100);
                      }}
                    >
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100">
                        <MapPin className="text-gray-500" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{search.location}</div>
                        {search.dates && <div className="text-gray-500 text-sm">{search.dates}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date Picker Overlay */}
      {(activeField === 'checkin' || activeField === 'checkout') && (
        <div className={cn(
          "absolute top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 search-overlay w-full max-h-[80vh] overflow-hidden",
          activeCategory === 'services' ? "left-0" : "left-0"
        )}>
          <div className="p-3 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex bg-gray-100 rounded-full p-1">
                <button
                  type="button"
                  className="px-6 py-2 text-sm font-semibold rounded-full transition-colors bg-white text-gray-900 shadow-sm"
                >
                  Dates
                </button>
              </div>
            </div>

            <DateRange
              ranges={[dateRange]}
              onChange={(ranges: RangeKeyDict) => {
                const selection = ranges.selection;
                
                if (isSelectingStartDate) {
                  // Selecting start date
                  if (selection.startDate) {
                    setDateRange({
                      startDate: selection.startDate,
                      endDate: dateRange.endDate, // Keep existing end date
                      key: 'selection'
                    });
                    setIsSelectingStartDate(false); // Next click will be end date
                  }
                } else {
                  // Selecting end date
                  if (selection.endDate && selection.endDate > dateRange.startDate) {
                    setDateRange({
                      startDate: dateRange.startDate,
                      endDate: selection.endDate,
                      key: 'selection'
                    });
                    // Both dates selected - close picker and move to guests
                    setActiveField(null);
                    setTimeout(() => {
                      setActiveField('who');
                    }, 200);
                  }
                }
              }}
              minDate={new Date()}
              showDateDisplay={false}
              showMonthAndYearPickers={false}
              direction="horizontal"
              months={2}
              rangeColors={['#333333']}
              color="#333333"
              className={`${searchCalendarStyles.searchCalendarWrapper} rounded-lg`}
              editableDateInputs={false}
              moveRangeOnFirstSelection={false}
            />

            {/* Date Flexibility Options */}
            {/* <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-3">Date flexibility</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'exact', label: 'Exact dates' },
                  { value: '1', label: '± 1 day' },
                  { value: '2', label: '± 2 days' },
                  { value: '3', label: '± 3 days' },
                  { value: '7', label: '± 7 days' },
                  { value: '14', label: '± 14 days' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDateFlexibility(option.value as any)}
                    className={cn(
                      "px-4 py-2 text-sm rounded-full border transition-colors",
                      dateFlexibility === option.value
                        ? "bg-white text-black border-black"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div> */}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setDateRange({
                    startDate: new Date(),
                    endDate: addDays(new Date(), 1),
                    key: 'selection'
                  });
                  setIsSelectingStartDate(true);
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear dates
              </button>
              <button
                type="button"
                onClick={() => setActiveField(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Selection Overlay */}
      {activeField === 'who' && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 search-overlay w-80">
          <div className="text-lg font-semibold text-gray-900 mb-4">Guests</div>
          
          {/* Adults */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <div className="font-semibold text-gray-900">Adults</div>
              <div className="text-sm text-gray-500">Ages 13 or above</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => updateGuestCount('adults', false)}
                disabled={guestCounts.adults <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold">{guestCounts.adults}</span>
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => updateGuestCount('adults', true)}
                disabled={guestCounts.adults >= 16}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <div className="font-semibold text-gray-900">Children</div>
              <div className="text-sm text-gray-500">Ages 2-12</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => updateGuestCount('children', false)}
                disabled={guestCounts.children <= 0}
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold">{guestCounts.children}</span>
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => updateGuestCount('children', true)}
                disabled={guestCounts.children >= 10}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Infants */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="font-semibold text-gray-900">Infants</div>
              <div className="text-sm text-gray-500">Under 2</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => updateGuestCount('infants', false)}
                disabled={guestCounts.infants <= 0}
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold">{guestCounts.infants}</span>
              <button
                type="button"
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => updateGuestCount('infants', true)}
                disabled={guestCounts.infants >= 5}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Service Animal Link */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="text-sm text-gray-600 underline hover:text-gray-800 transition-colors"
            >
              Bringing a service animal?
            </button>
          </div>
        </div>
      )}

      {/* Service Selection Overlay */}
      {activeField === 'service' && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 search-overlay w-80">
          <div className="text-lg font-semibold text-gray-900 mb-4">Type of service</div>
          
          <div className="space-y-2">
            {serviceOptions.map((service) => (
              <button
                key={service.value}
                type="button"
                onClick={() => {
                  setSelectedService(service);
                  setActiveField(null);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border transition-all duration-200",
                  selectedService?.value === service.value
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="font-medium text-gray-900">{service.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AirbnbSearchForm;
