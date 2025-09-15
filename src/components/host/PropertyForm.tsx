"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Camera, 
  Save,
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  AlertCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import ImageUpload from '../ui/ImageUpload';
import { Property, PropertyPricing, Location } from '@/types';
import { PROPERTY_TYPE_OPTIONS } from '@/config/constants';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRef, useCallback } from 'react';

// Dynamically import MapContainer and related components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents as any), { ssr: false });

// Helper for marker icon (Leaflet default icon fix for Next.js)
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2hpdmFuc2gxODA5IiwiYSI6ImNtZTRhdmJyMTA5YTEya3F0cWN2c3RpdmcifQ.7l3-Hj7ihCHCwH656wq1oA';
const MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

// Validation rules matching backend
const VALIDATION_RULES = {
  title: {
    minLength: 10,
    maxLength: 200,
    required: true
  },
  description: {
    minLength: 50,
    maxLength: 2000,
    required: true
  },
  address: {
    minLength: 10,
    maxLength: 500,
    required: true
  },
  userAddress: {
    minLength: 10,
    maxLength: 1000,
    required: true
  },
  city: {
    minLength: 2,
    maxLength: 100,
    required: true
  },
  state: {
    minLength: 2,
    maxLength: 100,
    required: true
  },
  postalCode: {
    minLength: 3,
    maxLength: 20,
    required: true,
    pattern: /^[A-Za-z0-9\s-]+$/
  },
  maxGuests: {
    min: 1,
    max: 20,
    required: true
  },
  bedrooms: {
    min: 0,
    max: 20,
    required: true
  },
  bathrooms: {
    min: 0,
    max: 20,
    required: true
  },
  beds: {
    min: 1,
    max: 50,
    required: true
  },
  minNights: {
    min: 1,
    max: 365,
    required: false
  },
  basePrice: {
    min: 1,
    max: 10000,
    required: true
  },
  extraGuestPrice: {
    min: 0,
    max: 1000,
    required: false
  },
  cleaningFee: {
    min: 0,
    max: 1000,
    required: false
  },
  securityDeposit: {
    min: 0,
    max: 5000,
    required: false
  }
};

const PropertyForm: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'apartment' as Property['type'],
    propertyType: 'standard' as Property['propertyType'],
    style: 'modern' as Property['style'],
    location: {
      type: 'Point' as const,
      coordinates: [0, 0] as [number, number],
      address: '',
      userAddress: '', // User's own address input
      city: '',
      state: '',
      country: 'India',
      postalCode: ''
    } as Location,
    pricing: {
      basePrice: 0,
      extraGuestPrice: 0,
      cleaningFee: 0,
      serviceFee: 0,
      securityDeposit: 0,
      currency: 'INR' as PropertyPricing['currency'],
      weeklyDiscount: 0,
      monthlyDiscount: 0
    } as PropertyPricing,
    maxGuests: 1,
    minNights: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: [] as string[],
    features: [] as string[],
    houseRules: [] as string[],
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'moderate' as Property['cancellationPolicy'],
    hourlyBooking: {
      enabled: false,
      minStayDays: 1,
      hourlyRates: {
        sixHours: 0.30,
        twelveHours: 0.60,
        eighteenHours: 0.75
      }
    },
    images: [] as { url: string; publicId: string; isPrimary: boolean; caption?: string; width?: number; height?: number; format?: string; size?: number }[]
  });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [validationMessages, setValidationMessages] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});

  // Only show allowed property types from backend enum
  const propertyTypes = [
    { value: 'villa', label: 'Villa' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'hostel', label: 'Hostel' },
    { value: 'house', label: 'House' },
    { value: 'cottage', label: 'Cottage' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'treehouse', label: 'Treehouse' },
    { value: 'boat', label: 'Boat' },
  ];

  const propertyStyles = [
    { value: 'modern', label: 'Modern' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'rustic', label: 'Rustic' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'scandinavian', label: 'Scandinavian' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'tropical', label: 'Tropical' }
  ];

  const amenitiesList = [
    'wifi', 'tv', 'kitchen', 'washer', 'dryer', 'ac', 'heating', 'workspace',
    'pool', 'hot-tub', 'parking', 'gym', 'breakfast', 'smoke-alarm',
    'carbon-monoxide-alarm', 'first-aid-kit', 'fire-extinguisher', 'essentials'
  ];

  const featuresList = [
    'ocean-view', 'mountain-view', 'city-view', 'garden', 'balcony', 'terrace',
    'fireplace', 'elevator', 'wheelchair-accessible', 'pet-friendly',
    'smoking-allowed', 'long-term-stays'
  ];

  const houseRulesList = [
    'no-smoking', 'no-pets', 'no-parties', 'no-loud-music', 'no-shoes', 'no-unregistered-guests'
  ];

  // Validation function
  const validateField = (field: string, value: any): string | null => {
    const rules = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES];
    if (!rules) return null;

    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.minLength} characters long`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${rules.maxLength} characters`;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return `Please provide a valid ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    }

    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.min}`;
      }
      if (rules.max !== undefined && value > rules.max) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${rules.max}`;
      }
    }

    return null;
  };

  // Update validation messages when form data changes
  useEffect(() => {
    const messages: { [key: string]: string } = {};
    
    // Only validate fields that have been touched
    Object.keys(touchedFields).forEach(field => {
      if (touchedFields[field]) {
        let value;
        if (field.includes('.')) {
          // Handle nested fields like 'location.city'
          const [parent, child] = field.split('.');
          value = formData[parent as keyof typeof formData]?.[child as keyof any];
        } else {
          value = formData[field as keyof typeof formData];
        }
        
        const error = validateField(field, value);
        if (error) messages[field] = error;
      }
    });
    
    setValidationMessages(messages);
  }, [formData, touchedFields]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark field as touched when user starts typing
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLocationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
    
    // Mark field as touched when user starts typing
    const fieldKey = `location.${field}`;
    setTouchedFields(prev => ({ ...prev, [fieldKey]: true }));
    
    // Clear field error when user starts typing
    if (fieldErrors[fieldKey]) {
      setFieldErrors(prev => ({ ...prev, [fieldKey]: '' }));
    }
  };

  const handlePricingChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }));
    
    // Mark field as touched when user starts typing
    const fieldKey = `pricing.${field}`;
    setTouchedFields(prev => ({ ...prev, [fieldKey]: true }));
    
    // Clear field error when user starts typing
    if (fieldErrors[fieldKey]) {
      setFieldErrors(prev => ({ ...prev, [fieldKey]: '' }));
    }
  };

  const handleArrayToggle = (field: 'amenities' | 'features' | 'houseRules', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const formatDataForBackend = () => {
    // Format the data according to backend expectations
    return {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      propertyType: formData.propertyType,
      style: formData.style,
      location: {
        type: 'Point',
        coordinates: formData.location.coordinates,
        address: formData.location.address,
        userAddress: formData.location.userAddress,
        city: formData.location.city,
        state: formData.location.state,
        country: formData.location.country,
        postalCode: formData.location.postalCode
      },
      pricing: {
        basePrice: formData.pricing.basePrice,
        extraGuestPrice: formData.pricing.extraGuestPrice,
        cleaningFee: formData.pricing.cleaningFee,
        serviceFee: formData.pricing.serviceFee,
        securityDeposit: formData.pricing.securityDeposit,
        currency: formData.pricing.currency,
        weeklyDiscount: formData.pricing.weeklyDiscount,
        monthlyDiscount: formData.pricing.monthlyDiscount
      },
      maxGuests: formData.maxGuests,
      minNights: formData.minNights,
      bedrooms: formData.bedrooms,
      beds: formData.beds,
      bathrooms: formData.bathrooms,
      amenities: formData.amenities,
      features: formData.features,
      houseRules: formData.houseRules,
      checkInTime: formData.checkInTime,
      checkOutTime: formData.checkOutTime,
      cancellationPolicy: formData.cancellationPolicy,
      hourlyBooking: formData.hourlyBooking,
      images: formData.images.map(image => ({
        url: image.url,
        publicId: image.publicId,
        isPrimary: image.isPrimary,
        caption: image.caption,
        width: image.width,
        height: image.height,
        format: image.format,
        size: image.size
        // Remove the 'type' field as backend doesn't expect it
      }))
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({}); // Clear previous errors
    
    try {
      const formattedData = formatDataForBackend();
      
      // Call backend API to create property
      const response = await apiClient.createListing(formattedData);
      
      if (response.success) {
        setSuccess(true);
        // Show success with CTA to set availability
        setTimeout(() => {
          try {
            const createdId = (response.data && (response.data as any).listing && (response.data as any).listing.id) || (response.data as any)?.listing?._id;
            if (createdId) {
              router.push(`/host/property/${createdId}/availability`);
            } else {
              router.push('/host/dashboard');
            }
          } catch {
            router.push('/host/dashboard');
          }
        }, 1000);
      } else {
        // If backend returns field errors
        if (response.errors && Array.isArray(response.errors)) {
          const errors: { [key: string]: string } = {};
          response.errors.forEach((err: any) => {
            if (err.field && err.message) {
              errors[err.field] = err.message;
            }
          });
          setFieldErrors(errors);
        }
        setError(response.message || 'Failed to create property');
      }
    } catch (error: any) {
      console.error('Error creating property:', error);
      setError(error.message || 'Error creating property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        // Basic Info: title, description, type are required and valid
        return formData.title && 
               formData.description && 
               formData.type && 
               !validationMessages.title && 
               !validationMessages.description &&
               formData.title.length >= 10 &&
               formData.description.length >= 50;
      case 2:
        // Location: city, state, address, postalCode are required and valid
        return formData.location.city && 
               formData.location.state && 
               formData.location.address && 
               formData.location.postalCode &&
               !validationMessages.city && 
               !validationMessages.state &&
               !validationMessages.address &&
               !validationMessages.postalCode &&
               formData.location.address.length >= 10 &&
               formData.location.city.length >= 2 &&
               formData.location.state.length >= 2 &&
               formData.location.postalCode.length >= 3;
      case 3:
        // Pricing: basePrice is required and valid
        return formData.pricing.basePrice > 0 && 
               !validationMessages.basePrice &&
               formData.pricing.basePrice >= 1 &&
               formData.pricing.basePrice <= 10000;
      case 4:
        // Capacity: maxGuests, bedrooms, bathrooms, beds are required and valid
        return formData.maxGuests > 0 && 
               formData.bedrooms > 0 && 
               formData.bathrooms > 0 &&
               formData.beds > 0 &&
               !validationMessages.maxGuests && 
               !validationMessages.bedrooms &&
               !validationMessages.bathrooms &&
               !validationMessages.beds &&
               formData.maxGuests >= 1 && formData.maxGuests <= 20 &&
               formData.bedrooms >= 0 && formData.bedrooms <= 20 &&
               formData.bathrooms >= 0 && formData.bathrooms <= 20 &&
               formData.beds >= 1 && formData.beds <= 50;
      case 5:
        // Amenities: optional, but at least one should be selected for better listing
        return formData.amenities.length > 0 || formData.features.length > 0;
      case 6:
        // Images: at least one image is required
        return formData.images.length > 0;
      default:
        return true;
    }
  };

  // Helper component for validation messages
  const ValidationMessage = ({ field, message }: { field: string; message: string }) => (
    <div className="flex items-center space-x-2 mt-1 text-sm">
      <AlertCircle className="w-4 h-4 text-red-500" />
      <span className="text-red-600">{message}</span>
    </div>
  );

  // Helper component for field info - REMOVED
  // const FieldInfo = ({ field, rules }: { field: string; rules: any }) => (
  //   <div className="flex items-center space-x-2 mt-1 text-sm">
  //     <Info className="w-4 h-4 text-blue-500" />
  //     <span className="text-blue-600">
  //       {rules.required ? 'Required' : 'Optional'} • 
  //       {rules.minLength && ` Min: ${rules.minLength} chars`}
  //       {rules.maxLength && ` Max: ${rules.maxLength} chars`}
  //       {rules.min !== undefined && ` Min: ${rules.min}`}
  //       {rules.max !== undefined && ` Max: ${rules.max}`}
  //     </span>
  //   </div>
  // );

  const renderStep1 = () => (
    <div className="pl-4 pr-6 py-6">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-gray-700 text-base">Tell us about your property</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Cozy Mountain Cabin"
                className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                  validationMessages.title || fieldErrors.title ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {(validationMessages.title || fieldErrors.title) && (
                <ValidationMessage field="title" message={validationMessages.title || fieldErrors.title || ''} />
              )}
            </div>
            
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Property Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Property Style</label>
              <select
                value={formData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900"
              >
                {propertyStyles.map(style => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Cancellation Policy</label>
              <select
                value={formData.cancellationPolicy}
                onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900"
              >
                <option value="flexible">Flexible - Full refund up to 24 hours before</option>
                <option value="moderate">Moderate - Full refund up to 5 days before</option>
                <option value="strict">Strict - 50% refund up to 7 days before</option>
                <option value="super-strict">Super Strict - No refunds</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-base font-semibold text-gray-900 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your property in detail..."
            rows={5}
            className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 resize-none text-gray-900 placeholder-gray-500 ${
              validationMessages.description || fieldErrors.description ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {(validationMessages.description || fieldErrors.description) && (
            <ValidationMessage field="description" message={validationMessages.description || fieldErrors.description || ''} />
          )}
        </div>
      </div>
    </div>
  );

  // Add a component for map click events and draggable marker
  function LocationMarker({ setCoordinates, coordinates }: { setCoordinates: (coords: [number, number]) => void, coordinates: [number, number] }) {
    // @ts-expect-error dynamic import typing
    useMapEvents({
      click(e: any) {
        setCoordinates([e.latlng.lng, e.latlng.lat]);
      },
    });
    return coordinates[0] !== 0 && coordinates[1] !== 0 ? (
      <Marker
        position={[coordinates[1], coordinates[0]]}
        icon={markerIcon}
        draggable={true}
        eventHandlers={{
          dragend: (e: any) => {
            const marker = e.target;
            const latlng = marker.getLatLng();
            setCoordinates([latlng.lng, latlng.lat]);
          },
        }}
      >
        <Popup>Drag me to adjust the exact location</Popup>
      </Marker>
    ) : null;
  }

  // Map search box component
  function MapSearchBox({ onSelect }: { onSelect: (coords: [number, number], address: string) => void }) {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSuggestions = useCallback(async (input: string) => {
      if (!input || input.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const url = `${MAPBOX_API_URL}/${encodeURIComponent(input)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5&country=IN`;
        const res = await fetch(url);
        const data = await res.json();
        setResults((data.features || []).map((feature: any) => ({
          label: feature.place_name,
          coordinates: feature.center,
        })));
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setShowDropdown(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => fetchSuggestions(value), 400);
    };

    return (
      <div className="relative mb-4">
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-800"
          placeholder="Search address or place on map..."
          value={query}
          onChange={handleInput}
          onFocus={() => setShowDropdown(true)}
          autoComplete="off"
        />
        {showDropdown && results.length > 0 && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto animate-fade-in">
            {results.map((result, idx) => (
              <button
                key={idx}
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-indigo-50 focus:bg-indigo-100 rounded-xl transition-all text-gray-900 font-medium"
                onClick={() => {
                  onSelect([result.coordinates[0], result.coordinates[1]], result.label);
                  setQuery(result.label);
                  setShowDropdown(false);
                }}
              >
                {result.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const renderStep2 = () => (
    <div className="pl-4 pr-6 py-6">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-gray-700 text-base">Where is your property located?</p>
        </div>
        
        {/* User's Address Input */}
        <div className="mb-6">
          <label className="block text-base font-semibold text-gray-900 mb-2">
            Your Property Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.location.userAddress}
            onChange={(e) => handleLocationChange('userAddress', e.target.value)}
            placeholder="Enter your complete property address as you would like it to appear to guests..."
            rows={3}
            className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none ${
              validationMessages.userAddress || fieldErrors['location.userAddress'] ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          <p className="text-sm text-gray-600 mt-2">This is how your address will appear to guests. Be specific and include landmarks if helpful.</p>
          {(validationMessages.userAddress || fieldErrors['location.userAddress']) && (
            <ValidationMessage field="userAddress" message={validationMessages.userAddress || fieldErrors['location.userAddress'] || ''} />
          )}
        </div>

        {/* Map-based Location Selection */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Map Location (for search & directions)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address (from map)
              </label>
              <input
                type="text"
                value={formData.location.address}
                readOnly
                placeholder="Select location on map below"
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">This will be filled automatically when you select a location on the map</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City (from map)
              </label>
              <input
                type="text"
                value={formData.location.city}
                readOnly
                placeholder="Will be filled from map selection"
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State (from map)
              </label>
              <input
                type="text"
                value={formData.location.state}
                readOnly
                placeholder="Will be filled from map selection"
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={formData.location.postalCode}
                onChange={(e) => handleLocationChange('postalCode', e.target.value)}
                placeholder="400001"
                className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                  validationMessages.postalCode || fieldErrors['location.postalCode'] ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {(validationMessages.postalCode || fieldErrors['location.postalCode']) && (
                <ValidationMessage field="postalCode" message={validationMessages.postalCode || fieldErrors['location.postalCode'] || ''} />
              )}
            </div>
          </div>
        </div>
        
        {/* Map search box */}
        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-blue-900">Map Search</h4>
            </div>
            <MapSearchBox
              onSelect={(coords, address) => {
                handleLocationChange('coordinates', coords);
                handleLocationChange('address', address);
                
                // Extract city and state from the address
                const addressParts = address.split(', ');
                let city = '';
                let state = '';
                
                // Try to extract city and state from the address
                if (addressParts.length >= 2) {
                  // Look for state (usually second to last or last part)
                  const possibleState = addressParts[addressParts.length - 2] || addressParts[addressParts.length - 1];
                  if (possibleState && possibleState.length > 0) {
                    state = possibleState.trim();
                  }
                  
                  // Look for city (usually before state)
                  const possibleCity = addressParts[addressParts.length - 3] || addressParts[addressParts.length - 2];
                  if (possibleCity && possibleCity.length > 0 && possibleCity !== state) {
                    city = possibleCity.trim();
                  }
                }
                
                // Update city and state if found
                if (city) handleLocationChange('city', city);
                if (state) handleLocationChange('state', state);
              }}
            />
          </div>
          
          <label className="block text-base font-semibold text-gray-900 mb-2">Pin property location on map</label>
          <div className="w-full h-80 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
            <MapContainer
              center={formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0 ? [formData.location.coordinates[1], formData.location.coordinates[0]] : [20.5937, 78.9629]} // Default: India
              zoom={formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0 ? 14 : 5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker
                setCoordinates={(coords: [number, number]) => handleLocationChange('coordinates', coords)}
                coordinates={formData.location.coordinates}
              />
            </MapContainer>
          </div>
          <p className="text-sm text-gray-700 mt-2">Search for an address or click on the map to set the exact location. This will be used for search and directions.</p>
          <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">Selected Coordinates: <span className="font-mono font-medium">{formData.location.coordinates[1]}, {formData.location.coordinates[0]}</span></div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="pl-4 pr-6 py-6">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-gray-700 text-base">Set your rates and fees</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Base Price per Night</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-purple-600">₹</span>
                <input
                  type="number"
                  value={formData.pricing.basePrice}
                  onChange={(e) => handlePricingChange('basePrice', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className={`w-full pl-10 pr-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    validationMessages.basePrice || fieldErrors.basePrice ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              {(validationMessages.basePrice || fieldErrors.basePrice) && (
                <ValidationMessage field="basePrice" message={validationMessages.basePrice || fieldErrors.basePrice || ''} />
              )}
            </div>
            
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Extra Guest Price</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-purple-600">₹</span>
                <input
                  type="number"
                  value={formData.pricing.extraGuestPrice}
                  onChange={(e) => handlePricingChange('extraGuestPrice', Number(e.target.value))}
                  placeholder="500"
                  className={`w-full pl-10 pr-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    validationMessages.extraGuestPrice || fieldErrors['pricing.extraGuestPrice'] ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              {(validationMessages.extraGuestPrice || fieldErrors['pricing.extraGuestPrice']) && (
                <ValidationMessage field="extraGuestPrice" message={validationMessages.extraGuestPrice || fieldErrors['pricing.extraGuestPrice'] || ''} />
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Cleaning Fee</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-purple-600">₹</span>
                <input
                  type="number"
                  value={formData.pricing.cleaningFee}
                  onChange={(e) => handlePricingChange('cleaningFee', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className={`w-full pl-10 pr-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    validationMessages.cleaningFee || fieldErrors['pricing.cleaningFee'] ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              {(validationMessages.cleaningFee || fieldErrors['pricing.cleaningFee']) && (
                <ValidationMessage field="cleaningFee" message={validationMessages.cleaningFee || fieldErrors['pricing.cleaningFee'] || ''} />
              )}
            </div>
            
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Security Deposit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-purple-600">₹</span>
                <input
                  type="number"
                  value={formData.pricing.securityDeposit}
                  onChange={(e) => handlePricingChange('securityDeposit', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className={`w-full pl-10 pr-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    validationMessages.securityDeposit || fieldErrors['pricing.securityDeposit'] ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              {(validationMessages.securityDeposit || fieldErrors['pricing.securityDeposit']) && (
                <ValidationMessage field="securityDeposit" message={validationMessages.securityDeposit || fieldErrors['pricing.securityDeposit'] || ''} />
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-base font-semibold text-gray-900 mb-2">Currency</label>
          <select
            value={formData.pricing.currency}
            onChange={(e) => handleInputChange('pricing', { ...formData.pricing, currency: e.target.value })}
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900 max-w-xs"
          >
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        {/* Hourly Booking Settings */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hourly Booking</h3>
              <p className="text-sm text-gray-700">Allow guests to extend their stay with hourly options</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hourlyBooking.enabled}
                onChange={(e) => handleInputChange('hourlyBooking', { ...formData.hourlyBooking, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {formData.hourlyBooking.enabled && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Hourly Extension Rates</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-800 mb-1">6 Hours</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={Math.round(formData.hourlyBooking.hourlyRates.sixHours * 100)}
                        onChange={(e) => handleInputChange('hourlyBooking', {
                          ...formData.hourlyBooking,
                          hourlyRates: { ...formData.hourlyBooking.hourlyRates, sixHours: Number(e.target.value) / 100 }
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-gray-900 font-medium bg-white"
                      />
                      <span className="ml-1 text-xs font-medium text-gray-700">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-800 mb-1">12 Hours</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={Math.round(formData.hourlyBooking.hourlyRates.twelveHours * 100)}
                        onChange={(e) => handleInputChange('hourlyBooking', {
                          ...formData.hourlyBooking,
                          hourlyRates: { ...formData.hourlyBooking.hourlyRates, twelveHours: Number(e.target.value) / 100 }
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-gray-900 font-medium bg-white"
                      />
                      <span className="ml-1 text-xs font-medium text-gray-700">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-800 mb-1">18 Hours</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={Math.round(formData.hourlyBooking.hourlyRates.eighteenHours * 100)}
                        onChange={(e) => handleInputChange('hourlyBooking', {
                          ...formData.hourlyBooking,
                          hourlyRates: { ...formData.hourlyBooking.hourlyRates, eighteenHours: Number(e.target.value) / 100 }
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-gray-900 font-medium bg-white"
                      />
                      <span className="ml-1 text-xs font-medium text-gray-700">%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2">Percentage of daily rate for each extension period</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="pl-4 pr-6 py-6">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Capacity & Details</h3>
          <p className="text-gray-700 text-base">How many guests can your property accommodate?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Maximum Guests</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600" />
                <input
                  type="number"
                  value={formData.maxGuests}
                  onChange={(e) => handleInputChange('maxGuests', Number(e.target.value))}
                  placeholder="4"
                  className={`w-full pl-12 pr-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    validationMessages.maxGuests || fieldErrors.maxGuests ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              {(validationMessages.maxGuests || fieldErrors.maxGuests) && (
                <ValidationMessage field="maxGuests" message={validationMessages.maxGuests || fieldErrors.maxGuests || ''} />
              )}
            </div>
            
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Bedrooms</label>
              <div className="relative">
                <Bed className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600" />
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', Number(e.target.value))}
                  placeholder="2"
                  className={`w-full pl-12 pr-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    validationMessages.bedrooms || fieldErrors.bedrooms ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              {(validationMessages.bedrooms || fieldErrors.bedrooms) && (
                <ValidationMessage field="bedrooms" message={validationMessages.bedrooms || fieldErrors.bedrooms || ''} />
              )}
            </div>
            
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Bath className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600" />
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', Number(e.target.value))}
                  placeholder="2"
                  className={`w-full pl-12 pr-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    validationMessages.bathrooms || fieldErrors.bathrooms ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              {(validationMessages.bathrooms || fieldErrors.bathrooms) && (
                <ValidationMessage field="bathrooms" message={validationMessages.bathrooms || fieldErrors.bathrooms || ''} />
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Minimum Nights</label>
              <input
                type="number"
                value={formData.minNights}
                onChange={(e) => handleInputChange('minNights', Number(e.target.value))}
                placeholder="1"
                className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                  validationMessages.minNights || fieldErrors.minNights ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {(validationMessages.minNights || fieldErrors.minNights) && (
                <ValidationMessage field="minNights" message={validationMessages.minNights || fieldErrors.minNights || ''} />
              )}
            </div>
            
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Beds</label>
              <input
                type="number"
                value={formData.beds}
                onChange={(e) => handleInputChange('beds', Number(e.target.value))}
                placeholder="3"
                className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                  validationMessages.beds || fieldErrors.beds ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {(validationMessages.beds || fieldErrors.beds) && (
                <ValidationMessage field="beds" message={validationMessages.beds || fieldErrors.beds || ''} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="pl-4 pr-6 py-6">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Amenities & Features</h3>
          <p className="text-gray-700 text-base">What does your property offer?</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenitiesList.map(amenity => (
                <label key={amenity} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleArrayToggle('amenities', amenity)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-4 focus:ring-purple-100 focus:ring-offset-0"
                  />
                  <span className="text-base text-gray-900 capitalize font-medium">
                    {amenity.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {featuresList.map(feature => (
                <label key={feature} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleArrayToggle('features', feature)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-4 focus:ring-purple-100 focus:ring-offset-0"
                  />
                  <span className="text-base text-gray-900 capitalize font-medium">
                    {feature.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">House Rules</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {houseRulesList.map(rule => (
                <label key={rule} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={formData.houseRules.includes(rule)}
                    onChange={() => handleArrayToggle('houseRules', rule)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-4 focus:ring-purple-100 focus:ring-offset-0"
                  />
                  <span className="text-base text-gray-900 capitalize font-medium">
                    {rule.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="pl-4 pr-6 py-6">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Property Images</h3>
          <p className="text-gray-700 text-base">
            Upload high-quality images of your property. The first image will be used as the cover photo.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-dashed border-purple-200 rounded-xl p-8">
          <ImageUpload
            images={formData.images}
            onImagesChange={(images) => handleInputChange('images', images)}
            maxImages={10}
          />
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Basic Info', icon: <Home size={20} /> },
    { number: 2, title: 'Location', icon: <MapPin size={20} /> },
    { number: 3, title: 'Pricing', icon: <span className="font-bold text-purple-600">₹</span> },
    { number: 4, title: 'Capacity', icon: <Users size={20} /> },
    { number: 5, title: 'Amenities', icon: <CheckCircle size={20} /> },
    { number: 6, title: 'Images', icon: <Camera size={20} /> }
  ];

  // Success message
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center pt-24">
        <div className="max-w-md mx-auto px-4 py-8">
          <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Property Created Successfully!
            </h2>
            <p className="text-gray-600 mb-6 text-lg">Your property has been added and is now pending review.</p>
            <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Full-screen sidebar */}
      <div className="flex h-screen mb-32">
        {/* Left Sidebar - Fixed width, full height */}
        <aside className="w-80 bg-white border-r border-gray-100 shadow-xl flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="hover:bg-gray-50 transition-all duration-200 rounded-full p-2"
              >
                <ArrowLeft size={18} className="text-gray-600" />
              </Button>
              <h2 className="text-xl font-bold text-gray-900">Add Property</h2>
            </div>
            <p className="text-sm text-gray-500">Complete all steps to create your listing</p>
          </div>

          {/* Steps Navigation */}
          <div className="flex-1 p-6">
            <div className="space-y-3">
              {steps.map((stepItem) => {
                const isActive = step === stepItem.number;
                const isCompleted = step > stepItem.number;
                const canCompleteCurrentStep = step === stepItem.number && canProceed();
                const isStepValid = step < stepItem.number || (step === stepItem.number && canProceed());
                const canNavigateToStep = stepItem.number <= step || (stepItem.number === step + 1 && canProceed());
                
                return (
                  <button
                    key={stepItem.number}
                    type="button"
                    onClick={() => {
                      // Only allow navigation to completed steps or current step if ready
                      if (canNavigateToStep) {
                        setStep(stepItem.number);
                      }
                    }}
                    disabled={!canNavigateToStep}
                    className={`w-full group relative transition-all duration-300 ${
                      isActive ? 'scale-105' : 'hover:scale-102'
                    } ${!canNavigateToStep ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className={`
                      flex items-center space-x-4 p-4 rounded-xl transition-all duration-300
                      ${isActive 
                        ? canCompleteCurrentStep
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                        : isCompleted 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : canNavigateToStep
                            ? 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}>
                      {/* Step Number/Icon */}
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                        ${isActive 
                          ? canCompleteCurrentStep
                            ? 'bg-white/20 text-white'
                            : 'bg-orange-500 text-white'
                          : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : canNavigateToStep
                              ? 'bg-gray-200 text-gray-500'
                              : 'bg-gray-300 text-gray-400'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle size={20} />
                        ) : isActive && canCompleteCurrentStep ? (
                          <CheckCircle size={20} />
                        ) : (
                          <span className="font-semibold text-sm">{stepItem.number}</span>
                        )}
                      </div>
                      
                      {/* Step Content */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="opacity-80">{stepItem.icon}</span>
                          <span className="font-medium">{stepItem.title}</span>
                        </div>
                        {isActive && (
                          <div className="text-xs opacity-80 mt-1">
                            Current step
                          </div>
                        )}
                        {!canNavigateToStep && !isActive && (
                          <div className="text-xs text-gray-400 mt-1">
                            Complete previous steps first
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">Progress</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(step / steps.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-2">{step} of {steps.length} completed</div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Top Header Bar */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Step {step}: {steps[step - 1]?.title}</h1>
                <p className="text-gray-500 text-sm">Complete this step to continue</p>
              </div>
              <Button 
                onClick={() => router.push('/host/dashboard')}
                className="flex items-center px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 text-sm font-medium rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <XCircle size={16} className="text-red-500" />
                </div>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="pl-2 pr-4 py-4">
            <div className="w-full">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="transition-all duration-300">
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}
                  {step === 4 && renderStep4()}
                  {step === 5 && renderStep5()}
                  {step === 6 && renderStep6()}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                <Button 
                  onClick={() => setStep(prev => Math.max(1, prev - 1))}
                  disabled={step === 1}
                  className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-xl text-lg font-medium"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Previous
                </Button>

                <div className="flex items-center space-x-4">
                  {step < steps.length ? (
                    <Button 
                      onClick={() => setStep(prev => prev + 1)}
                      disabled={!canProceed()}
                      className={`flex items-center px-8 py-3 rounded-xl shadow-lg text-lg font-medium transition-all duration-200 ${
                        canProceed()
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-purple-500/25'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Next Step
                      <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center px-10 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all duration-200 rounded-xl shadow-lg shadow-green-500/25 text-lg font-medium"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Create Property
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PropertyForm; 