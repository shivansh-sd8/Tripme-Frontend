"use client";
import { ChevronLeft, X, Search } from "lucide-react";
import React, { useState, useRef,useEffect,useCallback  } from "react";
import { useSearchState } from '@/hooks/useSearchState';
import { useRouter, useSearchParams } from 'next/navigation';
import AsyncSelect from 'react-select/async';

function CategoryTabs({ onClose, activeCategory, setActiveCategory }: { 
  onClose: () => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}) {
  const categories = [
    { id: 'homes', icon: '🏠', label: 'Homes' },
    { id: 'services', icon: '🔔', label: 'Services' },
    { id: 'stories', icon: '📖', label: 'Stories' },
  ];

  return (
    <div className="flex gap-8 justify-center border-b border-gray-200 px-4 bg-white">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setActiveCategory(cat.id)}
          className={`py-4 font-semibold flex flex-col items-center gap-1 ${
            activeCategory === cat.id
              ? 'text-gray-800 border-b-2 border-black'
              : 'text-gray-400'
          }`}
        >
          <span className="text-xl">{cat.icon}</span>
          <span className="text-xs">{cat.label}</span>
        </button>
      ))}
      <button className="absolute right-4 top-4 p-2"
       onClick={onClose}>
        <X size={24} className="text-gray-600" />
      </button>
    </div>
  );
}

function Calendar({ onNext, dateRange, setDateRange }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({ start: null, end: null });

  const daysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth(currentDate) }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth(currentDate) }, () => null);

  const handleDateClick = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      setSelectedDates({ start: newDate, end: null });
    } else {
      if (newDate < selectedDates.start) {
        setSelectedDates({ start: newDate, end: selectedDates.start });
      } else {
        setSelectedDates({ start: selectedDates.start, end: newDate });
      }
    }
  };

  const isDateInRange = (day) => {
    if (!selectedDates.start) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (!selectedDates.end) return date.getTime() === selectedDates.start.getTime();
    return date >= selectedDates.start && date <= selectedDates.end;
  };

  const isStartOrEnd = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return (
      (selectedDates.start && date.getTime() === selectedDates.start.getTime()) ||
      (selectedDates.end && date.getTime() === selectedDates.end.getTime())
    );
  };

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

   const today = new Date();
today.setHours(0, 0, 0, 0);

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



  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-gray-800">When?</h3>

        {/* Tabs */}
        <div className="flex justify-center  items-center">
          <button className="px-4 py-2 border  rounded-full text-sm font-medium bg-[#4285f4] text-white">
            Dates
          </button>
          {/* <button className="px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100">
            Months
          </button>
          <button className="px-4 py-2 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100">
            Flexible
          </button> */}
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
              )
            }
            className="text-gray-600 hover:text-gray-800 text-lg"
          >
            ←
          </button>
          <h4 className="text-gray-800 font-semibold text-center">{monthYear}</h4>
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
              )
            }
            className="text-gray-600 hover:text-gray-800 text-lg"
          >
            →
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <div key={d} className="text-xs font-semibold text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const currentDayDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );

          const isPast = currentDayDate < today;

            const inRange = isDateInRange(day);
            const isStartOrEndDay = isStartOrEnd(day);

            return (
              <button
                key={day}
                onClick={() => !isPast && handleDateClick(day)}
                className={`py-2 text-sm font-medium rounded-lg transition ${
                   isPast  ?
               "text-gray-300 cursor-not-allowed pointer-events-none" :
                  isStartOrEndDay
                    
                     ? "bg-[#4285f4] text-white font-bold"
                      : inRange
                      ? "bg-[#ECF2FD] text-black"
                      : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Flexible options */}
      {/* <div className="flex gap-2">
        <button className="flex-1 py-2 border border-gray-800 rounded-full text-sm font-medium text-gray-800 hover:bg-gray-50">
          Exact dates
        </button>
        <button className="flex-1 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50">
          ± 1 day
        </button>
        <button className="flex-1 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50">
          ± 2 days
        </button>
      </div> */}
    </div>
  );
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

export default function MobileSearchSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {

   if (!open) return null;
  
  // Use shared search state hook
  const {
    selectedCity,
    setSelectedCity,
    dateRange,
    setDateRange,
    guestCounts,
    setGuestCounts,
    recentSearches,
    totalGuests,
    saveSearchState,
    addToRecentSearches,
    updateGuestCount,
    getGuestDisplayText
  } = useSearchState();
  
  const [activeStep, setActiveStep] = useState("where");
  const [whereSearch, setWhereSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState('homes');
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const [dragging, setDragging] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  


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

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const onTouchMove = (e) => {
    if (!dragging || !sheetRef.current) return;
    currentY.current = e.touches[0].clientY - startY.current;
    if (currentY.current > 0) {
      sheetRef.current.style.transform = `translateY(${currentY.current}px)`;
    }
  };

  const onTouchEnd = () => {
    setDragging(false);
    if (!sheetRef.current) return;
    if (currentY.current > 120) {
      onClose();
    } else {
      sheetRef.current.style.transform = `translateY(0px)`;
    }
    currentY.current = 0;
  };

  const destinations = [
    { name: "Nearby", desc: "Find what's around you", icon: "✈️" },
    { name: "South Goa, Goa", desc: "Popular beach destination", icon: "🏖️" },
    { name: "North Goa, Goa", desc: "For sights like Fort Aguada", icon: "🏰" },
    { name: "Panaji, Goa", desc: "A hidden gem", icon: "💎" },
    { name: "Palolem Beach", desc: "For its seaside allure", icon: "🏝️" },
    { name: "Calangute, Goa", desc: "For its bustling nightlife", icon: "🎉" },
    { name: "Majorda, Goa", desc: "Off the beaten path", icon: "🌲" },
  ];


  
 const handleSearch = () => {
    if (!selectedCity) return;
    
    // Save current search state before navigating
    saveSearchState();
    
    // Add to recent searches
    if (dateRange.startDate && dateRange.endDate) {
      const datesStr = `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`;
      addToRecentSearches(selectedCity.label, datesStr);
    }
    
    // Navigate to search results
    const params = new URLSearchParams({
      city: selectedCity.value,
      guests: totalGuests.toString(),
      adults: guestCounts.adults.toString(),
      children: guestCounts.children.toString(),
      infants: guestCounts.infants.toString(),
      checkIn: dateRange.startDate?.toISOString().split('T')[0] || '',
      checkOut: dateRange.endDate?.toISOString().split('T')[0] || '',
    });

    let searchUrl = '/search';
  if (activeCategory === 'services') {
    searchUrl = '/search/services';
  } else if (activeCategory === 'stories') {
    searchUrl = '/search/stories';
  }

    window.location.href = `${searchUrl}?${params.toString()}`;
    onClose();
  };

  

useEffect(() => {
  if (activeCategory === 'homes' && selectedCity) {
    saveSearchState();
  }
}, [selectedCity, dateRange, guestCounts]);

useEffect(() => {
  if (activeCategory !== 'homes') {
    setSelectedCity(null);
    setDateRange({ startDate: null, endDate: null, key: 'selection' });
    setGuestCounts({ adults: 2, children: 0, infants: 0 });
  }
}, [activeCategory]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-[60]">
      <div
        className="absolute inset-0 pointer-events-none"
        // onClick={onClose}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="w-full bg-white rounded-t-3xl flex flex-col overflow-hidden"
        style={{ height: '100dvh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Category Tabs */}
        {/* <div className="relative">
          <CategoryTabs onClose={onClose} />
        </div> */}

        <CategoryTabs 
        onClose={onClose} 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">

             {activeCategory === 'homes' && (
              <>

            {/* WHERE - Always Visible but Collapses */}
            <div
              className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                activeStep === "where" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => activeStep !== "where" && setActiveStep("where")}
            >
              {activeStep === "where" ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">Where?</h2>
                  {/* <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search destinations"
                      value={whereSearch}
                      onChange={(e) => setWhereSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-800 text-gray-800"
                    />
                  </div> */}
                  <div className="relative">
  
 <div className="flex items-center  bg-gray-100 rounded-xl px-2 py-2">
  <Search className="text-[#4285F4] " size={20}    />
  <AsyncSelect
    cacheOptions
    loadOptions={debouncedLoadOptions}
    defaultOptions
    value={null}
    inputValue={whereSearch}
    onInputChange={(value) => setWhereSearch(value)}
    onChange={(option) => {
      const opt = option as {
        value: string;
        label: string;
        coordinates?: [number, number];
        type?: string;
        placeId?: string;
      };

      setSelectedCity({
        value: opt.value,
        label: opt.label,
        coordinates: opt.coordinates,
        type: opt.type,
      });

      setWhereSearch("");
      setActiveStep("when");
    }}
    placeholder="Search destinations"
      styles={{
                    ...customSelectStyles,
                    menuPortal: (base: any) => ({ ...base, zIndex: 60 })
                  }}
    className="w-full pl-2"
    components={{ DropdownIndicator: () => null }}
  />
  </div>
                 </div>
                  <div className="space-y-2">
                    {destinations.map((dest, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCity({ value: dest.name, label: dest.name });
                         
                         setWhereSearch(dest.name);
                           
                          setActiveStep("when");
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-1">{dest.icon}</span>
                          <div>
                            <div className="text-gray-800 font-semibold">{dest.name}</div>
                            <div className="text-sm text-gray-500">{dest.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Where</span>
                  <span className="text-gray-800 font-semibold">{selectedCity?.label || "Add location"}</span>
                </div>
              )}
            </div>

            {/* WHEN - Collapses when not active */}
            {selectedCity && (
              <div
                className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                  activeStep === "when" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => activeStep !== "when" && setActiveStep("when")}
              >
                {activeStep === "when" ? (
                  <Calendar 
                    onNext={() => setActiveStep("who")} 
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                  />
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">When</span>
                    <span className="text-gray-800 font-semibold">
                      {dateRange.startDate && dateRange.endDate 
                        ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                        : "Add dates"
                      }
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* WHO - Collapses when not active */}
            {selectedCity && (
              <div
                className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                  activeStep === "who" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => activeStep !== "who" && setActiveStep("who")}
              >
                {activeStep === "who" ? (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-800">Who?</h3>

                    {/* Adults */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-800 font-semibold">Adults</div>
                        <div className="text-sm text-gray-500">Ages 13 or above</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuestCount('adults', false)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          −
                        </button>
                        <span className="text-gray-800 font-semibold w-4 text-center">
                          {guestCounts.adults}
                        </span>
                        <button
                          onClick={() => updateGuestCount('adults', true)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-800 font-semibold">Children</div>
                        <div className="text-sm text-gray-500">Ages 2-12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuestCount('children', false)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          −
                        </button>
                        <span className="text-gray-800 font-semibold w-4 text-center">
                          {guestCounts.children}
                        </span>
                        <button
                          onClick={() => updateGuestCount('children', true)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Infants */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-800 font-semibold">Infants</div>
                        <div className="text-sm text-gray-500">Under 2</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateGuestCount('infants', false)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          −
                        </button>
                        <span className="text-gray-800 font-semibold w-4 text-center">
                          {guestCounts.infants}
                        </span>
                        <button
                          onClick={() => updateGuestCount('infants', true)}
                          className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Who</span>
                    <span className="text-gray-800 font-semibold">{getGuestDisplayText()}</span>
                  </div>
                )}
              </div>
            )}
            </>
             )}

             {activeCategory === 'services' && (
      // Services search content
             
                   <>

                    {/* WHERE - Always Visible but Collapses */}
                    <div
                      className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                        activeStep === "where" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => activeStep !== "where" && setActiveStep("where")}
                    >
                      {activeStep === "where" ? (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-800">Where?</h2>
                           <div className="relative">
  
 <div className="flex items-center  bg-gray-100 rounded-xl px-2 py-2">
  <Search className="text-[#4285F4] " size={20}    />
  <AsyncSelect
    cacheOptions
    loadOptions={debouncedLoadOptions}
    defaultOptions
    value={null}
    inputValue={whereSearch}
    onInputChange={(value) => setWhereSearch(value)}
    onChange={(option) => {
      const opt = option as {
        value: string;
        label: string;
        coordinates?: [number, number];
        type?: string;
        placeId?: string;
      };

      setSelectedCity({
        value: opt.value,
        label: opt.label,
        coordinates: opt.coordinates,
        type: opt.type,
      });

      setWhereSearch("");
      setActiveStep("when");
    }}
    placeholder="Search destinations"
      styles={{
                    ...customSelectStyles,
                    menuPortal: (base: any) => ({ ...base, zIndex: 60 })
                  }}
    className="w-full pl-2"
    components={{ DropdownIndicator: () => null }}
  />
  </div>
                 </div>
                          <div className="space-y-2">
                            {destinations.map((dest, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedCity({ value: dest.name, label: dest.name });
                                  setActiveStep("when");
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl mt-1">{dest.icon}</span>
                                  <div>
                                    <div className="text-gray-800 font-semibold">{dest.name}</div>
                                    <div className="text-sm text-gray-500">{dest.desc}</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Where</span>
                          <span className="text-gray-800 font-semibold">{selectedCity?.label || "Add location"}</span>
                        </div>
                      )}
                    </div>

                    {/* WHEN - Collapses when not active */}
                    {selectedCity && (
                      <div
                        className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                          activeStep === "when" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => activeStep !== "when" && setActiveStep("when")}
                      >
                        {activeStep === "when" ? (
                          <Calendar 
                            onNext={() => setActiveStep("who")} 
                            dateRange={dateRange}
                            setDateRange={setDateRange}
                          />
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">When</span>
                            <span className="text-gray-800 font-semibold">
                              {dateRange.startDate && dateRange.endDate 
                                ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                                : "Add dates"
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* WHO - Collapses when not active */}
                    {selectedCity && (
                      <div
                        className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                          activeStep === "who" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => activeStep !== "who" && setActiveStep("who")}
                      >
                        {activeStep === "who" ? (
                          <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-gray-800">Who?</h3>

                            {/* Adults */}
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-gray-800 font-semibold">Adults</div>
                                <div className="text-sm text-gray-500">Ages 13 or above</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateGuestCount('adults', false)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  −
                                </button>
                                <span className="text-gray-800 font-semibold w-4 text-center">
                                  {guestCounts.adults}
                                </span>
                                <button
                                  onClick={() => updateGuestCount('adults', true)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Children */}
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-gray-800 font-semibold">Children</div>
                                <div className="text-sm text-gray-500">Ages 2-12</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateGuestCount('children', false)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  −
                                </button>
                                <span className="text-gray-800 font-semibold w-4 text-center">
                                  {guestCounts.children}
                                </span>
                                <button
                                  onClick={() => updateGuestCount('children', true)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Infants */}
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-gray-800 font-semibold">Infants</div>
                                <div className="text-sm text-gray-500">Under 2</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => updateGuestCount('infants', false)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  −
                                </button>
                                <span className="text-gray-800 font-semibold w-4 text-center">
                                  {guestCounts.infants}
                                </span>
                                <button
                                  onClick={() => updateGuestCount('infants', true)}
                                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Who</span>
                            <span className="text-gray-800 font-semibold">{getGuestDisplayText()}</span>
                          </div>
                        )}
                      </div>
                    )}
                    </>
             
            )}
                {activeCategory === 'stories' && (
                  // Stories search content
                <>

                        {/* WHERE - Always Visible but Collapses */}
                        <div
                          className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                            activeStep === "where" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                          }`}
                          onClick={() => activeStep !== "where" && setActiveStep("where")}
                        >
                          {activeStep === "where" ? (
                            <div className="space-y-4">
                              <h2 className="text-2xl font-bold text-gray-800">Where?</h2>
                               <div className="relative">
  
 <div className="flex items-center  bg-gray-100 rounded-xl px-2 py-2">
  <Search className="text-[#4285F4] " size={20}    />
  <AsyncSelect
    cacheOptions
    loadOptions={debouncedLoadOptions}
    defaultOptions
    value={null}
    inputValue={whereSearch}
    onInputChange={(value) => setWhereSearch(value)}
    onChange={(option) => {
      const opt = option as {
        value: string;
        label: string;
        coordinates?: [number, number];
        type?: string;
        placeId?: string;
      };

      setSelectedCity({
        value: opt.value,
        label: opt.label,
        coordinates: opt.coordinates,
        type: opt.type,
      });

      setWhereSearch("");
      setActiveStep("when");
    }}
    placeholder="Search destinations"
      styles={{
                    ...customSelectStyles,
                    menuPortal: (base: any) => ({ ...base, zIndex: 60 })
                  }}
    className="w-full pl-2"
    components={{ DropdownIndicator: () => null }}
  />
  </div>
                 </div>
                              <div className="space-y-2">
                                {destinations.map((dest, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setSelectedCity({ value: dest.name, label: dest.name });
                                      setActiveStep("when");
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition"
                                  >
                                    <div className="flex items-start gap-3">
                                      <span className="text-2xl mt-1">{dest.icon}</span>
                                      <div>
                                        <div className="text-gray-800 font-semibold">{dest.name}</div>
                                        <div className="text-sm text-gray-500">{dest.desc}</div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 font-medium">Where</span>
                              <span className="text-gray-800 font-semibold">{selectedCity?.label || "Add location"}</span>
                            </div>
                          )}
                        </div>

                        {/* WHEN - Collapses when not active */}
                        {selectedCity && (
                          <div
                            className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                              activeStep === "when" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                            }`}
                            onClick={() => activeStep !== "when" && setActiveStep("when")}
                          >
                            {activeStep === "when" ? (
                              <Calendar 
                                onNext={() => setActiveStep("who")} 
                                dateRange={dateRange}
                                setDateRange={setDateRange}
                              />
                            ) : (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">When</span>
                                <span className="text-gray-800 font-semibold">
                                  {dateRange.startDate && dateRange.endDate 
                                    ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
                                    : "Add dates"
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* WHO - Collapses when not active */}
                        {selectedCity && (
                          <div
                            className={`border border-gray-300 rounded-2xl p-4 cursor-pointer transition-all ${
                              activeStep === "who" ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                            }`}
                            onClick={() => activeStep !== "who" && setActiveStep("who")}
                          >
                            {activeStep === "who" ? (
                              <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-gray-800">Who?</h3>

                                {/* Adults */}
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-gray-800 font-semibold">Adults</div>
                                    <div className="text-sm text-gray-500">Ages 13 or above</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => updateGuestCount('adults', false)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      −
                                    </button>
                                    <span className="text-gray-800 font-semibold w-4 text-center">
                                      {guestCounts.adults}
                                    </span>
                                    <button
                                      onClick={() => updateGuestCount('adults', true)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Children */}
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-gray-800 font-semibold">Children</div>
                                    <div className="text-sm text-gray-500">Ages 2-12</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => updateGuestCount('children', false)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      −
                                    </button>
                                    <span className="text-gray-800 font-semibold w-4 text-center">
                                      {guestCounts.children}
                                    </span>
                                    <button
                                      onClick={() => updateGuestCount('children', true)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Infants */}
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-gray-800 font-semibold">Infants</div>
                                    <div className="text-sm text-gray-500">Under 2</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => updateGuestCount('infants', false)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      −
                                    </button>
                                    <span className="text-gray-800 font-semibold w-4 text-center">
                                      {guestCounts.infants}
                                    </span>
                                    <button
                                      onClick={() => updateGuestCount('infants', true)}
                                      className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:border-gray-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Who</span>
                                <span className="text-gray-800 font-semibold">{getGuestDisplayText()}</span>
                              </div>
                            )}
                          </div>
                        )}
                        </>
                )}
          </div>
          
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-between items-center">
          <button 
            onClick={() => {
              setSelectedCity(null);
              setDateRange({ startDate: null, endDate: null, key: 'selection' });
              setGuestCounts({ adults: 2, children: 0, infants: 0 });
              setActiveStep("where");
            }}
            className="text-red-600 font-semibold hover:text-red-700"
          >
            Clear all
          </button>
          <button
            // onClick={() => {
            //   if (activeStep === "where") setActiveStep("when");
            //   else if (activeStep === "when") setActiveStep("who");
            //   else handleSearch();
            // }}
            onClick={() => {
    if (activeStep === "where") {
      if (whereSearch.trim()) {
        setSelectedCity({
          value: whereSearch.trim(),
          label: whereSearch.trim()
        });
      }
      setActiveStep("when");
    } else if (activeStep === "when") {
      setActiveStep("who");
    } else handleSearch();
  }}
            className="bg-[#4285F4] hover:bg-[#3367D6] text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            {activeStep === "who" ? "Search" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}



