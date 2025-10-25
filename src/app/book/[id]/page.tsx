"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { apiClient } from "@/infrastructure/api/clients/api-client";
import { useAuth } from "@/core/store/auth-context";
import { useBooking } from "@/core/store/booking-context";
import { User as UserType } from "@/shared/types";
import { securePricingAPI } from "@/infrastructure/api/securePricing-api";
import { formatCurrency } from "@/shared/constants/pricing.constants";
import PricingBreakdown from "@/components/booking/PricingBreakdown";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import Button from "@/components/ui/Button";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
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
  CheckCircle,
  Clock,
  PawPrint,
  Cigarette,
  CalendarDays,
  CreditCard,
  Lock,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  Zap,
  Receipt,
  Clock3,
  AlertTriangle,
  User,
  Gift,
  Info,
  MessageCircle
} from "lucide-react";

// Payment Modal Component
const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  loading: boolean;
}> = ({ isOpen, onClose, onSuccess, amount, loading }) => {
  const [paymentStep, setPaymentStep] = useState<'card' | 'processing' | 'success'>('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handlePayment = async () => {
    setPaymentStep('processing');
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
                <p className="text-sm text-gray-600">Secure payment via Stripe</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentStep === 'card' && (
            <div className="space-y-6">
              {/* Amount Display */}
              <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(amount)}</p>
              </div>

              {/* Card Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-lg font-mono"
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  />
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Lock className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-600">Your payment is secured with SSL encryption</p>
              </div>

              {/* Pay Button */}
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Pay {formatPrice(amount)}
              </Button>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment securely...</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your booking has been confirmed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { id } = params;
  const { user, isAuthenticated, isLoading } = useAuth();
  const { bookingData: contextBookingData, updateLocalBookingData: updateContextBookingData, clearBookingData } = useBooking();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<any[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [blockingTimer, setBlockingTimer] = useState<NodeJS.Timeout | null>(null);
  const [blockingExpiry, setBlockingExpiry] = useState<Date | null>(null);
  // Platform fee rate is now handled by backend API

  
  // Booking state - initialize from context or defaults
  const [bookingData, setBookingData] = useState(() => {
    if (contextBookingData && contextBookingData.propertyId === id) {
      return {
        checkIn: contextBookingData.startDate ? new Date(contextBookingData.startDate) : new Date(),
        checkOut: contextBookingData.endDate ? new Date(contextBookingData.endDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        guests: contextBookingData.guests || { adults: 1, children: 0, infants: 0 },
        specialRequests: contextBookingData.specialRequests || '',
        contactInfo: {
          name: user?.name || '',
          phone: user?.phone || '',
          email: user?.email || ''
        },
        paymentMethod: 'card',
        couponCode: '',
        hourlyExtension: contextBookingData.hourlyExtension,
        is24Hour: contextBookingData.is24Hour || false,
        checkInDateTime: contextBookingData.checkInDateTime,
        extensionHours: contextBookingData.extensionHours,
        agreeToTerms: false
      };
    }
    
    // Fallback to defaults if no context data
    return {
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000),
      guests: { adults: 1, children: 0, infants: 0 },
      specialRequests: '',
    contactInfo: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || ''
    },
    paymentMethod: 'card',
    couponCode: '',
    hourlyExtension: 0,
    is24Hour: false,
    checkInDateTime: null,
    extensionHours: 0,
    agreeToTerms: false
    };
  });
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Debug logging for booking data changes
  useEffect(() => {
    console.log('📊 Booking data updated:', {
      agreeToTerms: bookingData.agreeToTerms,
      contactInfo: bookingData.contactInfo,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      hourlyExtension: bookingData.hourlyExtension
    });
  }, [bookingData]);

  // Redirect to property page if no booking data
  useEffect(() => {
    if (!contextBookingData || contextBookingData.propertyId !== id) {
      router.push(`/rooms/${id}`);
    }
  }, [contextBookingData, id, router]);
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
  
  
  // Redirect unauthenticated users to login
  useEffect(() => {
    // Don't redirect while still loading authentication
    if (isLoading) {
      return;
    }
    
    // If not authenticated and not loading, redirect to login
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/book/${id}`);
      return;
    } else {
      // Clear any auth errors when user becomes authenticated
      setBookingError('');
    }
  }, [isAuthenticated, isLoading, router, id]);

  // Clear auth error when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && user?._id) {
      setBookingError('');
    }
  }, [isAuthenticated, isLoading, user?._id]);



  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.getListing(id as string)
      .then((res: any) => {
        setProperty(res.data?.listing || null);
        setError("");
      })
      .catch(() => setError("Property not found"))
      .finally(() => setLoading(false));
  }, [id]);

  // Platform fee rate is now handled by backend API

  // Initial availability fetch
  useEffect(() => {
    if (!id) return;
    refreshAvailabilityData();
  }, [id]);

  // Note: Pricing calculation is now handled by the calculatePrice function in a separate useEffect

  // Add beforeunload event listener as backup for cleanup
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (blockedDates.length > 0 && user?._id) {
        console.log('🔄 beforeunload event - releasing blocked dates:', blockedDates);
        // Use sendBeacon for reliable cleanup on page unload
        const payload = {
          dates: blockedDates
        };
        
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/availability/${id}/release-dates`;
        navigator.sendBeacon(url, JSON.stringify(payload));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [blockedDates, id, user?._id]);

  // Check availability when user arrives on booking page (but don't block dates yet)
  useEffect(() => {
    console.log('🔍 Availability check useEffect triggered');
    console.log('🔍 Current state:', {
      id,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      isAuthenticated,
      user: getUserId(user),
      isLoading,
      userObject: user
    });
    
    if (!id || !bookingData.checkIn || !bookingData.checkOut) {
      console.log('❌ Missing required data for availability check:', { id, checkIn: bookingData.checkIn, checkOut: bookingData.checkOut });
      return;
    }
    
    // Don't proceed if still loading authentication
    if (isLoading) {
      console.log('⏳ Still loading authentication, waiting...');
      return;
    }
    
    // Check if user is authenticated AND user object exists
    if (!isAuthenticated || !user || !getUserId(user)) {
      setBookingError('Please log in to continue with your booking.');
      return;
    }
    
    // Clear any auth errors since user is authenticated
    if (bookingError === 'Please log in to continue with your booking.') {
      setBookingError('');
    }
    
    // Just check availability, don't block dates yet
    checkAvailability();
  }, [id, bookingData.checkIn, bookingData.checkOut, isAuthenticated, user?._id, isLoading]);

  // Update timer display every minute
  useEffect(() => {
    if (!blockingExpiry) return;
    
    const timerInterval = setInterval(() => {
      const timeLeft = blockingExpiry.getTime() - Date.now();
      if (timeLeft <= 0) {
        // Timer expired, revert dates
        revertBlockedDates();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(timerInterval);
  }, [blockingExpiry]);

  // Real-time timer update for better UX
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    if (!blockingExpiry) return;
    
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000); // Update every second
    
    return () => clearInterval(timeInterval);
  }, [blockingExpiry]);

  // Revert blocked dates back to available
  const revertBlockedDates = async () => {
    if (!id || blockedDates.length === 0) return;
    
    console.log('Starting to revert blocked dates...');
    console.log('Dates to revert:', blockedDates);
    
    try {
      // Release all dates at once using the new endpoint
      const response = await apiClient.releaseDates(id as string, blockedDates);
      console.log('Successfully released all dates:', response);
      
      console.log('All dates reverted successfully');
      setBlockedDates([]);
      setBlockingExpiry(null);
      if (blockingTimer) {
        clearTimeout(blockingTimer);
        setBlockingTimer(null);
      }
      
      setBookingError('Your date reservation has expired. Please select new dates.');
    } catch (error) {
      console.error('Failed to revert blocked dates:', error);
    }
  };

  // Synchronous function to release dates when component unmounts
  const releaseDatesOnUnmount = (datesToRelease: string[]) => {
    if (!id || datesToRelease.length === 0 || !user?._id) return;
    
    console.log('🔄 Releasing dates on unmount:', datesToRelease);
    
    // Use a synchronous approach to avoid async issues in cleanup
    // We'll use the browser's beforeunload event as a backup
    try {
      // Make the API call synchronously using XMLHttpRequest
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/availability/${id}/release-dates`, false); // false = synchronous
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      
      const payload = {
        dates: datesToRelease
      };
      
      xhr.send(JSON.stringify(payload));
      
      if (xhr.status === 200) {
        console.log('✅ Dates released successfully on unmount');
      } else {
        console.error('❌ Failed to release dates on unmount:', xhr.status, xhr.responseText);
      }
    } catch (error) {
      console.error('❌ Error releasing dates on unmount:', error);
    }
  };

  // Refresh availability data from backend
  const refreshAvailabilityData = async () => {
    if (!id) return;
    
    try {
      console.log('Calling getAvailability for property:', id);
      const response = await apiClient.getAvailability(id as string);
      console.log('getAvailability response:', response);
      
      if (response.success && response.data) {
        setAvailability(response.data.availability || []);
        console.log('Availability data refreshed:', response.data.availability);
        console.log('Current blocked dates state:', blockedDates);
      }
    } catch (error) {
      console.error('Failed to refresh availability:', error);
    }
  };

  // Helper function to get user ID consistently
  const getUserId = (user: UserType | null): string | undefined => {
    return user?.id || user?._id;
  };

  // Manual trigger for date blocking (for debugging)
  const manualTriggerDateBlocking = () => {
    console.log('🔧 Manual trigger for date blocking called');
    console.log('🔧 Current state:', {
      id,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      isAuthenticated,
      user: getUserId(user),
      isLoading,
      userObject: user
    });
    
    if (!id || !bookingData.checkIn || !bookingData.checkOut) {
      console.log('❌ Cannot manually trigger - missing required data');
      return;
    }
    
    if (!isAuthenticated || !user || !getUserId(user)) {
      console.log('❌ Cannot manually trigger - user not authenticated or user object missing');
      console.log('❌ isAuthenticated:', isAuthenticated);
      console.log('❌ user object:', user);
      console.log('❌ user ID:', getUserId(user));
      return;
    }
    
    console.log('✅ Manual trigger conditions met, proceeding with date blocking...');
    // Force the useEffect to run by updating a dependency
    setAvailabilityLoading(prev => !prev);
  };

  // Check availability for selected dates
  const checkAvailability = async () => {
    if (!id || !bookingData.checkIn || !bookingData.checkOut) return false;
    
    setAvailabilityLoading(true);
    try {
      const response = await apiClient.getAvailability(id as string);
      if (response.success && response.data) {
        setAvailability(response.data.availability || []);
        
        console.log('Availability data received:', response.data.availability);
        const checkInDate = bookingData.checkIn instanceof Date ? bookingData.checkIn : new Date(bookingData.checkIn);
        const checkOutDate = bookingData.checkOut instanceof Date ? bookingData.checkOut : new Date(bookingData.checkOut);
        console.log('Checking availability for dates:', checkInDate.toLocaleDateString('en-CA'), 'to', checkOutDate.toLocaleDateString('en-CA'));
        
        // Check if all selected dates are available
        const startDate = new Date(bookingData.checkIn);
        const endDate = new Date(bookingData.checkOut);
        const currentDate = new Date(startDate);
        
        while (currentDate < endDate) {
          const dateStr = currentDate.toLocaleDateString('en-CA');
          
          // Find availability record for this date
          const dateAvailability = response.data.availability.find((a: any) => {
            // Handle both string dates and Date objects
            let availabilityDateStr: string;
            if (typeof a.date === 'string') {
              // Parse the date string and convert to local date string
              const parsedDate = new Date(a.date);
              availabilityDateStr = parsedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            } else if (a.date instanceof Date) {
              availabilityDateStr = a.date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            } else {
              const parsedDate = new Date(a.date);
              availabilityDateStr = parsedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
            }
            
            return availabilityDateStr === dateStr;
          });
          
          // Check availability status
          if (dateAvailability) {
            // Date exists in Availability model - check its status
            console.log(`Date ${dateStr} found in availability model, status: ${dateAvailability.status}`);
            
            if (dateAvailability.status === 'booked') {
              console.log(`Date ${dateStr} is booked and not available`);
              setBookingError(`Date ${dateStr} is already booked`);
              setAvailabilityLoading(false);
              return false;
            } else if (dateAvailability.status === 'maintenance') {
              console.log(`Date ${dateStr} is under maintenance`);
              setBookingError(`Date ${dateStr} is under maintenance`);
              setAvailabilityLoading(false);
              return false;
            } else if (dateAvailability.status === 'blocked') {
              // Check if this date is blocked by current user (allowed) or by someone else (not allowed)
              if (blockedDates.includes(dateStr)) {
                console.log(`Date ${dateStr} is blocked by current user - allowed`);
              } else {
                console.log(`Date ${dateStr} is blocked by another user - not available`);
                setBookingError(`Date ${dateStr} is not available for booking`);
                setAvailabilityLoading(false);
                return false;
              }
            } else if (dateAvailability.status === 'available') {
              console.log(`Date ${dateStr} is available for booking`);
            }
          } else {
            // Date doesn't exist in Availability model - it's NOT available
            console.log(`Date ${dateStr} not found in availability model - NOT available for booking`);
            setBookingError(`Date ${dateStr} is not available for booking`);
            setAvailabilityLoading(false);
            return false;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log('All dates are available for booking!');
        setBookingError('');
        setAvailabilityLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Availability check error:', error);
      setBookingError('Failed to check availability');
      setAvailabilityLoading(false);
      return false;
    }
    
    setAvailabilityLoading(false);
    return false;
  };

  // Validate coupon code
  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponError('');
      setCouponData(null);
      return;
    }

    if (!property) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await apiClient.post('/coupons/validate', {
        couponCode: code,
        propertyId: property._id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests
      });

      if (response.success && response.data) {
        const coupon = response.data.coupon;
        setCouponData({
          code: coupon.code,
          discountAmount: coupon.discountAmount,
          discountType: coupon.discountType,
          description: coupon.description
        });
        setCouponError('');
        console.log('✅ Coupon validated successfully:', coupon);
      } else {
        setCouponError(response.message || 'Invalid coupon code');
        setCouponData(null);
      }
    } catch (error: any) {
      console.error('❌ Error validating coupon:', error);
      setCouponError(error.message || 'Failed to validate coupon');
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Get price breakdown from secure backend
  const getSecurePricing = async () => {
    if (!property || !bookingData.checkIn || !bookingData.checkOut) {
      console.log('⏳ Waiting for required data to load...');
      return;
    }
    
    try {
      console.log('🔒 Calculating secure pricing via backend API...');
      
      // Use secure pricing API - all calculations happen on backend
      const pricingRequest = {
        propertyId: property._id,
        checkIn: bookingData.checkIn instanceof Date ? bookingData.checkIn.toLocaleDateString('en-CA') : bookingData.checkIn,
        checkOut: bookingData.checkOut instanceof Date ? bookingData.checkOut.toLocaleDateString('en-CA') : bookingData.checkOut,
        guests: bookingData.guests,
        hourlyExtension: bookingData.hourlyExtension || 0,
        couponCode: couponData?.code,
        bookingType: bookingData.is24Hour ? '24hour' : 'daily',
        checkInDateTime: bookingData.checkInDateTime ? (bookingData.checkInDateTime instanceof Date ? bookingData.checkInDateTime.toISOString() : bookingData.checkInDateTime) : undefined,
        extensionHours: bookingData.extensionHours
      };

      // Validate request before sending
      const validation = securePricingAPI.validatePricingRequest(pricingRequest);
      if (!validation.isValid) {
        console.error('❌ Invalid pricing request:', validation.errors);
        return;
      }
      
      const response = await securePricingAPI.calculatePricing(pricingRequest);
      
      if (!response.success) {
        console.error('❌ Secure pricing calculation failed:', response);
        return;
      }
      
      const pricing = response.data.pricing;
      console.log('✅ Secure pricing calculated successfully:', {
        nights: pricing.nights,
        totalAmount: pricing.totalAmount,
        token: response.data.security.pricingToken.substring(0, 8) + '...'
      });
      
      const newPriceBreakdown = {
        basePrice: property.pricing?.basePrice || 0,
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
        hostSubtotal: pricing.hostSubtotal,
        discountAmount: pricing.discountAmount,
        // Security token for validation
        pricingToken: response.data.security.pricingToken
      };
      
      console.log('✅ Secure price breakdown calculated:', newPriceBreakdown);
      setPriceBreakdown(newPriceBreakdown);
    } catch (error) {
      console.error('❌ Error calculating secure pricing:', error);
    }
  };

  // Helper function to ensure dates are Date objects
  const ensureDateObject = (date: any): Date => {
    if (date instanceof Date) {
      return date;
    }
    if (typeof date === 'string' || typeof date === 'number') {
      return new Date(date);
    }
    return new Date();
  };

  // Update local booking data and recalculate price
  const updateLocalBookingData = (updates: any) => {
    // Ensure dates are Date objects when updating
    if (updates.checkIn) {
      updates.checkIn = ensureDateObject(updates.checkIn);
    }
    if (updates.checkOut) {
      updates.checkOut = ensureDateObject(updates.checkOut);
    }
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  // Validate form and scroll to first error
  const validateForm = () => {
    const errors: {[key: string]: boolean} = {};
    let firstErrorElement: HTMLElement | null = null;

    // Check contact information
    if (!bookingData.contactInfo.name) {
      errors.contactName = true;
      if (!firstErrorElement) firstErrorElement = document.getElementById('contact-name');
    }
    if (!bookingData.contactInfo.email) {
      errors.contactEmail = true;
      if (!firstErrorElement) firstErrorElement = document.getElementById('contact-email');
    }
    if (!bookingData.contactInfo.phone) {
      errors.contactPhone = true;
      if (!firstErrorElement) firstErrorElement = document.getElementById('contact-phone');
    }

    // Check terms agreement
    if (!bookingData.agreeToTerms) {
      errors.agreeToTerms = true;
      if (!firstErrorElement) firstErrorElement = document.getElementById('agree-terms');
    }

    setValidationErrors(errors);

    // Scroll to first error
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      firstErrorElement.focus();
    }

    return Object.keys(errors).length === 0;
  };

  // Block dates for payment (called when user initiates payment)
  const blockDatesForPayment = async () => {
    try {
      setAvailabilityLoading(true);
      
      // Block all dates in the selected range
      const startDate = new Date(bookingData.checkIn);
      const endDate = new Date(bookingData.checkOut);
      const currentDate = new Date(startDate);
      const datesToBlock: string[] = [];
      
      while (currentDate < endDate) {
        const dateStr = currentDate.toLocaleDateString('en-CA');
        datesToBlock.push(dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log('🔒 Blocking dates for payment:', datesToBlock);
      
      try {
        // Block all dates at once using the new endpoint
        const response = await apiClient.blockDatesForBooking(id as string, datesToBlock);
        console.log('✅ Dates blocked successfully:', response);
      } catch (error) {
        console.error('❌ Error blocking dates:', error);
        throw error;
      }
      
      setBlockedDates(datesToBlock);
      
      // Refresh availability data to show blocked status
      await refreshAvailabilityData();
      
      // Start 15-minute timer
      const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      setBlockingExpiry(expiryTime);
      
      const timer = setTimeout(() => {
        // Timer expired, revert dates to available
        console.log('⏰ Payment timer expired, reverting blocked dates');
        revertBlockedDates();
      }, 15 * 60 * 1000);
      
      setBlockingTimer(timer);
      
      console.log('✅ Dates blocked successfully for payment');
      
    } catch (error) {
      console.error('❌ Error blocking dates for payment:', error);
      setBookingError('Failed to reserve dates. Please try again.');
      throw error;
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Handle booking submission
  const handleBooking = async () => {
    console.log('🚀 ===========================================');
    console.log('🚀 HANDLE BOOKING FUNCTION CALLED');
    console.log('🚀 ===========================================');
    console.log('🚀 isAuthenticated:', isAuthenticated);
    console.log('🚀 user:', user);
    console.log('🚀 bookingData:', bookingData);
    console.log('🚀 agreeToTerms:', bookingData.agreeToTerms);
    console.log('🚀 bookingLoading:', bookingLoading);
    console.log('🚀 availabilityLoading:', availabilityLoading);
    console.log('🚀 property:', property);
    console.log('🚀 priceBreakdown:', priceBreakdown);
    console.log('🚀 validationErrors:', validationErrors);
    console.log('🚀 bookingError:', bookingError);
    console.log('🚀 ===========================================');
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }

    // Clear previous validation errors
    setValidationErrors({});
    setBookingError('');

    // Validate form and scroll to first error if any
    console.log('🔍 Starting form validation...');
    const validationResult = validateForm();
    console.log('🔍 Form validation result:', validationResult);
    
    if (!validationResult) {
      console.log('❌ Form validation failed');
      console.log('❌ Current validation errors:', validationErrors);
      setBookingError('Please fill in all required fields');
      return;
    }

    console.log('✅ All validations passed, checking availability...');

    // Check availability before proceeding
    console.log('🔍 Starting availability check...');
    const isAvailable = await checkAvailability();
    console.log('📅 Availability check result:', isAvailable);
    
    if (!isAvailable) {
      console.log('❌ Dates not available');
      console.log('❌ Current booking error:', bookingError);
      return;
    }

    console.log('✅ All checks passed, blocking dates and showing payment modal');
    
    try {
      // Block dates now that user is initiating payment
      await blockDatesForPayment();
    setShowPaymentModal(true);
    } catch (error) {
      console.error('❌ Failed to block dates for payment:', error);
      // Error is already set in blockDatesForPayment function
      return;
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    setBookingLoading(true);
    setBookingError('');

    try {
      // Clear the blocking timer since payment is successful
      if (blockingTimer) {
        clearTimeout(blockingTimer);
        setBlockingTimer(null);
      }
      
      // Ensure dates are Date objects before converting to ISO string
      const checkInDate = bookingData.checkIn instanceof Date ? bookingData.checkIn : new Date(bookingData.checkIn);
      const checkOutDate = bookingData.checkOut instanceof Date ? bookingData.checkOut : new Date(bookingData.checkOut);
      
      console.log('📅 Date validation:', {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        checkInType: typeof bookingData.checkIn,
        checkOutType: typeof bookingData.checkOut,
        checkInIsDate: bookingData.checkIn instanceof Date,
        checkOutIsDate: bookingData.checkOut instanceof Date
      });

      // New flow: Process payment and create booking in one call
      const bookingPayload = {
        propertyId: id,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guests: bookingData.guests,
        specialRequests: bookingData.specialRequests,
        contactInfo: bookingData.contactInfo,
        paymentMethod: 'card', // Use 'card' as expected by backend validation
        ...(bookingData.couponCode && bookingData.couponCode.trim() && { couponCode: bookingData.couponCode.trim() }),
        ...(bookingData.hourlyExtension && bookingData.hourlyExtension > 0 && property?.hourlyBooking?.enabled && { 
          hourlyExtension: {
            hours: bookingData.hourlyExtension,
            rate: property?.hourlyBooking?.hourlyRates?.[`${bookingData.hourlyExtension === 6 ? 'six' : bookingData.hourlyExtension === 12 ? 'twelve' : 'eighteen'}Hours`] || 0,
            totalHours: bookingData.hourlyExtension
          }
        }),
        // Only include hourly booking fields if it's actually an hourly booking
        // For now, we'll determine this based on whether hourly extension is being used
        ...(property?.hourlyBooking?.enabled && bookingData.hourlyExtension && bookingData.hourlyExtension > 0 ? {
          bookingDuration: '24hour',
          checkInDateTime: checkInDate.toISOString(),
          extensionHours: bookingData.hourlyExtension
        } : {})
      };

      console.log('🚀 Processing payment and creating booking with payload:', bookingPayload);
      console.log('📅 Blocked dates to confirm:', blockedDates);
      console.log('🏠 Property ID:', id);
      console.log('🔐 Authentication status:', { isAuthenticated, userId: user?._id, userEmail: user?.email });
      
      const response = await apiClient.processPaymentAndCreateBooking(bookingPayload);
      
      if (response.success) {
        console.log('✅ Payment processed and booking created successfully:', response.data);
        console.log('📋 Booking ID from response:', response.data.booking._id);
        
        // Confirm the availability with the booking ID
        try {
          console.log('🔐 Confirming availability for dates:', blockedDates);
          console.log('📋 Using booking ID:', response.data.booking._id);
          
          await apiClient.confirmBooking(id as string, blockedDates, response.data.booking._id);
          console.log('✅ Successfully confirmed availability for all dates');
        } catch (error) {
          console.error('❌ Failed to confirm availability:', error);
          // Even if availability confirmation fails, the booking is still created
          // We can handle this separately if needed
        }

        // Clear blocked dates state since they're now booked
        setBlockedDates([]);
        setBlockingExpiry(null);
        
        // Clear booking context data
        clearBookingData();
        
        // Show success message and redirect to bookings page
        router.push('/bookings?success=true');
      } else {
        throw new Error(response.message || 'Failed to process payment and create booking');
      }
    } catch (error: any) {
      console.error('❌ Error in handlePaymentSuccess:', error);
      setBookingError(error.message || 'Failed to process payment and create booking');
      
      // If booking fails, revert blocked dates back to available
      await revertBlockedDates();
    } finally {
      setBookingLoading(false);
    }
  };

  // Get pricing from backend when booking data or coupon changes
  useEffect(() => {
    const updatePricing = async () => {
      await getSecurePricing();
    };
    updatePricing();
  }, [bookingData.checkIn, bookingData.checkOut, bookingData.hourlyExtension, property, couponData]);

  // Clear availability state when dates change
  useEffect(() => {
    setBookingError('');
    setAvailability([]);
  }, [bookingData.checkIn, bookingData.checkOut]);

  // Update booking data when coupon code changes
  useEffect(() => {
    setBookingData(prev => ({
      ...prev,
      couponCode: couponCode
    }));
  }, [couponCode]);

  const formatPrice = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, any> = {
      'wifi': <Wifi className="w-5 h-5" />,
      'tv': <Tv className="w-5 h-5" />,
      'kitchen': <ChefHat className="w-5 h-5" />,
      'washer': <Droplets className="w-5 h-5" />,
      'dryer': <Droplets className="w-5 h-5" />,
      'ac': <Snowflake className="w-5 h-5" />,
      'heating': <Flame className="w-5 h-5" />,
      'workspace': <Monitor className="w-5 h-5" />,
      'pool': <Waves className="w-5 h-5" />,
      'parking': <Car className="w-5 h-5" />,
      'gym': <Dumbbell className="w-5 h-5" />,
      'breakfast': <Coffee className="w-5 h-5" />,
      'smoke-alarm': <Bell className="w-5 h-5" />,
      'first-aid-kit': <Stethoscope className="w-5 h-5" />,
      'fire-extinguisher': <Flame className="w-5 h-5" />,
      'essentials': <Package className="w-5 h-5" />,
      'mountain-view': <Mountain className="w-5 h-5" />,
      'city-view': <Building2 className="w-5 h-5" />,
      'garden': <Trees className="w-5 h-5" />,
      'balcony': <Home className="w-5 h-5" />,
      'terrace': <Home className="w-5 h-5" />,
      'fireplace': <Flame className="w-5 h-5" />,
      'pet-friendly': <PawPrint className="w-5 h-5" />,
      'smoking-allowed': <Cigarette className="w-5 h-5" />,
      'long-term-stays': <CalendarDays className="w-5 h-5" />
    };
    return iconMap[amenity] || <CheckCircle className="w-5 h-5" />;
  };

  // Show loading while checking authentication or loading property
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isLoading ? 'Checking authentication...' : 'Loading property details...'}
            </h2>
            <p className="text-gray-600">
              {isLoading ? 'Please wait while we verify your account...' : 'Preparing your booking experience...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
            <p className="text-gray-600 mb-6">{error || "This property doesn't exist or has been removed."}</p>
            <Button onClick={() => router.back()} className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      
      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8">
            <Button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2 hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to property
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Property Info */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
                {/* Property Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">
                        Complete your booking
                      </h1>
                      <p className="text-gray-600">Secure your perfect stay</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-600 mb-6">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{property.rating || 4.5}</span>
                      <span className="text-gray-500">({property.reviewCount || 0} reviews)</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location?.city}, {property.location?.state}</span>
                    </div>
                  </div>
                  
                  {/* Property Image */}
                  <div className="aspect-video rounded-2xl overflow-hidden mb-6 shadow-lg">
                    <img
                      src={property.images?.[0] || '/logo.png'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{property.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{property.description?.substring(0, 200)}...</p>
                </div>

                {/* Booking Summary - Modern Design */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-200 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Complete Your Booking</h2>
                      <p className="text-gray-600">Just a few more details to secure your stay</p>
                    </div>
                  </div>
                  
                  {/* Selected Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-indigo-100">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-gray-900">Selected Dates</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-in:</span>
                          <span className="font-semibold text-gray-900">
                            {bookingData.checkIn.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out:</span>
                          <span className="font-semibold text-gray-900">
                            {bookingData.checkOut.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-2">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-semibold text-indigo-600">
                            {Math.ceil((bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 border border-indigo-100">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-gray-900">Guests</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Adults:</span>
                          <span className="font-semibold text-gray-900">{bookingData.guests.adults}</span>
                        </div>
                        {bookingData.guests.children > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Children:</span>
                            <span className="font-semibold text-gray-900">{bookingData.guests.children}</span>
                          </div>
                        )}
                        {bookingData.guests.infants > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Infants:</span>
                            <span className="font-semibold text-gray-900">{bookingData.guests.infants}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-100 pt-2">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-semibold text-indigo-600">
                            {bookingData.guests.adults + bookingData.guests.children + bookingData.guests.infants} guests
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pre-selected Extras */}
                  {(bookingData.specialRequests || bookingData.hourlyExtension) && (
                    <div className="mt-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-indigo-600" />
                        Selected Extras
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookingData.specialRequests && (
                          <div className="bg-white rounded-xl p-4 border border-indigo-100">
                            <div className="flex items-start gap-3">
                              <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">Special Requests</div>
                                <div className="text-gray-600 text-sm mt-1">{bookingData.specialRequests}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {bookingData.hourlyExtension && (
                          <div className="bg-white rounded-xl p-4 border border-indigo-100">
                            <div className="flex items-start gap-3">
                              <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">Hourly Extension</div>
                                <div className="text-gray-600 text-sm mt-1">
                                  {bookingData.hourlyExtension} hours
                                  {property?.hourlyBooking && (
                                    <span className="text-purple-600 ml-2">
                                      ({Math.round((property.hourlyBooking?.hourlyRates?.[`${bookingData.hourlyExtension === 6 ? 'six' : bookingData.hourlyExtension === 12 ? 'twelve' : 'eighteen'}Hours`] || 0) * 100)}% of daily rate)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>


                {/* Booking Form */}
                <div className="space-y-8">
                  {/* Dates Selection */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      Select dates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Check-in <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={(() => {
                            const year = bookingData.checkIn.getFullYear();
                            const month = String(bookingData.checkIn.getMonth() + 1).padStart(2, '0');
                            const day = String(bookingData.checkIn.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          })()}
                          onChange={(e) => updateLocalBookingData({ checkIn: new Date(e.target.value) })}
                          min={(() => {
                            const today = new Date();
                            const year = today.getFullYear();
                            const month = String(today.getMonth() + 1).padStart(2, '0');
                            const day = String(today.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          })()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-lg font-medium bg-white text-gray-900 shadow-sm"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Check-out <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={(() => {
                            const year = bookingData.checkOut.getFullYear();
                            const month = String(bookingData.checkOut.getMonth() + 1).padStart(2, '0');
                            const day = String(bookingData.checkOut.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          })()}
                          onChange={(e) => updateLocalBookingData({ checkOut: new Date(e.target.value) })}
                          min={(() => {
                            const year = bookingData.checkIn.getFullYear();
                            const month = String(bookingData.checkIn.getMonth() + 1).padStart(2, '0');
                            const day = String(bookingData.checkIn.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          })()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-lg font-medium bg-white text-gray-900 shadow-sm"
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>
                    
                    {/* Availability Status */}
                    {availabilityLoading && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking availability...
                      </div>
                    )}
                    
                    {/* Blocking Timer Status */}
                    {blockingExpiry && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <Clock className="w-4 h-4" />
                          <span>
                            🎯 <strong>Dates Reserved!</strong> Complete payment within{' '}
                            <span className="font-bold text-blue-800">
                              {Math.max(0, Math.floor((blockingExpiry.getTime() - currentTime) / 60000))}:{Math.max(0, Math.floor(((blockingExpiry.getTime() - currentTime) % 60000) / 1000)).toString().padStart(2, '0')}
                            </span>
                            <span className="text-blue-600"> (MM:SS)</span>
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Availability Summary */}
                    {availability.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Clock3 className="w-4 h-4" />
                            <span>Availability Status:</span>
                          </div>
                          
                          {/* Show blocked dates */}
                          {blockedDates.length > 0 && (
                            <div className="ml-6 text-sm">
                              <div className="flex items-center gap-2 text-blue-600">
                                <Lock className="w-4 h-4" />
                                <span>Blocked dates: {blockedDates.join(', ')}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Show available dates from Availability model */}
                          {availability.filter((a: any) => {
                            const dateStr = a.date instanceof Date ? a.date.toLocaleDateString('en-CA') : new Date(a.date).toLocaleDateString('en-CA');
                            return a.status === 'available' && !blockedDates.includes(dateStr);
                          }).length > 0 && (
                            <div className="ml-6 text-sm">
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span>Available dates: {availability.filter((a: any) => {
                                  const dateStr = a.date instanceof Date ? a.date.toLocaleDateString('en-CA') : new Date(a.date).toLocaleDateString('en-CA');
                                  return a.status === 'available' && !blockedDates.includes(dateStr);
                                }).map((a: any) => {
                                  const dateStr = a.date instanceof Date ? a.date.toLocaleDateString('en-CA') : new Date(a.date).toLocaleDateString('en-CA');
                                  return dateStr;
                                }).join(', ')}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Show unavailable dates (not in Availability model) */}
                          {(() => {
                            const unavailableDates = [];
                            const startDate = new Date(bookingData.checkIn);
                            const endDate = new Date(bookingData.checkOut);
                            const currentDate = new Date(startDate);
                            
                            while (currentDate < endDate) {
                              const dateStr = currentDate.toLocaleDateString('en-CA');
                              const existsInModel = availability.some((a: any) => {
                                const availabilityDateStr = a.date instanceof Date ? a.date.toLocaleDateString('en-CA') : new Date(a.date).toLocaleDateString('en-CA');
                                return availabilityDateStr === dateStr;
                              });
                              
                              if (!existsInModel) {
                                unavailableDates.push(dateStr);
                              }
                              currentDate.setDate(currentDate.getDate() + 1);
                            }
                            
                            return unavailableDates.length > 0 ? (
                              <div className="ml-6 text-sm">
                                <div className="flex items-center gap-2 text-red-600">
                                  <X className="w-4 h-4" />
                                  <span>Unavailable (not in database): {unavailableDates.join(', ')}</span>
                                </div>
                              </div>
                            ) : null;
                          })()}
                          
                          {/* Show booked dates */}
                          {availability.filter((a: any) => {
                            const dateStr = a.date instanceof Date ? a.date.toLocaleDateString('en-CA') : new Date(a.date).toLocaleDateString('en-CA');
                            return a.status === 'booked';
                          }).length > 0 && (
                            <div className="ml-6 text-sm">
                              <div className="flex items-center gap-2 text-red-600">
                                <X className="w-4 h-4" />
                                <span>Booked dates: {availability.filter((a: any) => {
                                  const dateStr = a.date instanceof Date ? a.date.toLocaleDateString('en-CA') : new Date(a.date).toLocaleDateString('en-CA');
                                  return a.status === 'booked';
                                }).map((a: any) => {
                                  const dateStr = a.date instanceof Date ? a.date.toLocaleDateString('en-CA') : new Date(a.date).toLocaleDateString('en-CA');
                                  return dateStr;
                                }).join(', ')}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Show maintenance dates */}
                          {availability.filter((a: any) => {
                            const dateStr = a.date instanceof Date ? a.date.toLocaleDateString('en-CA') : new Date(a.date).toLocaleDateString('en-CA');
                            return a.status === 'maintenance';
                          }).length > 0 && (
                            <div className="ml-6 text-sm">
                              <div className="flex items-center gap-2 text-orange-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Maintenance dates: {availability.filter((a: any) => {
                                  const dateStr = a.date instanceof Date ? a.date.toLocaleDateString('en-CA') : new Date(a.date).toLocaleDateString('en-CA');
                                  return a.status === 'maintenance';
                                }).map((a: any) => {
                                  const dateStr = a.date instanceof Date ? a.date.toLocaleDateString('en-CA') : new Date(a.date).toLocaleDateString('en-CA');
                                  return dateStr;
                                }).join(', ')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Guests Selection */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      Guests <span className="text-red-500">*</span>
                      {(bookingData.guests.adults > 1 || bookingData.guests.children > 0 || bookingData.guests.infants > 0) && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Pre-filled
                        </span>
                      )}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <div className="font-bold text-gray-900">Adults</div>
                          <div className="text-sm text-gray-600">Ages 13 or above</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateLocalBookingData({
                              guests: { ...bookingData.guests, adults: Math.max(1, bookingData.guests.adults - 1) }
                            })}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-bold text-lg">{bookingData.guests.adults}</span>
                          <button
                            onClick={() => updateLocalBookingData({
                              guests: { ...bookingData.guests, adults: Math.min(10, bookingData.guests.adults + 1) }
                            })}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <div className="font-bold text-gray-900">Children</div>
                          <div className="text-sm text-gray-600">Ages 2-12</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateLocalBookingData({
                              guests: { ...bookingData.guests, children: Math.max(0, bookingData.guests.children - 1) }
                            })}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-bold text-lg">{bookingData.guests.children}</span>
                          <button
                            onClick={() => updateLocalBookingData({
                              guests: { ...bookingData.guests, children: Math.min(5, bookingData.guests.children + 1) }
                            })}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <div className="font-bold text-gray-900">Infants</div>
                          <div className="text-sm text-gray-600">Under 2</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateLocalBookingData({
                              guests: { ...bookingData.guests, infants: Math.max(0, bookingData.guests.infants - 1) }
                            })}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-bold text-lg">{bookingData.guests.infants}</span>
                          <button
                            onClick={() => updateLocalBookingData({
                              guests: { ...bookingData.guests, infants: Math.min(3, bookingData.guests.infants + 1) }
                            })}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hourly Booking Extension */}
                  {property?.hourlyBooking?.enabled && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" />
                        Hourly Booking Extension <span className="text-gray-500 text-sm">(Optional)</span>
                        {bookingData.hourlyExtension && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Pre-selected
                          </span>
                        )}
                    </h3>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Extend your checkout time for additional hours at a discounted rate.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { hours: 6, rate: property.hourlyBooking?.hourlyRates?.sixHours || 0.3, label: '6 Hours' },
                            { hours: 12, rate: property.hourlyBooking?.hourlyRates?.twelveHours || 0.6, label: '12 Hours' },
                            { hours: 18, rate: property.hourlyBooking?.hourlyRates?.eighteenHours || 0.75, label: '18 Hours' }
                          ].map((option) => (
                            <div
                              key={option.hours}
                              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                bookingData.hourlyExtension === option.hours
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => {
                                const newExtension = bookingData.hourlyExtension === option.hours ? null : option.hours;
                                updateLocalBookingData({ hourlyExtension: newExtension });
                              }}
                            >
                              <div className="text-center">
                                <div className="font-bold text-gray-900">{option.label}</div>
                                <div className="text-sm text-gray-600">
                                  {Math.round(option.rate * 100)}% of daily rate
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Checkout: {(() => {
                                    if (!bookingData.checkOut) return 'Select dates first';
                                    const [hours, minutes] = (property?.checkOutTime || '11:00').split(':').map(Number);
                                    const baseCheckout = new Date(bookingData.checkOut);
                                    baseCheckout.setHours(hours, minutes, 0, 0);
                                    const newCheckout = new Date(baseCheckout);
                                    newCheckout.setHours(newCheckout.getHours() + option.hours);
                                    return newCheckout.toLocaleTimeString('en-US', { 
                                      hour: 'numeric', 
                                      minute: '2-digit',
                                      hour12: true 
                                    });
                                  })()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {bookingData.hourlyExtension && (
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <h4 className="font-semibold text-blue-900">Extension Selected</h4>
                            </div>
                            <div className="text-sm text-blue-700">
                              <div className="flex justify-between">
                                <span>Extension:</span>
                                <span className="font-medium">{bookingData.hourlyExtension} hours</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Rate:</span>
                                <span className="font-medium">
                                  {Math.round((property.hourlyBooking?.hourlyRates?.[`${bookingData.hourlyExtension === 6 ? 'six' : bookingData.hourlyExtension === 12 ? 'twelve' : 'eighteen'}Hours`] || 0) * 100)}% of daily rate
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>New checkout time:</span>
                                <span className="font-medium">
                                  {(() => {
                                    if (!bookingData.checkOut) return 'Select dates first';
                                    const [hours, minutes] = (property?.checkOutTime || '11:00').split(':').map(Number);
                                    const baseCheckout = new Date(bookingData.checkOut);
                                    baseCheckout.setHours(hours, minutes, 0, 0);
                                    const newCheckout = new Date(baseCheckout);
                                    newCheckout.setHours(newCheckout.getHours() + bookingData.hourlyExtension);
                                    return newCheckout.toLocaleTimeString('en-US', { 
                                      hour: 'numeric', 
                                      minute: '2-digit',
                                      hour12: true 
                                    });
                                  })()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                        <p className="text-sm text-gray-600">Required for booking confirmation</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          value={bookingData.contactInfo.name}
                          onChange={(e) => {
                            updateLocalBookingData({
                            contactInfo: { ...bookingData.contactInfo, name: e.target.value }
                            });
                            // Clear validation error when user starts typing
                            if (validationErrors.contactName) {
                              setValidationErrors(prev => ({ ...prev, contactName: false }));
                            }
                          }}
                          placeholder="Enter your full name"
                          className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 font-medium placeholder-gray-400 shadow-sm transition-all duration-200 ${
                            validationErrors.contactName 
                              ? 'border-red-500 ring-2 ring-red-200' 
                              : 'border-emerald-200'
                          }`}
                          style={{ color: '#111827' }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          value={bookingData.contactInfo.email}
                          onChange={(e) => {
                            updateLocalBookingData({
                            contactInfo: { ...bookingData.contactInfo, email: e.target.value }
                            });
                            // Clear validation error when user starts typing
                            if (validationErrors.contactEmail) {
                              setValidationErrors(prev => ({ ...prev, contactEmail: false }));
                            }
                          }}
                          placeholder="Enter your email address"
                          className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 font-medium placeholder-gray-400 shadow-sm transition-all duration-200 ${
                            validationErrors.contactEmail 
                              ? 'border-red-500 ring-2 ring-red-200' 
                              : 'border-emerald-200'
                          }`}
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={bookingData.contactInfo.phone}
                        onChange={(e) => {
                          updateLocalBookingData({
                          contactInfo: { ...bookingData.contactInfo, phone: e.target.value }
                          });
                          // Clear validation error when user starts typing
                          if (validationErrors.contactPhone) {
                            setValidationErrors(prev => ({ ...prev, contactPhone: false }));
                          }
                        }}
                          placeholder="Enter your phone number"
                          className={`w-full px-4 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 font-medium placeholder-gray-400 shadow-sm transition-all duration-200 ${
                            validationErrors.contactPhone 
                              ? 'border-red-500 ring-2 ring-red-200' 
                              : 'border-emerald-200'
                          }`}
                        style={{ color: '#111827' }}
                      />
                    </div>
                  </div>

                    <div className="mt-6 p-4 bg-emerald-100 rounded-2xl border border-emerald-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                        <div>
                          <div className="font-semibold text-emerald-800 text-sm">Why we need this information</div>
                          <div className="text-emerald-700 text-sm mt-1">
                            We use your contact details to send booking confirmations, check-in instructions, and important updates about your stay.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                        <p className="text-sm text-gray-600">Choose your preferred payment method</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { value: 'card', label: 'Credit Card', icon: '💳', color: 'blue' },
                        { value: 'paypal', label: 'PayPal', icon: '🅿️', color: 'indigo' },
                        { value: 'apple_pay', label: 'Apple Pay', icon: '🍎', color: 'gray' },
                        { value: 'google_pay', label: 'Google Pay', icon: 'G', color: 'green' }
                      ].map((method) => (
                        <div
                          key={method.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 text-center ${
                            bookingData.paymentMethod === method.value
                              ? 'border-gray-400 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => updateLocalBookingData({ paymentMethod: method.value })}
                        >
                          <div className="text-2xl mb-2">{method.icon}</div>
                          <div className="font-medium text-gray-900 text-sm">{method.label}</div>
                          {bookingData.paymentMethod === method.value && (
                            <div className="mt-2">
                              <CheckCircle className="w-4 h-4 text-gray-600 mx-auto" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-2">
                        <Lock className="w-4 h-4 text-gray-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-800 text-sm">Secure Payment</div>
                          <div className="text-gray-600 text-xs mt-1">
                            Your payment information is encrypted and secure.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Gift className="w-5 h-5 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Coupon Code</h3>
                        <p className="text-sm text-gray-600">Enter discount code if you have one</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={bookingData.couponCode}
                        onChange={(e) => updateLocalBookingData({ couponCode: e.target.value })}
                        placeholder="Enter coupon code..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white text-gray-900"
                      />
                      <button
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
                        onClick={() => {
                          // Add coupon validation logic here
                          console.log('Applying coupon:', bookingData.couponCode);
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MessageCircle className="w-5 h-5 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Special Requests</h3>
                        <p className="text-sm text-gray-600">Any special needs or preferences?</p>
                      </div>
                    </div>
                    
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => updateLocalBookingData({ specialRequests: e.target.value })}
                      placeholder="Let us know about any special requests, dietary restrictions, accessibility needs, or other preferences..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white text-gray-900 placeholder-gray-400 resize-none"
                      style={{ color: '#111827' }}
                    />
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        We'll do our best to accommodate your requests
                      </div>
                      <div className="text-sm text-gray-500">
                        {bookingData.specialRequests.length}/500 characters
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                      <input
                        id="agree-terms"
                        type="checkbox"
                        checked={bookingData.agreeToTerms}
                        onChange={(e) => {
                          updateLocalBookingData({ agreeToTerms: e.target.checked });
                          // Clear validation error when user checks the box
                          if (validationErrors.agreeToTerms) {
                            setValidationErrors(prev => ({ ...prev, agreeToTerms: false }));
                          }
                        }}
                          className={`w-5 h-5 rounded border text-gray-600 focus:ring-1 focus:ring-gray-400 ${
                            validationErrors.agreeToTerms 
                              ? 'border-red-500 ring-2 ring-red-200' 
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div className="text-gray-700">
                        <div className="font-semibold text-gray-900 mb-2">
                          Terms and Conditions <span className="text-red-500">*</span>
                        </div>
                        <div className="text-sm leading-relaxed">
                          By proceeding with this booking, I agree to the{' '}
                          <a href="#" className="text-gray-600 hover:text-gray-800 underline">
                          Terms and Conditions
                        </a>{' '}
                        and{' '}
                          <a href="#" className="text-gray-600 hover:text-gray-800 underline">
                          Privacy Policy
                        </a>
                          . I understand that this booking is subject to the property's cancellation policy and house rules.
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Summary - Modern Design */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <Receipt className="w-5 h-5 text-gray-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>
                    <p className="text-sm text-gray-600">Review your selection</p>
                  </div>
                </div>
                
                {/* Property Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={property.images?.[0] || '/logo.png'}
                      alt={property.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm">{property.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{property.location?.city}, {property.location?.state}</span>
                  </div>
                  </div>
                  </div>
                    </div>
                
                {/* Coupon Code Section */}
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Coupon Code</h3>
                        <p className="text-sm text-gray-600">Enter a valid coupon code to get discounts</p>
                  </div>
                </div>

                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onBlur={() => validateCoupon(couponCode)}
                          placeholder="Enter coupon code (e.g., SAVE20)"
                          className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                          disabled={couponLoading}
                        />
                        {couponError && (
                          <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {couponError}
                          </p>
                        )}
                        {couponData && (
                          <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Coupon applied! You saved {formatPrice(couponData.discountAmount)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => validateCoupon(couponCode)}
                        disabled={!couponCode.trim() || couponLoading}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {couponLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <Gift className="w-4 h-4" />
                            Apply
                          </>
                        )}
                      </button>
                    </div>
                    
                    {couponData && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-800 font-semibold">
                              {couponData.coupon.code} - {couponData.coupon.discountType === 'percentage' 
                                ? `${couponData.coupon.amount}% off` 
                                : `${formatPrice(couponData.coupon.amount)} off`
                              }
                            </p>
                            <p className="text-green-600 text-sm">
                              You saved {formatPrice(couponData.discountAmount)}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setCouponCode('');
                              setCouponData(null);
                              setCouponError('');
                            }}
                            className="text-green-600 hover:text-green-800 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                    </div>
                  </div>
                )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="mb-8">
                  {!priceBreakdown.total ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading pricing...</span>
                    </div>
                  ) : priceBreakdown ? (
                    <PricingBreakdown
                      pricing={priceBreakdown}
                      showPlatformFees={true}
                      variant="customer"
                    />
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      Please select dates to see pricing
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {bookingError && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-600">{bookingError}</p>
                    </div>
                  </div>
                )}

                {/* Book Now Button */}
                <Button
                  onClick={() => {
                    console.log('🖱️ ===========================================');
                    console.log('🖱️ COMPLETE BOOKING BUTTON CLICKED!');
                    console.log('🖱️ ===========================================');
                    console.log('🖱️ Button disabled state:', !bookingData.agreeToTerms || bookingLoading || availabilityLoading);
                    console.log('🖱️ agreeToTerms:', bookingData.agreeToTerms);
                    console.log('🖱️ bookingLoading:', bookingLoading);
                    console.log('🖱️ availabilityLoading:', availabilityLoading);
                    console.log('🖱️ isAuthenticated:', isAuthenticated);
                    console.log('🖱️ user:', user);
                    console.log('🖱️ bookingData:', bookingData);
                    console.log('🖱️ property:', property);
                    console.log('🖱️ priceBreakdown:', priceBreakdown);
                    console.log('🖱️ validationErrors:', validationErrors);
                    console.log('🖱️ bookingError:', bookingError);
                    console.log('🖱️ ===========================================');
                    handleBooking();
                  }}
                  disabled={!bookingData.agreeToTerms || bookingLoading || availabilityLoading}
                  className={`w-full py-3 rounded-lg font-semibold text-base transition-colors ${
                    !bookingData.agreeToTerms || bookingLoading || availabilityLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : !bookingData.agreeToTerms ? (
                    <div className="flex items-center justify-center gap-3">
                      <AlertTriangle className="w-6 h-6" />
                      <span>Accept Terms to Continue</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <Zap className="w-6 h-6" />
                      <span>Complete Booking</span>
                    </div>
                  )}
                </Button>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Secure payment • You won't be charged yet
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={priceBreakdown.total}
        loading={bookingLoading}
      />
    </div>
  );
} 