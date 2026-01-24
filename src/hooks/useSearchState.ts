import { useState, useEffect ,useRef} from 'react';

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchState {
  selectedCity: { value: string; label: string; coordinates?: [number, number]; type?: string } | null;
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
    key: string;
  };
  guestCounts: GuestCounts;
  recentSearches: Array<{ location: string; dates?: string }>;
}

export const useSearchState = (initialValues?: {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}) => {
  // State
  const [selectedCity, setSelectedCity] = useState<{ value: string; label: string; coordinates?: [number, number]; type?: string } | null>(
    initialValues?.location ? { value: initialValues.location, label: initialValues.location } : null
  );
  const hydratedRef = useRef(false);
  
  const [dateRange, setDateRange] = useState({
    startDate: initialValues?.checkIn ? new Date(initialValues.checkIn) : null,
    endDate: initialValues?.checkOut ? new Date(initialValues.checkOut) : null,
    key: 'selection',
  });
  
  const [guestCounts, setGuestCounts] = useState<GuestCounts>({
    adults: Math.max(1, initialValues?.guests || 2),
    children: 0,
    infants: 0
  });
  
  const [recentSearches, setRecentSearches] = useState<Array<{ location: string; dates?: string }>>([]);

  // Utility functions
  const formatDateForStorage = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateFromStorage = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Save current search state to localStorage
  const saveSearchState = () => {
    if (typeof window !== 'undefined' && selectedCity && dateRange.startDate && dateRange.endDate) {
      const totalGuests = guestCounts.adults + guestCounts.children + guestCounts.infants;
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

  // Load search state from localStorage
  const loadSearchState = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tripme_current_search');
      if (saved) {
        try {
          const searchState = JSON.parse(saved);
          // Only set city if it's a valid value (not undefined or empty)
          if (searchState.location && searchState.location !== 'undefined') {
            setSelectedCity({ value: searchState.location, label: searchState.location });
          }
          if (searchState.checkIn && searchState.checkOut) {
            setDateRange({
              startDate: parseDateFromStorage(searchState.checkIn),
              endDate: parseDateFromStorage(searchState.checkOut),
              key: 'selection'
            });
          }
          if (searchState.adults || searchState.children || searchState.infants) {
            setGuestCounts({
              adults: searchState.adults || 1,
              children: searchState.children || 0,
              infants: searchState.infants || 0
            });
          }
        } catch (error) {
          console.error('Error loading search state:', error);
        }
      }
    }
  };

  // Add to recent searches
  const addToRecentSearches = (location: string, dates?: string) => {
    const newSearch = { location, dates };
    const updated = [newSearch, ...recentSearches.filter(s => s.location !== location)].slice(0, 5);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tripme_recent_searches', JSON.stringify(updated));
    }
  };

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
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
  };

  // Calculate total guests
  const totalGuests = guestCounts.adults + guestCounts.children + guestCounts.infants;

  // Update guest counts
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

  // Effects
  useEffect(() => {
    loadRecentSearches();
    loadSearchState();
  }, []);

  // useEffect(() => {
  //   if (selectedCity) {
  //     saveSearchState();
  //   }
  // }, [selectedCity, dateRange, guestCounts]);

  

useEffect(() => {
  if (hydratedRef.current) return;

  const saved = localStorage.getItem('tripme_search_homes');
  if (saved) {
    const data = JSON.parse(saved);
    setSelectedCity({ value: data.location, label: data.location });
    setDateRange(data.dateRange);
    setGuestCounts(data.guests);
  }

  hydratedRef.current = true;
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

  return {
    // State
    selectedCity,
    setSelectedCity,
    dateRange,
    setDateRange,
    guestCounts,
    setGuestCounts,
    recentSearches,
    setRecentSearches,
    // Computed
    totalGuests,
    // Functions
    saveSearchState,
    loadSearchState,
    addToRecentSearches,
    updateGuestCount,
    getGuestDisplayText,
    formatDateForStorage,
    parseDateFromStorage
  };
};
