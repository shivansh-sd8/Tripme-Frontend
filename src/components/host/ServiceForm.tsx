"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Clock, 
  Save,
  ArrowLeft,
  CheckCircle,
  FileText,
  Upload,
  AlertCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import ImageUpload from '../ui/ImageUpload';
import { Service, ServicePricing, Location } from '@/types';
import { SERVICE_TYPE_OPTIONS } from '@/config/constants';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRef, useCallback } from 'react';

// Dynamic imports for Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents), { ssr: false });

// Marker icon configuration
const markerIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Mapbox constants
const MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Validation rules matching backend model
const VALIDATION_RULES = {
  title: {
    minLength: 1,
    maxLength: 100,
    required: true
  },
  description: {
    minLength: 1,
    maxLength: 2000,
    required: true
  },
  serviceType: {
    required: true
  },
  duration: {
    min: 1,
    required: true
  },
  address: {
    minLength: 1,
    required: false
  },
  city: {
    minLength: 1,
    required: false
  },
  country: {
    minLength: 1,
    required: false
  },
  groupSize: {
    min: 1,
    max: 100,
    required: true
  },
  basePrice: {
    min: 1,
    required: true
  },
  perPersonPrice: {
    min: 0,
    required: false
  }
};

interface ServiceFormProps {
  initialData?: any;
  isEditMode?: boolean;
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

const ServiceForm: React.FC<ServiceFormProps> = ({ initialData, isEditMode }) => {
  const requirementsList = [
    'government-id',
    'age-18-plus',
    'waiver-signature',
    'basic-fitness',
    'no-alcohol',
    'no-smoking',
    'no-pets',
    'experience-required'
  ];
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: '',
    duration: { value: 60, unit: 'minutes' }, // FIXED: duration is now an object
    location: {
      type: 'Point' as const,
      coordinates: [0, 0] as [number, number],
      address: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: ''
    } as Location,
    groupSize: {
      min: 1,
      max: 10
    },
    pricing: {
      basePrice: 0,
      perPersonPrice: 0,
      currency: 'INR' as ServicePricing['currency']
    } as ServicePricing,
    cancellationPolicy: 'moderate' as Service['cancellationPolicy'],
    requirements: [] as string[],
    media: [] as { url: string; publicId: string; isPrimary: boolean; caption?: string; width?: number; height?: number; format?: string; size?: number; type?: 'image' | 'video' }[]
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [validationMessages, setValidationMessages] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        duration: initialData.duration || { value: 60, unit: 'minutes' },
        location: initialData.location || formData.location,
        groupSize: initialData.groupSize || formData.groupSize,
        pricing: initialData.pricing || formData.pricing,
        requirements: initialData.requirements || [],
        media: initialData.media || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

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
          // Handle nested fields like 'pricing.basePrice'
          const [parent, child] = field.split('.');
          value = formData[parent as keyof typeof formData]?.[child as keyof any];
        } else if (field === 'duration') {
          value = formData.duration.value;
        } else if (field === 'groupSize') {
          value = formData.groupSize.max;
        } else {
          value = formData[field as keyof typeof formData];
        }
        
        const error = validateField(field, value);
        if (error) messages[field] = error;
      }
    });
    
    setValidationMessages(messages);
  }, [formData, touchedFields]);

  // Removed availability management for service creation/edit

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

  const handleGroupSizeChange = (field: 'min' | 'max', value: number) => {
    setFormData(prev => ({
      ...prev,
      groupSize: {
        ...prev.groupSize,
        [field]: value
      }
    }));
    
    // Mark field as touched when user starts typing
    const fieldKey = `groupSize.${field}`;
    setTouchedFields(prev => ({ ...prev, [fieldKey]: true }));
    
    // Clear field error when user starts typing
    if (fieldErrors[fieldKey]) {
      setFieldErrors(prev => ({ ...prev, [fieldKey]: '' }));
    }
  };

  const handleRequirementsToggle = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.includes(requirement)
        ? prev.requirements.filter(item => item !== requirement)
        : [...prev.requirements, requirement]
    }));
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let response;
      if (isEditMode && initialData && initialData._id) {
        response = await apiClient.updateService(initialData._id, formData);
      } else {
        response = await apiClient.createService(formData);
      }
      if (response.success) {
        try {
          const createdId = (response.data as any)?.service?._id || (response.data as any)?.service?.id || (response.data as any)?._id;
          if (createdId) {
            router.push(`/host/service/${createdId}/availability`);
          } else {
            router.push('/host/service');
          }
        } catch {
          router.push('/host/service');
        }
      } else {
        alert(response.message || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error saving service');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        // Basic Info: title, description, serviceType are required and valid
        return formData.title && 
               formData.description && 
               formData.serviceType && 
               !validationMessages.title && 
               !validationMessages.description && 
               !validationMessages.serviceType &&
               formData.title.length >= 1 &&
               formData.description.length >= 1;
      case 2:
        // Location: optional for services, but if provided should be valid
        return true; // Location is optional for services
      case 3:
        // Pricing: basePrice is required and valid
        return formData.pricing.basePrice > 0 && 
               !validationMessages.basePrice &&
               formData.pricing.basePrice >= 1;
      case 4:
        // Duration & Group Size: duration and groupSize are required and valid
        return formData.duration.value > 0 && 
               formData.groupSize.max >= formData.groupSize.min && 
               formData.groupSize.min > 0 &&
               !validationMessages.duration && 
               !validationMessages.groupSize &&
               formData.duration.value >= 1 &&
               formData.groupSize.max >= 1 && formData.groupSize.max <= 100;
      case 5:
        // Requirements & Policies: optional but should have at least one requirement
        return formData.requirements.length > 0 || true; // Requirements are optional
      case 6:
        // Media: at least one media file is required
        return formData.media.length > 0;
      default:
        return true;
    }
  };

  const renderStep1 = () => (
    <div className="pl-4 pr-6 py-6">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h3>
          <p className="text-gray-700 text-base">Tell us about your service</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              Service Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Guided City Tour"
              className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                validationMessages.title || fieldErrors.title ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {(validationMessages.title || fieldErrors.title) && (
              <ValidationMessage field="title" message={validationMessages.title || fieldErrors.title || ''} />
            )}
          </div>
          
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              Service Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) => handleInputChange('serviceType', e.target.value)}
              className={`w-full px-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900 ${
                validationMessages.serviceType || fieldErrors.serviceType ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              <option value="">Select service type</option>
              {SERVICE_TYPE_OPTIONS.map(type => (
                <option key={type} value={type}>
                  {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
            {(validationMessages.serviceType || fieldErrors.serviceType) && (
              <ValidationMessage field="serviceType" message={validationMessages.serviceType || fieldErrors.serviceType || ''} />
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-base font-semibold text-gray-900 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your service in detail..."
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

  const renderStep2 = () => (
    <div className="pl-4 pr-6 py-6">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Location</h3>
          <p className="text-gray-700 text-base">Where is your service located?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">Street Address</label>
            <input
              type="text"
              value={formData.location.address}
              onChange={(e) => handleLocationChange('address', e.target.value)}
              placeholder="123 Main Street"
              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">City</label>
            <input
              type="text"
              value={formData.location.city}
              onChange={(e) => handleLocationChange('city', e.target.value)}
              placeholder="Mumbai"
              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">State</label>
            <input
              type="text"
              value={formData.location.state}
              onChange={(e) => handleLocationChange('state', e.target.value)}
              placeholder="Maharashtra"
              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">Postal Code</label>
            <input
              type="text"
              value={formData.location.postalCode}
              onChange={(e) => handleLocationChange('postalCode', e.target.value)}
              placeholder="400001"
              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
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
              }}
            />
          </div>
          
          <label className="block text-base font-semibold text-gray-900 mb-2">Pin service location on map</label>
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
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Pricing</h3>
          <p className="text-gray-700 text-base">Set your service rates</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">Base Price</label>
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
            <label className="block text-base font-semibold text-gray-900 mb-2">Per Person Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-bold text-purple-600">₹</span>
              <input
                type="number"
                value={formData.pricing.perPersonPrice}
                onChange={(e) => handlePricingChange('perPersonPrice', Number(e.target.value))}
                placeholder="100"
                className={`w-full pl-10 pr-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                  validationMessages.perPersonPrice || fieldErrors['pricing.perPersonPrice'] ? 'border-red-300' : 'border-gray-200'
                }`}
              />
            </div>
            {(validationMessages.perPersonPrice || fieldErrors['pricing.perPersonPrice']) && (
              <ValidationMessage field="perPersonPrice" message={validationMessages.perPersonPrice || fieldErrors['pricing.perPersonPrice'] || ''} />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="pl-4 pr-6 py-6">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Duration & Group Size</h3>
          <p className="text-gray-700 text-base">How long is your service and how many people can join?</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">Duration</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600" />
                <input
                  type="number"
                  value={formData.duration.value}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      duration: { ...prev.duration, value: Number(e.target.value) }
                    }));
                    // Mark duration field as touched
                    setTouchedFields(prev => ({ ...prev, duration: true }));
                  }}
                  placeholder="60"
                  min={1}
                  className={`w-full pl-12 pr-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    validationMessages.duration || fieldErrors.duration ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              <select
                value={formData.duration.unit}
                onChange={e => {
                  setFormData(prev => ({
                    ...prev,
                    duration: { ...prev.duration, unit: e.target.value }
                  }));
                  // Mark duration field as touched
                  setTouchedFields(prev => ({ ...prev, duration: true }));
                }}
                className="px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900 min-w-[120px]"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            {(validationMessages.duration || fieldErrors.duration) && (
              <ValidationMessage field="duration" message={validationMessages.duration || fieldErrors.duration || ''} />
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Minimum Group Size</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600" />
                <input
                  type="number"
                  value={formData.groupSize.min}
                  onChange={(e) => handleGroupSizeChange('min', Number(e.target.value))}
                  placeholder="1"
                  className={`w-full pl-12 pr-4 py-3 text-base border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    validationMessages.groupSize || fieldErrors.groupSize ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              {(validationMessages.groupSize || fieldErrors.groupSize) && (
                <ValidationMessage field="groupSize" message={validationMessages.groupSize || fieldErrors.groupSize || ''} />
              )}
            </div>
            
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-2">Maximum Group Size</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600" />
                <input
                  type="number"
                  value={formData.groupSize.max}
                  onChange={(e) => handleGroupSizeChange('max', Number(e.target.value))}
                  placeholder="10"
                  className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>
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
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Requirements & Policies</h3>
          <p className="text-gray-700 text-base">What do guests need to know?</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Guest Requirements</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {requirementsList.map(requirement => (
                <label key={requirement} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={formData.requirements.includes(requirement)}
                    onChange={() => handleRequirementsToggle(requirement)}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-purple-600 focus:ring-4 focus:ring-purple-100 focus:ring-offset-0"
                  />
                  <span className="text-base text-gray-900 capitalize font-medium">
                    {requirement.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h4>
            <select
              value={formData.cancellationPolicy}
              onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900 max-w-md"
            >
              <option value="flexible">Flexible - Full refund up to 24 hours before</option>
              <option value="moderate">Moderate - Full refund up to 5 days before</option>
              <option value="strict">Strict - 50% refund up to 7 days before</option>
              <option value="super-strict">Super Strict - No refunds</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="pl-4 pr-6 py-6">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Service Media</h3>
          <p className="text-gray-700 text-base">
            Upload high-quality images or videos for your service. The first media will be used as the cover.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-dashed border-purple-200 rounded-xl p-8">
          <ImageUpload
            images={formData.media}
            onImagesChange={(media) => handleInputChange('media', media)}
            maxImages={10}
          />
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Basic Info', icon: <Briefcase size={20} /> },
    { number: 2, title: 'Location', icon: <MapPin size={20} /> },
    { number: 3, title: 'Pricing', icon: <span className="font-bold text-purple-600">₹</span> },
    { number: 4, title: 'Duration', icon: <Clock size={20} /> },
    { number: 5, title: 'Requirements', icon: <FileText size={20} /> },
    { number: 6, title: 'Media', icon: <Upload size={20} /> }
  ];

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
              <h2 className="text-xl font-bold text-gray-900">Add Service</h2>
            </div>
            <p className="text-sm text-gray-500">Complete all steps to create your service</p>
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
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                          Create Service
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

export default ServiceForm; 