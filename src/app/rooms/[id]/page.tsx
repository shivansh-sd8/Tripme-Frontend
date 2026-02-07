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
import { securePricingAPI } from "@/infrastructure/api/securePricing-api";
import { formatCurrency } from "@/shared/constants/pricing.constants";
import { addDays, format, differenceInDays } from 'date-fns';
import { createPortal } from 'react-dom';
import PropertyAvailabilityCalendar from "@/components/rooms/PropertyAvailabilityCalendar";
import dynamic from 'next/dynamic';
import Link from "next/link";
import ImageGallery from "@/components/rooms/gallery/ImageGallery";
import { ReviewsSection } from "@/components/rooms/reviews";
import HostCard from "@/components/rooms/host-section/hostCard";
import MobileBookingBar from "@/components/booking/MobileBookingBar";
import { ShareOption } from "@/components/shared/SharedProperty";
// Dynamically import PropertyMap to avoid SSR issues with Google Maps
const PropertyMap = dynamic(() => import("@/components/rooms/PropertyMap"), { 
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});
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
  Receipt,
  // Link
} from "lucide-react";
import { useUI } from "@/core/store/uiContext";
import { TimeStepper } from "@/components/booking/TimeStepper";
import { TimeSpinner } from "@/components/rooms/timeSelection/TimeSpinner";


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
  const { setHideBottomNav ,setHideHeader} = useUI();
  const { hideHeader } = useUI();
  const [timeConfirmed, setTimeConfirmed] = useState(false);
  

const [calendarAnchor, setCalendarAnchor] =
  useState<'checkin' | 'checkout'>('checkin');

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  
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
  const [showExtras, setShowExtras] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showWishlistPicker, setShowWishlistPicker] = useState(false);
 
  // const [listName, setListName] = useState('');
const [selectedStay, setSelectedStay] = useState<string | null>(null);
const [wishlists, setWishlists] = useState<any[]>([]);
const [favorites, setFavorites] = useState<Set<string>>(new Set());
const [wishlistName, setWishlistName] = useState('');

  
  // Hourly booking state
  const [hourlyExtension, setHourlyExtension] = useState<number | null>(() => {
    return bookingData?.hourlyExtension || null;
  });
  // 24-hour mode check-in time selector
  const [checkInTimeStr, setCheckInTimeStr] = useState<string>(property?.checkInTime || '15:00');
  const [hourlyPricing, setHourlyPricing] = useState<any>(null);
  const [specialRequests, setSpecialRequests] = useState(() => {
    return bookingData?.specialRequests || '';
  });
  // Platform fee rate is now handled by backend
  
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

  if (bookingData.checkInTime) {
    setCheckInTimeStr(bookingData.checkInTime);
  }
      
      if (bookingData.specialRequests) {
        setSpecialRequests(bookingData.specialRequests);
      }
    }
  }, [bookingData]);

  // Debug dateRange changes
  useEffect(() => {
    console.log('📅 dateRange state changed:', {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      key: dateRange.key
    });
  }, [dateRange]);

  useEffect(() => {
  setHideBottomNav(true);
  setHideHeader(true);

  return () => {
    setHideBottomNav(false);
    setHideHeader(false);
  };
}, []);


  // Fetch current platform fee rate immediately
  // Platform fee rate is now handled by backend API

  // Update priceBreakdown when pricing calculation changes
  useEffect(() => {
    console.log('🔄 useEffect dependency change detected:', {
      property: !!property,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      guests,
      hourlyExtension
    });
    console.log('🔄 useEffect triggered at:', new Date().toISOString());
    
    const updatePricing = async () => {
      console.log('🔄 Pricing useEffect triggered', { 
        property: !!property, 
        startDate: !!dateRange.startDate, 
        endDate: !!dateRange.endDate,
        guests,
        hourlyExtension
      });
      
      if (!property || !dateRange.startDate || !dateRange.endDate) {
        console.log('⏳ Waiting for required data to load...');
        return;
      }
      
      console.log('🚀 Calling secure pricing API...');
      const pricing = await getSecurePricing();
      
      if (!pricing) {
        console.log('❌ No pricing data returned from secure pricing API');
        return;
      }
      
      console.log('💰 Pricing data received:', pricing);
      
      const newPriceBreakdown = {
        basePrice: property?.pricing?.basePrice || 0, // Fixed: use actual price per night, not total base amount
        baseAmount: pricing.baseAmount, // Backend calculated base amount
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
      console.log('🔍 NIGHTS IN STATE:', newPriceBreakdown.nights);
      console.log('🔍 TOTAL IN STATE:', newPriceBreakdown.total);
      setPriceBreakdown(newPriceBreakdown);
    };
    
    updatePricing();
  }, [property, dateRange.startDate, dateRange.endDate, guests, hourlyExtension]);

  // If hourly booking is enabled for the property, enforce 24-hour flow:
  // checkout = check-in + 23h (+ any extension hours)
  useEffect(() => {
    if (!property?.hourlyBooking?.enabled) return;
    if (!dateRange.startDate) return;
    try {
      setTimeConfirmed(false);
      const [hh, mm] = (checkInTimeStr || '15:00').split(':').map(Number);
      const start = new Date(dateRange.startDate);
      start.setHours(isNaN(hh) ? 15 : hh, isNaN(mm) ? 0 : mm, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 23 + (hourlyExtension || 0));
      // Guard: only set on initial check-in selection (when no endDate yet or end equals start)
      const prevStart = dateRange.startDate;
      const prevEnd = dateRange.endDate;
      const noEndSelected = !prevEnd || (new Date(prevEnd).toDateString() === new Date(prevStart).toDateString());
      const startChanged = !prevStart || new Date(prevStart).getTime() !== start.getTime();
      const endChanged = !prevEnd || new Date(prevEnd).getTime() !== end.getTime();
      if (noEndSelected && (startChanged || endChanged)) {
        setDateRange(prev => ({ ...prev, startDate: start, endDate: end }));
      }
    } catch {}
  }, [property?.hourlyBooking?.enabled, dateRange.startDate, dateRange.endDate, checkInTimeStr, hourlyExtension]);
  
  
  // Availability state
  const [availability, setAvailability] = useState<any[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false);
  const [showTimePrompt, setShowTimePrompt] = useState(false);
const [showTimeSelector, setShowTimeSelector] = useState(false);
const [showShare, setShowShare] = useState(false);


  
  // Booked dates state - for showing red marks on calendar
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  
  // Maintenance info by date - for validating check-in times
  const [maintenanceByDate, setMaintenanceByDate] = useState<Map<string, { availableAfter: Date; availableHours?: Array<{ startTime: string; endTime: string }> }>>(new Map());
  
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
  const checkInRef = useRef<HTMLDivElement>(null);
  const checkOutRef = useRef<HTMLDivElement>(null);
  const timeOptions = generateTimeOptions();

  const lastAutoAdjustedDate = useRef<string | null>(null); // Track last date we auto-adjusted for
  


const getCalendarPosition = () => {
  const el =
    calendarAnchor === 'checkin'
      ? checkInRef.current
      : checkOutRef.current;

  if (!el) return { top: 0, left: 0 };

  const rect = el.getBoundingClientRect();
  return {
    top: rect.bottom + window.scrollY + 8,
    left: rect.left + window.scrollX,
  };
};


const findWishlistItem = (stayId: string) => {
  for (const wl of wishlists) {
    const item = wl.items.find((i: any) =>
      (i.itemId._id?.toString() || i.itemId?.toString()) === stayId
    );
    if (item) return { wishlistId: wl._id, wishlistItemId: item._id };
  }
  return null;
};


const handleFavorite = async (stayId: string) => {

  // ---------- REMOVE ----------
  if (favorites.has(stayId)) {
    const found = findWishlistItem(stayId);
    if (!found) return;

    await apiClient.removeFromWishlist(
      found.wishlistId,
      found.wishlistItemId
    );

    // update local state from truth
    setFavorites(prev => {
      const newSet = new Set(prev);
      newSet.delete(stayId);
      return newSet;
    });
  setIsFavorite(false);
    // setWishlists(prev =>
    //   prev.map(wl =>
    //     wl._id === found.wishlistId
    //       ? { ...wl, items: wl.items.filter(i => i._id !== found.wishlistItemId) }
    //       : wl
    //   )
    // );

    return;
  }

  // ---------- ADD ----------
  // if (wishlists.length === 0) {
  //   setSelectedStay(stayId);
  //   setShowWishlistModal(true);
  //   return;
  // }

  if (wishlists.length === 0) {
    // no list → create modal
    setSelectedStay(stayId);
    setShowWishlistModal(true);
  } else {
    // show picker modal
    setSelectedStay(stayId);
    setShowWishlistPicker(true);
  }

  const wishlist = wishlists[0]; // default list

  // 🔥 THIS IS WHERE YOUR BLOCK GOES
  const res = await apiClient.addToWishlist(wishlist._id, {
    itemType: 'Property',
    itemId: stayId
  });

  // use backend truth
  setWishlists(prev =>
    prev.map(wl =>
      wl._id === wishlist._id ? res.data : wl
    )
  );

  setFavorites(prev => new Set(prev).add(stayId));
  setIsFavorite(true);
};


const handleShare = async () => {
  if (typeof window === "undefined") return;

  const shareData = {
    title: property.title,
    text: "Check out this place",
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log("Share cancelled");
    }
  } else {
    // Desktop fallback
    setShowShare(true);
  }
};

const shareUrl =
  typeof window !== "undefined" ? window.location.href : "";

const handleCopyLink = async () => {
  await navigator.clipboard.writeText(shareUrl);
  alert("Link copied to clipboard");
};

const handleWhatsApp = () => {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
    "_blank"
  );
};

const handleFacebook = () => {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    "_blank"
  );
};

const handleEmail = () => {
  window.location.href = `mailto:?subject=Check this place&body=${shareUrl}`;
};



  // Clear availability state when dates OR extension hours change
  // This allows user to try different extensions without refreshing
  useEffect(() => {
    setAvailabilityError('');
    setAvailabilityChecked(false);
    setAvailability([]);
    console.log('🔄 Availability state cleared (dates or extension changed)');
  }, [dateRange.startDate, dateRange.endDate, hourlyExtension]);


  // Auto-adjust check-in time ONLY on initial date selection (not on every time change)
  // Also validate check-in time is after maintenance end time for checkout dates
  useEffect(() => {
    if (!dateRange.startDate) return;
    
    const now = new Date();
    const isToday = dateRange.startDate.toDateString() === now.toDateString();
    
    // Get date string for maintenance lookup
    const dateStr = `${dateRange.startDate.getFullYear()}-${String(dateRange.startDate.getMonth() + 1).padStart(2, '0')}-${String(dateRange.startDate.getDate()).padStart(2, '0')}`;
    const maintenanceInfo = maintenanceByDate.get(dateStr);
    
    // Only auto-adjust if this is a new date (not already adjusted)
    const shouldAutoAdjust = lastAutoAdjustedDate.current !== dateStr;
    
    // Check if maintenance restriction exists for this date
    if (maintenanceInfo && shouldAutoAdjust) {
      const [selectedHour, selectedMinute] = checkInTimeStr.split(':').map(Number);
      const selectedTime = new Date(dateRange.startDate);
      selectedTime.setHours(selectedHour, selectedMinute, 0, 0);
      
      // Check if selected time is before maintenance end
      if (selectedTime < maintenanceInfo.availableAfter) {
        // Auto-adjust to maintenance end time (rounded up to next hour)
        const maintenanceEndHour = maintenanceInfo.availableAfter.getHours();
        const maintenanceEndMinute = maintenanceInfo.availableAfter.getMinutes();
        const nextAvailableHour = maintenanceEndMinute > 0 ? maintenanceEndHour + 1 : maintenanceEndHour;
        const newTimeStr = `${nextAvailableHour.toString().padStart(2, '0')}:00`;
        
        console.log(`⏰ Auto-adjusting check-in time from ${checkInTimeStr} to ${newTimeStr} (before maintenance end at ${maintenanceInfo.availableAfter.toLocaleTimeString()})`);
        setCheckInTimeStr(newTimeStr);
        lastAutoAdjustedDate.current = dateStr; // Mark as adjusted
        return;
      }
    }
    
    if (isToday && shouldAutoAdjust) {
      const currentHour = now.getHours();
      const [selectedHour] = checkInTimeStr.split(':').map(Number);
      
      // If selected time is in the past, auto-adjust to next available hour
      if (selectedHour <= currentHour) {
        const nextAvailableHour = Math.min(currentHour + 1, 23);
        const newTimeStr = `${nextAvailableHour.toString().padStart(2, '0')}:00`;
        console.log(`⏰ Auto-adjusting check-in time from ${checkInTimeStr} to ${newTimeStr} (past time)`);
        setCheckInTimeStr(newTimeStr);
        lastAutoAdjustedDate.current = dateStr; // Mark as adjusted
      }
    }
    
    // Clear adjustment flag when date changes (so we can adjust again for new date)
    if (lastAutoAdjustedDate.current !== dateStr && !shouldAutoAdjust) {
      lastAutoAdjustedDate.current = null;
    }
  }, [dateRange.startDate]); // Only run on date change, not time change

  // Initialize dates from search params if available
  useEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    console.log("check in params", checkInParam,checkOutParam);
    if (checkInParam) {
      try {
        const checkInDate = new Date(checkInParam);
        if (!isNaN(checkInDate.getTime())) {
          setDateRange(prev => ({
            ...prev,
            startDate: checkInDate,
            key: 'selection'
          }));
          setSelectionStep('checkout');
        }
      } catch (error) {
        console.error('Error parsing checkIn param:', error);
      }
    }
    
    if (checkOutParam && checkInParam) {
      try {
        const checkOutDate = new Date(checkOutParam);
        const checkInDate = new Date(checkInParam);
        if (!isNaN(checkOutDate.getTime()) && !isNaN(checkInDate.getTime()) && checkOutDate > checkInDate) {
          setDateRange(prev => ({
            ...prev,
            startDate: checkInDate,
            endDate: checkOutDate,
            key: 'selection'
          }));
          setSelectionStep('complete');
        }
      } catch (error) {
        console.error('Error parsing checkOut param:', error);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    console.log('🏠 Loading property with ID:', id);
    apiClient.getListing(id as string)
      .then((res: any) => {
        console.log('🏠 Property loaded:', res.data?.listing);
        setProperty(res.data?.listing || null);
        setError("");
      })
      .catch((error) => {
        console.error('🏠 Error loading property:', error);
        setError("Property not found");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Load booked dates when property is loaded (for showing red marks on calendar)
  useEffect(() => {
    if (!id) return;
    
    const fetchBookedDates = async () => {
      try {
        // Fetch availability for the next 6 months
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        const response = await apiClient.getAvailability(id as string, startDateStr, endDateStr);
        
        if (response.success && response.data?.availability) {
          const bookedSet = new Set<string>();
          const maintenanceMap = new Map<string, { availableAfter: Date }>();
          
          response.data.availability.forEach((slot: any) => {
            // FIXED: Use local date format to avoid timezone shift issues
            const slotDate = new Date(slot.date);
            const dateStr = `${slotDate.getFullYear()}-${String(slotDate.getMonth() + 1).padStart(2, '0')}-${String(slotDate.getDate()).padStart(2, '0')}`;
            
            // Store maintenance info if available
            if (slot.maintenance?.availableAfter) {
              const availableAfter = new Date(slot.maintenance.availableAfter);
              const existing = maintenanceMap.get(dateStr) || { availableAfter };
              maintenanceMap.set(dateStr, { 
                ...existing,
                availableAfter,
                availableHours: slot.availableHours || existing.availableHours
              });
              console.log(`🔧 Maintenance info for ${dateStr}: available after ${availableAfter.toISOString()}`);
            }
            
            // Store hour restrictions for available dates
            if (slot.status === 'available' && slot.availableHours && slot.availableHours.length > 0) {
              const existing = maintenanceMap.get(dateStr) || { availableAfter: new Date() };
              maintenanceMap.set(dateStr, {
                ...existing,
                availableHours: slot.availableHours
              });
              console.log(`⏰ Hour restrictions for ${dateStr}:`, slot.availableHours);
            }
            
            // Mark dates that are booked, blocked, maintenance, or unavailable
            if (['booked', 'blocked', 'maintenance', 'unavailable'].includes(slot.status)) {
              bookedSet.add(dateStr);
              console.log(`📅 Marking ${dateStr} as booked/blocked (status: ${slot.status})`);
            }
          });
          
          setMaintenanceByDate(maintenanceMap);
          
          setBookedDates(bookedSet);
          console.log('📅 Loaded booked dates:', bookedSet.size, 'dates');
        }
      } catch (error) {
        console.error('Error fetching booked dates:', error);
      }
    };
    
    fetchBookedDates();
  }, [id]);

  // Close dropdowns on outside click
  // useEffect(() => {
  //   function handleClickOutside(event: MouseEvent) {
  //     if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
  //       setShowDatePicker(false);
  //     }
  //     if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
  //       setShowGuestPicker(false);
  //     }
  //   }
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);


  // }, []);

//   useEffect(() => {
//   if (!user) return;
  
//   const loadWishlists = async () => {
//     const res = await apiClient.getMyWishlists();
//     console.log('Wishlists:', res.data);
//     setWishlists(res.data);
 
//     const favSet = new Set<string>();
//     res.data.forEach((wl: any) => {
//       wl.items.forEach((item: any) => {
//         favSet.add(item.itemId._id.toString());
//       });
//     });
 
//     // Check if current property is in favorites
//     if (property && favSet.has(property._id)) {
//       setIsFavorite(true);
//     }
//   };
 
//   loadWishlists();
// }, [user, property?._id]);


useEffect(() => {
  const loadWishlists = async () => {
    const res = await apiClient.getMyWishlists();
    console.log('Wishlists:', res.data);
    setWishlists(res.data);

    const favSet = new Set<string>();
    res.data.forEach((wl: any) => {
      wl.items.forEach((item: any) => {
        console.log('Item:', item);
        // Fix this line:
        favSet.add(item.itemId._id.toString()); // Change from .id to ._id
      });
    });

    setFavorites(favSet);
    
    // Check if current property is in favorites and update isFavorite
    if (property && favSet.has(property._id)) {
      setIsFavorite(true);
    } else {
      setIsFavorite(false);
    }
    
    console.log('Favorites:', favSet);
  };

  loadWishlists();
}, [user, property?._id]); // Add dependencies

  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Node;

    if (
      datePickerRef.current?.contains(target) ||
      checkInRef.current?.contains(target) ||
      checkOutRef.current?.contains(target)
    ) {
      return; // ✅ don't close
    }

    setShowDatePicker(false);
  }

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);


const createWishlistAndSave = async () => {
  const wishlist = await apiClient.createWishList({
    name: wishlistName,
    isPublic: false
  });

  await apiClient.addToWishlist(wishlist.data._id, {
    itemType: 'Property',
    itemId: selectedStay
  });

  setFavorites(prev => new Set(prev).add(selectedStay!));
  setWishlists(prev => [...prev, wishlist.data]);
  setShowWishlistModal(false);
  setIsFavorite(true);
};


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

  // Helper function to format hour to 12-hour format with AM/PM
  const formatTimeHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Calculate checkout time based on checkout DATE + check-in time - 1 hour + extension
  // Example: Check-in Dec 5 at 4 PM, Checkout date Dec 7 → Checkout: Dec 7 at 3 PM (4 PM - 1h)
  // With 6h extension: Dec 7 at 9 PM
  const getCalculatedCheckout = () => {
    if (!dateRange.startDate || !dateRange.endDate) return null;
    const [hh, mm] = (checkInTimeStr || '15:00').split(':').map(Number);
    
    // Use the checkout DATE (endDate) as the base
    const checkOut = new Date(dateRange.endDate);
    // Set checkout time to check-in time - 1 hour (23-hour stay per night)
    // So if check-in is 4 PM, checkout is 3 PM on the checkout date
    checkOut.setHours(hh - 1, mm, 0, 0);
    
    // Add extension hours if any
    if (hourlyExtension && hourlyExtension > 0) {
      checkOut.setHours(checkOut.getHours() + hourlyExtension);
    }
    
    return checkOut;
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

    if (!isAuthenticated) {
      router.push('/auth/login');
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

    // Check minimum nights if property has this requirement (display only)
    // FIXED: Calculate nights using calendar days (ignore time component)
    let nights = 0;
    if (endDate && !isNaN(endDate.getTime()) && startDate && !isNaN(startDate.getTime())) {
      // Normalize dates to midnight to get accurate day count
      const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      nights = Math.max(0, Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)));
    }
    
    // DEBUG: Log nights calculation in detail
    console.log('🌙 DETAILED Nights calculation:', {
      startDateRaw: dateRange.startDate,
      endDateRaw: dateRange.endDate,
      
      startDate: startDate?.toISOString(),
      startDateLocal: startDate?.toLocaleDateString(),
      endDate: endDate?.toISOString(),
      endDateLocal: endDate?.toLocaleDateString(),
      diffMs: endDate && startDate ? (endDate.getTime() - startDate.getTime()) : 'N/A',
      nights: nights,
      propertyMinNights: property?.minNights,
      propertyMinNightsType: typeof property?.minNights,
      checkInTimeStr: checkInTimeStr,
    });
    
    // Only check minNights if property has this requirement set
    const minNightsRequired = property?.minNights ? Number(property.minNights) : 0;
    if (minNightsRequired > 0 && nights < minNightsRequired) {
      console.log(`❌ FAILED: ${nights} nights < ${minNightsRequired} minNights`);
      setAvailabilityError(`Minimum ${minNightsRequired} nights required`);
      return;
    }
    console.log(`✅ PASSED: ${nights} nights >= ${minNightsRequired || 'no minimum'}`);
    

    // Validate check-in time is after maintenance end (if applicable)
    const dateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const maintenanceInfo = maintenanceByDate.get(dateStr);
    
    if (maintenanceInfo) {
      const [checkInHour, checkInMinute] = (checkInTimeStr || '15:00').split(':').map(Number);
      const selectedCheckInTime = new Date(startDate);
      selectedCheckInTime.setHours(checkInHour, checkInMinute, 0, 0);
      
      if (selectedCheckInTime < maintenanceInfo.availableAfter) {
        const maintenanceEndTime = maintenanceInfo.availableAfter.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        setAvailabilityError(`Check-in time must be after ${maintenanceEndTime} (maintenance period ends)`);
        setAvailabilityLoading(false);
        return;
      }
    }

    setAvailabilityLoading(true);
    setAvailabilityError('');
    
    try {
      console.log('checkAvailability', { checkInTimeStr });
      // Calculate exact check-in and check-out times based on custom check-in time
      const [checkInHour, checkInMinute] = (checkInTimeStr || '15:00').split(':').map(Number);
      const exactCheckIn = new Date(startDate);
      exactCheckIn.setHours(0,0,0,0);
      exactCheckIn.setHours(checkInHour, checkInMinute, 0, 0);
      
      // Checkout = endDate at (check-in time - 1 hour) + extension
      // Example: Check-in Dec 5 at 4 PM, endDate Dec 7 → Checkout: Dec 7 at 3 PM
      const exactCheckOut = new Date(endDate);
      exactCheckOut.setHours(0,0,0,0);
      exactCheckOut.setHours(checkInHour - 1, checkInMinute, 0, 0); // Check-in time - 1 hour
      
      // Add extension hours if any
      if (hourlyExtension && hourlyExtension > 0) {
        exactCheckOut.setHours(exactCheckOut.getHours() + hourlyExtension);
      }
      
      console.log('⏰ Custom time calculation:', {
        checkInTimeStr,
        exactCheckIn: exactCheckIn.toISOString(),
        exactCheckOut: exactCheckOut.toISOString(),
        checkoutDate: endDate.toLocaleDateString(),
        extensionHours: hourlyExtension || 0
      });

      // NEW: Use hourly slot checking for properties with hourly booking enabled
      if (property?.hourlyBooking?.enabled) {
        console.log('🕐 Using hourly slot availability check...');
        const slotResponse = await apiClient.checkTimeSlotAvailability(
          id as string,
          exactCheckIn.toISOString(),
          exactCheckOut.toISOString(),
          hourlyExtension || 0
        );
        
        if (slotResponse.success && slotResponse.data) {
          if (slotResponse.data.available) {
            console.log('✅ Time slot is available!');
            setAvailabilityChecked(true);
            setAvailabilityError('');
            
            // Get pricing from backend when availability is confirmed
            const pricing = await getSecurePricing();
            if (pricing) {
              console.log('💰 Pricing received from backend:', pricing);
              setPriceBreakdown({
                basePrice: property?.pricing?.basePrice || 0,
                baseAmount: pricing.baseAmount,
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
              });
            }
            setAvailabilityLoading(false);
            return;
          } else {
            // Has conflicts
            const conflicts = slotResponse.data.conflicts;
            let errorMsg = 'Selected time slot is not available.';
            if (conflicts?.dailyConflicts?.length > 0) {
              const conflictDates = conflicts.dailyConflicts.map((c: any) => 
                new Date(c.date).toLocaleDateString()
              ).join(', ');
              errorMsg = `Dates not available: ${conflictDates}`;
            }
            if (slotResponse.data.nextAvailableSlot?.start) {
              const nextDate = new Date(slotResponse.data.nextAvailableSlot.start);
              if (!isNaN(nextDate.getTime())) {
                errorMsg += ` Next available: ${nextDate.toLocaleString()}`;
              }
            }
            setAvailabilityError(errorMsg);
            setAvailabilityChecked(false);
            setAvailabilityLoading(false);
            return;
          }
        }
      }

      // FALLBACK: Traditional daily availability check
      const startDateStr = startDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      // FIXED: Calculate extended checkout date if hourly extension is selected
      let effectiveEndDate = new Date(endDate);
      let extendedCheckoutDate = new Date(endDate); // The actual day when checkout happens
      
      if (hourlyExtension && hourlyExtension > 0) {
        // Use the already calculated exactCheckOut for the extended date
        extendedCheckoutDate = new Date(exactCheckOut.getFullYear(), exactCheckOut.getMonth(), exactCheckOut.getDate());
        
        console.log('⏰ Extended checkout calculation:', {
          originalCheckout: endDate.toLocaleDateString(),
          extensionHours: hourlyExtension,
          extendedCheckoutDateTime: exactCheckOut.toISOString(),
          extendedCheckoutDate: extendedCheckoutDate.toLocaleDateString(),
          originalEndDate: endDate.toLocaleDateString()
        });
      }
      
      // Check availability up to the day AFTER the extended checkout date
      // (to include the checkout date itself in the check)
      const checkEndDate = new Date(extendedCheckoutDate);
      checkEndDate.setDate(checkEndDate.getDate() + 1);
      
      const endDateStr = checkEndDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      const response = await apiClient.getAvailability(id as string, startDateStr, endDateStr);
      
      if (response.success && response.data) {
        const availabilityData = response.data.availability || [];
        
        // DEBUG: Log what we received from API
        console.log('📅 Availability API Response:', {
          startDate: startDateStr,
          endDate: endDateStr,
          recordsCount: availabilityData.length,
          records: availabilityData.map((a: any) => ({
            date: a.date,
            status: a.status,
            reason: a.reason
          }))
        });
        
        // Check if all selected dates are available (including extended dates)
        // FIXED: Normalize to midnight to avoid time-based comparison issues
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        let allAvailable = true;
        const conflictingDates: string[] = [];
        
        // FIXED: Check dates up to the extended checkout date (not just original checkout)
        // For 6-hour extension on Dec 5 checkout = still Dec 5, so check Dec 4-5
        // For 18-hour extension on Dec 5 checkout = Dec 6, so check Dec 4-5-6
        const dateCheckEnd = hourlyExtension && hourlyExtension > 0 ? checkEndDate : 
          new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        console.log('🔍 Checking availability:', {
          from: currentDate.toLocaleDateString(),
          to: dateCheckEnd.toLocaleDateString(),
          extensionHours: hourlyExtension || 0,
          extendedCheckoutDate: extendedCheckoutDate.toLocaleDateString()
        });
        
        while (currentDate < dateCheckEnd) {
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
          
          
          // Check availability status - dates are AVAILABLE by default unless explicitly marked as unavailable
          if (dateAvailability) {
            // Date exists in Availability model - check its status
            if (dateAvailability.status === 'booked') {
              console.log(`❌ Date ${dateStr} is BOOKED`);
              allAvailable = false;
              conflictingDates.push(dateStr);
            } else if (dateAvailability.status === 'maintenance') {
              console.log(`❌ Date ${dateStr} is under MAINTENANCE`);
              allAvailable = false;
              conflictingDates.push(dateStr);
            } else if (dateAvailability.status === 'blocked') {
              console.log(`❌ Date ${dateStr} is BLOCKED`);
              allAvailable = false;
              conflictingDates.push(dateStr);
            } else if (dateAvailability.status === 'unavailable') {
              console.log(`❌ Date ${dateStr} is UNAVAILABLE`);
              allAvailable = false;
              conflictingDates.push(dateStr);
            } else {
              console.log(`✅ Date ${dateStr} is available (status: ${dateAvailability.status})`);
            }
            // 'available' or any other status = available
          } else {
            console.log(`✅ Date ${dateStr} - no record, defaulting to AVAILABLE`);
          }
          // No record in Availability model = AVAILABLE by default (this is correct behavior)
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        if (allAvailable) {
          setAvailabilityChecked(true);
          setAvailabilityError('');
          setAvailability(availabilityData);
          
          // Get pricing from backend when availability is confirmed
          console.log('✅ Availability confirmed, getting pricing from backend...');
          const pricing = await getSecurePricing();
          if (pricing) {
            console.log('💰 Pricing received from backend:', pricing);
            setPriceBreakdown({
              basePrice: property?.pricing?.basePrice || 0,
              baseAmount: pricing.baseAmount,
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
            });
          }
        } else {
          // Check if the conflict is due to extension hours
          const originalEndStr = endDate.toLocaleDateString('en-CA');
          const isExtensionConflict = hourlyExtension && hourlyExtension > 0 && 
            conflictingDates.some(d => d > originalEndStr);
          
          if (isExtensionConflict) {
            setAvailabilityError(`Cannot add ${hourlyExtension}-hour extension: checkout would overlap with booked dates (${conflictingDates.join(', ')}). Try a shorter extension or different dates.`);
        } else {
          setAvailabilityError(`Selected dates are not available. Conflicting dates: ${conflictingDates.join(', ')}`);
          }
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

  function generateTimeOptions() {
  const now = new Date();
  const currentHour = now.getHours();
  const isToday =
    dateRange.startDate &&
    dateRange.startDate.toDateString() === now.toDateString();

  const dateStr = dateRange.startDate
    ? `${dateRange.startDate.getFullYear()}-${String(
        dateRange.startDate.getMonth() + 1
      ).padStart(2, '0')}-${String(
        dateRange.startDate.getDate()
      ).padStart(2, '0')}`
    : '';

  const maintenanceInfo = maintenanceByDate.get(dateStr);
  const hourRestrictions = maintenanceInfo?.availableHours;

  let minHour = isToday ? Math.max(currentHour + 1, 6) : 6;

  if (maintenanceInfo?.availableAfter) {
    const h = maintenanceInfo.availableAfter.getHours();
    const m = maintenanceInfo.availableAfter.getMinutes();
    minHour = Math.max(minHour, m > 0 ? h + 1 : h);
  }

  const times: string[] = [];

  if (hourRestrictions && hourRestrictions.length > 0) {
    for (const range of hourRestrictions) {
      const [startH] = range.startTime.split(':').map(Number);
      const [endH] = range.endTime.split(':').map(Number);

      for (let h = startH; h < endH; h++) {
        times.push(`${h.toString().padStart(2, '0')}:00`);
      }
    }
  } else {
    for (let h = minHour; h <= 23; h++) {
      times.push(`${h.toString().padStart(2, '0')}:00`);
    }
    if (minHour > 5) {
      for (let h = 0; h <= 5; h++) {
        times.push(`${h.toString().padStart(2, '0')}:00`);
      }
    }
  }

  return times;
}

const saveToExistingWishlist = async (wishlistId: string) => {
  const res = await apiClient.addToWishlist(wishlistId, {
    itemType: 'Property',
    itemId: selectedStay
  });

  setWishlists(prev =>
    prev.map(wl => wl._id === wishlistId ? res.data : wl)
  );

  setFavorites(prev => new Set(prev).add(selectedStay!));
  setShowWishlistPicker(false);
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

    // Check minimum nights if property has this requirement (display only)
    // FIXED: Calculate nights using calendar days (ignore time component)
    let nights = 0;
    if (endDate && startDate && !isNaN(endDate.getTime()) && !isNaN(startDate.getTime())) {
      const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      nights = Math.max(0, Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)));
    }
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
    // FIXED: Calculate nights using calendar days (ignore time component)
    const startDay = new Date(dateRange.startDate.getFullYear(), dateRange.startDate.getMonth(), dateRange.startDate.getDate());
    const endDay = new Date(dateRange.endDate.getFullYear(), dateRange.endDate.getMonth(), dateRange.endDate.getDate());
    return Math.max(0, Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Manual test function removed

  const getSecurePricing = async () => {
    console.log('🔍 getSecurePricing called with:', { 
      property: !!property, 
      startDate: dateRange.startDate, 
      endDate: dateRange.endDate 
    });
    
    if (!property || !dateRange.startDate || !dateRange.endDate) {
      console.log('⏳ Waiting for required data to load...', { property: !!property, startDate: !!dateRange.startDate, endDate: !!dateRange.endDate });
      return null;
    }
    
    try {
      // Request pricing from backend - NO CALCULATIONS ON FRONTEND
      const pricingRequest = {
        propertyId: property._id,
        checkIn: dateRange.startDate.toLocaleDateString('en-CA'),
        checkOut: dateRange.endDate.toLocaleDateString('en-CA'),
        guests: { adults: guests, children: 0 },
        hourlyExtension: hourlyExtension || 0,
        // Always request daily pricing unless explicitly switching to 24-hour mode
        bookingType: 'daily'
      };

      // Basic validation only - comprehensive validation on backend
      if (!pricingRequest.propertyId || !pricingRequest.checkIn || !pricingRequest.checkOut) {
        console.error('❌ Invalid pricing request parameters');
        return null;
      }

      console.log('🔒 Requesting pricing from secure backend API...', pricingRequest);
      
      const response = await securePricingAPI.calculatePricing(pricingRequest);
      
      if (!response.success) {
        console.error('❌ Secure pricing request failed:', response);
        return null;
      }
      
      const pricing = response.data.pricing;
      console.log('✅ Secure pricing received from backend:', {
        nights: pricing.nights,
        totalAmount: pricing.totalAmount,
        token: response.data.security.pricingToken.substring(0, 8) + '...'
      });
      
      // Return pricing data as received from backend
      return {
        ...pricing,
        // Security token for validation
        pricingToken: response.data.security.pricingToken
      };
    } catch (error) {
      console.error('❌ Error requesting secure pricing:', error);
      console.error('❌ Error details:', error.message, error.stack);
      return null;
    }
  };

  const handleBooking = async () => {
    console.log("WHn called",checkInTimeStr);
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Check if dates are selected
    if (!dateRange.startDate || !dateRange.endDate) {
      setAvailabilityError('Please select check-in and check-out dates');
      return;
    }

    // Update booking context with current selection (including custom check-in time)
    updateBookingData({
      propertyId: id as string,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      guests: { adults: guests, children: 0, infants: 0 },
      hourlyExtension: hourlyExtension,
      specialRequests: specialRequests,
      // NEW: Include custom check-in time for 23-hour checkout calculation
      checkInTime: checkInTimeStr || '15:00',
      pricing: {
        basePrice: property?.pricing?.basePrice || 0,
        cleaningFee: property?.pricing?.cleaningFee || 0,
        serviceFee: property?.pricing?.serviceFee || 0,
        securityDeposit: property?.pricing?.securityDeposit || 0,
        totalPrice: 0 // Will be calculated by backend
      }
    });

    console.log("check in str",checkInTimeStr);

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

  const pricing = priceBreakdown; // Use the state instead of calling async function
  const nights = pricing?.nights || 0; // Use nights from backend pricing data
  
  // Debug pricing state
  console.log('🔍 Pricing debug:', {
    pricing,
    nights,
    priceBreakdown,
    total: pricing?.total,
    totalAmount: pricing?.totalAmount
  });
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header  />
      
      {/* Main Content */}
      <main className={` ${hideHeader ? "pt-0 sm:pt-40" : "pt-40"} font-['Inter',system-ui,-apple-system,sans-serif] overflow-hidden`}>
        {/* Image Gallery */}
        <div className="relative">
           {/* MOBILE – HORIZONTAL SWIPE */}
 

         <ImageGallery images={property.images || []} title={property.title} />
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 font-['Inter',system-ui,-apple-system,sans-serif] tracking-tight">
                      {property.title}
                    </h1>
                    
                    {/* Place Type Badge */}
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 rounded-full text-blue-700 font-semibold text-sm">
                        <Home className="w-4 h-4" />
                        {property.placeType === 'entire' ? 'Entire place' : 
                         property.placeType === 'room' ? 'A room' : 
                         property.placeType === 'shared' ? 'A shared room' : 'Entire place'}
                      </div>
                    </div>
                    
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
                   <button
  onClick={handleShare}
  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
>
  <Share2 className="w-5 h-5 text-gray-600" />
</button>

                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                     
                      onClick={() => handleFavorite(property._id)}
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
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-['Inter',system-ui,-apple-system,sans-serif] tracking-tight">About this place</h2>
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
                         
      <div className="bg-white rounded-2xl shadow-md  p-5 md:p-8">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl md:text-3xl font-semibold text-gray-900">
            What this place offers
          </h2>
        </div>

        {/* AMENITIES GRID */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          {(property.amenities
            ?.slice(0, isMobile ? 4: showAllAmenities ? property.amenities.length : 8)
          )?.map((amenity: string) => (
            <div
              key={amenity}
              className="flex items-center gap-2 p-2 rounded-lg"
            >
              {getAmenityIcon(amenity)}
              <span className="text-sm md:text-base text-gray-700 capitalize">
                {amenity.replace(/-/g, " ")}
              </span>
            </div>
          ))}
        </div>

        {/* SHOW ALL BUTTON */}
        {property.amenities?.length > 4 && (
          <button
            onClick={() => setShowAllAmenities(true)}
            className="mt-5 w-full md:w-auto text-center border border-gray-300 rounded-xl px-6 py-3 text-sm font-medium hover:bg-gray-100 transition"
          >
            Show all {property.amenities.length} amenities
          </button>
        )}
      </div>

      {/* MOBILE BOTTOM SHEET */}
      {showAllAmenities && isMobile && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute bottom-0 w-full bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto animate-slideUp">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">
                What this place offers
              </h3>
              <button onClick={() => setShowAllAmenities(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* FULL AMENITIES LIST */}
            <div className="grid grid-cols-1 gap-4">
              {property.amenities?.map((amenity: string) => (
                <div
                  key={amenity}
                  className="flex items-center gap-3"
                >
                  {getAmenityIcon(amenity)}
                  <span className="capitalize text-gray-700">
                    {amenity.replace(/-/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



              {/* Availability Calendar Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 ">
                <PropertyAvailabilityCalendar 
                  propertyId={id as string}
                  checkInDate={dateRange.startDate}
                  checkOutDate={dateRange.endDate}
                  selectionStep={selectionStep}
                  onDateSelect={(date) => {
                    console.log('Selected date from calendar:', date);
                    
                    if (selectionStep === 'checkin') {
                      // Select check-in date
                      const newDateRange = {
                        ...dateRange,
                        startDate: new Date(date),
                        endDate: null,
                        key: 'selection'
                      };
                      setDateRange(newDateRange);
                      setSelectionStep('checkout');
                    } else if (selectionStep === 'checkout') {
                      // Select check-out date
                      if (date > dateRange.startDate) {
                        const newDateRange = {
                          ...dateRange,
                          endDate: new Date(date),
                          key: 'selection'
                        };
                        setDateRange(newDateRange);
                        setSelectionStep('complete');
                      } else if (date < dateRange.startDate) {
                        // New date is before start date, make it new start date
                        setDateRange({
                          startDate: new Date(date),
                          endDate: null,
                          key: 'selection'
                        });
                        setSelectionStep('checkin');
                      }
                    } else {
                      // Both dates selected, start over with new check-in date
                      setDateRange({
                        startDate: new Date(date),
                        endDate: null,
                        key: 'selection'
                      });
                      setSelectionStep('checkin');
                    }
                  }}
                  isHostView={isOwnProperty} // Show booking details only for property owner
                />
              </div>

              {/* Reviews Section */}
              {/* <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                    <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                      <h2 className="text-3xl font-bold text-gray-900 font-['Inter',system-ui,-apple-system,sans-serif] tracking-tight">Reviews</h2>
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
              </div> */}
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
            <div className="hidden lg:col-span-1 lg:block">
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
                         ref={checkInRef}
                          className={`border rounded-lg p-3 cursor-pointer transition-all duration-300 ${
                            selectionStep === 'checkin' 
                              ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                              : availabilityError && availabilityError.includes('Check-in')
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => {
                            // ref={checkInRef}
                            setShowDatePicker(true);
                            setCalendarAnchor('checkin');
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
                         ref={checkOutRef}
                          className={`border rounded-lg p-3 cursor-pointer transition-all duration-300 ${
                            selectionStep === 'checkout' 
                              ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                              : availabilityError && availabilityError.includes('Check-out')
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => {
                            ref={checkOutRef}
                            setShowDatePicker(true);
                            setCalendarAnchor('checkout');
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
                      </div>

                      {/* Custom Check-in Time Selector */}
                      {!isOwnProperty && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <label className="text-sm font-semibold text-gray-800">Check-in Time</label>
                          </div>
                          <TimeSpinner
                          value={checkInTimeStr}
                          onChange={(newTime) => {
                            setCheckInTimeStr(newTime);
                            setAvailabilityChecked(false);
                          }}
                        />

                          
                          {/* Show warning if today's time options are limited */}
                          {dateRange.startDate && dateRange.startDate.toDateString() === new Date().toDateString() && (
                            <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                              <span>⚠️</span>
                              <span>Showing available times for today (past hours hidden)</span>
                            </div>
                          )}
                          
                          {/* Show maintenance restriction message for checkout dates */}
                          {dateRange.startDate && (() => {
                            const dateStr = `${dateRange.startDate.getFullYear()}-${String(dateRange.startDate.getMonth() + 1).padStart(2, '0')}-${String(dateRange.startDate.getDate()).padStart(2, '0')}`;
                            const maintenanceInfo = maintenanceByDate.get(dateStr);
                            if (maintenanceInfo) {
                              return (
                                <div className="mt-2 text-xs text-orange-600 flex items-center gap-1 bg-orange-50 p-2 rounded-lg border border-orange-200">
                                  <span>🔧</span>
                                  <span>
                                    Available after {maintenanceInfo.availableAfter.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })} (maintenance period)
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          
                          {/* Calculated checkout display */}
                          {dateRange.startDate && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Calculated Check-out:</span>
                                <span className="text-sm font-semibold text-blue-700">
                                  {(() => {
                                    const checkout = getCalculatedCheckout();
                                    if (!checkout) return 'Select dates';
                                    return checkout.toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    });
                                  })()}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                (Check-in + 23h{hourlyExtension ? ` + ${hourlyExtension}h extension` : ''})
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    
                      {/* Fresh Working Calendar */}

                      {showDatePicker &&
  createPortal(
    (() => {
      const pos = getCalendarPosition();

      if (isMobile) {
        return (
          <div className="fixed inset-0 z-[1000] bg-white">
           {/* Mobile Bottom Sheet */}
          <div className="fixed inset-0 z-[1000]">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowDatePicker(false)}
            />

            {/* Bottom Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
              
              {/* Drag Handle */}
              <div className="flex justify-center pt-3">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="text-base font-semibold">
                  {selectionStep === 'checkin'
                    ? 'Select check-in date'
                    : selectionStep === 'checkout'
                    ? 'Select check-out date'
                    : 'Select dates'}
                </h3>

                <button
                  onClick={() => setShowDatePicker(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {/* Calendar Content (Scrollable) */}
              <div
                ref={datePickerRef}
                className="overflow-y-auto px-4 py-4 flex-1"
              >
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
                                            // const isPast = date < new Date();
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);

                                            const isPast = date < today;

                                            
                                            // Check if this date is booked/unavailable
                                            // FIXED: Use local date format to match bookedDates format
                                            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                            const isBooked = bookedDates.has(dateStr);
                                            
                                            const isStartDate = dateRange.startDate && 
                                              dateRange.startDate.toDateString() === date.toDateString();
                                            const isEndDate = dateRange.endDate && 
                                              dateRange.endDate.toDateString() === date.toDateString();
                                            const isInRange = dateRange.startDate && dateRange.endDate &&
                                              date > dateRange.startDate && date < dateRange.endDate;
                                            
                                            // Booked dates are not selectable
                                            const isSelectable = isCurrentMonth && !isPast && !isBooked;
                                            
                                          
                                            // Add 'text-gray-700' (for light mode) or 'text-white' (for dark mode)
                                                                            // 1. Initialize with a base text color to ensure nothing is ever 'invisible'
                                          let className = 'text-center py-2 text-sm rounded-lg transition-colors relative ';
                                          if (!isCurrentMonth) {
                                            className += 'text-gray-300';
                                          } else if (isBooked) {
                                            className += 'bg-red-50 text-red-600 cursor-not-allowed line-through';
                                          } else if (isStartDate || isEndDate) {
                                            className += 'bg-blue-600 text-white font-semibold';
                                          } else if (isInRange) {
                                            className += 'bg-blue-100 text-blue-800';
                                          } else if (!isSelectable) {
                                            className += 'text-gray-400 cursor-default';
                                          } else if (isToday) {
                                            className += 'bg-blue-50 text-blue-700 font-bold underline';
                                          } else {
                                            className += 'text-black hover:bg-gray-100 cursor-pointer';
                                          }
                                    
                                            days.push(
                                              <div
                                                key={date.getTime()}
                                                className={className}
                                                title={isBooked ? 'This date is already booked' : undefined}
                                                onClick={() => {
                                                  if (!isSelectable) return;
                                                  
                                                  console.log('Date clicked:', date.toDateString());
                                                  console.log('Current selectionStep:', selectionStep);
                                                  
                                                  if (selectionStep === 'checkin') {
                                                    // Select check-in date
                                                    console.log('Setting check-in date:', date.toDateString());
                                                    const newDateRange = {
                                                      ...dateRange,
                                                      startDate: new Date(date),
                                                      endDate: null,
                                                      key: 'selection'
                                                    };
                                                    console.log('📅 New date range:', newDateRange);
                                                    console.log('📅 Setting dateRange state...');
                                                    setDateRange(newDateRange);
                                                    console.log('📅 DateRange state updated');
                                                    setSelectionStep('checkout');
                                                  } else if (selectionStep === 'checkout') {
                                                    // Select check-out date
                                                    if (date > dateRange.startDate) {
                                                      console.log('Setting check-out date:', date.toDateString());
                                                      console.log('🔍 Original date:', date);
                                                      console.log('🔍 New Date(date):', new Date(date));
                                                      console.log('🔍 Start date:', dateRange.startDate);
                                                      const newDateRange = {
                                                        ...dateRange,
                                                        endDate: new Date(date),
                                                        key: 'selection'
                                                      };
                                                      console.log('📅 Complete date range:', newDateRange);
                                                      console.log('🔍 Final endDate:', newDateRange.endDate);
                                                      console.log('📅 Setting complete dateRange state...');
                                                      setDateRange(newDateRange);
                                                      console.log('📅 Complete dateRange state updated');
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
                                                <span>{date.getDate()}</span>
                                                {/* Red dot indicator for booked dates */}
                                                {isBooked && isCurrentMonth && (
                                                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                )}
                                              </div>
                                            );
                                          }
                                          
                                          return days;
                                        })()}
                                      </div>

                                      {/* Legend for booked dates */}
                                      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                          <span>Booked</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                          <span>Selected</span>
                                        </div>
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

              {/* Footer (Optional CTA like Airbnb) */}
              <div className="px-4 py-3 border-t flex gap-3">
                <button
                  onClick={() => {
                    setSelectionStep('checkin');
                    setDateRange({ startDate: new Date(), endDate: null, key: 'selection' });
                  }}
                  className="flex-1 py-2 text-sm rounded-lg border border-gray-300"
                >
                  Clear
                </button>

                <button
                  onClick={() => setShowDatePicker(false)}
                  className="flex-1 py-2 text-sm rounded-lg bg-indigo-600 text-white"
                >
                  Done
                </button>
              </div>
            </div>
          </div>

        );
      }

      return (
        <div
          ref={datePickerRef}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            zIndex: 1000,
          }}
          className="bg-white rounded-xl shadow-xl border p-4 w-[360px]"
        >    <div className="flex items-center justify-between mb-4">
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
                                  // const isPast = date < new Date();
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);

                                  const isPast = date < today;
                                  
                                  // Check if this date is booked/unavailable
                                  // FIXED: Use local date format to match bookedDates format
                                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                  const isBooked = bookedDates.has(dateStr);
                                  
                                  const isStartDate = dateRange.startDate && 
                                    dateRange.startDate.toDateString() === date.toDateString();
                                  const isEndDate = dateRange.endDate && 
                                    dateRange.endDate.toDateString() === date.toDateString();
                                  const isInRange = dateRange.startDate && dateRange.endDate &&
                                    date > dateRange.startDate && date < dateRange.endDate;
                                  
                                  // Booked dates are not selectable
                                  const isSelectable = isCurrentMonth && !isPast && !isBooked;
                                  
                                  let className = 'text-center py-2 text-sm rounded-lg transition-colors relative ';
                                  
                                  if (!isCurrentMonth) {
                                    className += 'text-gray-300';
                                  } else if (isBooked) {
                                    // Red styling for booked dates
                                    className += 'bg-red-100 text-red-400 cursor-not-allowed line-through';
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
                                      title={isBooked ? 'This date is already booked' : undefined}
                                      onClick={() => {
                                        if (!isSelectable) return;
                                        
                                        console.log('Date clicked:', date.toDateString());
                                        console.log('Current selectionStep:', selectionStep);
                                        
                                        if (selectionStep === 'checkin') {
                                          // Select check-in date
                                          console.log('Setting check-in date:', date.toDateString());
                                          const newDateRange = {
                                            ...dateRange,
                                            startDate: new Date(date),
                                            endDate: null,
                                            key: 'selection'
                                          };
                                          console.log('📅 New date range:', newDateRange);
                                          console.log('📅 Setting dateRange state...');
                                          setDateRange(newDateRange);
                                          console.log('📅 DateRange state updated');
                                          setSelectionStep('checkout');
                                        } else if (selectionStep === 'checkout') {
                                          // Select check-out date
                                          if (date > dateRange.startDate) {
                                            console.log('Setting check-out date:', date.toDateString());
                                            console.log('🔍 Original date:', date);
                                            console.log('🔍 New Date(date):', new Date(date));
                                            console.log('🔍 Start date:', dateRange.startDate);
                                            const newDateRange = {
                                              ...dateRange,
                                              endDate: new Date(date),
                                              key: 'selection'
                                            };
                                            console.log('📅 Complete date range:', newDateRange);
                                            console.log('🔍 Final endDate:', newDateRange.endDate);
                                            console.log('📅 Setting complete dateRange state...');
                                            setDateRange(newDateRange);
                                            console.log('📅 Complete dateRange state updated');
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
                                      <span>{date.getDate()}</span>
                                      {/* Red dot indicator for booked dates */}
                                      {isBooked && isCurrentMonth && (
                                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                      )}
                                    </div>
                                  );
                                }
                                
                                return days;
                              })()}
                            </div>

                            {/* Legend for booked dates */}
                            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <span>Booked</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                <span>Selected</span>
                              </div>
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
                          
          {/* calendar content */}
        </div>
      );
    })(),
    document.body
  )
}    
                      {/* Test Pricing Button removed */}

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
                              <span className="text-sm font-medium">Available! {pricing?.nights || 0} night{(pricing?.nights || 0) > 1 ? 's' : ''} • {pricing?.total && !isNaN(pricing.total) ? formatPrice(pricing.total) : 'Calculating...'}</span>
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

                      {/* MOBILE ACCORDION HEADER */}
                          <button
                            onClick={() => setShowExtras((prev) => !prev)}
                            className="lg:hidden w-full flex items-center justify-between px-4 py-3 mb-3
                                      bg-purple-50 border border-purple-200 rounded-xl font-semibold"
                          >
                            <span>Add extra hours</span>
                            <ChevronDown
                              className={`transition-transform duration-300 ${
                                showExtras ? "rotate-180" : ""
                              }`}
                            />
                          </button>
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
                                    // Use same calculation as getCalculatedCheckout
                                    const checkout = getCalculatedCheckout();
                                    if (!checkout) return 'Select dates first';
                                    return checkout.toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric', 
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
                            <p className="text-sm text-gray-600">{pricing?.nights || 0} night{(pricing?.nights || 0) > 1 ? 's' : ''} stay</p>
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

            

            

            <MobileBookingBar
            ownerProperty={isOwnProperty}
            property={property}
            dateRange={dateRange}
            nights={nights}
            pricing={pricing}
            availabilityChecked={availabilityChecked}
            availabilityLoading={availabilityLoading}
            selectionStep={selectionStep}
            formatPrice={formatPrice}
            formatDate={formatDate}
            setShowDatePicker={setShowDatePicker}
            setSelectionStep={setSelectionStep}
            checkAvailability={checkAvailability}
            handleBooking={handleBooking}
            setShowTimePrompt={setShowTimePrompt}
            setTimeConfirmed={setTimeConfirmed}
/>
{showTimePrompt && (
  <div className="fixed inset-0 z-[100] bg-black/40 flex items-end">
    <div className="bg-white w-full rounded-t-2xl p-5">

      <h3 className="text-lg font-semibold mb-2">
        Prefer a check-in time?
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        You can choose a time or skip to use the default.
      </p>

      <div className="flex gap-3">
        <Button
          className="flex-1 border"
          onClick={() => {
            setShowTimePrompt(false);
            checkAvailability();
          }}
        >
          Skip
        </Button>

        <Button
          className="flex-1 bg-indigo-600 text-white"
          onClick={() => {
            setShowTimePrompt(false);
            setShowTimeSelector(true);
          }}
        >
          Choose time
        </Button>
      </div>
    </div>
  </div>
)}

 {showTimeSelector && (  
        <div className="fixed inset-0 z-[101] bg-black/40 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-5">
            <h3 className="font-semibold mb-3">Select check-in time</h3>
  timeOptions = generateTimeOptions();

<TimeStepper
  value={checkInTimeStr}
  options={timeOptions}
  formatTimeHour={formatTimeHour} 
  onChange={(newTime) => {
    const [selectedHour] = newTime.split(':').map(Number);

    if (selectedHour >= 0 && selectedHour <= 5 && dateRange.startDate) {
      const nextDay = new Date(dateRange.startDate);
      nextDay.setDate(nextDay.getDate() + 1);

      setDateRange(prev => ({
        ...prev,
        startDate: nextDay,
        endDate: prev.endDate
          ? new Date(prev.endDate.getTime() + 86400000)
          : null
      }));
    }

    setCheckInTimeStr(newTime);
    setAvailabilityChecked(false);
  }}
/>


            

            <Button
              className="w-full mt-4 bg-indigo-600 text-white"
              onClick={() => {
                setTimeConfirmed(true);
                setShowTimeSelector(false);
                checkAvailability();
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      )}


          </div>
            <div  className="mb-10 mt-10">
            <ReviewsSection property={property} />
              </div>
              {/* Location Section with Map */}
              <div className="mb-10">
               
                <PropertyMap
                  address={property.location?.address || 'Address not specified'}
                  city={property.location?.city || 'City not specified'}
                  state={property.location?.state || 'State not specified'}
                  country={property.location?.country || 'India'}
                  coordinates={property.location?.coordinates}
                />
              </div>

              {/* Host Section */}
               <HostCard host={property.host} />
        </div>


{showWishlistModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-[400px]">
      <h3 className="text-lg font-semibold mb-3">Create new list</h3>
      <input
        className="border w-full p-2 rounded mb-4"
        placeholder="My dream stays"
        value={wishlistName}
        onChange={e => setWishlistName(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button onClick={() => setShowWishlistModal(false) 
          // setIsFavorite(false)
        }>
          Cancel
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={createWishlistAndSave}
        >
          Create & Save
        </button>
      </div>
    </div>
  </div>
)}


{showShare && (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
    
    {/* Backdrop */}
    <div
      onClick={() => setShowShare(false)}
      className="absolute inset-0 bg-black/40"
    />

    {/* Modal */}
    <div className="relative bg-white w-full sm:w-[420px] rounded-t-2xl sm:rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Share this place</h3>
        <button
          onClick={() => setShowShare(false)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ShareOption label="Copy link" onClick={handleCopyLink} />
        <ShareOption label="WhatsApp" onClick={handleWhatsApp} />
        <ShareOption label="Facebook" onClick={handleFacebook} />
        <ShareOption label="Email" onClick={handleEmail} />
      </div>
    </div>
  </div>
)}




      </main>
      
      <Footer />
    </div>
  );
}