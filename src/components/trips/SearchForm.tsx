"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users, Minus, Plus } from 'lucide-react';
import { DateRange } from 'react-date-range';
import { addDays, format } from 'date-fns';
import AsyncSelect from 'react-select/async';
import { RangeKeyDict } from 'react-date-range';
import { createPortal } from 'react-dom';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { cn } from '@/utils/utils';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2hpdmFuc2gxODA5IiwiYSI6ImNtZTRhdmJyMTA5YTEya3F0cWN2c3RpdmcifQ.7l3-Hj7ihCHCwH656wq1oA';
const MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

const formatDate = (date: Date) => format(date, 'dd MMM');

interface SearchFormProps {
  variant?: 'default' | 'compact';
  initialValues?: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
  className?: string;
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

async function fetchPLacesMapbox(inputValue: string) {
  if (!inputValue || inputValue.length < 2) return [];

  const url = `${MAPBOX_API_URL}/${encodeURIComponent(inputValue)}.json` +
              `?access_token=${MAPBOX_TOKEN}` +
              `&types=place,region,locality,poi` +  // richer types
              `&country=IN` +
              `&limit=10`;

  const res = await fetch(url);
  const data = await res.json();

  return (data.features || []).map((feature: any) => ({
    value: feature.text, // short name like "Agra"
    label: feature.place_name, // full label like "Agra, Uttar Pradesh, India"
    coordinates: feature.center,
    type: feature.place_type?.[0] || 'unknown', // city, region, poi, etc.
    context: feature.context || [], // useful for extracting state, country, etc.
  }));
}


// Debounce utility
function debounce<F extends (...args: any[]) => void>(func: F, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const SearchForm: React.FC<SearchFormProps> = ({ 
  variant = 'default', 
  initialValues, 
  className 
}) => {
  const router = useRouter();
  const [step, setStep] = useState<-1 | 0 | 1 | 2>(-1);
  const [selectedCity, setSelectedCity] = useState<{ value: string; label: string; coordinates?: [number, number]; type?: string } | null>(
    initialValues?.location ? { value: initialValues.location, label: initialValues.location } : null
  );
  const [dateRange, setDateRange] = useState({
    startDate: initialValues?.checkIn ? new Date(initialValues.checkIn) || new Date() : new Date(),
    endDate: initialValues?.checkOut ? new Date(initialValues.checkOut) || addDays(new Date(), 1) : addDays(new Date(), 1),
    key: 'selection',
  });
  const [guestCounts, setGuestCounts] = useState<GuestCounts>({
    adults: Math.max(1, initialValues?.guests || 2),
    children: 0,
    infants: 0
  });
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const guestDropdownRef = useRef<HTMLDivElement>(null);
  const guestButtonRef = useRef<HTMLButtonElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const [calendarStyle, setCalendarStyle] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0});
  const [guestDropdownStyle, setGuestDropdownStyle] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0});
  const [isSelecting, setIsSelecting] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  const [searchType, setSearchType] = useState<'homes' | 'services'>('homes');
  const [searchInput, setSearchInput] = useState('');
  const [recentSearches, setRecentSearches] = useState<Array<{ location: string; dates?: string }>>([
    // Example: { location: 'India', dates: '11–13 Jul' }
  ]);
  const [suggestedDestinations, setSuggestedDestinations] = useState<Array<{ label: string; description: string; icon?: React.ReactNode }>>([
    // Example: { label: 'Nearby', description: 'Find what's around you', icon: <svg ... /> }
  ]);
  // For mobile city suggestions
  const [citySuggestions, setCitySuggestions] = useState<{ value: string; label: string; coordinates?: [number, number]; type?: string }[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Calculate total guests
  const totalGuests = guestCounts.adults + guestCounts.children + guestCounts.infants;

  // Debounced loadOptions for react-select/async
  const debouncedLoadOptions = useRef(
    debounce((inputValue: string, callback: (options: any[]) => void) => {
      fetchPLacesMapbox(inputValue).then(callback);
    }, 400)
  ).current;

  // Debounced city search for mobile
  useEffect(() => {
    if (searchInput.length < 2) {
      setCitySuggestions([]);
      setShowCityDropdown(false);
      return;
    }
    const handler = setTimeout(() => {
      fetchPLacesMapbox(searchInput).then((results) => {
        setCitySuggestions(results.map((city: any) => ({
          value: city.value,
          label: city.label,
          coordinates: city.coordinates,
          type: city.type // include type
        })));
        setShowCityDropdown(true);
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Position the calendar below the date button
  useEffect(() => {
    function updateCalendarPosition() {
      if (showCalendar && dateButtonRef.current) {
        const rect = dateButtonRef.current.getBoundingClientRect();
        setCalendarStyle({
          top: rect.bottom + window.scrollY + 4, // 4px gap
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }
    if (showCalendar) {
      updateCalendarPosition();
      window.addEventListener('resize', updateCalendarPosition);
      window.addEventListener('scroll', updateCalendarPosition, true);
    }
    return () => {
      window.removeEventListener('resize', updateCalendarPosition);
      window.removeEventListener('scroll', updateCalendarPosition, true);
    };
  }, [showCalendar]);

  // Position the guest dropdown below the guest button
  useEffect(() => {
    function updateGuestDropdownPosition() {
      if (showGuestDropdown && guestButtonRef.current) {
        const rect = guestButtonRef.current.getBoundingClientRect();
        setGuestDropdownStyle({
          top: rect.bottom + window.scrollY + 4, // 4px gap
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    }
    if (showGuestDropdown) {
      updateGuestDropdownPosition();
      window.addEventListener('resize', updateGuestDropdownPosition);
      window.addEventListener('scroll', updateGuestDropdownPosition, true);
    }
    return () => {
      window.removeEventListener('resize', updateGuestDropdownPosition);
      window.removeEventListener('scroll', updateGuestDropdownPosition, true);
    };
  }, [showGuestDropdown]);

  // Close dropdowns on outside click/escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close calendar
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        dateButtonRef.current &&
        !dateButtonRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
        setStep(2);
      }
      
      // Close guest dropdown
      if (
        guestDropdownRef.current &&
        !guestDropdownRef.current.contains(event.target as Node) &&
        guestButtonRef.current &&
        !guestButtonRef.current.contains(event.target as Node)
      ) {
        setShowGuestDropdown(false);
        setStep(-1);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowCalendar(false);
        setShowGuestDropdown(false);
        setStep(-1);
      }
    }
    if (showCalendar || showGuestDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showCalendar, showGuestDropdown]);

  // Hide mobile bottom nav when search modal is open
  useEffect(() => {
    if (showFullForm) {
      document.body.classList.add('search-open');
    } else {
      document.body.classList.remove('search-open');
    }
    return () => {
      document.body.classList.remove('search-open');
    };
  }, [showFullForm]);

  // Add scroll effect for mobile search bar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return;
    const params = new URLSearchParams({
      guests: totalGuests.toString(),
      adults: guestCounts.adults.toString(),
      children: guestCounts.children.toString(),
      infants: guestCounts.infants.toString(),
      checkIn: dateRange.startDate.toISOString().split('T')[0],
      checkOut: dateRange.endDate.toISOString().split('T')[0],
    });

    // If the selected place is a city, send only the city name
    if (
      selectedCity.type === 'place' ||
      selectedCity.type === 'city' ||
      selectedCity.type === 'locality'
    ) {
      params.append('location.city', selectedCity.value);
    } else if (selectedCity.coordinates && selectedCity.coordinates.length === 2) {
      // If not a city, send coordinates for nearby search
      params.append('location[coordinates][0]', String(selectedCity.coordinates[0]));
      params.append('location[coordinates][1]', String(selectedCity.coordinates[1]));
      params.append('location[radius]', '50000'); // 50km default radius
    }

    let searchUrl = '';
    if (searchType === 'homes') {
      searchUrl = `/search?${params.toString()}`;
    } else if (searchType === 'services') {
      searchUrl = `/services?${params.toString()}`;
    }
    router.push(searchUrl);
  };

  // Helper to move to next step in mobile search
  const goToNextStep = (currentStep: number) => {
    if (currentStep === 0) setStep(1);
    if (currentStep === 1) setStep(2);
    if (currentStep === 2) setStep(-1);
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

  return (
    <>
      {/* Mobile: collapsed search box - Fixed at top */}
      <div className="sm:hidden fixed top-4 left-4 right-4 z-50">
        {!showFullForm && (
          <div
            className={cn(
              "rounded-full p-4 flex items-center gap-3 cursor-pointer animate-fade-in border hover:shadow-3xl transition-all duration-300 ease-out",
              scrolled
                ? "bg-white/80 backdrop-blur-xl shadow-xl border-white/40"
                : "bg-white/95 backdrop-blur-none shadow-2xl border-white/30"
            )}
            onClick={() => setShowFullForm(true)}
            style={{ minHeight: 56 }}
          >
            <MapPin className="text-indigo-500" size={26} />
            <span className="text-gray-600 font-medium text-base flex-1">Lets go somewhere?</span>
            <Search className="text-indigo-500" size={26} />
          </div>
        )}
        {showFullForm && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in" style={{ minHeight: '100dvh' }}>
            {/* Top toggle and close button */}
            <div className="relative flex flex-col w-full">
              <div className="flex items-center justify-center pt-6 pb-2 gap-8">
                <button
                  className={`flex flex-col items-center px-2 focus:outline-none transition-all duration-200 ${searchType === 'homes' ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}
                  onClick={() => setSearchType('homes')}
                >
                  <span className="text-3xl mb-1">🏠</span>
                  <span className="text-base">Homes</span>
                  {searchType === 'homes' && <div className="w-8 h-1 bg-indigo-500 rounded-full mt-1" />}
                </button>
                <button
                  className={`flex flex-col items-center px-2 focus:outline-none transition-all duration-200 ${searchType === 'services' ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}
                  onClick={() => setSearchType('services')}
                >
                  <span className="text-3xl mb-1">🛎️</span>
                  <span className="text-base">Services</span>
                  {searchType === 'services' && <div className="w-8 h-1 bg-indigo-500 rounded-full mt-1" />}
                </button>
              </div>
              {/* Always visible close button */}
              <button
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-700 text-3xl font-bold focus:outline-none z-50 bg-white rounded-full shadow p-2 transition-all duration-200 focus:ring-2 focus:ring-indigo-400"
                onClick={() => setShowFullForm(false)}
                aria-label="Close search form"
                tabIndex={0}
              >
                {/* SVG cross icon for modern look */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* Main card */}
            <div className="flex-1 flex flex-col justify-start items-center w-full px-2 pb-2">
              <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl p-6 mt-2 mb-4 flex flex-col items-stretch" style={{ minHeight: 320 }}>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Where?</h2>
                <div className="relative mb-4">
                  <div className="flex items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
                    <Search className="text-gray-400 mr-2" size={22} />
                    <input
                      ref={cityInputRef}
                      type="text"
                      placeholder="Search destinations"
                      className="flex-1 bg-transparent outline-none text-gray-900 text-base font-medium"
                      value={selectedCity ? selectedCity.label : searchInput}
                      onChange={e => {
                        setSearchInput(e.target.value);
                        setSelectedCity(null);
                      }}
                      onFocus={() => {
                        if (citySuggestions.length > 0) setShowCityDropdown(true);
                      }}
                      autoComplete="off"
                    />
                  </div>
                  {/* City suggestions dropdown */}
                  {showCityDropdown && citySuggestions.length > 0 ? (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[120] max-h-60 overflow-y-auto animate-fade-in">
                      {citySuggestions.map((city) => (
                        <button
                          key={city.value}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-indigo-50 focus:bg-indigo-100 rounded-xl transition-all text-gray-900 font-medium"
                          onClick={() => {
                            setSelectedCity({ value: city.value, label: city.label, coordinates: city.coordinates, type: city.type });
                            setSearchInput(city.label);
                            setShowCityDropdown(false);
                            cityInputRef.current?.blur();
                            setTimeout(() => setStep(1), 100); // Move to dates step
                          }}
                        >
                          {city.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                {/* Suggested destinations */}
                {suggestedDestinations.length > 0 && (
                  <div className="mb-2">
                    {suggestedDestinations.map((dest, idx) => (
                      <div key={dest.label} className="flex items-center gap-3 mb-2 cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-50">
                          {dest.icon || <span className="text-xl">📍</span>}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{dest.label}</div>
                          <div className="text-gray-500 text-sm">{dest.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div className="mt-2">
                    <div className="text-gray-500 text-sm mb-1">Recent searches</div>
                    {recentSearches.map((search, idx) => (
                      <div key={search.location + idx} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100">
                          <span className="text-xl">📍</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{search.location}</div>
                          {search.dates && <div className="text-gray-500 text-sm">{search.dates}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-center mt-2">
                  <span className="text-2xl text-gray-400">⌄</span>
                </div>
              </div>
              {/* When and What sections */}
              <div className="w-full max-w-xl mx-auto flex flex-col gap-3 mb-4">
                  <button
                    type="button"
                    className="flex items-center justify-between px-4 py-4 rounded-2xl bg-white shadow border border-gray-200 w-full text-left text-lg font-semibold"
                    onClick={() => setStep(1)}
                  >
                    <span>When</span>
                    <span className="text-gray-900 font-medium">{dateRange.startDate && dateRange.endDate ? `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}` : 'Add dates'}</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-between px-4 py-4 rounded-2xl bg-white shadow border border-gray-200 w-full text-left text-lg font-semibold"
                    onClick={() => setStep(2)}
                  >
                    <span>Who</span>
                    <span className="text-gray-900 font-medium">{getGuestDisplayText()}</span>
                  </button>
              </div>
              {/* Bottom actions */}
              <div className="w-full max-w-xl mx-auto flex items-center justify-between mt-auto mb-4 px-1">
                <button className="text-base text-black underline font-medium">Clear all</button>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg text-lg"
                  style={{ minWidth: 56 }}
                >
                  <Search size={22} />
                  <span>Search</span>
                </button>
              </div>
            </div>
            {/* Date Picker Modal */}
            {step === 1 && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
                <div className="bg-white rounded-t-3xl shadow-2xl w-full max-w-md p-6 animate-fade-in flex flex-col gap-4">
                  <h3 className="text-lg font-bold mb-2">Select dates</h3>
                  <DateRange
                    ranges={[dateRange]}
                    onChange={(ranges: RangeKeyDict) => {
                      const selection = ranges.selection;
                      setDateRange({
                        ...dateRange,
                        startDate: selection.startDate || dateRange.startDate,
                        endDate: selection.endDate || dateRange.endDate,
                      });
                    }}
                    minDate={new Date()}
                    rangeColors={["#6366f1"]}
                    showDateDisplay={false}
                    showMonthAndYearPickers={true}
                    direction="horizontal"
                    months={1}
                    className="rounded-lg"
                  />
                  <button className="mt-2 text-indigo-500 font-semibold" onClick={() => goToNextStep(1)}>Done</button>
                </div>
              </div>
            )}
            {/* Guests Picker Modal */}
            {step === 2 && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
                <div className="bg-white rounded-t-3xl shadow-2xl w-full max-w-md p-6 animate-fade-in flex flex-col gap-4">
                  <h3 className="text-lg font-bold mb-2">Guests</h3>
                  
                  {/* Adults */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Adults</div>
                      <div className="text-sm text-gray-500">Ages 13 or above</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors"
                        onClick={() => updateGuestCount('adults', false)}
                        disabled={guestCounts.adults <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">{guestCounts.adults}</span>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors"
                        onClick={() => updateGuestCount('adults', true)}
                        disabled={guestCounts.adults >= 16}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">Children</div>
                      <div className="text-sm text-gray-500">Ages 2-12</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors"
                        onClick={() => updateGuestCount('children', false)}
                        disabled={guestCounts.children <= 0}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">{guestCounts.children}</span>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors"
                        onClick={() => updateGuestCount('children', true)}
                        disabled={guestCounts.children >= 10}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-semibold text-gray-900">Infants</div>
                      <div className="text-sm text-gray-500">Under 2</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors"
                        onClick={() => updateGuestCount('infants', false)}
                        disabled={guestCounts.infants <= 0}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">{guestCounts.infants}</span>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 transition-colors"
                        onClick={() => updateGuestCount('infants', true)}
                        disabled={guestCounts.infants >= 5}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button className="mt-2 text-indigo-500 font-semibold" onClick={() => goToNextStep(2)}>Done</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Desktop: always show full form */}
      <form
        onSubmit={handleSearch}
        className={cn(
          "hidden sm:flex bg-white rounded-full shadow-xl border border-gray-200 p-2 max-w-5xl mx-auto flex-row items-center gap-0 overflow-visible animate-fade-in hover:shadow-2xl transition-all duration-300",
          className
        )}
        style={{ isolation: 'isolate' }}
      >
      {/* Location */}
        <div className="flex flex-col gap-1 flex-1 flex-row items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-white w-full hover:bg-gray-50 transition-all duration-200 group">
            <MapPin className="text-indigo-400 group-hover:text-indigo-500 transition-colors duration-200" size={26} />
            <div className="flex-1">
            <AsyncSelect
              cacheOptions
              loadOptions={debouncedLoadOptions}
              defaultOptions={false}
              value={selectedCity}
              onChange={option => {
                const opt = option as { value: string; label: string; coordinates?: [number, number]; type?: string };
                setSelectedCity({ value: opt.value, label: opt.label, coordinates: opt.coordinates, type: opt.type });
                // Auto-focus to next field after selection
                setTimeout(() => {
                  setShowCalendar(true);
                  setIsSelecting(true);
                }, 100);
              }}
              placeholder="Where to?"
              styles={{
                ...customSelectStyles,
                menuPortal: (base: any) => ({ ...base, zIndex: 1200 })
              }}
              menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
              isSearchable
              autoFocus={step === 0}
              menuPlacement="auto"
              className="w-full"
              components={{ DropdownIndicator: () => null }}
              onFocus={() => setStep(0)}
            />
          </div>
        </div>
      </div>
        {/* Dates */}
        <div className="flex flex-col gap-1 flex-1 flex-row items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-white w-full hover:bg-gray-50 transition-all duration-200 group">
            <Calendar className="text-indigo-400 group-hover:text-indigo-500 transition-colors duration-200" size={26} />
        <button
              ref={dateButtonRef}
          type="button"
          onClick={() => {
            setShowCalendar(true);
            setIsSelecting(true);
          }}
              className="flex-1 text-left bg-transparent outline-none border-none text-gray-900 font-medium text-base cursor-pointer hover:text-indigo-600 transition-colors duration-200"
        >
            {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
        </button>
            {showCalendar && createPortal(
              <div
                ref={calendarRef}
                className="z-[99999] bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-full animate-slideDown"
                style={{
                  position: 'absolute',
                  top: calendarStyle.top,
                  left: calendarStyle.left,
                  width: calendarStyle.width,
                  background: '#fff',
                }}
              >
            <DateRange
              ranges={[dateRange]}
              onChange={(ranges: RangeKeyDict) => {
                const selection = ranges.selection;
                if (!isSelecting) {
                  setIsSelecting(true);
                }
                setDateRange({
                  ...dateRange,
                  startDate: selection.startDate || dateRange.startDate,
                  endDate: selection.endDate || dateRange.endDate,
                });
                if (
                  selection.startDate &&
                  selection.endDate &&
                  selection.startDate.getTime() !== selection.endDate.getTime()
                ) {
                  setShowCalendar(false);
                  // Auto-focus to guests field after date selection
                  setTimeout(() => {
                    guestButtonRef.current?.focus();
                  }, 100);
                  setIsSelecting(false);
                }
              }}
              minDate={new Date()}
                  rangeColors={["#6366f1"]}
              showDateDisplay={false}
              showMonthAndYearPickers={true}
              direction="horizontal"
              months={1}
                  className="rounded-lg"
            />
              </div>,
              document.body
            )}
          </div>
      </div>
      {/* Guests */}
        <div className="flex flex-col gap-1 flex-1 flex-row items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-white w-full hover:bg-gray-50 transition-all duration-200 group">
            <Users className="text-indigo-400 group-hover:text-indigo-500 transition-colors duration-200" size={26} />
          <button
            ref={guestButtonRef}
            type="button"
            onClick={() => {
              setShowGuestDropdown(true);
              setStep(2);
            }}
            className="flex-1 text-left bg-transparent outline-none border-none text-gray-900 font-medium text-base cursor-pointer hover:text-indigo-600 transition-colors duration-200"
          >
            {getGuestDisplayText()}
          </button>
            {showGuestDropdown && createPortal(
              <div
                ref={guestDropdownRef}
                className="z-[99999] bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-80 animate-slideDown"
                style={{
                  position: 'absolute',
                  top: guestDropdownStyle.top,
                  left: guestDropdownStyle.left,
                  width: guestDropdownStyle.width,
                  background: '#fff',
                }}
              >
                <h3 className="text-lg font-bold mb-4">Guests</h3>
                
                {/* Adults */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
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
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
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
                <div className="flex items-center justify-between py-3">
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
              </div>,
              document.body
            )}
        </div>
      </div>
      {/* Search Button */}
      <button
        type="submit"
          className="w-auto p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-full shadow-lg transition-all duration-200 flex items-center justify-center text-base animate-fade-in hover:scale-105"
          style={{ minWidth: 56 }}
      >
          <Search size={26} />
      </button>
    </form>
    </>
  );
};

export default SearchForm; 