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
  Copy
} from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { useAuth } from '@/core/store/auth-context';
import Button from '@/shared/components/ui/Button';
import PromotionalCard from '@/components/shared/PromotionalCard';

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
    validFrom: string;
    validUntil: string;
    isActive: boolean;
  }>>([]);
  const [couponLoading, setCouponLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Removed forceUpdate effect as it was unused

  useEffect(() => {
    fetchHomeData();
    fetchActiveCoupons();
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
        setFeaturedStays(fetchedStays);
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
        {/* Hero Section - Two Column Layout */}
        <section className="relative min-h-screen flex items-center pt-48 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Column - Main Content */}
              <div className="space-y-8">
                {/* Brand Tagline */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Plane className="w-6 h-6 text-blue-600" />
                    <span className="text-blue-600 font-semibold text-lg font-heading">TripMe Travel Gems</span>
                  </div>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight font-display">
                  Discover the Best Destinations Across India
                </h1>

                {/* Description */}
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg font-body">
                  Embark on the adventure of a lifetime, where every step you take unveils a new story, and every destination leaves a lasting impression.
                </p>



                {/* Trust Indicators */}
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">100% Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Secure Booking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm text-gray-600">Best Prices</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Image Grid */}
              <div className="grid grid-cols-4 grid-rows-3 gap-3 h-[600px]">
                {/* Large Top Left - Beautiful Beach House */}
                <div className="relative rounded-2xl overflow-hidden group col-span-3 row-span-2">
                  <img
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Beautiful Beach House"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-sm font-bold text-gray-900">100+ Destinations</div>
                    <div className="text-xs text-gray-600">100 of the world&apos;s most destinations</div>
                  </div>
                </div>

                {/* Small Top Right - Beach Image */}
                <div className="relative rounded-2xl overflow-hidden group col-span-1 row-span-1">
                  <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Beautiful Beach"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2">
                    <div className="text-xs font-bold text-gray-900">100%</div>
                    <div className="text-xs text-gray-600">Verified</div>
                  </div>
                </div>

                {/* Medium Bottom Left - House Between Jungle */}
                <div className="relative rounded-2xl overflow-hidden group col-span-1 row-span-2">
                  <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="House Between Jungle"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Small Bottom Right - Luxury Penthouse */}
                <div className="relative rounded-2xl overflow-hidden group col-span-1 row-span-1">
                  <img
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Luxury Penthouse"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Promotional Offers Section */}
        <section className="py-12 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">Special Offers</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
                Exclusive deals and discounts for your next trip
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <PromotionalCard
                type="credit-card"
                title="HDFC Credit Card"
                description="Get 10% instant discount on all bookings"
                discount="10% OFF"
                validUntil="Dec 31, 2024"
                code="HDFC10"
              />
              <PromotionalCard
                type="cashback"
                title="ICICI Bank"
                description="Earn 5% cashback on your first booking"
                discount="5% CASHBACK"
                validUntil="Jan 15, 2025"
                code="ICICI5"
              />
              <PromotionalCard
                type="discount"
                title="New User Special"
                description="First-time users get 15% off on all stays"
                discount="15% OFF"
                validUntil="Feb 28, 2025"
                code="NEW15"
              />
              <PromotionalCard
                type="bonus"
                title="Weekend Getaway"
                description="Book weekend stays and get 20% bonus discount"
                discount="20% BONUS"
                validUntil="Mar 31, 2025"
                code="WEEKEND20"
              />
            </div>
          </div>
        </section>

        {/* Dynamic Coupon Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">Active Coupons</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
                Check out our latest active coupons and discounts
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {couponLoading ? (
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600">Loading coupons...</p>
                </div>
              ) : activeCoupons.length > 0 ? (
                activeCoupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{coupon.code}</h3>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {coupon.discountType === 'percentage' ? `${coupon.amount}% OFF` : `₹${coupon.amount} OFF`}
                      </div>
                      {coupon.maxDiscount && (
                        <p className="text-sm text-gray-500 mb-1">Max: ₹{coupon.maxDiscount}</p>
                      )}
                      {coupon.minBookingAmount && (
                        <p className="text-sm text-gray-500 mb-1">Min: ₹{coupon.minBookingAmount}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      Valid until {formatDate(coupon.validTo)}
                    </div>
                    
                    {coupon.usageLimit && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Usage</span>
                          <span>{coupon.usedCount}/{coupon.usageLimit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => copyCouponCode(coupon.code)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Copy className="w-4 h-4 inline mr-2" />
                      Copy Code
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Coupons</h3>
                  <p className="text-gray-600">Check back soon for exciting offers and discounts!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Popular Destinations Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover the most loved destinations by travelers across India
              </p>
            </div>
            {popularDestinations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {popularDestinations.slice(0, 6).map((destination) => (
                  <div
                    key={destination.name}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
                    onClick={() => router.push(`/search?location.city=${encodeURIComponent(destination.name)}`)}
                  >
                    <div className="h-48 w-full relative overflow-hidden rounded-t-2xl">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {destination.icon}
                          <span>{destination.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{destination.name}</h3>
                      <p className="text-gray-600 mb-3">{destination.description}</p>
                      <p className="text-sm text-gray-500">{destination.stays}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No destinations available</h3>
                <p className="text-gray-600">Check back soon for amazing destinations!</p>
              </div>
            )}
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
                      ? stay.host === user._id 
                      : stay.host._id === user._id || stay.host.id === user._id
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
    </div>
  );
}