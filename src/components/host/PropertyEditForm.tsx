"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import { 
  Home, 
  MapPin, 
  Users, 
  Bed, 
  Bath, 
  Save,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar
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
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents), { ssr: false });

// Custom property marker icon using home.png
const propertyMarkerIcon = new L.Icon({
  iconUrl: '/home.png',
  iconSize: [48, 60],
  iconAnchor: [24, 60],
  popupAnchor: [0, -60],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [61, 61],
  shadowAnchor: [18, 61],
});

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2hpdmFuc2gxODA5IiwiYSI6ImNtZTRhdmJyMTA5YTEya3F0cWN2c3RpdmcifQ.7l3-Hj7ihCHCwH656wq1oA';
const MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

interface PropertyEditFormProps {
  listingId: string;
}

// Add a component for map click events and draggable marker
function LocationMarker({ setCoordinates, coordinates }: { setCoordinates: (coords: [number, number]) => void, coordinates: [number, number] }) {
  // @ts-expect-error - useMapEvents is dynamically imported
  useMapEvents({
    click(e: any) {
      setCoordinates([e.latlng.lng, e.latlng.lat]);
    },
  });
  return coordinates[0] !== 0 && coordinates[1] !== 0 ? (
    <Marker
      position={[coordinates[1], coordinates[0]]}
      icon={propertyMarkerIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e: any) => {
          const marker = e.target;
          const latlng = marker.getLatLng();
          setCoordinates([latlng.lng, latlng.lat]);
        },
      }}
    >
      <Popup>🏠 Drag me to adjust the exact property location</Popup>
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

const PropertyEditForm: React.FC<PropertyEditFormProps> = ({ listingId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
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

  // Property type options
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

  useEffect(() => {
    fetchListingData();
  }, [listingId]);

  const fetchListingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getListing(listingId);
      
      if (response.success && (response.data as any)?.listing) {
        const listing = (response.data as any).listing;
        
        setFormData({
          title: listing.title || '',
          description: listing.description || '',
          type: listing.type || 'apartment',
          propertyType: listing.propertyType || 'standard',
          style: listing.style || 'modern',
          location: {
            type: 'Point',
            coordinates: listing.location?.coordinates || [0, 0],
            address: listing.location?.address || '',
            city: listing.location?.city || '',
            state: listing.location?.state || '',
            country: listing.location?.country || 'India',
            postalCode: listing.location?.postalCode || ''
          },
          pricing: {
            basePrice: listing.pricing?.basePrice || 0,
            extraGuestPrice: listing.pricing?.extraGuestPrice || 0,
            cleaningFee: listing.pricing?.cleaningFee || 0,
            serviceFee: listing.pricing?.serviceFee || 0,
            securityDeposit: listing.pricing?.securityDeposit || 0,
            currency: listing.pricing?.currency || 'INR',
            weeklyDiscount: listing.pricing?.weeklyDiscount || 0,
            monthlyDiscount: listing.pricing?.monthlyDiscount || 0
          },
          maxGuests: listing.maxGuests || 1,
          minNights: listing.minNights || 1,
          bedrooms: listing.bedrooms || 1,
          beds: listing.beds || 1,
          bathrooms: listing.bathrooms || 1,
          amenities: listing.amenities || [],
          features: listing.features || [],
          houseRules: listing.houseRules || [],
          checkInTime: listing.checkInTime || '15:00',
          checkOutTime: listing.checkOutTime || '11:00',
          cancellationPolicy: listing.cancellationPolicy || 'moderate',
          hourlyBooking: {
            enabled: listing.hourlyBooking?.enabled || false,
            minStayDays: listing.hourlyBooking?.minStayDays || 1,
            hourlyRates: {
              sixHours: listing.hourlyBooking?.hourlyRates?.sixHours || 0.30,
              twelveHours: listing.hourlyBooking?.hourlyRates?.twelveHours || 0.60,
              eighteenHours: listing.hourlyBooking?.hourlyRates?.eighteenHours || 0.75
            }
          },
          images: listing.images || []
        });
      } else {
        setError('Failed to load listing data');
        console.error('API error: No listing in response', response);
      }
    } catch (err: any) {
      console.error('Error fetching listing:', err);
      setError(err?.message || 'Failed to load listing data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleLocationSelect = (coords: [number, number], address: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: coords,
        address: address
      }
    }));
  };

  const setCoordinates = (coords: [number, number]) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: coords
      }
    }));
  };

  const handlePricingChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }));
  };

  const handleArrayToggle = (field: 'amenities' | 'features' | 'houseRules', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleHourlyBookingChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      hourlyBooking: {
        ...prev.hourlyBooking,
        [field]: value
      }
    }));
  };

  const formatDataForBackend = () => {
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
    setSaving(true);
    setError(null);
    setFieldErrors({});
    
    try {
      const formattedData = formatDataForBackend();
      
      const response = await apiClient.updateListing(listingId, formattedData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/host/listings');
        }, 2000);
      } else {
        if (response.errors && Array.isArray(response.errors)) {
          const errors: { [key: string]: string } = {};
          response.errors.forEach((err: any) => {
            if (err.field && err.message) {
              errors[err.field] = err.message;
            }
          });
          setFieldErrors(errors);
        }
        setError(response.message || 'Failed to update listing');
      }
    } catch (error: any) {
      console.error('Error updating listing:', error);
      setError(error.message || 'Error updating listing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.type;
      case 2:
        return formData.location.city && formData.location.state;
      case 3:
        return formData.pricing.basePrice > 0;
      case 4:
        return formData.maxGuests > 0 && formData.bedrooms > 0;
      case 5:
        return true; // Amenities are optional
      case 6:
        return formData.images.length > 0; // At least one image required
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading listing data...</p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchListingData}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/host/listings')}>
                Back to Listings
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Listing Updated Successfully!
            </h2>
            <p className="text-gray-600 mb-6 text-lg">Your property has been updated and is now pending review.</p>
            <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Redirecting to listings...</p>
          </Card>
        </div>
      </div>
    );
  }

  // Define steps for the sidebar
  const steps = [
    { number: 1, title: 'Basic Info', icon: <Home size={20} /> },
    { number: 2, title: 'Location', icon: <MapPin size={20} /> },
    { number: 3, title: 'Pricing', icon: <span className="font-bold text-purple-600">₹</span> },
    { number: 4, title: 'Capacity', icon: <Users size={20} /> },
    { number: 5, title: 'Amenities', icon: <CheckCircle size={20} /> },
    { number: 6, title: 'Images', icon: <Calendar size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Full-screen sidebar */}
      <div className="flex min-h-screen">
        {/* Left Sidebar - Fixed width, full height */}
        <aside className="w-80 bg-white border-r border-gray-100 shadow-xl flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/host/listings')}
                className="hover:bg-gray-50 transition-all duration-200 rounded-full p-2"
              >
                <ArrowLeft size={18} className="text-gray-600" />
              </Button>
              <h2 className="text-xl font-bold text-gray-900">Edit Property</h2>
            </div>
            <p className="text-sm text-gray-500">Update your property information</p>
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
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25' 
                        : isCompleted 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      } ${!canNavigateToStep ? 'opacity-50' : ''}
                    `}>
                      {/* Step Number/Icon */}
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                        ${isActive 
                          ? 'bg-white/20 text-white' 
                          : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }
                      `}>
                        {isCompleted ? (
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
                          <div className="text-xs opacity-80 mt-1">Current step</div>
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
        <main className="flex-1 overflow-y-auto pb-8">
          {/* Top Header Bar */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Step {step}: {steps[step - 1]?.title}</h1>
                <p className="text-gray-600 mt-1">Update this step to continue</p>
              </div>
              <Button 
                onClick={() => router.push('/host/listings')}
                className="flex items-center px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 text-sm font-medium rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Listings
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6">
            <div className="w-full">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="transition-all duration-300">
                  {step === 1 && (
                    <div className="p-8">
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <h3 className="text-3xl font-bold text-slate-900 mb-2">Basic Information</h3>
                          <p className="text-slate-600 text-lg">Tell us about your property</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Property Title</label>
                              <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="e.g., Beautiful Beachfront Villa"
                                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                              />
                              {fieldErrors['title'] && (
                                <p className="text-red-500 text-sm mt-2">{fieldErrors['title']}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Property Type</label>
                              <select
                                value={formData.type}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900"
                              >
                                {propertyTypes.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Property Category</label>
                              <select
                                value={formData.propertyType}
                                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900"
                              >
                                <option value="budget">Budget</option>
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                                <option value="luxury">Luxury</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Style</label>
                              <select
                                value={formData.style}
                                onChange={(e) => handleInputChange('style', e.target.value)}
                                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900"
                              >
                                {propertyStyles.map(style => (
                                  <option key={style.value} value={style.value}>
                                    {style.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8">
                          <label className="block text-lg font-semibold text-gray-800 mb-3">Description</label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe your property, its unique features, and what makes it special..."
                            rows={6}
                            className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none bg-white text-slate-900 placeholder-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step === 2 && (
                    <div className="p-8">
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <h3 className="text-3xl font-bold text-slate-900 mb-2">Location</h3>
                          <p className="text-slate-600 text-lg">Where is your property located?</p>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <div className="flex items-center space-x-3 mb-4">
                              <MapPin className="w-6 h-6 text-blue-600" />
                              <h4 className="text-xl font-semibold text-blue-900">Map Search</h4>
                            </div>
                            <MapSearchBox onSelect={handleLocationSelect} />
                          </div>
                          
                          <div className="h-96 rounded-xl overflow-hidden border-2 border-slate-300 shadow-lg">
                            <MapContainer
                              center={[formData.location.coordinates[1], formData.location.coordinates[0]]}
                              zoom={13}
                              className="h-full w-full"
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                              />
                              <LocationMarker 
                                setCoordinates={setCoordinates} 
                                coordinates={formData.location.coordinates} 
                              />
                            </MapContainer>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Street Address</label>
                              <input
                                type="text"
                                value={formData.location.address}
                                onChange={(e) => handleLocationChange('address', e.target.value)}
                                placeholder="123 Main Street"
                                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                              />
                            </div>
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">City</label>
                              <input
                                type="text"
                                value={formData.location.city}
                                onChange={(e) => handleLocationChange('city', e.target.value)}
                                placeholder="Mumbai"
                                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                              />
                            </div>
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">State</label>
                              <input
                                type="text"
                                value={formData.location.state}
                                onChange={(e) => handleLocationChange('state', e.target.value)}
                                placeholder="Maharashtra"
                                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                              />
                            </div>
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Postal Code</label>
                              <input
                                type="text"
                                value={formData.location.postalCode}
                                onChange={(e) => handleLocationChange('postalCode', e.target.value)}
                                placeholder="400001"
                                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step === 3 && (
                    <div className="p-8">
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <h3 className="text-3xl font-bold text-slate-900 mb-2">Pricing</h3>
                          <p className="text-slate-600 text-lg">Set your property's pricing</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Base Price per Night</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-purple-600">₹</span>
                                <input
                                  type="number"
                                  value={formData.pricing.basePrice}
                                  onChange={(e) => handlePricingChange('basePrice', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                                />
                              </div>
                              {fieldErrors['pricing.basePrice'] && (
                                <p className="text-red-500 text-sm mt-2">{fieldErrors['pricing.basePrice']}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Extra Guest Price</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-purple-600">₹</span>
                                <input
                                  type="number"
                                  value={formData.pricing.extraGuestPrice}
                                  onChange={(e) => handlePricingChange('extraGuestPrice', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Cleaning Fee</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-purple-600">₹</span>
                                <input
                                  type="number"
                                  value={formData.pricing.cleaningFee}
                                  onChange={(e) => handlePricingChange('cleaningFee', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Security Deposit</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-purple-600">₹</span>
                                <input
                                  type="number"
                                  value={formData.pricing.securityDeposit}
                                  onChange={(e) => handlePricingChange('securityDeposit', parseFloat(e.target.value) || 0)}
                                  placeholder="0"
                                  className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-slate-900 placeholder-slate-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Hourly Booking Settings */}
                        <div className="mt-8 pt-6 border-t border-slate-300">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">Hourly Booking</h3>
                              <p className="text-sm text-slate-700">Allow guests to extend their stay with hourly options</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.hourlyBooking.enabled}
                                onChange={(e) => handleHourlyBookingChange('enabled', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          {formData.hourlyBooking.enabled && (
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                              <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-3">Hourly Extension Rates</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-800 mb-1">6 Hours</label>
                                    <div className="flex items-center">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={Math.round(formData.hourlyBooking.hourlyRates.sixHours * 100)}
                                        onChange={(e) => handleHourlyBookingChange('hourlyRates', {
                                          ...formData.hourlyBooking.hourlyRates,
                                          sixHours: Number(e.target.value) / 100
                                        })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-gray-900 font-medium bg-white"
                                      />
                                      <span className="ml-1 text-xs font-medium text-slate-700">%</span>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-800 mb-1">12 Hours</label>
                                    <div className="flex items-center">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={Math.round(formData.hourlyBooking.hourlyRates.twelveHours * 100)}
                                        onChange={(e) => handleHourlyBookingChange('hourlyRates', {
                                          ...formData.hourlyBooking.hourlyRates,
                                          twelveHours: Number(e.target.value) / 100
                                        })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-gray-900 font-medium bg-white"
                                      />
                                      <span className="ml-1 text-xs font-medium text-slate-700">%</span>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-800 mb-1">18 Hours</label>
                                    <div className="flex items-center">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={Math.round(formData.hourlyBooking.hourlyRates.eighteenHours * 100)}
                                        onChange={(e) => handleHourlyBookingChange('hourlyRates', {
                                          ...formData.hourlyBooking.hourlyRates,
                                          eighteenHours: Number(e.target.value) / 100
                                        })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-gray-900 font-medium bg-white"
                                      />
                                      <span className="ml-1 text-xs font-medium text-slate-700">%</span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 mt-2">Percentage of daily rate for each extension period</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step === 4 && (
                    <div className="p-8">
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <h3 className="text-3xl font-bold text-slate-900 mb-2">Capacity</h3>
                          <p className="text-slate-600 text-lg">Define your property's capacity</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="text-center">
                            <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Max Guests</label>
                              <input
                                type="number"
                                value={formData.maxGuests}
                                onChange={(e) => handleInputChange('maxGuests', parseInt(e.target.value))}
                                placeholder="1"
                                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-center bg-white text-slate-900 placeholder-slate-500"
                              />
                              {fieldErrors['maxGuests'] && (
                                <p className="text-red-500 text-sm mt-2">{fieldErrors['maxGuests']}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                              <Bed className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Bedrooms</label>
                              <input
                                type="number"
                                value={formData.bedrooms}
                                onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                                placeholder="1"
                                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-center bg-white text-slate-900 placeholder-slate-500"
                              />
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                              <Bath className="w-12 h-12 text-green-600 mx-auto mb-4" />
                              <label className="block text-lg font-semibold text-slate-800 mb-3">Bathrooms</label>
                              <input
                                type="number"
                                value={formData.bathrooms}
                                onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                                placeholder="1"
                                className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-center bg-white text-slate-900 placeholder-slate-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step === 5 && (
                    <div className="p-8">
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <h3 className="text-3xl font-bold text-slate-900 mb-2">Amenities</h3>
                          <p className="text-slate-600 text-lg">What amenities does your property offer?</p>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {amenitiesList.map((amenity) => (
                            <label key={amenity} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200">
                              <input
                                type="checkbox"
                                checked={formData.amenities.includes(amenity)}
                                onChange={(e) => handleArrayToggle('amenities', amenity)}
                                className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <span className="text-slate-700 font-medium capitalize">
                                {amenity.replace('-', ' ')}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step === 6 && (
                    <div className="p-8">
                      <div className="space-y-8">
                        <div className="text-center mb-8">
                          <h3 className="text-3xl font-bold text-slate-900 mb-2">Property Images</h3>
                          <p className="text-slate-600 text-lg">Upload high-quality images of your property</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-200">
                          <ImageUpload
                            images={formData.images}
                            onImagesChange={(images) => handleInputChange('images', images)}
                            maxImages={10}
                            error={fieldErrors['images']}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8">
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
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all duration-200 rounded-xl shadow-lg shadow-purple-500/25 text-lg font-medium"
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
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Update Property
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

export default PropertyEditForm; 