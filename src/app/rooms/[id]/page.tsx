"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { apiClient } from "@/infrastructure/api/clients/api-client";
import { useAuth } from "@/core/store/auth-context";
import { useBooking } from "@/core/store/booking-context";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Button from "@/components/ui/Button";
import HourlyBookingSelector from "@/components/booking/HourlyBookingSelector";
import PricingBreakdown from "@/components/booking/PricingBreakdown";
import { calculatePricingBreakdown, fetchPlatformFeeRate, toTwoDecimals, calculateHourlyExtension } from "@/shared/utils/pricingUtils";
import { formatCurrency, PRICING_CONSTANTS } from "@/shared/constants/pricing.constants";
import { addDays, format, differenceInDays } from 'date-fns';
import { createPortal } from 'react-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Heart,
  Wifi,
  Tv,
  ChefHat,
  Droplets,
  Snowflake,
  Flame,
  Monitor,
  Waves,
  Car,
  Dumbbell,
  Coffee,
  Bell,
  Stethoscope,
  Package,
  Mountain,
  Building2,
  Trees,
  Home,
  ArrowLeft,
  Share2,
  Shield,
  CheckCircle,
  Clock,
  PawPrint,
  Cigarette,
  CalendarDays,
  Minus,
  Plus,
  Info,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Bed,
  Bath,
  Users as UsersIcon,
  Zap,
  Lock,
  Wifi as WifiIcon,
  Car as CarIcon,
  Coffee as CoffeeIcon,
  Dumbbell as GymIcon,
  Waves as PoolIcon,
  Mountain as ViewIcon,
  Flame as FireplaceIcon,
  PawPrint as PetIcon,
  Cigarette as SmokingIcon,
  Clock as ClockIcon,
  Shield as SecurityIcon,
  Star as StarIcon,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Loader2,
  RefreshCw,
  Receipt
} from "lucide-react";

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;
  const { user, isAuthenticated, isLoading } = useAuth();
  const { bookingData, updateBookingData, setBookingData } = useBooking();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Booking state - initialize from context or defaults
  const [dateRange, setDateRange] = useState<{
    startDate: Date;
    endDate: Date | null;
    key: string;
  }>(() => {
    if (bookingData?.startDate && bookingData?.endDate) {
      return {
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        key: 'selection',
      };
    }
    return {
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      key: 'selection',
    };
  });
  
  const [guests, setGuests] = useState(() => {
    return bookingData?.guests?.adults || 1;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Hourly booking state
  const [hourlyExtension, setHourlyExtension] = useState<number | null>(() => {
    return bookingData?.hourlyExtension || null;
  });
  const [hourlyPricing, setHourlyPricing] = useState<any>(null);
  const [specialRequests, setSpecialRequests] = useState(() => {
    return bookingData?.specialRequests || '';
  });
  const [platformFeeRate, setPlatformFeeRate] = useState<number | null>(null);
  const [isLoadingPlatformFee, setIsLoadingPlatformFee] = useState(true);
  
  // Pricing breakdown state
  const [priceBreakdown, setPriceBreakdown] = useState({
    basePrice: 0,
    serviceFee: 0,
    cleaningFee: 0,
    securityDeposit: 0,
    extraGuestCost: 0,
    hourlyExtensionCost: 0,
    platformFee: 0,
    gst: 0,
    processingFee: 0,
    taxes: 0,
    total: 0,
    nights: 0,
    subtotal: 0
  });

  // Sync local state with booking context
  useEffect(() => {
    if (bookingData) {
      if (bookingData.startDate && bookingData.endDate) {
        setDateRange({
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          key: 'selection',
        });
      }
      if (bookingData.guests) {
        setGuests(bookingData.guests.adults);
      }
      if (bookingData.hourlyExtension) {
        setHourlyExtension(bookingData.hourlyExtension);
      }
      if (bookingData.specialRequests) {
        setSpecialRequests(bookingData.specialRequests);
      }
    }
  }, [bookingData]);

  // Fetch current platform fee rate immediately
  useEffect(() => {
    const loadPlatformFeeRate = async () => {
      try {
        setIsLoadingPlatformFee(true);
        const rate = await fetchPlatformFeeRate();
        setPlatformFeeRate(rate);
        console.log(`✅ Platform fee rate loaded: ${(rate * 100).toFixed(1)}%`);
      } catch (error) {
        console.error('❌ Error fetching platform fee rate:', error);
        setPlatformFeeRate(PRICING_CONSTANTS.PLATFORM_FEE_RATE);
        console.warn('⚠️ Using fallback platform fee rate: 15%');
      } finally {
        setIsLoadingPlatformFee(false);
      }
    };
    
    loadPlatformFeeRate();
  }, []);

  // Update priceBreakdown when pricing calculation changes
  useEffect(() => {
    if (!property || !dateRange.startDate || !dateRange.endDate || isLoadingPlatformFee || platformFeeRate === null) {
      console.log('⏳ Waiting for required data to load...');
      return;
    }
    
    const pricing = calculateTotalPrice();
    
    if (!pricing) return;
    
    const newPriceBreakdown = {
      basePrice: property?.pricing?.basePrice || 0, // Fixed: use actual price per night, not total base amount
      serviceFee: pricing.serviceFee,
      cleaningFee: pricing.cleaningFee,
      securityDeposit: pricing.securityDeposit,
      extraGuestCost: pricing.extraGuestCost,
      extraGuestPrice: pricing.extraGuestPrice,
      extraGuests: pricing.extraGuests,
      hourlyExtension: pricing.hourlyExtension,
      platformFee: pricing.platformFee,
      gst: pricing.gst,
      processingFee: pricing.processingFee,
      taxes: pricing.gst,
      total: pricing.totalAmount,
      nights: pricing.nights,
      subtotal: pricing.subtotal,
      discountAmount: pricing.discountAmount
    };
    
    console.log('✅ Price breakdown updated:', newPriceBreakdown);
    setPriceBreakdown(newPriceBreakdown);
  }, [property, dateRange.startDate, dateRange.endDate, guests, hourlyExtension, platformFeeRate, isLoadingPlatformFee]);
  
  // Availability state
  const [availability, setAvailability] = useState<any[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false);
  
  // UI state
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Calendar navigation state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Date selection state
  const [selectionStep, setSelectionStep] = useState<'checkin' | 'checkout' | 'complete'>('checkin');
  
  // Refs
  const datePickerRef = useRef<HTMLDivElement>(null);
  const guestPickerRef = useRef<HTMLDivElement>(null);
  const bookingCardRef = useRef<HTMLDivElement>(null);

  // Clear availability state when dates change
  useEffect(() => {
    setAvailabilityError('');
    setAvailabilityChecked(false);
    setAvailability([]);
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.getListing(id as string)
      .then((res: any) => {
        setProperty(res.data?.listing || null);
        setError("");
      })
      .catch((error) => {
        setError("Property not found");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Removed automatic availability loading - only load when user explicitly checks availability

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
        setShowGuestPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatPrice = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return 'Select date';
    return format(date, 'MMM dd');
  };
  const formatDateFull = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return 'Select date';
    return format(date, 'EEEE, MMMM dd');
  };

  // Check availability for selected dates
  const checkAvailability = async () => {
    if (!id || selectionStep !== 'complete') {
      setAvailabilityError('Please select both check-in and check-out dates');
      return;
    }

    // Validate date range
    if (!dateRange.startDate || isNaN(dateRange.startDate.getTime())) {
      setAvailabilityError('Please select a valid check-in date');
      return;
    }
    
    const startDate = new Date(dateRange.startDate);
    const endDate = dateRange.endDate && !isNaN(dateRange.endDate.getTime()) ? new Date(dateRange.endDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setAvailabilityError('Check-in date cannot be in the past');
      return;
    }

    if (!endDate || startDate >= endDate) {
      setAvailabilityError('Check-out date must be after check-in date');
      return;
    }

    // Check minimum nights if property has this requirement
    const nights = endDate && !isNaN(endDate.getTime()) && !isNaN(startDate.getTime()) ? differenceInDays(endDate, startDate) : 0;
    if (property?.minNights && nights < property.minNights) {
      setAvailabilityError(`Minimum ${property.minNights} nights required`);
      return;
    }

    setAvailabilityLoading(true);
    setAvailabilityError('');
    
    try {
      const startDateStr = startDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const endDateStr = endDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      const response = await apiClient.getAvailability(id as string, startDateStr, endDateStr);
      
      if (response.success && response.data) {
        const availabilityData = response.data.availability || [];
        
        
        // Check if all selected dates are available
        const currentDate = new Date(startDate);
        let allAvailable = true;
        const conflictingDates: string[] = [];
        
        while (currentDate < endDate) {
          const dateStr = currentDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
          
          // Find availability record for this date
          const dateAvailability = availabilityData.find((a: any) => {
            // Handle both string dates and Date objects
            let availabilityDateStr: string;
            if (typeof a.date === 'string') {
              // Parse the date string and convert to local date string
              try {
              const parsedDate = new Date(a.date);
                if (isNaN(parsedDate.getTime())) {
                  console.warn('Invalid date string:', a.date);
                  return false;
                }
              availabilityDateStr = parsedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
              } catch (error) {
                console.warn('Error parsing date string:', a.date, error);
                return false;
              }
            } else if (a.date instanceof Date) {
              if (isNaN(a.date.getTime())) {
                console.warn('Invalid Date object:', a.date);
                return false;
              }
              availabilityDateStr = a.date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            } else {
              try {
              const parsedDate = new Date(a.date);
                if (isNaN(parsedDate.getTime())) {
                  console.warn('Invalid date value:', a.date);
                  return false;
                }
              availabilityDateStr = parsedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
              } catch (error) {
                console.warn('Error parsing date value:', a.date, error);
                return false;
              }
            }
            return availabilityDateStr === dateStr;
          });
          
          
          // Check availability status - dates are available by default unless explicitly marked as unavailable
          if (dateAvailability) {
            // Date exists in Availability model - check its status
            if (dateAvailability.status === 'booked') {
              allAvailable = false;
              conflictingDates.push(dateStr);
            } else if (dateAvailability.status === 'maintenance') {
              allAvailable = false;
              conflictingDates.push(dateStr);
            } else if (dateAvailability.status === 'blocked') {
              allAvailable = false;
              conflictingDates.push(dateStr);
            } else if (dateAvailability.status === 'available') {
            } else {
              // Any other unknown status - treat as available by default
            }
          } else {
            // Date doesn't exist in Availability model - it's NOT available
            allAvailable = false;
            conflictingDates.push(dateStr);
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        if (allAvailable) {
          setAvailabilityChecked(true);
          setAvailabilityError('');
          setAvailability(availabilityData);
        } else {
          setAvailabilityError(`Selected dates are not available. Conflicting dates: ${conflictingDates.join(', ')}`);
          setAvailabilityChecked(false);
        }
      } else {
        setAvailabilityError('Failed to check availability');
        setAvailabilityChecked(false);
      }
    } catch (error: any) {
      console.error('Availability check error:', error);
      setAvailabilityError(error.message || 'Failed to check availability');
      setAvailabilityChecked(false);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Date validation function
  const validateDateRange = (startDate: Date | null, endDate: Date | null) => {
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Basic validation
    if (startDate < today) {
      setAvailabilityError('Check-in date cannot be in the past');
      return false;
    }

    if (startDate >= endDate) {
      setAvailabilityError('Check-out date must be after check-in date');
      return false;
    }

    // Check minimum nights if property has this requirement
    const nights = (!endDate || !startDate || isNaN(endDate.getTime()) || isNaN(startDate.getTime())) ? 0 : differenceInDays(endDate, startDate);
    if (property?.minNights && nights < property.minNights) {
      setAvailabilityError(`Minimum ${property.minNights} nights required`);
      return false;
    }

    // Clear any previous errors if dates are valid
    setAvailabilityError('');
    return true;
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, any> = {
      'wifi': <WifiIcon className="w-5 h-5" />,
      'tv': <Tv className="w-5 h-5" />,
      'kitchen': <ChefHat className="w-5 h-5" />,
      'washer': <Droplets className="w-5 h-5" />,
      'dryer': <Droplets className="w-5 h-5" />,
      'ac': <Snowflake className="w-5 h-5" />,
      'heating': <Flame className="w-5 h-5" />,
      'workspace': <Monitor className="w-5 h-5" />,
      'pool': <PoolIcon className="w-5 h-5" />,
      'parking': <CarIcon className="w-5 h-5" />,
      'gym': <GymIcon className="w-5 h-5" />,
      'breakfast': <CoffeeIcon className="w-5 h-5" />,
      'smoke-alarm': <Bell className="w-5 h-5" />,
      'first-aid-kit': <Stethoscope className="w-5 h-5" />,
      'fire-extinguisher': <Flame className="w-5 h-5" />,
      'essentials': <Package className="w-5 h-5" />,
      'mountain-view': <ViewIcon className="w-5 h-5" />,
      'city-view': <Building2 className="w-5 h-5" />,
      'garden': <Trees className="w-5 h-5" />,
      'balcony': <Home className="w-5 h-5" />,
      'terrace': <Home className="w-5 h-5" />,
      'fireplace': <FireplaceIcon className="w-5 h-5" />,
      'pet-friendly': <PetIcon className="w-5 h-5" />,
      'smoking-allowed': <SmokingIcon className="w-5 h-5" />,
      'long-term-stays': <ClockIcon className="w-5 h-5" />
    };
    return iconMap[amenity] || <CheckCircle className="w-5 h-5" />;
  };

  const calculateTotalNights = () => {
    if (!dateRange.startDate || !dateRange.endDate || isNaN(dateRange.startDate.getTime()) || isNaN(dateRange.endDate.getTime())) return 0;
    return differenceInDays(dateRange.endDate, dateRange.startDate);
  };

  const calculateTotalPrice = () => {
    if (!property || !dateRange.startDate || !dateRange.endDate || isLoadingPlatformFee || platformFeeRate === null) {
      console.log('⏳ Waiting for platform fee rate to load...');
      return null;
    }
    
    const nights = calculateTotalNights();
    const basePrice = property?.pricing?.basePrice || 0;
    const extraGuestPrice = property?.pricing?.extraGuestPrice || 0;
    const cleaningFee = property?.pricing?.cleaningFee || 0;
    const serviceFee = property?.pricing?.serviceFee || 0;
    const securityDeposit = property?.pricing?.securityDeposit || 0;
    const extraGuests = guests > 1 ? guests - 1 : 0;
    
    // Calculate hourly extension cost using shared utility
    let hourlyExtensionCost = 0;
    if (hourlyExtension && property?.hourlyBooking?.enabled) {
      hourlyExtensionCost = calculateHourlyExtension(basePrice, hourlyExtension);
    }
    
    console.log(`💰 Calculating pricing with platform fee rate: ${(platformFeeRate * 100).toFixed(1)}%`);
    
    const pricing = calculatePricingBreakdown({
      basePrice,
      nights,
      extraGuestPrice,
      extraGuests,
      cleaningFee,
      serviceFee,
      securityDeposit,
      hourlyExtension: hourlyExtensionCost,
      currency: property?.pricing?.currency || 'INR',
      platformFeeRate: platformFeeRate
    });
    
    // Note: priceBreakdown state will be set in useEffect to avoid infinite re-renders
    
    return {
      ...pricing,
      // Legacy fields for backward compatibility
      subtotal: pricing.subtotal,
      total: pricing.totalAmount
    };
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Check if dates are selected
    if (!dateRange.startDate || !dateRange.endDate) {
      setAvailabilityError('Please select check-in and check-out dates');
      return;
    }

    // Update booking context with current selection
    updateBookingData({
      propertyId: id as string,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      guests: { adults: guests, children: 0, infants: 0 },
      hourlyExtension: hourlyExtension,
      specialRequests: specialRequests,
      pricing: {
        basePrice: property?.pricing?.basePrice || 0,
        cleaningFee: property?.pricing?.cleaningFee || 0,
        serviceFee: property?.pricing?.serviceFee || 0,
        securityDeposit: property?.pricing?.securityDeposit || 0,
        totalPrice: calculateTotalPrice().total || 0
      }
    });

    // Navigate to booking page with clean URL (only property ID)
    router.push(`/book/${id}`);
  };

  // Function to refresh availability after booking
  const refreshAvailability = async () => {
    try {
      setAvailabilityLoading(true);
      const response = await apiClient.getAvailability(id as string);
      
      if (response.success && response.data) {
        const availabilityData = response.data.availability || [];
        setAvailability(availabilityData);
        console.log('Availability refreshed after booking:', availabilityData);
      }
    } catch (error: any) {
      console.error('Failed to refresh availability:', error);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Guest selection handlers
  const handleGuestChange = (newGuestCount: number) => {
    if (newGuestCount >= 1 && newGuestCount <= (property?.maxGuests || 8)) {
      setGuests(newGuestCount);
      // Reset availability when guest count changes as it might affect pricing
      setAvailabilityChecked(false);
      setAvailabilityError('');
      setAvailability([]);
    }
  };

  const decreaseGuests = () => {
    if (guests > 1) {
      handleGuestChange(guests - 1);
    }
  };

  const increaseGuests = () => {
    if (guests < (property?.maxGuests || 8)) {
      handleGuestChange(guests + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-40 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
            <span className="text-xl text-gray-600">Loading property details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-40 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "This property doesn't exist or has been removed."}</p>
            <Button onClick={() => router.back()} className="bg-indigo-600 hover:bg-indigo-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const pricing = calculateTotalPrice();
  const nights = calculateTotalNights();
  
  // Check if current user is the host of this property (safe for unauthenticated users)
  const isOwnProperty = isAuthenticated && user && property?.host && (
    typeof property.host === 'string' 
      ? property.host === user.id || property.host === user._id
      : property.host._id?.toString() === user.id?.toString() || 
        property.host._id?.toString() === user._id?.toString() || 
        property.host.id === user.id || 
        property.host.id === user._id
  );


  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Main Content */}
      <main className="pt-40">
        {/* Image Gallery */}
        <div className="relative">
          <div className="grid grid-cols-4 gap-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main large image */}
            <div className="col-span-4 lg:col-span-2 row-span-2">
              <img
                src={property.images?.[selectedImage] || '/logo.png'}
                alt={property.title}
                className="w-full h-[400px] lg:h-[500px] object-cover rounded-2xl"
              />
            </div>
            {/* Smaller images */}
            {property.images?.slice(1, 5).map((img: string, index: number) => (
              <div key={index} className="col-span-2 lg:col-span-1">
                <img
                  src={img}
                  alt={property.title}
                  className="w-full h-[200px] lg:h-[245px] object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(index + 1)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 font-display">
                      {property.title}
                    </h1>
                    
                    {/* Your Property Badge */}
                    {isOwnProperty && (
                      <div className="mb-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 rounded-full text-indigo-700 font-semibold text-sm">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          Your Property
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{property.rating || 4.5}</span>
                        <span className="text-gray-500">({property.reviewCount || 0} reviews)</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{property.location?.city}, {property.location?.state}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isOwnProperty && (
                      <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        Your Property
                      </div>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Highlights */}
              <div className="mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-2xl">
                  <div className="text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="text-sm font-medium text-gray-900">Up to {property.maxGuests} guests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🛏️</div>
                    <div className="text-sm font-medium text-gray-900">{property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🛌</div>
                    <div className="text-sm font-medium text-gray-900">{property.beds} bed{property.beds > 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚿</div>
                    <div className="text-sm font-medium text-gray-900">{property.bathrooms} bathroom{property.bathrooms > 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>

              {/* Overview Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-display">About this place</h2>
              </div>
                    <div className="text-gray-700 leading-relaxed">
                      {showFullDescription ? (
                        <div>
                          <p className="whitespace-pre-line">{property.description}</p>
                          <button
                            onClick={() => setShowFullDescription(false)}
                            className="text-indigo-600 font-medium mt-2 hover:underline"
                          >
                            Show less
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="whitespace-pre-line">
                            {property.description?.length > 300 
                              ? `${property.description.substring(0, 300)}...`
                              : property.description
                            }
                          </p>
                          {property.description?.length > 300 && (
                            <button
                              onClick={() => setShowFullDescription(true)}
                              className="text-indigo-600 font-medium mt-2 hover:underline"
                            >
                              Show more
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

              {/* Amenities Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-display">What this place offers</h2>
                </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(showAllAmenities ? property.amenities : property.amenities?.slice(0, 8))?.map((amenity: string) => (
                        <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          {getAmenityIcon(amenity)}
                          <span className="text-gray-700 capitalize">{amenity.replace(/-/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                    {property.amenities?.length > 8 && (
                      <button
                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                        className="text-indigo-600 font-medium mt-4 hover:underline"
                      >
                        {showAllAmenities ? 'Show less' : `Show all ${property.amenities.length} amenities`}
                      </button>
                    )}
                  </div>

              {/* Reviews Section */}
              <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                      <h2 className="text-2xl font-bold text-gray-900 font-display">Reviews</h2>
                  </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{property.rating || 4.5}</span>
                        <span className="text-gray-500">({property.reviewCount || 0} reviews)</span>
                      </div>
                    </div>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">⭐</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                      <p className="text-gray-600">Be the first to review this property!</p>
                    </div>
                  </div>

              {/* Location Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-display">Location</h2>
                </div>
                    <div className="bg-gray-100 rounded-2xl p-6 mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <MapPin className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {property.location?.address}, {property.location?.city}, {property.location?.state}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {property.location?.city} is known for its vibrant culture, delicious food, and beautiful architecture.
                      </p>
                    </div>
                  </div>

              {/* Host Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-display">About the host</h2>
                </div>
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                          {property.host?.profileImage ? (
                            <img 
                              src={property.host.profileImage} 
                              alt={property.host.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users className="w-10 h-10 text-indigo-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Hosted by {property.host?.name || 'TripMe Host'}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {property.host?.rating || 4.5} • {property.host?.reviewCount || 0} reviews
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                        Member since {property.host?.createdAt ? (() => {
                          try {
                            const date = new Date(property.host.createdAt);
                            return isNaN(date.getTime()) ? '2024' : date.getFullYear();
                          } catch (error) {
                            console.warn('Error parsing host creation date:', property.host.createdAt, error);
                            return '2024';
                          }
                        })() : '2024'}
                          </p>
                          {property.host?.bio && (
                            <p className="text-gray-700 text-sm leading-relaxed mb-4">
                              {property.host.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Host Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {property.host?.location?.city && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <MapPin className="w-5 h-5 text-gray-500" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">Location</div>
                              <div className="text-sm text-gray-600">
                                {property.host.location.city}, {property.host.location.state}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {property.host?.languages && property.host.languages.length > 0 && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <Globe className="w-5 h-5 text-gray-500" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">Languages</div>
                              <div className="text-sm text-gray-600">
                                {property.host.languages.join(', ')}
                              </div>
                            </div>
                          </div>
                        )}

                        {property.host?.phone && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">Phone</div>
                              <div className="text-sm text-gray-600">{property.host.phone}</div>
                            </div>
                          </div>
                        )}

                        {property.host?.email && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">Email</div>
                              <div className="text-sm text-gray-600">{property.host.email}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contact Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          Contact host
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          <Phone className="w-4 h-4" />
                          Call host
                        </button>
                      </div>
                    </div>
              </div>

              {/* House Rules */}
              {property.houseRules?.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">House rules</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.houseRules.map((rule: string) => (
                      <div key={rule} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <Shield className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700 capitalize">{rule.replace(/-/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div ref={bookingCardRef} className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(property.pricing?.basePrice || 0, property.pricing?.currency || 'INR')}
                      </span>
                      <span className="text-gray-600">night</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{property.rating || 4.5}</span>
                      <span>•</span>
                      <span>{property.reviewCount || 0} reviews</span>
                    </div>
                  </div>


                  {/* Date Selection */}
                  {!isOwnProperty && (
                    <div className="mb-4 relative">
                      <div className="grid grid-cols-2 gap-2">
                        <div 
                          className={`border rounded-lg p-3 cursor-pointer transition-all duration-300 ${
                            selectionStep === 'checkin' 
                              ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                              : availabilityError && availabilityError.includes('Check-in')
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => {
                            setShowDatePicker(true);
                            setSelectionStep('checkin');
                          }}
                        >
                          <div className={`text-xs font-medium mb-1 ${
                            selectionStep === 'checkin' ? 'text-indigo-700' : 'text-gray-700'
                          }`}>
                            {selectionStep === 'checkin' ? '🔄 Selecting Check-in' : 'Check-in'}
                          </div>
                          <div className={`text-sm ${
                            selectionStep === 'checkin' ? 'text-indigo-900' : 'text-gray-900'
                          }`}>
                            {formatDate(dateRange.startDate)}
                          </div>
                        </div>
                        <div 
                          className={`border rounded-lg p-3 cursor-pointer transition-all duration-300 ${
                            selectionStep === 'checkout' 
                              ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                              : availabilityError && availabilityError.includes('Check-out')
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => {
                            setShowDatePicker(true);
                            setSelectionStep('checkout');
                          }}
                        >
                          <div className={`text-xs font-medium mb-1 ${
                            selectionStep === 'checkout' ? 'text-indigo-700' : 'text-gray-700'
                          }`}>
                            {selectionStep === 'checkout' ? '🔄 Selecting Check-out' : 'Check-out'}
                          </div>
                          <div className={`text-sm ${
                            selectionStep === 'checkout' ? 'text-indigo-900' : 'text-gray-900'
                          }`}>
                            {dateRange.endDate ? formatDate(dateRange.endDate) : 'Select date'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Date validation error display */}
                      {availabilityError && (
                        <div className="mt-2 text-sm text-red-600">
                          {availabilityError}
                        </div>
                      )}

                      {/* Property requirements info */}
                      <div className="mt-3 text-xs text-gray-500 space-y-1">
                        {property?.minNights && property.minNights > 1 && (
                          <div>• Minimum stay: {property.minNights} nights</div>
                        )}
                        <div>• Check-in: {property?.checkInTime || '15:00'}</div>
                        <div>• Check-out: {property?.checkOutTime || '11:00'}</div>
                      </div>
                    
                      {/* Fresh Working Calendar */}
                      {showDatePicker && (
                        <div 
                          ref={datePickerRef}
                          className="absolute top-full left-0 right-0 z-50 mt-3 bg-white rounded-xl shadow-xl border border-gray-200 p-4"
                        >
                          <div className="w-full max-w-sm mx-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                              <button
                                onClick={() => {
                                  const newMonth = new Date(currentMonth);
                                  newMonth.setMonth(newMonth.getMonth() - 1);
                                  setCurrentMonth(newMonth);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              
                              <h3 className="text-lg font-semibold text-gray-900">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </h3>
                              
                              <button
                                onClick={() => {
                                  const newMonth = new Date(currentMonth);
                                  newMonth.setMonth(newMonth.getMonth() + 1);
                                  setCurrentMonth(newMonth);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>

                            {/* Step Indicator */}
                            <div className="text-center mb-4 text-sm">
                              {selectionStep === 'checkin' && (
                                <span className="text-blue-600 font-medium">Select Check-in Date</span>
                              )}
                              {selectionStep === 'checkout' && (
                                <span className="text-blue-600 font-medium">Select Check-out Date</span>
                              )}
                              {selectionStep === 'complete' && (
                                <span className="text-green-600 font-medium">Dates Selected!</span>
                              )}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                              {/* Day Headers */}
                              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                                  {day}
                                </div>
                              ))}

                              {/* Calendar Days */}
                              {(() => {
                                const year = currentMonth.getFullYear();
                                const month = currentMonth.getMonth();
                                const firstDay = new Date(year, month, 1);
                                const lastDay = new Date(year, month + 1, 0);
                                const startDate = new Date(firstDay);
                                startDate.setDate(startDate.getDate() - firstDay.getDay());
                                
                                const days = [];
                                
                                // Generate all days for the calendar grid (6 weeks x 7 days = 42)
                                for (let i = 0; i < 42; i++) {
                                  const date = new Date(startDate);
                                  date.setDate(startDate.getDate() + i);
                                  
                                  const isCurrentMonth = date.getMonth() === month;
                                  const isToday = date.toDateString() === new Date().toDateString();
                                  const isPast = date < new Date();
                                  
                                  const isStartDate = dateRange.startDate && 
                                    dateRange.startDate.toDateString() === date.toDateString();
                                  const isEndDate = dateRange.endDate && 
                                    dateRange.endDate.toDateString() === date.toDateString();
                                  const isInRange = dateRange.startDate && dateRange.endDate &&
                                    date > dateRange.startDate && date < dateRange.endDate;
                                  
                                  const isSelectable = isCurrentMonth && !isPast;
                                  
                                  let className = 'text-center py-2 text-sm rounded-lg transition-colors ';
                                  
                                  if (!isCurrentMonth) {
                                    className += 'text-gray-300';
                                  } else if (!isSelectable) {
                                    className += 'text-gray-400 bg-gray-100';
                                  } else if (isStartDate || isEndDate) {
                                    className += 'bg-blue-600 text-white font-semibold';
                                  } else if (isInRange) {
                                    className += 'bg-blue-200 text-blue-800';
                                  } else if (isToday) {
                                    className += 'bg-blue-100 text-blue-800 font-medium';
                                  } else {
                                    className += 'hover:bg-gray-100 cursor-pointer';
                                  }
                                  
                                  days.push(
                                    <div
                                      key={date.getTime()}
                                      className={className}
                                      onClick={() => {
                                        if (!isSelectable) return;
                                        
                                        console.log('Date clicked:', date.toDateString());
                                        console.log('Current selectionStep:', selectionStep);
                                        
                                        if (selectionStep === 'checkin') {
                                          // Select check-in date
                                          console.log('Setting check-in date:', date.toDateString());
                                          setDateRange({
                                            ...dateRange,
                                            startDate: new Date(date),
                                            endDate: null,
                                            key: 'selection'
                                          });
                                          setSelectionStep('checkout');
                                        } else if (selectionStep === 'checkout') {
                                          // Select check-out date
                                          if (date > dateRange.startDate) {
                                            console.log('Setting check-out date:', date.toDateString());
                                            setDateRange({
                                              ...dateRange,
                                              endDate: new Date(date),
                                              key: 'selection'
                                            });
                                            setSelectionStep('complete');
                                            setTimeout(() => setShowDatePicker(false), 300);
                                          } else if (date < dateRange.startDate) {
                                            // New date is before start date, make it new start date
                                            console.log('New date before start, making it new start date');
                                            setDateRange({
                                              startDate: new Date(date),
                                              endDate: null,
                                              key: 'selection'
                                            });
                                            setSelectionStep('checkin');
                                          }
                                        } else {
                                          // Both dates selected, start over
                                          console.log('Starting over with new check-in date');
                                          setDateRange({
                                            startDate: new Date(date),
                                            endDate: null,
                                            key: 'selection'
                                          });
                                          setSelectionStep('checkin');
                                        }
                                      }}
                                    >
                                      {date.getDate()}
                                    </div>
                                  );
                                }
                                
                                return days;
                              })()}
                            </div>

                            {/* Reset Button */}
                            <div className="mt-4 text-center">
                              <button
                                onClick={() => {
                                  const today = new Date();
                                  const tomorrow = new Date();
                                  tomorrow.setDate(tomorrow.getDate() + 1);
                                  
                                  setDateRange({
                                    startDate: today,
                                    endDate: tomorrow,
                                    key: 'selection'
                                  });
                                  setSelectionStep('checkin');
                                  setAvailabilityChecked(false);
                                  setAvailabilityError('');
                                  setAvailability([]);
                                }}
                                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Reset to Today & Tomorrow
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    
                      {/* Check Availability Button */}
                      <div className="mt-4">
                        <Button
                          onClick={checkAvailability}
                          disabled={availabilityLoading || selectionStep !== 'complete' || !!availabilityError}
                          className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 ${
                            availabilityLoading || selectionStep !== 'complete' || !!availabilityError
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                          }`}
                        >
                          {availabilityLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Checking Availability...
                            </>
                          ) : selectionStep !== 'complete' ? (
                            selectionStep === 'checkin' ? 'Select Check-in Date' : 'Select Check-out Date'
                          ) : availabilityError ? (
                            'Dates unavailable'
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Check Availability
                            </>
                          )}
                        </Button>
                      
                        {/* Availability Status */}
                        {availabilityChecked && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Available! {nights} night{nights > 1 ? 's' : ''} • {formatPrice(pricing.total)}</span>
                            </div>
                          </div>
                        )}
                      
                        {availabilityError && !availabilityError.includes('Check-in') && !availabilityError.includes('Check-out') && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-700">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Dates not available</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Guest Selection */}
                  {!isOwnProperty && (
                    <div className="mb-6">
                      <div
                        className="border border-gray-300 rounded-lg p-3 cursor-pointer hover:border-gray-400 transition-colors"
                        onClick={() => setShowGuestPicker(true)}
                      >
                        <div className="text-xs font-medium text-gray-700 mb-1">Guests</div>
                        <div className="text-sm text-gray-900">
                          {guests} guest{guests > 1 ? 's' : ''}
                        </div>
                      </div>
                      {/* Guest Picker Modal */}
                      {showGuestPicker &&
                        createPortal(
                          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                            <div
                              ref={guestPickerRef}
                              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Number of guests</h3>
                                <button
                                  onClick={() => setShowGuestPicker(false)}
                                  className="p-1 hover:bg-gray-100 rounded-full"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between py-4">
                                <span className="text-lg font-medium">Guests</span>
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={decreaseGuests}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="text-lg font-medium w-8 text-center">{guests}</span>
                                  <button
                                    onClick={increaseGuests}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex justify-end mt-4">
                                <button
                                  onClick={() => setShowGuestPicker(false)}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          </div>,
                          document.body
                        )}
                    </div>
                  )}

                  {/* Hourly Booking Extension - Modern Design */}
                  {!isOwnProperty && property?.hourlyBooking?.enabled && nights >= (property?.hourlyBooking?.minStayDays || 1) && (
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Extend Your Stay</h3>
                            <p className="text-sm text-gray-600">Add extra hours at a discounted rate</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { hours: 6, rate: property.hourlyBooking.sixHours || 0.3, label: '6 Hours', icon: '⏰' },
                            { hours: 12, rate: property.hourlyBooking.twelveHours || 0.6, label: '12 Hours', icon: '🕐' },
                            { hours: 18, rate: property.hourlyBooking.eighteenHours || 0.75, label: '18 Hours', icon: '🕕' }
                          ].map((option) => (
                            <div
                              key={option.hours}
                              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                hourlyExtension === option.hours
                                  ? 'border-purple-500 bg-purple-100 shadow-lg scale-105'
                                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                              }`}
                              onClick={() => setHourlyExtension(hourlyExtension === option.hours ? null : option.hours)}
                            >
                              <div className="text-center">
                                <div className="text-2xl mb-2">{option.icon}</div>
                                <div className="font-bold text-gray-900 text-sm">{option.label}</div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {Math.round(option.rate * 100)}% of daily rate
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {hourlyExtension && (
                          <div className="mt-4 p-4 bg-white rounded-xl border border-purple-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-gray-900">{hourlyExtension} hours selected</div>
                                <div className="text-sm text-gray-600">
                                  New checkout: {(() => {
                                    if (!dateRange.endDate) return 'Select dates first';
                                    const [hours, minutes] = (property?.checkOutTime || '11:00').split(':').map(Number);
                                    const baseCheckout = new Date(dateRange.endDate);
                                    baseCheckout.setHours(hours, minutes, 0, 0);
                                    const newCheckout = new Date(baseCheckout);
                                    newCheckout.setHours(newCheckout.getHours() + hourlyExtension);
                                    return newCheckout.toLocaleTimeString('en-US', { 
                                      hour: 'numeric', 
                                      minute: '2-digit',
                                      hour12: true 
                                    });
                                  })()}
                                </div>
                              </div>
                              <button
                                onClick={() => setHourlyExtension(null)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                              >
                                <X className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                          </div>
                        )}

                  {/* Pricing Breakdown - Modern Design */}
                  {!isOwnProperty && nights > 0 && (
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-white" />
                        </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Price Breakdown</h3>
                            <p className="text-sm text-gray-600">{nights} night{nights > 1 ? 's' : ''} stay</p>
                          </div>
                        </div>
                        
                        <PricingBreakdown
                          pricing={priceBreakdown}
                          showPlatformFees={true}
                          variant="customer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Special Requests - Modern Design */}
                  {!isOwnProperty && (
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Special Requests</h3>
                            <p className="text-sm text-gray-600">Let us know your preferences</p>
                          </div>
                        </div>
                      <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any special requests or requirements..."
                          className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                        rows={3}
                        maxLength={500}
                      />
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-gray-500">
                            We'll do our best to accommodate your requests
                          </div>
                          <div className="text-xs text-gray-500">
                        {specialRequests.length}/500
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Booking Button - Modern Design */}
                  {isOwnProperty ? (
                    <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">This is your property</h3>
                      <p className="text-gray-600 mb-6">
                        You cannot book your own property. This is a preview of how guests see your listing.
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={() => router.push(`/host/property/${id}/edit`)}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Edit Property
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                    <Button 
                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform ${
                        availabilityChecked && nights > 0
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white hover:shadow-2xl hover:scale-105' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={handleBooking}
                      disabled={bookingLoading || !availabilityChecked || nights === 0}
                    >
                      {bookingLoading ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Processing...</span>
                        </div>
                      ) : !availabilityChecked ? (
                          <div className="flex items-center justify-center gap-3">
                            <CheckCircle className="w-6 h-6" />
                            <span>Check Availability First</span>
                          </div>
                      ) : nights === 0 ? (
                          <div className="flex items-center justify-center gap-3">
                            <Calendar className="w-6 h-6" />
                            <span>Select Valid Dates</span>
                          </div>
                      ) : (
                          <div className="flex items-center justify-center gap-3">
                            <Zap className="w-6 h-6" />
                            <span>Continue to Book • {nights} night{nights > 1 ? 's' : ''}</span>
                          </div>
                      )}
                    </Button>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4" />
                          You won't be charged yet
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {!isOwnProperty && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">You won't be charged yet</p>
                    </div>
                  )}

                  {/* Cancellation Policy */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {property.cancellationPolicy || 'Moderate'} cancellation policy
                      </span>
                      <span className="text-sm text-indigo-600 underline cursor-pointer">Learn more</span>
                    </div>
                  </div>

                  {/* Check-in/Check-out Times */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-900 mb-1">Check-in</div>
                        <div className="text-gray-600">{property.checkInTime || '15:00'}</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 mb-1">Check-out</div>
                        <div className="text-gray-600">{property.checkOutTime || '11:00'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}