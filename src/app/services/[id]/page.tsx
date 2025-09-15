"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { DateRange } from 'react-date-range';
import { addDays, format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
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
  Image as ImageIcon
} from 'lucide-react';
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
    state: string;
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
}

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availability, setAvailability] = useState<{ date: Date; isAvailable: boolean; price: number }[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: addDays(new Date(), 1),
    key: 'selection',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient.getService(id as string)
      .then((res: any) => {
        setService(res.data?.service || null);
        setError("");
      })
      .catch(() => setError("Service not found"))
      .finally(() => setLoading(false));
    
    // Fetch availability
    apiClient.getServiceAvailability(id as string)
      .then((res: any) => {
        if (res.success && res.data && Array.isArray(res.data.availability)) {
          setAvailability(res.data.availability.map((a: any) => ({
            date: a.date ? new Date(a.date) : new Date(),
            isAvailable: a.isAvailable,
            price: a.price
          })));
        }
      });
  }, [id]);

  // Only allow selection of available dates
  const isDateAvailable = (date: Date) => {
    return availability.some(a => a.isAvailable && format(a.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  };

  const handleDateRangeChange = (ranges: any) => {
    const { selection } = ranges;
    setDateRange(selection);
  };

  const handleBook = () => {
    // Only allow booking if all selected dates are available
    const current = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    while (current <= end) {
      if (!isDateAvailable(current)) {
        alert('Selected range includes unavailable dates.');
        return;
      }
      current.setDate(current.getDate() + 1);
    }
    // Proceed to booking page or modal
    router.push(`/book/${id}?checkIn=${format(dateRange.startDate, 'yyyy-MM-dd')}&checkOut=${format(dateRange.endDate, 'yyyy-MM-dd')}`);
  };

  const formatPrice = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatServiceType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
            <Button 
              onClick={() => router.back()} 
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft size={16} className="mr-2" />
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
      
      {/* Hero Section with Image Gallery */}
      <section className="relative pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="hover:bg-white/80 transition-all duration-200 rounded-full p-2"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </Button>
          </div>

          {/* Image Gallery */}
          <div className="relative mb-8">
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-200">
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
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex 
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
                <Heart 
                  size={20} 
                  className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'} 
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/90 backdrop-blur-sm hover:bg-white"
              >
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

          {/* Service Header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{service.title}</h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{service.location.city}, {service.location.state}</span>
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
                  <div className="font-semibold text-gray-900">
                    {service.groupSize.min}-{service.groupSize.max}
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Clock size={24} className="text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-semibold text-gray-900">
                    {service.duration.value} {service.duration.unit}
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Shield size={24} className="text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Policy</div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {service.cancellationPolicy}
                  </div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                  <CheckCircle size={24} className="text-emerald-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {service.status}
                  </div>
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
                    {service.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatPrice(service.pricing.basePrice, service.pricing.currency)}
                    </div>
                    <div className="text-gray-600">per service</div>
                    {service.pricing.perPersonPrice && (
                      <div className="text-sm text-gray-500 mt-1">
                        +{formatPrice(service.pricing.perPersonPrice, service.pricing.currency)} per person
                      </div>
                    )}
                  </div>

                  {/* Date Selection */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar size={16} />
                      Select Dates
                    </h4>
                    <DateRange
                      ranges={[dateRange]}
                      onChange={handleDateRangeChange}
                      minDate={new Date()}
                      showDateDisplay={false}
                      disabledDay={(date) => !isDateAvailable(date)}
                      className="mb-4"
                    />
                  </div>

                  {/* Booking Button */}
                  <Button 
                    onClick={handleBook} 
                    disabled={bookingLoading}
                    className="w-full py-3 text-lg font-semibold"
                  >
                    {bookingLoading ? 'Processing...' : 'Book Now'}
                  </Button>

                  {/* Cancellation Policy */}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Free cancellation up to 24h before
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">About the provider</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                {service.provider.profileImage ? (
                  <Image
                    src={service.provider.profileImage}
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
                  {service.provider.isVerified && (
                    <CheckCircle size={16} className="text-blue-500" />
                  )}
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
                    <Phone size={14} />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Mail size={14} />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 