"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MapPin, 
  Star, 
  Heart, 
  Shield, 
  ArrowRight,
  Mountain,
  Waves,
  Building2,
  TreePine,
  Award,
  CheckCircle,
  Plane,
  Tag,
  Calendar,
  Copy,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import PricesPopup from "@/components/shared/PricesPopup";
import { useAuth } from '@/core/store/auth-context';
import Button from '@/shared/components/ui/Button';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, refreshUser } = useAuth();
  const [featuredStays, setFeaturedStays] = useState<Array<{
    _id: string;
    title: string;
    description: string;
    price: { amount: number; currency: string };
    images: string[];
    host: { name: string; avatar?: string } | string;
    location: { city: string; state: string; country: string };
    rating: number;
    reviewCount: number;
  }>>([]);
  const [popularDestinations, setPopularDestinations] = useState<Array<{
    name: string;
    image: string;
    stays: string;
    description: string;
    icon: React.ReactNode;
  }>>([]);
  const [activeCoupons, setActiveCoupons] = useState<Array<{
    _id: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    amount: number;
    maxDiscount?: number;
    minBookingAmount?: number;
    validFrom: string;
    validTo: string;
    validUntil: string;
    isActive: boolean;
    usageLimit?: number;
    usedCount?: number;
  }>>([]);
  const [couponLoading, setCouponLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  const [currentHotelIndex, setCurrentHotelIndex] = useState(0);
  const [weekendProperties, setWeekendProperties] = useState<any[]>([]);
  const [weekendLoading, setWeekendLoading] = useState(true);

  // Fetch weekend properties from database
  const fetchWeekendProperties = async () => {
    try {
      setWeekendLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/featured?limit=6`);
      
      if (response.ok) {
        const data = await response.json();
        setWeekendProperties(data.data?.listings || []);
      } else {
        console.error('Failed to fetch featured listings:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching weekend properties:', error);
    } finally {
      setWeekendLoading(false);
    }
  };

  // Hotel carousel functions
  const nextHotel = () => {
    if (weekendProperties.length <= 2) return; // No navigation for 1-2 properties
    setCurrentHotelIndex((prev) => (prev + 1) % weekendProperties.length);
  };

  const prevHotel = () => {
    if (weekendProperties.length <= 2) return; // No navigation for 1-2 properties
    setCurrentHotelIndex((prev) => (prev - 1 + weekendProperties.length) % weekendProperties.length);
  };

  // Get visible hotels for carousel
  const getVisibleHotels = () => {
    if (weekendProperties.length === 0) return [];
    
    const visible = [];
    const totalProperties = weekendProperties.length;
    
    if (totalProperties === 1) {
      // Single property - center it
      visible.push({ ...weekendProperties[0], position: 1 });
    } else if (totalProperties === 2) {
      // Two properties - show both side by side
      visible.push({ ...weekendProperties[0], position: 0 });
      visible.push({ ...weekendProperties[1], position: 2 });
    } else {
      // Three or more properties - show 3 with center focus
      for (let i = 0; i < 3; i++) {
        const index = (currentHotelIndex + i) % totalProperties;
        visible.push({ ...weekendProperties[index], position: i });
      }
    }
    
    return visible;
  };

  // Removed forceUpdate effect as it was unused

  useEffect(() => {
    fetchHomeData();
    fetchActiveCoupons();
    fetchWeekendProperties();
  }, []);

  // Auto-hide copied coupon notification
  useEffect(() => {
    if (copiedCoupon) {
      const timer = setTimeout(() => {
        setCopiedCoupon(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedCoupon]);

  // Refresh user data when component mounts to ensure we have the latest role
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Only refresh once when component mounts
      const shouldRefresh = !user || user.role === 'guest';
      if (shouldRefresh) {
        refreshUser();
      }
    }
  }, [isAuthenticated, isLoading, refreshUser, user]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      // Fetch featured stays (properties with isFeatured: true)
      const featuredResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/featured?limit=6`);
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        const fetchedStays = featuredData.data?.listings || [];
        
        // Transform the data to match the expected format
        const transformedStays = fetchedStays.map((stay: any) => ({
          _id: stay._id,
          title: stay.title,
          description: stay.description,
          price: {
            amount: stay.pricing?.basePrice || stay.price?.amount || 0,
            currency: stay.pricing?.currency || stay.price?.currency || 'INR'
          },
          images: stay.propertyImages?.map((img: any) => img.url) || stay.images || [],
          host: stay.host,
          location: stay.location,
          rating: stay.rating?.average || stay.rating || 0,
          reviewCount: stay.reviewCount || 0,
          tags: [...(stay.amenities || []), ...(stay.features || [])]
        }));
        
        setFeaturedStays(transformedStays);
      }

      // Set hardcoded popular destinations for famous Indian cities
      const hardcodedDestinations = [
        {
          name: "Delhi",
          image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          stays: "2,500+ stays",
          description: "Capital Heritage",
          icon: <Building2 className="w-5 h-5" />
        },
        {
          name: "Mumbai",
          image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          stays: "3,200+ stays",
          description: "City of Dreams",
          icon: <Building2 className="w-5 h-5" />
        },
        {
          name: "Manali",
          image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          stays: "1,500+ stays",
          description: "Mountains & Adventure",
          icon: <Mountain className="w-5 h-5" />
        },
        {
          name: "Jaipur",
          image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          stays: "1,800+ stays",
          description: "Pink City Heritage",
          icon: <Building2 className="w-5 h-5" />
        },
        {
          name: "Goa",
          image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          stays: "2,100+ stays",
          description: "Beaches & Nightlife",
          icon: <Waves className="w-5 h-5" />
        },
        {
          name: "Udaipur",
          image: "https://images.unsplash.com/photo-1629210132098-592c636e3d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          stays: "1,200+ stays",
          description: "City of Lakes",
          icon: <TreePine className="w-5 h-5" />
        }
      ];
      setPopularDestinations(hardcodedDestinations);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveCoupons = async () => {
    try {
      setCouponLoading(true);
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/public?isActive=true&limit=6`);
      if (response.ok) {
        const data = await response.json();
        setActiveCoupons(data.data?.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setCouponLoading(false);
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    // You could add a toast notification here
  };

  // Carousel navigation functions with circular behavior
  const nextCoupon = () => {
    if (activeCoupons.length <= 3) return; // No navigation needed if 3 or fewer coupons
    
    setCurrentCouponIndex((prev) => 
      prev + 3 >= activeCoupons.length ? 0 : prev + 3
    );
  };

  const prevCoupon = () => {
    if (activeCoupons.length <= 3) return; // No navigation needed if 3 or fewer coupons
    
    setCurrentCouponIndex((prev) => 
      prev - 3 < 0 ? Math.max(0, Math.floor((activeCoupons.length - 1) / 3) * 3) : prev - 3
    );
  };

  // Get visible coupons for current page with circular behavior
  const getVisibleCoupons = () => {
    const coupons = [];
    const maxVisible = Math.min(3, activeCoupons.length);
    
    if (activeCoupons.length === 0) {
      return [];
    }
    
    // If we have fewer than 3 coupons, just show what we have
    if (activeCoupons.length <= 3) {
      return activeCoupons;
    }
    
    // If we have more than 3 coupons, use circular behavior
    for (let i = 0; i < maxVisible; i++) {
      const index = (currentCouponIndex + i) % activeCoupons.length;
      coupons.push(activeCoupons[index]);
    }
    return coupons;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
          <span className="text-xl text-gray-600">Loading amazing destinations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Copy Notification */}
      {copiedCoupon && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5" />
          <span>Coupon code &quot;{copiedCoupon}&quot; copied to clipboard!</span>
        </div>
      )}

      <main className="pt-0 z-0 relative">
        {/* Hero Section - Two Column Layout Inspired by Image */}
        <section className="relative min-h-screen flex items-center pt-32 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start lg:items-center">
              
              {/* Left Column - Main Content */}
              <div className="space-y-6 lg:space-y-8">
                {/* Brand Tagline */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Plane className="w-6 h-6 text-blue-600" />
              <span className="text-blue-600 font-semibold text-lg font-heading">TripMe Travel Gems —</span>
                  </div>
                </div>

                {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight font-display">
                  Discover the Best Destinations Across India
                </h1>

                {/* Description */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-xl font-body">
                  Embark on the adventure of a lifetime, where every step you take unveils a new story, and every destination leaves a lasting impression.
                </p>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm lg:text-base text-gray-600 font-medium">100% Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="text-sm lg:text-base text-gray-600 font-medium">Secure Booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm lg:text-base text-gray-600 font-medium">Best Prices</span>
                  </div>
                </div>

              </div>

              {/* Right Column - Direct Image */}
              <div className="relative flex items-center justify-center lg:justify-end h-[450px] sm:h-[550px] lg:h-[650px] xl:h-[750px] pt-8 lg:pt-12">
                <img
                  src="/finalImage.png"
                  alt="Indian Destinations"
                  className="max-h-full w-auto max-w-full cursor-pointer hover:scale-105 transition-transform duration-500"
                  onClick={() => router.push('/search')}
                />
              </div>
            </div>
          </div>
        </section>


        {/* Dynamic Coupon Section - Fixed Height Carousel */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">Active Coupons</h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto font-body">
                Check out our latest active coupons and discounts
              </p>
            </div>
            
            {/* Fixed height carousel container */}
            <div className="relative">
              {couponLoading ? (
                <div className="h-80 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  <div className="text-center">
                  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600">Loading coupons...</p>
                  </div>
                </div>
              ) : activeCoupons.length > 0 ? (
                <>
                  {/* Navigation arrows */}
                  {activeCoupons.length > 3 && (
                    <>
                      <button
                        onClick={prevCoupon}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 border border-gray-200"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={nextCoupon}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 border border-gray-200"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </>
                  )}
                  
                  {/* Coupon cards container with fixed height */}
                  <div className="h-80 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full">
                      {getVisibleCoupons().map((coupon) => (
                  <div
                    key={coupon._id}
                          className="bg-white rounded-2xl shadow-lg p-4 text-center hover:shadow-xl hover:scale-102 transition-all duration-300 relative overflow-hidden h-full flex flex-col"
                        >
                          {/* Gradient background overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 to-blue-50/20 rounded-2xl"></div>
                          
                          {/* Top section with coupon icon (left) and days left (right) */}
                          <div className="relative z-10 flex justify-between items-start mb-3">
                            {/* Coupon icon - top left */}
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                              <Tag className="w-5 h-5 text-white" />
                            </div>
                            
                            {/* Days left - top right */}
                            <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                              {Math.ceil((new Date(coupon.validTo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                            </div>
                    </div>
                          
                          {/* Main content - optimized for fixed height */}
                          <div className="relative z-10 mb-3 flex-1 min-h-0">
                            {/* Coupon code with compact styling */}
                            <h3 className="text-xl font-black text-gray-900 mb-2 tracking-wide">{coupon.code}</h3>
                            
                            {/* Discount amount with compact visual hierarchy */}
                            <div className="mb-2">
                              <div className="text-2xl font-black text-green-600 mb-1">
                        {coupon.discountType === 'percentage' ? `${coupon.amount}% OFF` : `₹${coupon.amount} OFF`}
                      </div>
                              <div className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                {coupon.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                              </div>
                            </div>
                            
                            {/* Additional details with clear labels - more compact */}
                            <div className="space-y-0.5">
                              {coupon.discountType === 'percentage' && coupon.maxDiscount && (
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Max discount: ₹{coupon.maxDiscount}</span>
                                </div>
                      )}
                      {coupon.minBookingAmount && (
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Min booking: ₹{coupon.minBookingAmount}</span>
                                </div>
                      )}
                    </div>
                    </div>
                    
                          
                          {/* Usage section - more compact */}
                          <div className="relative z-10 mb-3">
                            {coupon.usageLimit ? (
                              <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-medium text-gray-700">Usage</span>
                                  <span className="text-xs font-bold text-gray-900">{coupon.usedCount || 0} of {coupon.usageLimit}</span>
                        </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                          <div 
                                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(((coupon.usedCount || 0) / coupon.usageLimit) * 100, 100)}%` }}
                          ></div>
                        </div>
                                <div className="text-center">
                                  <span className="inline-flex items-center px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                                    {Math.round(((coupon.usedCount || 0) / coupon.usageLimit) * 100)}% used
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                                <div className="flex items-center justify-center">
                                  <span className="text-green-700 font-bold text-xs">Unlimited usage</span>
                        </div>
                      </div>
                    )}
                          </div>
                    
                          {/* Compact copy button */}
                          <div className="relative z-10 mt-auto flex justify-center">
                    <button
                      onClick={() => copyCouponCode(coupon.code)}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-bold text-xs hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                              <Copy className="w-3 h-3 inline mr-1" />
                              {copiedCoupon === coupon.code ? 'Copied!' : 'Copy Code'}
                    </button>
                            {copiedCoupon === coupon.code && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Pagination dots - circular carousel */}
                  {activeCoupons.length > 3 && (
                    <div className="flex justify-center mt-4 space-x-2">
                      {Array.from({ length: Math.ceil(activeCoupons.length / 3) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentCouponIndex(index * 3)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            Math.floor(currentCouponIndex / 3) === index
                              ? 'bg-purple-600 w-8'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-80 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Coupons</h3>
                  <p className="text-gray-600">Check back soon for exciting offers and discounts!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Top-Recommended Destinations Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-4 gap-4 h-[500px]">
              
              {/* Block 1: Title on top, Image below */}
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Top-Recommended Destinations</h2>
                <div 
                  className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  onClick={() => router.push(`/search?city=${encodeURIComponent(popularDestinations[0]?.name || 'Mumbai')}`)}
                >
                  <img
                    src={popularDestinations[0]?.image || '/placeholder-destination.jpg'}
                    alt={popularDestinations[0]?.name || 'Mumbai'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                      <span className="text-lg">🇮🇳</span>
                      <span>Mumbai</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <ArrowRight className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 2: One big image */}
              <div className="space-y-3">
                <div 
                  className="group relative h-[90%] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  onClick={() => router.push(`/search?city=${encodeURIComponent(popularDestinations[1]?.name || 'Delhi')}`)}
                >
                  <img
                    src={popularDestinations[1]?.image || '/placeholder-destination.jpg'}
                    alt={popularDestinations[1]?.name || 'Delhi'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                      <span className="text-lg">🇮🇳</span>
                      <span>Delhi</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <ArrowRight className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 3: One big image */}
              <div className="space-y-3">
                <div 
                  className="group relative h-[90%] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  onClick={() => router.push(`/search?city=${encodeURIComponent(popularDestinations[2]?.name || 'Goa')}`)}
                >
                  <img
                    src={popularDestinations[2]?.image || '/placeholder-destination.jpg'}
                    alt={popularDestinations[2]?.name || 'Goa'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                      <span className="text-lg">🇮🇳</span>
                      <span>Goa</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <ArrowRight className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 4: Image on top, Subheading on bottom */}
              <div className="space-y-3">
                <div 
                  className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  onClick={() => router.push(`/search?city=${encodeURIComponent(popularDestinations[3]?.name || 'Kerala')}`)}
                >
                  <img
                    src={popularDestinations[3]?.image || '/placeholder-destination.jpg'}
                    alt={popularDestinations[3]?.name || 'Kerala'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                      <span className="text-lg">🇮🇳</span>
                      <span>Kerala</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                      <ArrowRight className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">When it comes to planning a dream vacation, some destinations stand out as top recommendations for travelers worldwide.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Weekend Offers Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-0.5 bg-blue-600"></div>
                <span className="mx-4 text-blue-600 font-medium">Weekend Offers</span>
                <div className="w-8 h-0.5 bg-blue-600"></div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Deals For The Weekend</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Don't miss out on these limited-time offers, and make the most of your weekend with a spontaneous trip that's easy on the wallet. Save on stays for 09 August - 11 August.
              </p>
            </div>

            {/* Hotel Carousel */}
            <div className="relative">
              {/* Navigation Arrows - Only show for 3+ properties */}
              {weekendProperties.length > 2 && (
                <>
                  <button 
                    onClick={prevHotel}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border border-white/20"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button 
                    onClick={nextHotel}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border border-white/20"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Carousel Container */}
              {weekendLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : weekendProperties.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">No weekend offers available at the moment.</p>
                </div>
              ) : (
                <div className={`flex items-center justify-center gap-6 overflow-hidden ${
                  weekendProperties.length === 1 ? 'justify-center' : 
                  weekendProperties.length === 2 ? 'justify-center' : 
                  'justify-center'
                }`}>
                  {getVisibleHotels().map((property, index) => (
                    <div 
                      key={`${property._id}-${index}`}
                      className={`
                        transition-all duration-700 overflow-hidden cursor-pointer
                        hover:scale-105 hover:-translate-y-2
                        ${weekendProperties.length === 1 
                          ? 'scale-100 z-20 transform' // Single property - normal size
                          : weekendProperties.length === 2 
                            ? property.position === 0 
                              ? 'scale-100 z-20 transform hover:scale-105' // Left property - normal size
                              : 'scale-100 z-20 transform hover:scale-105' // Right property - normal size
                            : property.position === 1 
                              ? 'scale-110 z-20 transform hover:scale-115' // Center property - larger
                              : property.position === 0 
                                ? 'scale-95 -translate-x-4 z-10 opacity-80 hover:scale-100 hover:opacity-90' // Left property - smaller
                                : 'scale-95 translate-x-4 z-10 opacity-80 hover:scale-100 hover:opacity-90' // Right property - smaller
                        }
                      `}
                      onClick={() => router.push(`/rooms/${property._id}`)}
                    >
                      <div className={`shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden ${
                        weekendProperties.length === 1 
                          ? 'w-96' // Single property - 20% wider
                          : weekendProperties.length === 2 
                            ? 'w-96' // Two properties - 20% wider
                            : property.position === 1 ? 'w-96' : 'w-80' // Three+ properties - center wider
                      }`}>
                        {/* Image Section */}
                        <div className="relative h-52 overflow-hidden rounded-t-2xl">
                          <img
                            src={property.images?.[0] || '/placeholder-hotel.jpg'}
                            alt={property.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 right-4">
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                              Weekend Deal
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="bg-white p-8 rounded-b-2xl">
                          <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight line-clamp-2">
                            {property.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {property.location?.city}, {property.location?.state}
                          </p>
                          <div className="flex items-center mb-4">
                            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1.5 text-sm font-medium text-gray-700">
                                {property.rating} ({property.reviewCount?.toLocaleString() || 0} Reviews)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <span className="text-2xl font-bold text-gray-900">
                                ₹{property.price?.amount?.toLocaleString() || 'N/A'}
                              </span>
                              <span className="text-sm text-gray-500 font-medium">/night</span>
                            </div>
                            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                              Book Now
                            </button>
                      </div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
              
              {/* Pagination Dots - Only show for 3+ properties */}
              {!weekendLoading && weekendProperties.length > 2 && (
                <div className="flex justify-center mt-8 space-x-3">
                  {weekendProperties.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentHotelIndex(index)}
                      className={`w-4 h-4 rounded-full transition-all duration-300 shadow-lg ${
                        index === currentHotelIndex 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 scale-125 shadow-blue-500/50' 
                          : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              )}
              </div>
          </div>
        </section>

        {/* Featured Stays */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured Stays
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Handpicked accommodations for an unforgettable experience
              </p>
            </div>

            {featuredStays.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredStays.map((stay) => {
                  // Check if current user is the host of this property
                  const isOwnProperty = user && stay.host && (
                    typeof stay.host === 'string' 
                      ? stay.host === user.id || stay.host === user._id
                      : stay.host._id?.toString() === user.id?.toString() || 
                        stay.host._id?.toString() === user._id?.toString() || 
                        stay.host.id === user.id || 
                        stay.host.id === user._id
                  );
                  
                  return (
                    <div 
                      key={stay._id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden cursor-pointer"
                      onClick={() => router.push(`/rooms/${stay._id}`)}
                    >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={stay.images?.[0] || '/logo.png'}
                        alt={stay.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        {isOwnProperty && (
                          <div className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                            Your Property
                          </div>
                        )}
                        <button className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-semibold">{stay.rating || 4.5}</span>
                          <span className="text-xs text-gray-600">({stay.reviewCount || 0})</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{stay.title}</h3>
                      <p className="text-gray-600 mb-3">{stay.location?.city}, {stay.location?.state}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {stay.tags?.slice(0, 2).map((tag: string) => (
                                                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(stay.price?.amount || 0, stay.price?.currency || 'INR')}
                          </p>
                          <p className="text-sm text-gray-600">per night</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 size={32} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No featured stays available</h3>
                <p className="text-gray-600">Check back soon for amazing accommodations!</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers discovering unique stays and experiences across India
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => router.push('/search')}
              >
                Start Exploring
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {user?.role === 'host' ? (
                <Button 
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20 px-8 py-4 rounded-xl font-medium transition-all duration-200"
                  onClick={() => router.push('/host/dashboard')}
                >
                  Host Dashboard
                </Button>
              ) : (
                <Button 
                  className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20 px-8 py-4 rounded-xl font-medium transition-all duration-200"
                  onClick={() => router.push('/become-host')}
                >
                  Become a Host
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Prices Include All Fees Popup */}
      <PricesPopup />
    </div>
  );
}