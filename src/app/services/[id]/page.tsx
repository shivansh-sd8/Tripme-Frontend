"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/core/store/auth-context";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { format, addDays, startOfDay, isSameDay, isBefore } from 'date-fns';
import Button from '@/components/ui/Button';
import {
  MapPin,
  Users,
  Clock,
  Star,
  Calendar,
  Phone,
  Mail,
  Heart,
  Share2,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import PropertyMap from "@/components/rooms/PropertyMap";
import Image from 'next/image';

interface ServiceDetails {
  _id: string;
  title: string;
  description: string;
  provider: {
    _id: string;
    name: string;
    profileImage?: string;
    isVerified?: boolean;
    rating?: number;
    reviewCount?: number;
  };
  serviceType: string;
  duration: { value: number; unit: string };
  location: {
    city: string;
    state?: string;
    country: string;
    address?: string;
  };
  groupSize: {
    min: number;
    max: number;
  };
  pricing: {
    basePrice: number;
    perPersonPrice?: number;
    currency: string;
  };
  cancellationPolicy: string;
  requirements: string[];
  media: { url: string; type: string; caption?: string }[];
  rating: number;
  reviewCount: number;
  status: string;
  availableSlots?: { startTime: string | Date; endTime: string | Date; isAvailable: boolean; status?: string }[];
}

interface TimeSlot {
  time: string; // "10:00 AM"
  startDate: Date;
  endDate: Date;
  isAvailable: boolean;
}

// Read individual available slots for a date directly (no re-splitting)
// The host saves pre-split slots each = 1 service duration already
function getSlotsForDate(
  date: Date,
  availableSlots: { startTime: string | Date; endTime: string | Date; isAvailable: boolean; status?: string }[]
): TimeSlot[] {
  const dateStr = format(date, 'yyyy-MM-dd');
  return availableSlots
    .filter(slot => {
      const slotDate = new Date(slot.startTime);
      const isAvail = slot.status === 'available' || (slot.isAvailable === true && slot.status !== 'unavailable' && slot.status !== 'on-hold' && slot.status !== 'booked');
      return format(slotDate, 'yyyy-MM-dd') === dateStr && isAvail;
    })
    .map(slot => ({
      time: format(new Date(slot.startTime), 'h:mm a'),
      startDate: new Date(slot.startTime),
      endDate: new Date(slot.endTime),
      isAvailable: true,
    }))
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

// Build a week of visible dates starting from weekStart
function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();

  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Slot-based booking state
  const [calendarWeekStart, setCalendarWeekStart] = useState<Date>(() => startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // all available slots fetched from API separately (fresh, authoritative)
  const [apiSlots, setApiSlots] = useState<{ startTime: string | Date; endTime: string | Date; isAvailable: boolean; status?: string }[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Fetch service details + availability in parallel
    Promise.all([
      apiClient.getService(id as string),
      apiClient.getServiceAvailability(id as string),
    ])
      .then(([svcRes, availRes]: [any, any]) => {
        const svc = svcRes.data?.service || null;
        setService(svc);
        // Detect if the current user is the service provider
        if (user && svc) {
          const ownerId = svc.user ? String(svc.user) : (svc.provider ? String(svc.provider._id) : '');
          setIsProvider(ownerId !== '' && ownerId === String(user._id));
        }
        // Prefer the dedicated availability endpoint for freshest slot data
        const slots = availRes?.data?.availableSlots || svc?.availableSlots || [];
        setApiSlots(slots);
        setError('');
      })
      .catch(() => setError('Service not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // Recompute time slots whenever the selected date or slot data changes
  useEffect(() => {
    if (!selectedDate) return;
    // Use API slots as primary source, fall back to service.availableSlots
    const source = apiSlots.length > 0 ? apiSlots : (service?.availableSlots || []);
    const slots = getSlotsForDate(selectedDate, source);
    setTimeSlots(slots);
    setSelectedSlot(null);
  }, [selectedDate, apiSlots, service]);

  const weekDates = getWeekDates(calendarWeekStart);

  const prevWeek = () => setCalendarWeekStart(d => addDays(d, -7));
  const nextWeek = () => setCalendarWeekStart(d => addDays(d, 7));

  const today = startOfDay(new Date());

  const handleBook = () => {
    if (!selectedDate || !selectedSlot) {
      alert('Please select a date and time slot.');
      return;
    }
    // Route to dedicated service booking page (not the property booking page)
    router.push(
      `/book/service/${id}?checkIn=${format(selectedSlot.startDate, "yyyy-MM-dd'T'HH:mm")}&checkOut=${format(selectedSlot.endDate, "yyyy-MM-dd'T'HH:mm")}`
    );
  };

  const formatPrice = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatServiceType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDuration = (value: number, unit: string) => {
    if (unit === 'hours') return value === 1 ? '1 hr' : `${value} hrs`;
    if (unit === 'minutes') return `${value} min`;
    if (unit === 'days') return value === 1 ? '1 day' : `${value} days`;
    return `${value} ${unit}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
            <span className="text-xl text-gray-600">Loading service details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
            <p className="text-gray-600">The service you are looking for does not exist.</p>
            <Button onClick={() => router.back()} className="mt-4" variant="outline">
              <ArrowLeft size={16} className="mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const durationLabel = `${service.duration.value} ${service.duration.unit}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <br />

          {/* Image Gallery */}
          <div className="relative mb-6 md:mb-8 mt-4 md:mt-0">
            <div className="aspect-video md:aspect-[32/9] rounded-2xl overflow-hidden bg-gray-200">
              {service.media && service.media.length > 0 ? (
                <Image
                  src={service.media[selectedImageIndex]?.url || '/placeholder-service.jpg'}
                  alt={service.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={64} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {service.media && service.media.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {service.media.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${index === selectedImageIndex
                        ? 'border-white shadow-lg'
                        : 'border-white/50 hover:border-white/80'
                        }`}
                    >
                      <Image
                        src={media.url}
                        alt={media.caption || `Image ${index + 1}`}
                        width={64}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'} />
              </Button>
              <Button variant="ghost" size="sm" className="bg-white/90 backdrop-blur-sm hover:bg-white">
                <Share2 size={20} className="text-gray-700" />
              </Button>
            </div>

            {/* Service Type Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-2 bg-white/90 backdrop-blur-sm text-sm font-medium text-purple-700 rounded-full shadow-lg">
                {formatServiceType(service.serviceType)}
              </span>
            </div>
          </div>

          {/* Main Content + Booking Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">

            {/* ---- Left: Service Info ---- */}
            <div className="lg:col-span-2">
              {/* Title & Location */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{service.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-600 mb-4 text-sm md:text-base">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{service.location.city}{service.location.state ? `, ${service.location.state}` : ''}</span>
                    </div>
                    {service.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-current" />
                        <span>{service.rating}</span>
                        <span className="text-gray-500">({service.reviewCount} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Users size={24} className="text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Group Size</div>
                  <div className="font-semibold text-gray-900">{service.groupSize.min}-{service.groupSize.max}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Clock size={24} className="text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-semibold text-gray-900">{formatDuration(service.duration.value, service.duration.unit)}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Shield size={24} className="text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Policy</div>
                  <div className="font-semibold text-gray-900 capitalize">{service.cancellationPolicy}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <CheckCircle size={24} className="text-emerald-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-semibold text-gray-900 capitalize">{service.status}</div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">About this service</h3>
                <p className="text-gray-700 leading-relaxed">{service.description}</p>
              </div>

              {/* Requirements */}
              {service.requirements && service.requirements.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {service.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-12">
  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 text-center sm:text-left">
    About the provider
  </h3>
  
  {/* Change to column layout on mobile, row on tablet+ */}
  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
    
    {/* Profile Image Container */}
    <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-gray-50">
      {service.provider.profileImage ? (
        <Image
          src={
            service.provider.profileImage?.startsWith("http")
              ? service.provider.profileImage
              : `/${service.provider.profileImage}`
          }
          alt={service.provider.name}
          width={80}
          height={80}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <Users size={32} />
        </div>
      )}
    </div>

    {/* Content Section */}
    <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left w-full">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-semibold text-gray-900 text-lg">{service.provider.name}</h4>
        {service.provider.isVerified && <CheckCircle size={18} className="text-blue-500" />}
      </div>

      {service.provider.rating && (
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
          <Star size={14} className="text-yellow-500 fill-current" />
          <span className="font-medium">{service.provider.rating}</span>
          <span className="text-gray-400">({service.provider.reviewCount} reviews)</span>
        </div>
      )}

      {/* Buttons: Full width on mobile, auto width on desktop */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 h-11 sm:h-9">
          <Phone size={14} /> Contact
        </Button>
        <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 h-11 sm:h-9">
          <Mail size={14} /> Message
        </Button>
      </div>
    </div>
  </div>
</div>


 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
  <h3 className="text-xl font-semibold text-gray-900 mb-3">
    What you'll get
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex gap-3">
      <CheckCircle className="text-green-500 mt-1" size={16} />
      <div>
        <p className="font-medium text-gray-900">Professional service</p>
        <p className="text-sm text-gray-600">Delivered by expert provider</p>
      </div>
    </div>

    <div className="flex gap-3">
      <Clock className="text-blue-500 mt-1" size={16} />
      <div>
        <p className="font-medium text-gray-900">Flexible timing</p>
        <p className="text-sm text-gray-600">Choose your preferred slot</p>
      </div>
    </div>
  </div>
         </div>

<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
  <h3 className="text-xl font-semibold text-gray-900 mb-4">
    Reviews ({service.reviewCount})
  </h3>

  {service.reviewCount === 0 ? (
    <p className="text-gray-500">No reviews yet</p>
  ) : (
    <div className="space-y-4">
      {/* later map real reviews */}
      <div className="border-b pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Star size={14} className="text-yellow-500 fill-current" />
          <span className="font-medium">4.8</span>
        </div>
        <p className="text-gray-700 text-sm">
          Amazing service, very professional!
        </p>
      </div>
    </div>
  )}

  
</div>


 <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Things to know</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Guest requirements</h4>
                  <p style={{ fontSize: 13, color: "#717171", lineHeight: 1.6 }}>
                    Guests aged 2 and up can attend. Group size: {service.groupSize.min}–{service.groupSize.max} guests.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Service details</h4>
                  <p style={{ fontSize: 13, color: "#717171", lineHeight: 1.6 }}>
                    Duration: {formatDuration(service.duration.value, service.duration.unit)}. Type: {service.serviceType}.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Cancellation policy</h4>
                  <p style={{ fontSize: 13, color: "#717171", lineHeight: 1.6 }}>
                    {service.cancellationPolicy === "free" || service.cancellationPolicy === "flexible"
                      ? "Free cancellation up to 24 hours before the service."
                      : `${service.cancellationPolicy.charAt(0).toUpperCase()}${service.cancellationPolicy.slice(1)} policy applies.`}
                  </p>
                </div>
              </div>
            </div>

<div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 sm:mb-12 overflow-hidden">
  
  {/* Header with padding */}
  <div className="p-4 sm:p-6 pb-0">
    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
      Location
    </h3>
  </div>
  
  {/* Map container with NO padding (Full Cover) */}
  <div className="w-full h-[400px] sm:h-[450px] relative border-t border-gray-100">
    <PropertyMap
      address={service.location?.address || 'Address not specified'}
      city={service.location?.city || 'City not specified'}
      state={service.location?.state || 'State not specified'}
      country={service.location?.country || 'India'}
      coordinates={service.location?.coordinates}
    />
  </div>
</div>




            </div>

            {/* ---- Right: Airbnb-style Booking Card ---- */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">

                  {/* Price Header */}
                  <div className="mb-5">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(service.pricing.basePrice, service.pricing.currency)}
                      <span className="text-base font-normal text-gray-500"> / session</span>
                    </div>
                    {service.pricing.perPersonPrice && service.pricing.perPersonPrice > 0 && (
                      <div className="text-sm text-gray-500 mt-0.5">
                        +{formatPrice(service.pricing.perPersonPrice, service.pricing.currency)} per person
                      </div>
                    )}
                  </div>

                  {/* ====== WEEK DATE PICKER ====== */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                        <Calendar size={15} />
                        {selectedDate
                          ? format(selectedDate, 'MMMM yyyy')
                          : format(calendarWeekStart, 'MMMM yyyy')}
                      </h4>
                      <div className="flex gap-1">
                        <button
                          onClick={prevWeek}
                          disabled={isBefore(addDays(calendarWeekStart, -1), today)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Previous week"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={nextWeek}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                          aria-label="Next week"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-semibold text-gray-400 uppercase">
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Date cells */}
                    <div className="grid grid-cols-7 gap-1">
                      {weekDates.map((date) => {
                        const isPast = isBefore(date, today);
                        const isSelected = selectedDate && isSameDay(date, selectedDate);
                        const isToday = isSameDay(date, today);

                        return (
                          <button
                            key={date.toISOString()}
                            onClick={() => !isPast && setSelectedDate(date)}
                            disabled={isPast}
                            className={`
                              relative flex flex-col items-center justify-center py-2 rounded-xl text-sm font-medium transition-all duration-150
                              ${isPast
                                ? 'text-gray-300 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-gray-900 text-white shadow-md'
                                  : 'hover:bg-gray-100 text-gray-800 cursor-pointer'
                              }
                              ${isToday && !isSelected ? 'ring-2 ring-purple-500' : ''}
                            `}
                          >
                            <span className="text-base leading-none">{format(date, 'd')}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ====== TIME SLOTS ====== */}
                      {selectedDate && (
                    <div className="mb-5 border-t border-gray-100 pt-4">
                      <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                        <Clock size={14} />
                        {format(selectedDate, 'EEE, MMM d')} — Available Times
                        <span className="ml-auto text-xs font-normal text-gray-400">
                          {durationLabel} per slot
                        </span>
                      </h4>

                      {timeSlots.length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                          <Clock size={22} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm font-medium">No slots available</p>
                          <p className="text-xs mt-1 opacity-70">The host hasn't opened any slots for this date yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                          {timeSlots.map((slot, idx) => {
                            const isActive = selectedSlot && selectedSlot.time === slot.time && isSameDay(slot.startDate, selectedSlot.startDate);
                            return (
                              <button
                                key={idx}
                                onClick={() => setSelectedSlot(slot)}
                                className={`
                                  py-2 px-3 rounded-xl border text-center text-sm font-medium transition-all duration-150
                                  ${isActive
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                    : 'border-gray-200 text-gray-700 hover:border-gray-800 hover:bg-gray-50 cursor-pointer'
                                  }
                                `}
                              >
                                {slot.time}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selection Summary */}
                  {selectedDate && selectedSlot && (
                    <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-xl text-sm">
                      <div className="flex items-center gap-2 text-purple-700 font-semibold mb-1">
                        <CheckCircle size={14} />
                        Selected Session
                      </div>
                      <div className="text-purple-600">
                        {format(selectedDate, 'EEE, MMM d')} · {selectedSlot.time} – {format(selectedSlot.endDate, 'h:mm a')}
                      </div>
                    </div>
                  )}

                  {/* Book Button — hidden for service providers */}
                  {isProvider ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-center text-sm text-purple-700 font-medium">
                        You are the provider of this service
                      </div>
                      <Button
                        onClick={() => router.push(`/host/service/${id}`)}
                        className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                      >
                        Edit Service
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/host/service/${id}/availability`)}
                        className="w-full py-3 text-base font-semibold rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Calendar size={16} className="mr-2" />
                        Manage Calendar
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={handleBook}
                        disabled={bookingLoading || !selectedDate || !selectedSlot}
                        className={`w-full py-3 text-base font-semibold rounded-xl transition-all ${(!selectedDate || !selectedSlot)
                          ? 'opacity-60 cursor-not-allowed'
                          : ''
                          }`}
                      >
                        {bookingLoading ? 'Processing...' : !selectedDate ? 'Select a date' : !selectedSlot ? 'Select a time' : 'Book Now'}
                      </Button>
                      <p className="mt-3 text-center text-xs text-gray-500">
                        Free cancellation up to 24h before
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Provider Information */}
          {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">About the provider</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {service.provider.profileImage ? (
                  <Image
                    src={
                      service.provider.profileImage?.startsWith("http")
                        ? service.provider.profileImage
                        : `/${service.provider.profileImage}`
                    }
                    alt={service.provider.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <Users size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{service.provider.name}</h4>
                  {service.provider.isVerified && <CheckCircle size={16} className="text-blue-500" />}
                </div>
                {service.provider.rating && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span>{service.provider.rating}</span>
                    <span>({service.provider.reviewCount} reviews)</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Phone size={14} /> Contact
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Mail size={14} /> Message
                  </Button>
                </div>
              </div>
            </div>
          </div> */}

          


         

{/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
  <h3 className="text-xl font-semibold text-gray-900 mb-4">
    Location
  </h3>
   <div className="mb-10" >

            <PropertyMap
              address={service.location?.address || 'Address not specified'}
              city={service.location?.city || 'City not specified'}
              state={service.location?.state || 'State not specified'}
              country={service.location?.country || 'India'}
              coordinates={service.location?.coordinates}
            />
          </div>

 
</div> */}

{/* 
  1. Remove 'p-6' from the outer container and use 'overflow-hidden' to clip map corners
  2. Add 'p-4 sm:p-6' only to the header so the map stays full-width 
*/}




        </div>
        
        
      </section>

      

      <Footer />
    </div>
  );
}

