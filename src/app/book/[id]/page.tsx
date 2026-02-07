"use client";
import { useEffect, useState, useRef } from "react";
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
import { start } from "repl";
import { useUI } from "@/core/store/uiContext";
import UserHeader from "@/components/shared/UserHeader";

// Payment Modal Component with Razorpay Integration
const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: any) => void;
  amount: number;
  loading: boolean;
  bookingId?: string | null;
  propertyId?: string;
  user?: any;
}> = ({ isOpen, onClose, onSuccess, amount, loading, bookingId, propertyId, user }) => {
  const [paymentStep, setPaymentStep] = useState<'init' | 'processing' | 'success' | 'error'>('init');
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Load Razorpay script
  useEffect(() => {
    if (!isOpen || razorpayLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
      console.log('✅ Razorpay script loaded');
    };
    script.onerror = () => {
      setError('Failed to load Razorpay. Please refresh the page.');
      console.error('❌ Failed to load Razorpay script');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [isOpen, razorpayLoaded]);

  const handlePayment = async () => {
    setPaymentStep('processing');
    setError('');

    try {
      console.log('🔄 Creating Razorpay order...', { bookingId, amount, propertyId });
      
      // Create Razorpay order (bookingId is temporary, actual booking created after payment)
      const orderResponse = await apiClient.createRazorpayOrder(bookingId || null, amount, 'INR', propertyId);
      
      console.log('📦 Order response:', orderResponse);
      
      if (!orderResponse.success || !orderResponse.data) {
        const errorMsg = orderResponse.error || orderResponse.message || 'Failed to create payment order';
        console.error('❌ Order creation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      const { orderId, key } = orderResponse.data;

      // Initialize Razorpay checkout
      const options = {
        key: key,
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        name: 'TripMe',
        description: `Payment for booking${propertyId ? ` - Property ${propertyId}` : ''}`,
        order_id: orderId,
        handler: async function (response: any) {
          console.log('✅ Razorpay payment success:', response);
          
          // Payment successful - call onSuccess with payment data
          onSuccess({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            razorpayPaymentDetails: response
          });
          
          setPaymentStep('success');
          setTimeout(() => {
            onClose();
          }, 2000);
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#1f2937'
        },
        modal: {
          ondismiss: function() {
            setPaymentStep('init');
            console.log('Payment modal closed');
          }
        }
      };

      // Check if Razorpay is available
      if (!(window as any).Razorpay) {
        throw new Error('Razorpay script not loaded. Please refresh the page.');
      }

      // Open Razorpay checkout
      console.log('🚀 Opening Razorpay checkout with options:', { ...options, key: '***' });
      const razorpay = new (window as any).Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        console.error('❌ Razorpay payment failed:', response);
        setError(response.error?.description || response.error?.reason || 'Payment failed. Please try again.');
        setPaymentStep('error');
      });

      razorpay.on('payment.authorized', function (response: any) {
        console.log('✅ Payment authorized:', response);
      });
      
      // Open the Razorpay checkout popup
      razorpay.open();
      console.log('✅ Razorpay checkout opened');
    } catch (error: any) {
      console.error('❌ Error initiating Razorpay payment:', error);
      setError(error.message || 'Failed to initiate payment. Please try again.');
      setPaymentStep('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 ">
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
                <p className="text-sm text-gray-600">Secure payment via Razorpay</p>
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
          {paymentStep === 'init' && (
            <div className="space-y-6">
              {/* Amount Display */}
              <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(amount)}</p>
              </div>

              {/* Payment Info */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-800">
                    You will be redirected to Razorpay's secure payment gateway to complete your payment.
                  </p>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Lock className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-600">Your payment is secured with SSL encryption</p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Pay Button */}
              <Button
                onClick={handlePayment}
                disabled={loading || !razorpayLoaded}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {!razorpayLoaded ? 'Loading Razorpay...' : `Pay ${formatPrice(amount)}`}
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

          {paymentStep === 'processing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Opening Payment Gateway</h3>
              <p className="text-gray-600">Please wait while we redirect you to Razorpay...</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your booking has been confirmed</p>
            </div>
          )}

          {paymentStep === 'error' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-4">{error || 'An error occurred during payment'}</p>
              <Button
                onClick={() => {
                  setPaymentStep('init');
                  setError('');
                }}
                className="bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                Try Again
              </Button>
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
  const [isRedirecting, setIsRedirecting] = useState(false); // Flag to prevent conflicting redirects
 
   const { hideHeader, setHideBottomNav ,setHideHeader} = useUI();
  // Platform fee rate is now handled by backend API

  
  // Helper function to parse date string to LOCAL midnight (not UTC)
  // new Date('YYYY-MM-DD') creates UTC midnight which shifts by 1 day in IST
  const parseDateToLocal = (dateInput: string | Date | undefined): Date => {
     if (!dateInput) return new Date();
  return new Date(dateInput); // preserve time
    // if (!dateInput) return new Date();
    // if (dateInput instanceof Date) return dateInput;
    
    // // If it's an ISO string like '2025-12-29T18:30:00.000Z', parse it properly
    // if (dateInput.includes('T')) {
    //   const date = new Date(dateInput);
    //   // Return a new date at local midnight for the local date
    //   return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    // }
    
    // // If it's a date-only string like '2025-12-29', parse to local midnight
    // const [year, month, day] = dateInput.split('-').map(Number);
    // return new Date(year, month - 1, day);
  };

//  HIDE BOTTOM NAV SCROLLING 
   useEffect(() => {
    setHideBottomNav(true);
    setHideHeader(true);
  
    return () => {
      setHideBottomNav(false);
      setHideHeader(false);
    };
  }, []);
  
  // Booking state - initialize from context or defaults
  const [bookingData, setBookingData] = useState(() => {
    if (contextBookingData && contextBookingData.propertyId === id) {
      return {
        checkIn: parseDateToLocal(contextBookingData.startDate),
        checkOut: contextBookingData.endDate ? parseDateToLocal(contextBookingData.endDate) : new Date(Date.now() + 24 * 60 * 60 * 1000),
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
        checkInTime: contextBookingData.checkInTime, // FIX: Include custom check-in time
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
      checkInTime: undefined, // Will use property default if not set
      checkInDateTime: null,
      extensionHours: 0,
      agreeToTerms: false
    };
  });
  const [showContactSheet, setShowContactSheet] = useState(false);

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
      hourlyExtension: bookingData.hourlyExtension,
      checkInTime: bookingData.checkInTime
      // checkOutDateTime: bookingData.checkOutDateTime, // DEBUG: Check if checkInTime is passed
    });
  }, [bookingData]);

  // Redirect to property page if no booking data (but not if we're redirecting after payment)
  useEffect(() => {
    // Don't redirect if we're in the process of redirecting after payment
    if (isRedirecting) {
      return;
    }
    if (!contextBookingData || contextBookingData.propertyId !== id) {
      router.push(`/rooms/${id}`);
    }
  }, [contextBookingData, id, router, isRedirecting]);

  const [priceBreakdown, setPriceBreakdown] = useState<{
    basePrice: number;
    serviceFee: number;
    cleaningFee: number;
    securityDeposit: number;
    extraGuestCost: number;
    hourlyExtensionCost: number;
    platformFee: number;
    gst: number;
    processingFee: number;
    taxes: number;
    total: number;
    nights: number;
    subtotal: number;
    pricingToken?: string;
  }>({
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

  // Track if we've initialized the available date
  const dateInitializedRef = useRef(false);

  // Initial load: Fetch availability and set check-in to next available date if today is booked
  useEffect(() => {
    if (!id || isLoading || dateInitializedRef.current) return;
    
    console.log('🚀 Initializing available date check...');
    
    const initializeAvailableDate = async () => {
      try {
        const response = await apiClient.getAvailability(id as string);
        console.log('📊 Initial availability response:', response);
        
        if (response.success && response.data) {
          const availabilityData = response.data.availability || [];
          setAvailability(availabilityData);
          
          console.log('📅 Availability data loaded:', availabilityData.length, 'dates');
          
          // Check if current check-in date (today) is available
          setBookingData(prev => {
            const currentCheckIn = prev.checkIn || new Date();
            const currentCheckInStr = currentCheckIn.toLocaleDateString('en-CA');
            
            console.log('🔍 Checking if initial check-in date is available:', currentCheckInStr);
            
            // Find the availability record for current check-in date
            const currentDateAvailability = availabilityData.find((a: any) => {
              let availabilityDateStr: string;
              if (typeof a.date === 'string') {
                const parsedDate = new Date(a.date);
                availabilityDateStr = parsedDate.toLocaleDateString('en-CA');
              } else if (a.date instanceof Date) {
                availabilityDateStr = a.date.toLocaleDateString('en-CA');
              } else {
                const parsedDate = new Date(a.date);
                availabilityDateStr = parsedDate.toLocaleDateString('en-CA');
              }
              return availabilityDateStr === currentCheckInStr;
            });
            
            console.log('📋 Current date availability record:', currentDateAvailability);
            
            if (currentDateAvailability) {
              console.log('📊 Current date status:', currentDateAvailability.status);
              
              // If date is booked, maintenance, or unavailable, find next available
              if (currentDateAvailability.status === 'booked' || 
                  currentDateAvailability.status === 'maintenance' || 
                  currentDateAvailability.status === 'unavailable') {
                console.log('⚠️ Initial check-in date is not available (status:', currentDateAvailability.status, '), finding next available date...');
                const nextAvailableDate = findNextAvailableDate(availabilityData, currentCheckIn);
                
                if (nextAvailableDate) {
                  const newCheckOutDate = new Date(nextAvailableDate);
                  newCheckOutDate.setDate(nextAvailableDate.getDate() + 1);
                  
                  console.log(`✅ Initializing check-in date to ${nextAvailableDate.toLocaleDateString('en-CA')}`);
                  
                  dateInitializedRef.current = true;
                  
                  return {
                    ...prev,
                    checkIn: nextAvailableDate,
                    checkOut: newCheckOutDate
                  };
                } else {
                  console.log('❌ No available date found');
                }
              } else if (currentDateAvailability.status === 'available') {
                console.log('✅ Initial check-in date is available');
              }
            } else {
              // Date not found in availability - might not be available
              console.log('⚠️ Initial check-in date not found in availability data, finding next available date...');
              const nextAvailableDate = findNextAvailableDate(availabilityData, currentCheckIn);
              
              if (nextAvailableDate) {
                const newCheckOutDate = new Date(nextAvailableDate);
                newCheckOutDate.setDate(nextAvailableDate.getDate() + 1);
                
                console.log(`✅ Initializing check-in date to ${nextAvailableDate.toLocaleDateString('en-CA')}`);
                
                dateInitializedRef.current = true;
                
                return {
                  ...prev,
                  checkIn: nextAvailableDate,
                  checkOut: newCheckOutDate
                };
              }
            }
            
            dateInitializedRef.current = true;
            return prev; // No change needed
          });
        }
      } catch (error) {
        console.error('❌ Failed to initialize available date:', error);
        dateInitializedRef.current = true; // Mark as initialized even on error to prevent retries
      }
    };
    
    initializeAvailableDate();
  }, [id, isLoading]); // Only run once when component mounts and id is available

  // Check availability when user arrives on booking page (but don't block dates yet)
  useEffect(() => {
    // Skip if date initialization hasn't completed yet
    if (!dateInitializedRef.current) {
      console.log('⏳ Waiting for date initialization to complete...');
      return;
    }
    
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
  }, [id, bookingData.checkIn, bookingData.checkOut, bookingData.hourlyExtension, isAuthenticated, user?._id, isLoading]);

  // Update timer display every minute
  useEffect(() => {
    if (!blockingExpiry) return;
    
    const timerInterval = setInterval(() => {
      // Don't revert if booking is in progress (payment succeeded, booking being created)
      if (bookingLoading) {
        console.log('⏸️ Skipping expiry check - booking in progress');
        return;
      }
      
      const timeLeft = blockingExpiry.getTime() - Date.now();
      if (timeLeft <= 0) {
        // Timer expired, revert dates
        console.log('⏰ Blocking expiry timer expired, reverting dates');
        revertBlockedDates();
      }
    }, 10000); // Check every 10 seconds for more responsive expiry
    
    return () => clearInterval(timerInterval);
  }, [blockingExpiry, bookingLoading]);

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
    
    // Don't revert if booking is in progress (payment succeeded, booking being created)
    if (bookingLoading) {
      console.log('⏸️ Skipping date revert - booking in progress');
      return;
    }
    
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
      
      // Only show error if booking is not in progress
      if (!bookingLoading) {
        setBookingError('Your date reservation has expired. Please select new dates.');
      }
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

  const normalizeDate = (d: Date) =>
  d.toISOString().split('T')[0];

  // Refresh availability data from backend
  // Pass currentBlockedDates parameter to avoid relying on stale blockedDates state
  // const refreshAvailabilityData = async (currentBlockedDates?: string[]) => {
  //   if (!id) return;
    
  //   // Use passed dates or fall back to state (which may be stale due to async updates)
  //   const effectiveBlockedDates = currentBlockedDates || blockedDates;
    
  //   try {
  //     console.log('Calling getAvailability for property:', id);
  //     const response = await apiClient.getAvailability(id as string);
  //     console.log('getAvailability response:', response);
      
  //     if (response.success && response.data) {
  //       const availabilityData = response.data.availability || [];
  //       setAvailability(availabilityData);
  //       console.log('Availability data refreshed:', availabilityData);
  //       console.log('Current blocked dates (effective):', effectiveBlockedDates);
        
  //       // Check if current check-in date is available, if not find next available
  //       // Use a local check that considers the effective blocked dates
  //       const checkInDateStr = bookingData.checkIn?.toLocaleDateString('en-CA');
  //       const isCheckInBlocked = effectiveBlockedDates.includes(checkInDateStr || '');
        
  //       if (bookingData.checkIn && !isCheckInBlocked && !isDateAvailable(bookingData.checkIn, availabilityData)) {
  //         console.log('⚠️ Current check-in date is not available after refresh, finding next available date...');
  //         const nextAvailableDate = findNextAvailableDate(availabilityData, bookingData.checkIn);
          
  //         if (nextAvailableDate) {
  //           const newCheckOutDate = new Date(nextAvailableDate);
  //           newCheckOutDate.setDate(nextAvailableDate.getDate() + 1);
            
  //           console.log(`🔄 Auto-updating check-in date to ${nextAvailableDate.toLocaleDateString('en-CA')}`);
            
  //           setBookingData(prev => ({
  //             ...prev,
  //             checkIn: nextAvailableDate,
  //             checkOut: newCheckOutDate
  //           }));
  //         }
  //       } else if (isCheckInBlocked) {
  //         console.log('✅ Check-in date is blocked by current user, keeping selected dates');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Failed to refresh availability:', error);
  //   }
  // };

  const refreshAvailabilityData = async (currentBlockedDates?: string[]) => {
  if (!id) return;

  const effectiveBlockedDates = currentBlockedDates || blockedDates;

  try {
    console.log('Calling getAvailability for property:', id);
    const response = await apiClient.getAvailability(id as string);
    console.log('getAvailability response:', response);

    if (!response.success || !response.data) return;

    const availabilityData = response.data.availability || [];
    setAvailability(availabilityData);

    console.log('Availability data refreshed:', availabilityData);
    console.log('Current blocked dates (effective):', effectiveBlockedDates);

    if (!bookingData.checkIn) return;

    const checkInDateKey = normalizeDate(bookingData.checkIn);
    const isCheckInBlocked = effectiveBlockedDates.includes(checkInDateKey);

    // 🔒 DO NOT auto-shift if user already blocked this date
    if (isCheckInBlocked) {
      console.log('✅ Check-in date is blocked by current user, keeping selected dates');
      return;
    }

    // ✅ Date-only availability check (NO time comparison)
    const isAvailable = availabilityData.some((a: any) => {
      const availabilityDateKey = normalizeDate(new Date(a.date));
      return (
        availabilityDateKey === checkInDateKey &&
        (a.status === 'available' || a.status === "partially-available")
      );
    });

    if (!isAvailable) {
      console.log(
        '⚠️ Check-in date not available after refresh, finding next available date...'
      );

      const nextAvailableDate = findNextAvailableDate(
        availabilityData,
        bookingData.checkIn
      );

      if (nextAvailableDate) {
        const newCheckOutDate = new Date(nextAvailableDate);
        newCheckOutDate.setDate(nextAvailableDate.getDate() + 1);

        console.log(
          `🔄 Auto-updating check-in date to ${normalizeDate(nextAvailableDate)}`
        );

        setBookingData(prev => ({
          ...prev,
          checkIn: nextAvailableDate,
          checkOut: newCheckOutDate
        }));
      }
    }
  } catch (error) {
    console.error('Failed to refresh availability:', error);
  }
};


  // Helper function to get user ID consistently
  const getUserId = (user: UserType | null): string | undefined => {
    return user?.id || user?._id;
  };

  // Helper function to find the next available date from availability data
  const findNextAvailableDate = (availabilityData: any[], startFromDate?: Date): Date | null => {
    if (!availabilityData || availabilityData.length === 0) return null;
    
    const startDate = startFromDate || new Date();
    const today = new Date(startDate);
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    // Look ahead up to 90 days for an available date
    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateStr = checkDate.toLocaleDateString('en-CA');
      
      // Find availability record for this date
      const dateAvailability = availabilityData.find((a: any) => {
        let availabilityDateStr: string;
        if (typeof a.date === 'string') {
          const parsedDate = new Date(a.date);
          availabilityDateStr = parsedDate.toLocaleDateString('en-CA');
        } else if (a.date instanceof Date) {
          availabilityDateStr = a.date.toLocaleDateString('en-CA');
        } else {
          const parsedDate = new Date(a.date);
          availabilityDateStr = parsedDate.toLocaleDateString('en-CA');
        }
        return availabilityDateStr === dateStr;
      });
      
      // Skip booked, maintenance, and unavailable dates
      if (dateAvailability && (
        dateAvailability.status === 'booked' || 
        dateAvailability.status === 'maintenance' || 
        dateAvailability.status === 'unavailable'
      )) {
        continue; // Skip this date, check next
      }
      
      // Check if date is available
      if (dateAvailability && dateAvailability.status === 'available') {
        console.log(`✅ Found next available date: ${dateStr}`);
        return checkDate;
      }
      
      // Also allow dates that are blocked by current user
      if (dateAvailability && dateAvailability.status === 'blocked' && blockedDates.includes(dateStr)) {
        console.log(`✅ Found next available date (blocked by current user): ${dateStr}`);
        return checkDate;
      }
      
      // If date doesn't exist in availability data, skip it (not available)
      if (!dateAvailability) {
        continue; // Skip dates not in availability model
      }
    }
    
    console.log('⚠️ No available date found in next 90 days');
    return null;
  };

  // Helper function to check if a date is available
  const isDateAvailable = (date: Date, availabilityData: any[]): boolean => {
    if (!availabilityData || availabilityData.length === 0) return false;
    
    const dateStr = date.toLocaleDateString('en-CA');
    
    const dateAvailability = availabilityData.find((a: any) => {
      let availabilityDateStr: string;
      if (typeof a.date === 'string') {
        const parsedDate = new Date(a.date);
        availabilityDateStr = parsedDate.toLocaleDateString('en-CA');
      } else if (a.date instanceof Date) {
        availabilityDateStr = a.date.toLocaleDateString('en-CA');
      } else {
        const parsedDate = new Date(a.date);
        availabilityDateStr = parsedDate.toLocaleDateString('en-CA');
      }
      return availabilityDateStr === dateStr;
    });
    
    if (!dateAvailability) return false;
    
    // Explicitly exclude booked, maintenance, and unavailable dates
    if (dateAvailability.status === 'booked' || 
        dateAvailability.status === 'maintenance' || 
        dateAvailability.status === 'unavailable') {
      return false;
    }
    
    // Date is available if status is 'available' or blocked by current user
    return dateAvailability.status === 'available' || 
           (dateAvailability.status === 'blocked' && blockedDates.includes(dateStr));
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
        const availabilityData = response.data.availability || [];
        setAvailability(availabilityData);
        
        console.log('Availability data received:', availabilityData);
        const checkInDate = bookingData.checkIn instanceof Date ? bookingData.checkIn : new Date(bookingData.checkIn);
        const checkOutDate = bookingData.checkOut instanceof Date ? bookingData.checkOut : new Date(bookingData.checkOut);
        console.log('Checking availability for dates:', checkInDate.toLocaleDateString('en-CA'), 'to', checkOutDate.toLocaleDateString('en-CA'));
        
        // Check if current check-in date is available
        if (!isDateAvailable(checkInDate, availabilityData)) {
          console.log('⚠️ Current check-in date is not available, finding next available date...');
          const nextAvailableDate = findNextAvailableDate(availabilityData, checkInDate);
          
          if (nextAvailableDate) {
            // Calculate check-out date (1 day after check-in by default)
            const newCheckOutDate = new Date(nextAvailableDate);
            newCheckOutDate.setDate(nextAvailableDate.getDate() + 1);
            
            console.log(`🔄 Auto-updating check-in date from ${checkInDate.toLocaleDateString('en-CA')} to ${nextAvailableDate.toLocaleDateString('en-CA')}`);
            
            setBookingData(prev => ({
              ...prev,
              checkIn: nextAvailableDate,
              checkOut: newCheckOutDate
            }));
            
            // Return early - we'll check again with the new dates
            setAvailabilityLoading(false);
            return false; // Will trigger another check with new dates
          } else {
            setBookingError('No available dates found. Please try selecting dates manually.');
            setAvailabilityLoading(false);
            return false;
          }
        }
        
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
        hourlyExtensionCost: pricing.hourlyExtension || 0,
        platformFee: pricing.platformFee,
        gst: pricing.gst,
        processingFee: pricing.processingFee,
        taxes: pricing.gst,
        total: pricing.totalAmount,
        nights: pricing.nights,
        subtotal: pricing.subtotal,
        // Security token for validation - ensures backend uses this exact price for the current dates
        pricingToken: response.data.security.pricingToken
      };
      
      console.log('💰 New price breakdown with token:', {
        total: newPriceBreakdown.total,
        token: newPriceBreakdown.pricingToken?.substring(0, 8) + '...',
        dates: {
          checkIn: bookingData.checkIn instanceof Date ? bookingData.checkIn.toLocaleDateString('en-CA') : bookingData.checkIn,
          checkOut: bookingData.checkOut instanceof Date ? bookingData.checkOut.toLocaleDateString('en-CA') : bookingData.checkOut
        }
      });
      
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
      console.log("start date", startDate);
      console.log("end date", endDate);
      console.log("current date", currentDate);
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
      // Pass datesToBlock directly to avoid relying on stale state
      await refreshAvailabilityData(datesToBlock);
      
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
      if (window.innerWidth < 768) {
        setShowContactSheet(true);
        return;
      }
      setBookingError('Please fill in all required fields');
      return;
    }

    console.log('✅ All validations passed, checking availability before proceeding...');

    // IMPORTANT: Check availability BEFORE blocking dates and showing payment modal
    // This ensures user can't proceed with booking if dates are not available
    console.log('🔍 Starting availability check...');
    setAvailabilityLoading(true);
    const isAvailable = await checkAvailability();
    setAvailabilityLoading(false);
    console.log('📅 Availability check result:', isAvailable);
    
    if (!isAvailable) {
      console.log('❌ Dates not available, cannot proceed with booking');
      // Error message is already set by checkAvailability() function
      if (!bookingError) {
        setBookingError('Selected dates are not available. Please choose different dates.');
      }
      return;
    }

    console.log('✅ All checks passed, blocking dates and showing payment modal');
    
    try {
      // Block dates now that user is initiating payment
      await blockDatesForPayment();
      // Clear any validation errors before showing payment modal
      setValidationErrors({});
      setBookingError('');
      // Extend blocking expiry when payment modal opens (user is actively paying)
      // This gives more time for payment processing
      if (blockingExpiry) {
        const extendedExpiry = new Date(Date.now() + 20 * 60 * 1000); // Extend to 20 minutes
        setBlockingExpiry(extendedExpiry);
        console.log('⏰ Extended blocking expiry for payment:', extendedExpiry);
      }
      setShowPaymentModal(true);
    } catch (error) {
      console.error('❌ Failed to block dates for payment:', error);
      // Error is already set in blockDatesForPayment function
      return;
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentData?: any) => {
    setBookingLoading(true);
    setBookingError('');
    setValidationErrors({}); // Clear validation errors when payment succeeds

    try {
      // Clear the blocking timer and expiry IMMEDIATELY when payment succeeds
      // This prevents the expiry check from triggering while booking is being created
      if (blockingTimer) {
        clearTimeout(blockingTimer);
        setBlockingTimer(null);
      }
      // Clear expiry immediately to prevent "reservation expired" error
      setBlockingExpiry(null);
      
      // Ensure dates are Date objects before converting to ISO string
      const checkInDate = bookingData.checkIn instanceof Date ? bookingData.checkIn : parseDateToLocal(bookingData.checkIn);
      const checkOutDate = bookingData.checkOut instanceof Date ? bookingData.checkOut : parseDateToLocal(bookingData.checkOut);
      
      // Format date for backend - send LOCAL date as UTC midnight so backend interprets correctly
      // This ensures Dec 29 local is sent as '2025-12-29T00:00:00.000Z'
      const formatDateForBackend = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00.000Z`;
      };
      
      const checkInISO = formatDateForBackend(checkInDate);
      const checkOutISO = formatDateForBackend(checkOutDate);
      
      console.log('📅 Date validation:', {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        checkInLocal: checkInDate.toLocaleDateString('en-CA'),
        checkOutLocal: checkOutDate.toLocaleDateString('en-CA'),
        checkInISO: checkInISO,
        checkOutISO: checkOutISO,
        checkInType: typeof bookingData.checkIn,
        checkOutType: typeof bookingData.checkOut,
        checkInIsDate: bookingData.checkIn instanceof Date,
        checkOutIsDate: bookingData.checkOut instanceof Date
      });

      // New flow: Process payment and create booking in one call
      const bookingPayload = {
        propertyId: id,
        checkIn: checkInISO,
        checkOut: checkOutISO,
        guests: bookingData.guests,
        specialRequests: bookingData.specialRequests,
        contactInfo: bookingData.contactInfo,
        paymentMethod: bookingData.paymentMethod || 'card', // Use selected payment method
        // Razorpay payment data
        ...(paymentData && {
          paymentData: {
            razorpayOrderId: paymentData.razorpayOrderId,
            razorpayPaymentId: paymentData.razorpayPaymentId,
            razorpaySignature: paymentData.razorpaySignature,
            razorpayPaymentDetails: paymentData.razorpayPaymentDetails
          }
        }),
        // NEW: Include custom check-in time for 23-hour checkout calculation
        ...(bookingData.checkInTime && { checkInTime: bookingData.checkInTime }),
        ...(bookingData.couponCode && bookingData.couponCode.trim() && { couponCode: bookingData.couponCode.trim() }),
        ...(bookingData.hourlyExtension && bookingData.hourlyExtension > 0 && property?.hourlyBooking?.enabled && { 
          hourlyExtension: {
            hours: bookingData.hourlyExtension,
            rate: property?.hourlyBooking?.hourlyRates?.[`${bookingData.hourlyExtension === 6 ? 'six' : bookingData.hourlyExtension === 12 ? 'twelve' : 'eighteen'}Hours`] || 0,
            totalHours: bookingData.hourlyExtension
          }
        }),
        // Include pricing token for backend validation (prevents price manipulation)
        ...(priceBreakdown?.pricingToken && { pricingToken: priceBreakdown.pricingToken }),
        // Do not include extra 24-hour specific fields; backend infers from dates and hourlyExtension
      };

      console.log('🚀 Processing payment and creating booking with payload:', bookingPayload);
      console.log('💰 Current price breakdown:', priceBreakdown);
      console.log('🔒 Pricing token being sent:', priceBreakdown?.pricingToken ? priceBreakdown.pricingToken.substring(0, 8) + '...' : 'NONE');
      console.log('🕐 DEBUG - bookingData.checkInTime:', bookingData.checkInTime);
      console.log('🕐 DEBUG - payload checkInTime:', bookingPayload.checkInTime);
      console.log('📅 Blocked dates to confirm:', blockedDates);
      console.log('🏠 Property ID:', id);
      console.log('🔐 Authentication status:', { isAuthenticated, userId: user?._id, userEmail: user?.email });
      
      const response = await apiClient.processPaymentAndCreateBooking(bookingPayload);
      
      console.log('📋 Backend response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ Payment processed and booking created successfully:', response.data);
        console.log('📋 Booking ID from response:', response.data.bookingDoc._id);
        
        // NOTE: confirmBooking is no longer needed here
        // The backend's processPaymentAndCreateBooking already updates dates from 'blocked' to 'booked'
        console.log('✅ Availability already confirmed by backend during payment processing');

        // Extract booking ID for redirect
        const bookingId = response.data.bookingDoc._id;
        
        // Set redirecting flag to prevent conflicting useEffect
        setIsRedirecting(true);
        
        // Clear blocked dates state since they're now booked
        setBlockedDates([]);
        setBlockingExpiry(null);
        
        // Clear any errors before redirecting
        setBookingError('');
        setValidationErrors({});
        
        // Redirect to specific booking details page with success parameter
        router.push(`/bookings/${bookingId}?success=true`);
        
        // Clear booking context data after redirect is initiated
        clearBookingData();
      } else {
        // Extract detailed error message from response
        const errorMessage = response.message || response.error || 'Failed to process payment and create booking';
        const errorDetails = response.errors ? JSON.stringify(response.errors) : '';
        throw new Error(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Error in handlePaymentSuccess:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        errors: error.errors,
        response: error.response,
        fullError: JSON.stringify(error, null, 2)
      });
      
      // Extract error message properly
      let errorMessage = 'Failed to process payment and create booking';
      let errorDetails: string[] = [];
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.message) {
        errorMessage = error.response.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Extract error details
      if (Array.isArray(error.errors)) {
        errorDetails = error.errors;
      } else if (Array.isArray(error.response?.errors)) {
        errorDetails = error.response.errors;
      } else if (error.errors && typeof error.errors === 'object') {
        errorDetails = Object.values(error.errors).map(e => String(e));
      } else if (error.response?.errors && typeof error.response.errors === 'object') {
        errorDetails = Object.values(error.response.errors).map(e => String(e));
      }
      
      // Format final error message
      const finalErrorMessage = errorDetails.length > 0 
        ? `${errorMessage}: ${errorDetails.join(', ')}`
        : errorMessage;
      
      console.error('❌ Final error message:', finalErrorMessage);
      setBookingError(finalErrorMessage);
      
      // IMPORTANT: Payment succeeded, so don't revert dates immediately
      // The payment was successful, so dates should remain blocked
      // If booking creation failed, admin will need to process refund manually
      // Extend blocking expiry to give time for resolution
      console.log('⚠️ Payment succeeded but booking creation failed. Dates remain blocked.');
      if (blockingExpiry) {
        const extendedExpiry = new Date(Date.now() + 30 * 60 * 1000); // Extend to 30 minutes
        setBlockingExpiry(extendedExpiry);
        console.log('⏰ Extended blocking expiry due to booking creation failure:', extendedExpiry);
      }
      // Don't revert dates - payment was successful, need manual intervention
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
  }, [bookingData.checkIn, bookingData.checkOut, bookingData.hourlyExtension,bookingData.guests , property, couponData]);

  // Clear availability state and invalidate old pricing token when dates or extension change
  useEffect(() => {
    setBookingError('');
    setAvailability([]);
    
    // Clear pricing token when dates/extension change to force fresh price calculation
    // This ensures we don't use stale pricing tokens from previous date selections
    setPriceBreakdown(prev => ({
      ...prev,
      pricingToken: undefined, // Invalidate old token
      total: 0 // Reset total to show loading state
    }));
    
    // Note: Price updates immediately when dates/guests change (via getSecurePricing useEffect)
    // Availability is checked ONLY when user clicks "Book" button (in handleBooking function)
    // This allows users to see prices even if dates might not be available,
    // but prevents booking if dates are not available
  }, [bookingData.checkIn, bookingData.checkOut, bookingData.hourlyExtension]);

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

// helper function for pending details add bottom sheet
  const isContactInfoValid = () => {
  return (
    bookingData.contactInfo.name.trim() &&
    bookingData.contactInfo.email.trim() &&
    bookingData.contactInfo.phone.trim()
  );
};


  // Show loading while checking authentication or loading property
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Header hideSearchBar={true} />
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
        <Header hideSearchBar={true} />
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
      {/* <Header hideSearchBar={true} /> */}
       {/* <Header /> */}
       <UserHeader/>
      
      {/* Main Content */}
      <main className={`${hideHeader ? "pt-0 sm:pt-24" : "pt-40"} pb-12 overflow-x-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-8 hidden lg:block">
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
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4 md:p-8 mt-14 md:mt-5">
                {/* Property Header */}
                <div className="mb-8">
                  {/* <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">
                        Complete your booking
                      </h1>
                      <p className="text-gray-600">Secure your perfect stay</p>
                    </div>
                  </div> */}
                 <div className="flex items-center justify-between w-full mb-6 gap-4">
  {/* Icon Container - Fixed at the start */}
  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
  </div>

  {/* Text Container - Aligned to the end */}
  <div className="text-right">
    <h1 className="text-lg sm:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent leading-tight whitespace-nowrap">
      Complete your booking
    </h1>
    <p className="text-xs sm:text-base text-gray-600 whitespace-nowrap">
      Secure your perfect stay
    </p>
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
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl sm:rounded-3xl p-3 md:p-8 border border-indigo-200 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-24 sm:w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm  sm:text-2xl font-bold text-gray-900">Complete Your Booking</h2>
                      <p className="text-gray-600 text-sm sm:text-base">Just a few more details to secure your stay</p>
                    </div>
                  </div>
                  
                  {/* Selected Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-6 border border-indigo-100">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-gray-900">Selected Dates</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm whitespace-nowrap sm:text-base">Check-in : </span>
                          <span className="font-semibold text-gray-900 text-sm whitespace-nowrap sm:text-base">
                            {bookingData.checkIn.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                            {(() => {
                              const checkInTime = bookingData.checkInTime || property?.checkInTime || '15:00';
                              const [hours, minutes] = checkInTime.split(':').map(Number);
                              const time = new Date();
                              time.setHours(hours, minutes, 0);
                              return `, ${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm whitespace-nowrap sm:text-base">Check-out :</span>
                          <span className="font-semibold text-gray-900 text-sm  sm:text-base whitespace-nowrap">
                            {bookingData.checkOut.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}

                          {(() => {
                              const checkInTime = bookingData.checkInTime || property?.checkInTime || '15:00';
                              const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
                              // Checkout = check-in time - 1 hour + extension
                              let checkoutHours = checkInHours - 1;
                              if (checkoutHours < 0) checkoutHours = 23;
                              if (bookingData.hourlyExtension) {
                                checkoutHours = (checkoutHours + bookingData.hourlyExtension) % 24;
                              }
                              const time = new Date();
                              time.setHours(checkoutHours, checkInMinutes, 0);
                              return `,  ${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
                            })()}

                           


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
                    
                    <div className="bg-white rounded-xl sm:rounded-2xl  p-2 sm:p6 border border-indigo-100">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-gray-900 text-sm whitespace-nowrap sm:text-base">Guests</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm whitespace-nowrap sm:text-base">Adults:</span>
                          <span className="font-semibold text-gray-900 text-sm whitespace-nowrap sm:text-base">{bookingData.guests.adults}</span>
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
                  <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-6 ">
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
                          onChange={(e) => {
                            // Parse date string to LOCAL midnight (not UTC)
                            // new Date('YYYY-MM-DD') creates UTC midnight which shifts by 1 day in IST
                            const [year, month, day] = e.target.value.split('-').map(Number);
                            const localDate = new Date(year, month - 1, day); // Creates LOCAL midnight
                            updateLocalBookingData({ checkIn: localDate });
                          }}
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
                        <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                          <Clock3 className="w-4 h-4" />
                          <span>
                            {(() => {
                              const checkInTime = bookingData.checkInTime || property?.checkInTime || '15:00';
                              const [hours, minutes] = checkInTime.split(':').map(Number);
                              const time = new Date();
                              time.setHours(hours, minutes, 0);
                              return `Check-in time: ${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
                            })()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Check-out <span className="text-red-500"></span>
                        </label>
                        <input
                          type="date"
                          value={(() => {
                            const year = bookingData.checkOut.getFullYear();
                            const month = String(bookingData.checkOut.getMonth() + 1).padStart(2, '0');
                            const day = String(bookingData.checkOut.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          })()}
                          onChange={(e) => {
                            // Parse date string to LOCAL midnight (not UTC)
                            // new Date('YYYY-MM-DD') creates UTC midnight which shifts by 1 day in IST
                            const [year, month, day] = e.target.value.split('-').map(Number);
                            const localDate = new Date(year, month - 1, day); // Creates LOCAL midnight
                            updateLocalBookingData({ checkOut: localDate });
                          }}
                          min={(() => {
                            const year = bookingData.checkIn.getFullYear();
                            const month = String(bookingData.checkIn.getMonth() + 1).padStart(2, '0');
                            const day = String(bookingData.checkIn.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          })()}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-lg font-medium bg-white text-gray-900 shadow-sm"
                          style={{ color: '#111827' }}
                        />
                        <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                          <Clock3 className="w-4 h-4" />
                          <span>
                            {(() => {
                              const checkInTime = bookingData.checkInTime || property?.checkInTime || '15:00';
                              const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
                              // Checkout = check-in time - 1 hour + extension
                              let checkoutHours = checkInHours - 1;
                              if (checkoutHours < 0) checkoutHours = 23;
                              if (bookingData.hourlyExtension) {
                                checkoutHours = (checkoutHours + bookingData.hourlyExtension) % 24;
                              }
                              const time = new Date();
                              time.setHours(checkoutHours, checkInMinutes, 0);
                              return `Check-out time: ${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
                            })()}
                          </span>
                        </div>
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
                  <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-6">
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
  <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
    {/* <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex flex-wrap items-center gap-2">
      <Clock className="w-5 h-5 text-gray-500" />
      <span className="whitespace-nowrap">Hourly Booking Extension</span>
      <span className="text-gray-500 text-xs font-normal">(Optional)</span>
      {bookingData.hourlyExtension && (
        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-[10px] md:text-xs font-medium rounded-full">
          Pre-selected
        </span>
      )}
    </h3> */}
<h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
  {/* Icon and Title Group */}
  <div className="flex items-center gap-2">
    <Clock className="w-5 h-5 text-gray-500 shrink-0" />
    <span className="whitespace-nowrap">Hourly Extension</span>
  </div>

  {/* Badges Group - Will wrap together if space is tight */}
  <div className="flex items-center gap-2">
    <span className="text-gray-500 text-xs font-normal whitespace-nowrap">
      (Optional)
    </span>
    {bookingData.hourlyExtension && (
      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full whitespace-nowrap">
        Selected
      </span>
    )}
  </div>
</h3>
    <div className="space-y-4">
      <p className="text-xs md:text-sm text-gray-600">
        Extend your checkout time for additional hours at a discounted rate.
      </p>

      {/* Grid: Always 3 columns on mobile and desktop */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {[
          { hours: 6, rate: property.hourlyBooking?.hourlyRates?.sixHours || 0.3, label: '6 Hours', shortLabel: '6H' },
          { hours: 12, rate: property.hourlyBooking?.hourlyRates?.twelveHours || 0.6, label: '12 Hours', shortLabel: '12H' },
          { hours: 18, rate: property.hourlyBooking?.hourlyRates?.eighteenHours || 0.75, label: '18 Hours', shortLabel: '18H' }
        ].map((option) => (
          <div
            key={option.hours}
            className={`p-2 md:p-4 border-2 rounded-xl cursor-pointer transition-all text-center flex flex-col justify-center ${
              bookingData.hourlyExtension === option.hours
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 md:border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              const newExtension = bookingData.hourlyExtension === option.hours ? null : option.hours;
              updateLocalBookingData({ hourlyExtension: newExtension });
            }}
          >
            {/* Label: Short on mobile, Full on desktop */}
            <div className="font-bold text-gray-900 text-sm md:text-base">
              <span className="md:hidden">{option.shortLabel}</span>
              <span className="hidden md:inline">{option.label}</span>
            </div>

            {/* Discount Rate: Always visible */}
            <div className="text-[10px] md:text-sm text-gray-600 font-medium">
              {Math.round(option.rate * 100)}% <span className="hidden md:inline">of daily rate</span>
            </div>

            {/* Time: Hidden on mobile buttons, visible on desktop */}
            <div className="hidden md:block text-xs text-gray-500 mt-1">
              {(() => {
                if (!bookingData.checkOut) return '...';
                const [hours, minutes] = (property?.checkOutTime || '11:00').split(':').map(Number);
                const baseCheckout = new Date(bookingData.checkOut);
                baseCheckout.setHours(hours, minutes, 0, 0);
                const newCheckout = new Date(baseCheckout);
                newCheckout.setHours(newCheckout.getHours() + option.hours);
                return newCheckout.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              })()}
            </div>
          </div>
        ))}
      </div>

      {/* Selection Details: Shows the discount and new time clearly on mobile when selected */}
      {bookingData.hourlyExtension && (
        <div className="mt-4 p-2 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h4 className="font-semibold text-blue-900 text-sm md:text-base">Extension Selected</h4>
          </div>
          <div className="text-xs md:text-sm text-blue-700 space-y-1">
            <div className="flex justify-between">
              <span>Extension:</span>
              <span className="font-medium">{bookingData.hourlyExtension} hours</span>
            </div>
            <div className="flex justify-between">
              <span>Discounted Rate:</span>
              <span className="font-medium">
                {Math.round((property.hourlyBooking?.hourlyRates?.[`${bookingData.hourlyExtension === 6 ? 'six' : bookingData.hourlyExtension === 12 ? 'twelve' : 'eighteen'}Hours`] || 0) * 100)}% of daily
              </span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
              <span>New checkout time:</span>
              <span className="font-bold">
                {(() => {
                  if (!bookingData.checkOut) return '...';
                  const [hours, minutes] = (property?.checkOutTime || '11:00').split(':').map(Number);
                  const baseCheckout = new Date(bookingData.checkOut);
                  baseCheckout.setHours(hours, minutes, 0, 0);
                  const newCheckout = new Date(baseCheckout);
                  newCheckout.setHours(newCheckout.getHours() + bookingData.hourlyExtension);
                  return newCheckout.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
                  <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-6">
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
                  <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                        <p className="text-sm text-gray-600">Choose your preferred payment method</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { value: 'card', label: 'Credit/Debit Card', icon: '💳', color: 'blue' },
                        { value: 'razorpay', label: 'Razorpay', icon: '💳', color: 'indigo' },
                        { value: 'upi', label: 'UPI', icon: '📱', color: 'green' },
                        { value: 'net_banking', label: 'Net Banking', icon: '🏦', color: 'gray' }
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
                          <div className="font-medium text-gray-800 text-sm">Secure Payment via Razorpay</div>
                          <div className="text-gray-600 text-xs mt-1">
                            All payment methods are processed securely through Razorpay. You'll enter payment details in the secure checkout window.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="hidden md:bg-white border border-gray-200 rounded-lg p-6">
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
                  <div className="bg-white border border-gray-200 rounded-lg p-2 md:p-6">
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
                  <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-6">
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

                {/* Terms & Conditions - Mobile only */}
                <div className="block md:hidden mb-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={bookingData.agreeToTerms}
                        onChange={(e) => {
                          updateLocalBookingData({ agreeToTerms: e.target.checked });
                          if (validationErrors.agreeToTerms) {
                            setValidationErrors(prev => ({ ...prev, agreeToTerms: false }));
                          }
                        }}
                        className={`w-5 h-5 mt-1 rounded border ${
                          validationErrors.agreeToTerms 
                            ? 'border-red-500 ring-2 ring-red-200' 
                            : 'border-gray-300'
                        }`}
                      />
                      <div className="text-xs text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">
                          I agree to the{' '}
                          <a href="#" className="underline">Terms</a> and{' '}
                          <a href="#" className="underline">Privacy Policy</a>.
                        </span>
                      </div>
                    </div>
                  </div>
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
                    // console.log('🖱️ Booking data',bookingData);
                    // console.log('🖱️ Button disabled state:', !bookingData.agreeToTerms || bookingLoading || availabilityLoading);
                    // console.log('🖱️ agreeToTerms:', bookingData.agreeToTerms);
                    // console.log('🖱️ bookingLoading:', bookingLoading);
                    // console.log('🖱️ availabilityLoading:', availabilityLoading);
                    // console.log('🖱️ isAuthenticated:', isAuthenticated);
                    console.log('🖱️ user:', user);
                    console.log('🖱️ bookingData:', bookingData);
                    // console.log('🖱️ property:', property);
                    // console.log('🖱️ priceBreakdown:', priceBreakdown);
                    console.log('🖱️ validationErrors:', validationErrors);
                    // console.log('🖱️ bookingError:', bookingError);
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

      {showContactSheet && (
        
  <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:hidden">
    <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Contact Information</h3>
        <button onClick={() => setShowContactSheet(false)}>
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Reuse same fields */}
      <div className="space-y-4">
        <input
          placeholder="Full Name"
          value={bookingData.contactInfo.name}
          onChange={(e) =>
            updateLocalBookingData({
              contactInfo: { ...bookingData.contactInfo, name: e.target.value }
            })
          }
          className="w-full px-4 py-3 border rounded-xl"
        />

        <input
          placeholder="Email"
          value={bookingData.contactInfo.email}
          onChange={(e) =>
            updateLocalBookingData({
              contactInfo: { ...bookingData.contactInfo, email: e.target.value }
            })
          }
          className="w-full px-4 py-3 border rounded-xl"
        />

        <input
          placeholder="Phone"
          value={bookingData.contactInfo.phone}
          onChange={(e) =>
            updateLocalBookingData({
              contactInfo: { ...bookingData.contactInfo, phone: e.target.value }
            })
          }
          className="w-full px-4 py-3 border rounded-xl"
        />
      </div>

      <Button
        className="w-full mt-6 bg-gray-800 text-white"
        onClick={() => {
          if (isContactInfoValid()) {
            setShowContactSheet(false);
            handleBooking();
          }
        }}
      >
        Continue Booking
      </Button>
    </div>
  </div>
)}


      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          // If payment modal is closed without payment, keep the expiry timer running
          // User can still complete payment within the remaining time
          setShowPaymentModal(false);
        }}
        onSuccess={handlePaymentSuccess}
        amount={priceBreakdown?.total || 0}
        loading={bookingLoading}
        bookingId={null}
        propertyId={id as string}
        user={user}
      />
    </div>
  );
} 