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


export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user, isAuthenticated, isLoading } = useAuth();


   

  //  state 
   const [property, setProperty] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
  
   
  //  booking states
   const [bookingLoading, setBookingLoading] = useState(false);
   const { bookingData: contextBookingData, clearBookingData } = useBooking();
   const [bookingError, setBookingError] = useState('');

  //  validation Error states
   const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});

  // Availibiity States
  const [availability, setAvailability] = useState<any[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  //  Blocking States
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [blockingTimer, setBlockingTimer] = useState<NodeJS.Timeout | null>(null);
  const [blockingExpiry, setBlockingExpiry] = useState<Date | null>(null);


  //  coupon states
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  //  redirect states
  const [isRedirecting, setIsRedirecting] = useState(false);



  // // Redirect unauthenticated users to login
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

    //  fetching listing details

     useEffect(() => {
        
        if (!id) return;
        setLoading(true);
        apiClient.getListing(id as string)
          .then((res: any) => {
            console.log("listing",res.data?.listing)
            setProperty(res.data?.listing || null);
            setError("");
          })
          .catch(() => setError("Property not found"))
          .finally(() => setLoading(false));
      }, [id]);


    // price breakdown state intial value
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
      

        // Initial availability fetch
        useEffect(() => {
          if (!id) return;
          refreshAvailabilityData();
        }, [id]);

        // helper functions
        const normalizeDate = (d: Date) =>
  d.toISOString().split('T')[0];

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
      if (dateAvailability && dateAvailability.status === 'available' || dateAvailability.status === 'partial-available') {
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
        a.status === 'available' || a.status === "partially-available"
      );
    });
    console.log("isAvailable",isAvailable)

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

    



  //  intialization of booking data
   const [bookingData, setBookingData] = useState(() => {
      if (contextBookingData && contextBookingData.propertyId === id) {
        return {
          checkIn: contextBookingData.startDate,
          checkOut: contextBookingData.endDate ? contextBookingData.endDate : new Date(Date.now() + 24 * 60 * 60 * 1000),
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
          // checkInDateTime: contextBookingData.checkInDateTime,
          // extensionHours: contextBookingData.extensionHours,
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


      // price formate
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };



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
          <Header hideSearchBar={true} />
          
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
                                {(() => {
                                  console.log("bookingData.checkIn",bookingData.checkInTime)
                                  const checkInTime = bookingData.checkInTime || property?.checkInTime || '15:00';
                                  const [hours, minutes] = checkInTime.split(':').map(Number);
                                  const time = new Date();
                                  time.setHours(hours, minutes, 0);
                                  return `, ${time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
                                })()}
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
                        console.log('🖱️ Booking data',bookingData);
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
                        // handleBooking();
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
          {/* <PaymentModal
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
          /> */}
        </div>
      );
}
