// AirbnbFilters.tsx - Updated version with props

import { Home, Building2, DoorOpen,
  Hotel,
  Warehouse,
  TentTree,
  Trees,
  Building,
  Castle,
   Zap, Key, RefreshCcw

 } from 'lucide-react';
import React, { useState ,useEffect } from 'react';
import AmenityGroup from './AmenityGroup';

// FilterModal component (keep this in the same file or separate)
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
// fixed inset-0 z-[9999] flex items-center justify-center
//                 bg-black/30 backdrop-blur-[2px]
  return (
    <div className="fixed inset-0  bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-[1px]">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] md:max-h-[90vh] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// Main AirbnbFilters component
interface AirbnbFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: any) => void; 
   resultsCount?: number;
  onResultsCountChange?: (count: number) => void; 
}

const AirbnbFilters: React.FC<AirbnbFiltersProps> = ({ isOpen, onClose, onApplyFilters , resultsCount = 0,onResultsCountChange  }) => {
  // Price range
  const [priceRange, setPriceRange] = useState({ min: 900, max: 100000 });
  
  // Type of place
  const [placeType, setPlaceType] = useState<string>('any');
  
  // Rooms & Beds
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [beds, setBeds] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<number | null>(null);
  
  // Property type
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  
  // Amenities
  const [amenities, setAmenities] = useState<string[]>([]);
  
  // Booking options
  const [instantBook, setInstantBook] = useState(false);
  const [selfCheckIn, setSelfCheckIn] = useState(false);
  const [freeCancel, setFreeCancel] = useState(false);
  
  // Host language
  const [hostLanguage, setHostLanguage] = useState<string[]>([]);

  const handleClearAll = () => {
    setPriceRange({ min: 10, max: 500 });
    setPlaceType('any');
    setBedrooms(null);
    setBeds(null);
    setBathrooms(null);
    setPropertyTypes([]);
    setAmenities([]);
    setInstantBook(false);
    setSelfCheckIn(false);
    setFreeCancel(false);
    setHostLanguage([]);
  };

  const getFilteredCount = async () => {
  try {
    // Build params from current filter state
    const params = new URLSearchParams();
    
    // Price range
    if (priceRange.min) params.append('minPrice', priceRange.min);
    if (priceRange.max) params.append('maxPrice', priceRange.max);
    
    // Rooms & beds
    if (bedrooms) params.append('guests', bedrooms);
    if (beds) params.append('beds', beds);
    if (bathrooms) params.append('bathrooms', bathrooms);
    
    // Property types
    if (propertyTypes.length > 0) {
      params.append('type', propertyTypes.join(','));
    }
    
    // Amenities
    if (amenities.length > 0) {
      params.append('amenities', amenities.join(','));
    }
    
    // Booking options
    if (instantBook) params.append('instantBook', 'true');
    if (selfCheckIn) params.append('selfCheckIn', 'true');
    if (freeCancel) params.append('freeCancel', 'true');
    
    // Add limit=0 to just get count without data
    params.append('limit', '0');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/listings?${params}`);
    const data = await response.json();
    
    if (data.success) {
      const count = data.data?.listings?.length || 0;
      console.log('🔢 Extracted count:', count);
      // console.log('📊 Full API Response:', JSON.stringify(data, null, 2));
      onResultsCountChange?.(count);
    }
  } catch (error) {
    console.error('Error getting filtered count:', error);
    onResultsCountChange?.(0);
  }
};
 
// Call this whenever filters change
useEffect(() => {
  if (isOpen) {
    // Debounce to avoid too many API calls
    const timeoutId = setTimeout(() => {
      getFilteredCount();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }
}, [priceRange, placeType, bedrooms, beds, bathrooms, propertyTypes, amenities, instantBook, selfCheckIn, freeCancel, isOpen]);

  const handleApplyFilters = () => {
    // Collect all filters
    const filters = {
      priceRange,
      placeType,
      bedrooms,
      beds,
      bathrooms,
      propertyTypes,
      amenities,
      instantBook,
      selfCheckIn,
      freeCancel,
      hostLanguage
    };

    // Call the callback if provided
    if (onApplyFilters) {
      onApplyFilters(filters);
    }

    // Close the modal
    onClose();
  };

  const PROPERTY_TYPE_OPTIONS = [
  { label: "House", icon: Home },
  { label: "Apartment", icon: Building2 },
  { label: "Guesthouse", icon: Building },
  { label: "Hotel", icon: Hotel },
  { label: "Condo", icon: Warehouse },
  { label: "Villa", icon: Castle },
  { label: "Cottage", icon: Trees },
  { label: "Cabin", icon: TentTree },
];


  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const CounterButton = ({ 
    label, 
    value, 
    onChange, 
    subtitle 
  }: { 
    label: string; 
    value: number | null; 
    onChange: (val: number | null) => void;
    subtitle?: string;
  }) => (
    <div className="flex items-center justify-between py-4 border-b">
      <div>
        <div className="font-medium">{label}</div>
        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(value ? Math.max(0, value - 1) : 0)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={!value}
        >
          −
        </button>
        <span className="w-8 text-center">{value || 'Any'}</span>
        <button
          onClick={() => onChange((value || 0) + 1)}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <FilterModal isOpen={isOpen} onClose={onClose}>
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-55">
        <button onClick={onClose} className="text-2xl hover:bg-gray-100 w-8 h-8 rounded-full">×</button>
        <h2 className="font-semibold text-lg">Filters</h2>
        <div className="w-6"></div>
      </div>

      <div className="px-6 py-6 space-y-8 overflow-y-auto max-h-[calc(90vh-200px)]">
        {/* Type of Place */}
       
        <section>
  <h3 className="font-semibold text-lg mb-4">Type of place</h3>

  <div className="grid grid-cols-3 gap-3">
    {[
      { key: 'any', label: 'Any type', icon: Building2 },
      { key: 'room', label: 'Room', icon: DoorOpen },
      { key: 'entire', label: 'Entire home', icon: Home },
    ].map(({ key, label, icon: Icon }) => {
      const active = placeType === key;

      return (
        <button
          key={key}
          onClick={() => setPlaceType(key)}
          className={`flex flex-col items-center justify-center gap-2
                      py-4 px-4 rounded-xl border transition
                      ${
                        active
                          ? 'border-gray-900 bg-gray-50 shadow-sm'
                          : 'border-gray-300 hover:border-gray-900'
                      }`}
        >
          <Icon
            size={28}
            className={active ? 'text-gray-900' : 'text-gray-500'}
          />
          <span className="text-sm font-medium">{label}</span>
        </button>
      );
    })}
  </div>
</section>

        {/* Price Range */}
        <section className="border-t pt-8">
          <h3 className="font-semibold text-lg mb-4">Price range</h3>
          <p className="text-sm text-gray-500 mb-4">Trip price, includes all fees</p>
          
          <div className="space-y-4">
            <input 
              type="range" 
              min="1000" 
              max="100000" 
              value={priceRange.max}
              onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
            />
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                <input 
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="1000"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                <input 
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="100000"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Rooms and Beds */}
        <section className="border-t pt-8">
          <h3 className="font-semibold text-lg mb-4">Rooms and beds</h3>
          <CounterButton 
            label="Bedrooms" 
            value={bedrooms} 
            onChange={setBedrooms}
          />
          <CounterButton 
            label="Beds" 
            value={beds} 
            onChange={setBeds}
          />
          <CounterButton 
            label="Bathrooms" 
            value={bathrooms} 
            onChange={setBathrooms}
          />
        </section>

        {/* Property Type */}
       <section className="border-t pt-8">
  <h3 className="font-semibold text-lg mb-4">Property type</h3>

  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {PROPERTY_TYPE_OPTIONS.map(({ label, icon: Icon }) => {
      const active = propertyTypes.includes(label);

      return (
        <button
          key={label}
          onClick={() =>
            toggleArrayItem(propertyTypes, setPropertyTypes, label)
          }
          className={`flex items-center gap-3 px-4 py-4
                      border rounded-xl transition
                      ${
                        active
                          ? "border-gray-900 bg-gray-50 shadow-sm"
                          : "border-gray-300 hover:border-gray-900"
                      }`}
        >
          <Icon
            size={22}
            className={active ? "text-gray-900" : "text-gray-500"}
          />
          <span className="text-sm font-medium">{label}</span>
        </button>
      );
    })}
  </div>
</section>

        {/* Amenities */}
        {/* <section className="border-t pt-8">
          <h3 className="font-semibold text-lg mb-4">Amenities</h3>
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Essentials</h4>
            {['Wifi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating'].map((amenity) => (
              <label key={amenity} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded">
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => toggleArrayItem(amenities, setAmenities, amenity)}
                  className="w-5 h-5 rounded accent-gray-900"
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>

          <div className="space-y-3 mt-6">
            <h4 className="font-medium text-sm">Features</h4>
            {['Pool', 'Hot tub', 'Free parking', 'EV charger', 'Gym', 'BBQ grill'].map((amenity) => (
              <label key={amenity} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded">
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => toggleArrayItem(amenities, setAmenities, amenity)}
                  className="w-5 h-5 rounded accent-gray-900"
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>

          <div className="space-y-3 mt-6">
            <h4 className="font-medium text-sm">Location</h4>
            {['Beachfront', 'Waterfront', 'Ski-in/Ski-out'].map((amenity) => (
              <label key={amenity} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded">
                <input
                  type="checkbox"
                  checked={amenities.includes(amenity)}
                  onChange={() => toggleArrayItem(amenities, setAmenities, amenity)}
                  className="w-5 h-5 rounded accent-gray-900"
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        </section> */}

        <section className="border-t pt-8">
    <h3 className="font-semibold text-lg mb-4">Amenities</h3>

  <div className="space-y-6">
    <AmenityGroup
      title="Essentials"
      items={[
        "Wifi",
        "Kitchen",
        "Washer",
        "Dryer",
        "Air conditioning",
        "Heating",
        "TV",
      ]}
      amenities={amenities}
      setAmenities={setAmenities}
      toggleArrayItem={toggleArrayItem}
    />

    <AmenityGroup
      title="Features"
      items={[
        "Pool",
        "Hot tub",
        "Free parking",
        "EV charger",
        "Gym",
        "BBQ grill",
      ]}
      amenities={amenities}
      setAmenities={setAmenities}
      toggleArrayItem={toggleArrayItem}
    />

    <AmenityGroup
      title="Location"
      items={[
        "Beachfront",
        "Waterfront",
        "Ski-in/Ski-out",
      ]}
      amenities={amenities}
      setAmenities={setAmenities}
      toggleArrayItem={toggleArrayItem}
    />
  </div>
</section>


        {/* Booking Options */}
        <section className="border-t pt-8">
  <h3 className="font-semibold text-lg mb-4">Booking options</h3>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {/* Instant Book */}
    <button
      onClick={() => setInstantBook((v) => !v)}
      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition
        ${
          instantBook
            ? "border-gray-900 bg-gray-50 shadow-sm"
            : "border-gray-300 hover:border-gray-900"
        }`}
    >
      <Zap
        size={22}
        className={instantBook ? "text-gray-900" : "text-gray-500"}
      />
      <div>
        <div className="font-medium">Instant Book</div>
        <div className="text-sm text-gray-500">
          Book without waiting for host approval
        </div>
      </div>
    </button>

    {/* Self check-in */}
    <button
      onClick={() => setSelfCheckIn((v) => !v)}
      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition
        ${
          selfCheckIn
            ? "border-gray-900 bg-gray-50 shadow-sm"
            : "border-gray-300 hover:border-gray-900"
        }`}
    >
      <Key
        size={22}
        className={selfCheckIn ? "text-gray-900" : "text-gray-500"}
      />
      <div>
        <div className="font-medium">Self check-in</div>
        <div className="text-sm text-gray-500">
          Easy access when you arrive
        </div>
      </div>
    </button>

    {/* Free cancellation */}
    <button
      onClick={() => setFreeCancel((v) => !v)}
      className={`flex items-start gap-3 p-4 rounded-xl border text-left transition
        ${
          freeCancel
            ? "border-gray-900 bg-gray-50 shadow-sm"
            : "border-gray-300 hover:border-gray-900"
        }`}
    >
      <RefreshCcw
        size={22}
        className={freeCancel ? "text-gray-900" : "text-gray-500"}
      />
      <div>
        <div className="font-medium">Free cancellation</div>
        <div className="text-sm text-gray-500">
          Cancel before check-in for a full refund
        </div>
      </div>
    </button>
  </div>
</section>


      
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
        <button 
          onClick={handleClearAll}
          className="text-sm underline font-medium hover:text-gray-600"
        >
          Clear all
        </button>
        <button
          onClick={handleApplyFilters}
          className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 font-medium transition"
        >
          Show {resultsCount || 0} places
        </button>
      </div>
    </FilterModal>
  );
};

export default AirbnbFilters;