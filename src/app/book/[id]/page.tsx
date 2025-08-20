"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { apiClient } from "@/infrastructure/api/clients/api-client";
import { useAuth } from "@/core/store/auth-context";
import { User as UserType } from "@/shared/types";
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
  Gift
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-lg font-mono"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
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
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<any[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [blockingTimer, setBlockingTimer] = useState<NodeJS.Timeout | null>(null);
  const [blockingExpiry, setBlockingExpiry] = useState<Date | null>(null);

  
  // Booking state
  const [bookingData, setBookingData] = useState({
    checkIn: searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : new Date(),
    checkOut: searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : new Date(Date.now() + 24 * 60 * 60 * 1000),
    guests: {
      adults: parseInt(searchParams.get('guests') || '1'),
      children: 0,
      infants: 0
    },
    specialRequests: searchParams.get('specialRequests') || '',
    contactInfo: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || ''
    },
    paymentMethod: 'card',
    couponCode: '',
    agreeToTerms: false
  });
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState({
    basePrice: 0,
    serviceFee: 0,
    taxes: 0,
    total: 0,
    nights: 0
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

  // Initial availability fetch
  useEffect(() => {
    if (!id) return;
    refreshAvailabilityData();
  }, [id]);

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

  // Block dates when user arrives on booking page
  useEffect(() => {
    console.log('🔍 Date blocking useEffect triggered');
    console.log('🔍 Current state:', {
      id,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      isAuthenticated,
      user: getUserId(user),
      isLoading,
      userObject: user
    });
    
    // Force trigger when component mounts and user is authenticated
    if (isAuthenticated && getUserId(user) && id && bookingData.checkIn && bookingData.checkOut) {
      console.log('🚀 Force triggering date blocking on mount...');
    }
    
    if (!id || !bookingData.checkIn || !bookingData.checkOut) {
      console.log('❌ Missing required data for blocking:', { id, checkIn: bookingData.checkIn, checkOut: bookingData.checkOut });
      return;
    }
    
    // Don't proceed if still loading authentication
    if (isLoading) {
      console.log('⏳ Still loading authentication, waiting...');
      return;
    }
    
    // Check if user is authenticated AND user object exists before blocking dates
    if (!isAuthenticated || !user || !getUserId(user)) {
      setBookingError('Please log in to continue with your booking.');
      return;
    }
    
    // Clear any auth errors since user is authenticated
    if (bookingError === 'Please log in to continue with your booking.') {
      setBookingError('');
    }
    
    const blockDatesForBooking = async () => {
      try {
        setAvailabilityLoading(true);
        
        // Block all dates in the selected range
        const startDate = new Date(bookingData.checkIn);
        const endDate = new Date(bookingData.checkOut);
        let currentDate = new Date(startDate);
        const datesToBlock: string[] = [];
        
        while (currentDate < endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          datesToBlock.push(dateStr);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        try {
          // Block all dates at once using the new endpoint
          const response = await apiClient.blockDatesForBooking(id as string, datesToBlock);
        } catch (error) {
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
          revertBlockedDates();
        }, 15 * 60 * 1000);
        
        setBlockingTimer(timer);
        
      } catch (error) {
        setBookingError('Failed to reserve dates. Please try again.');
      } finally {
        setAvailabilityLoading(false);
      }
    };
    
    blockDatesForBooking();
    
    // Cleanup function to clear timer and revert dates if component unmounts
    return () => {
      console.log('🔄 useEffect cleanup running - user is leaving the page');
      if (blockingTimer) {
        clearTimeout(blockingTimer);
        console.log('⏰ Timer cleared');
      }
      // If user leaves the page without completing payment, revert the blocked dates
      if (blockedDates.length > 0) {
        console.log('📅 Releasing blocked dates:', blockedDates);
        // Use a synchronous cleanup to avoid async issues
        releaseDatesOnUnmount(blockedDates);
      }
    };
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
        console.log('Checking availability for dates:', bookingData.checkIn.toISOString().split('T')[0], 'to', bookingData.checkOut.toISOString().split('T')[0]);
        
        // Check if all selected dates are available
        const startDate = new Date(bookingData.checkIn);
        const endDate = new Date(bookingData.checkOut);
        let currentDate = new Date(startDate);
        
        while (currentDate < endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          
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

  // Calculate price breakdown
  const calculatePrice = () => {
    if (!property) return;
    
    const nights = Math.ceil((bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = (property.pricing?.basePrice || 0) * nights;
    const serviceFee = basePrice * 0.12; // 12% service fee
    const taxes = basePrice * 0.05; // 5% taxes
    const total = basePrice + serviceFee + taxes;
    
    setPriceBreakdown({
      basePrice,
      serviceFee,
      taxes,
      total,
      nights
    });
  };

  // Update booking data and recalculate price
  const updateBookingData = (updates: any) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!bookingData.agreeToTerms) {
      setBookingError('Please agree to the terms and conditions');
      return;
    }

    // Check availability before proceeding
    const isAvailable = await checkAvailability();
    if (!isAvailable) {
      return;
    }

    setShowPaymentModal(true);
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
      
      // Step 1: Create the actual booking first
      const bookingPayload = {
        propertyId: id,
        checkIn: bookingData.checkIn.toISOString(),
        checkOut: bookingData.checkOut.toISOString(),
        guests: bookingData.guests.adults + bookingData.guests.children + bookingData.guests.infants,
        specialRequests: bookingData.specialRequests,
        contactInfo: bookingData.contactInfo,
        paymentMethod: bookingData.paymentMethod,
        ...(bookingData.couponCode && bookingData.couponCode.trim() && { couponCode: bookingData.couponCode.trim() })
      };

      console.log('🚀 Creating booking with payload:', bookingPayload);
      console.log('📅 Blocked dates to confirm:', blockedDates);
      console.log('🏠 Property ID:', id);
      
      const response = await apiClient.createBooking(bookingPayload);
      
      if (response.success) {
        console.log('✅ Booking created successfully:', response.data);
        console.log('📋 Booking ID from response:', response.data._id);
        
        // Step 2: Now confirm the availability with the booking ID
        try {
          console.log('🔐 Confirming availability for dates:', blockedDates);
          console.log('📋 Using booking ID:', response.data._id);
          
          await apiClient.confirmBooking(id as string, blockedDates, response.data._id);
          console.log('✅ Successfully confirmed availability for all dates');
        } catch (error) {
          console.error('❌ Failed to confirm availability:', error);
          // Even if availability confirmation fails, the booking is still created
          // We can handle this separately if needed
        }

        // Clear blocked dates state since they're now booked
        setBlockedDates([]);
        setBlockingExpiry(null);
        
        // Show success message and redirect
        router.push('/bookings?success=true');
      } else {
        throw new Error(response.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('❌ Error in handlePaymentSuccess:', error);
      setBookingError(error.message || 'Failed to create booking');
      
      // If booking fails, revert blocked dates back to available
      await revertBlockedDates();
    } finally {
      setBookingLoading(false);
    }
  };

  // Calculate price when booking data changes
  useEffect(() => {
    calculatePrice();
  }, [bookingData.checkIn, bookingData.checkOut, property]);

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

                {/* Booking Form */}
                <div className="space-y-8">
                  {/* Dates Selection */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      Select dates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
                        <input
                          type="date"
                          value={bookingData.checkIn.toISOString().split('T')[0]}
                          onChange={(e) => updateBookingData({ checkIn: new Date(e.target.value) })}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-lg font-medium bg-white text-gray-900 shadow-sm"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
                        <input
                          type="date"
                          value={bookingData.checkOut.toISOString().split('T')[0]}
                          onChange={(e) => updateBookingData({ checkOut: new Date(e.target.value) })}
                          min={bookingData.checkIn.toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-lg font-medium bg-white text-gray-900 shadow-sm"
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
                            let currentDate = new Date(startDate);
                            
                            while (currentDate < endDate) {
                              const dateStr = currentDate.toISOString().split('T')[0];
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
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      Guests
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                        <div>
                          <div className="font-bold text-gray-900">Adults</div>
                          <div className="text-sm text-gray-600">Ages 13 or above</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateBookingData({
                              guests: { ...bookingData.guests, adults: Math.max(1, bookingData.guests.adults - 1) }
                            })}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-bold text-lg">{bookingData.guests.adults}</span>
                          <button
                            onClick={() => updateBookingData({
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
                            onClick={() => updateBookingData({
                              guests: { ...bookingData.guests, children: Math.max(0, bookingData.guests.children - 1) }
                            })}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-bold text-lg">{bookingData.guests.children}</span>
                          <button
                            onClick={() => updateBookingData({
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
                            onClick={() => updateBookingData({
                              guests: { ...bookingData.guests, infants: Math.max(0, bookingData.guests.infants - 1) }
                            })}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-bold text-lg">{bookingData.guests.infants}</span>
                          <button
                            onClick={() => updateBookingData({
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

                  {/* Contact Information */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-600" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={bookingData.contactInfo.name}
                          onChange={(e) => updateBookingData({
                            contactInfo: { ...bookingData.contactInfo, name: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white text-gray-900 font-medium placeholder-gray-500 shadow-sm"
                          style={{ color: '#111827' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={bookingData.contactInfo.email}
                          onChange={(e) => updateBookingData({
                            contactInfo: { ...bookingData.contactInfo, email: e.target.value }
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white text-gray-900 font-medium placeholder-gray-500 shadow-sm"
                          style={{ color: '#111827' }}
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={bookingData.contactInfo.phone}
                        onChange={(e) => updateBookingData({
                          contactInfo: { ...bookingData.contactInfo, phone: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white text-gray-900 font-medium placeholder-gray-500 shadow-sm"
                        style={{ color: '#111827' }}
                      />
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-gray-600" />
                      Special Requests (Optional)
                    </h3>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => updateBookingData({ specialRequests: e.target.value })}
                      placeholder="Any special requests or requirements..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white text-gray-900 font-medium placeholder-gray-500 resize-none shadow-sm"
                      style={{ color: '#111827' }}
                    />
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookingData.agreeToTerms}
                        onChange={(e) => updateBookingData({ agreeToTerms: e.target.checked })}
                        className="mt-1 rounded border-gray-300 text-gray-600 focus:ring-gray-500 w-5 h-5"
                      />
                      <div className="text-sm text-gray-700 font-medium">
                        I agree to the{' '}
                        <a href="#" className="text-gray-600 hover:text-gray-700 underline font-semibold">
                          Terms and Conditions
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-gray-600 hover:text-gray-700 underline font-semibold">
                          Privacy Policy
                        </a>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Booking Summary</h3>
                </div>
                
                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">
                      ₹{property.pricing?.basePrice?.toLocaleString()} × {priceBreakdown.nights} nights
                    </span>
                    <span className="font-bold text-gray-900">{formatPrice(priceBreakdown.basePrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Service fee</span>
                    <span className="font-bold text-gray-900">{formatPrice(priceBreakdown.serviceFee)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Taxes</span>
                    <span className="font-bold text-gray-900">{formatPrice(priceBreakdown.taxes)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">{formatPrice(priceBreakdown.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Error Message - Only show for non-authenticated users */}
                {bookingError && !isAuthenticated && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-600 font-medium">{bookingError}</p>
                    </div>
                  </div>
                )}



                {/* Book Now Button */}
                <Button
                  onClick={handleBooking}
                  disabled={!bookingData.agreeToTerms || bookingLoading || availabilityLoading}
                  className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Book Now
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4 font-medium">
                  You won't be charged yet
                </p>
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