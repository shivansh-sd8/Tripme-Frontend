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
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import PricesPopup from "@/components/shared/PricesPopup";
import { useAuth } from '@/core/store/auth-context';
import Button from '@/shared/components/ui/Button';
import { useScrollDirection } from "@/hooks/userScrollDirection";
import StayCard from '@/components/trips/StayCard';
import { apiClient } from '@/infrastructure/api/clients/api-client';
export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, refreshUser } = useAuth();
  const [featuredStays, setFeaturedStays] = useState<Array<{
    id: string;
    title: string;
    description: string;
    price: { amount: number; currency: string };
    images: string[];
    host: { name: string; avatar?: string } | string;
    location: { city: string; state: string; country: string };
    rating: number;
    reviewCount: number;
  }>>([]);
  const [cityProperties, setCityProperties] = useState<{ [key: string]: any[] }>({});
  const [cityLoading, setCityLoading] = useState<{ [key: string]: boolean }>({});
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const RECENT_SEARCHES_KEY = 'tripme_recent_properties';
  const MAX_RECENT_SEARCHES = 8;
  const [allCities, setAllCities] = useState<Array<{
    name: string;
    image: string;
    description: string;
    propertyCount: number;
  }>>([]);

  const [popularDestinations, setPopularDestinations] = useState<Array<{
    _id: string;
    name: string;
    image: string;
    description: string;
    staysLabel: string;
    searchCity: string;
    displayOrder: number;
    isActive: boolean;
  }>>([])
  const [destLoading, setDestLoading] = useState(true);


  const getPropertyId = (property: any): string | null => {
    const id = property?.id || property?._id;
    return id ? String(id) : null;
  };

  const dedupeRecentSearches = (items: any[] = []): any[] => {
    const seen = new Set<string>();
    return items.filter((item: any) => {
      const id = getPropertyId(item);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  const getRecentSearches = (): any[] => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed)) return [];
      return dedupeRecentSearches(parsed).slice(0, MAX_RECENT_SEARCHES);
    } catch (error) {
      console.error('Error reading recent searches from localStorage:', error);
      return [];
    }
  };

  const savePropertyToRecent = (property: any) => {
    if (typeof window === 'undefined') return;

    try {
      const propertyId = getPropertyId(property);
      if (!propertyId) return getRecentSearches();

      const recent = getRecentSearches();
      const filtered = recent.filter((item: any) => getPropertyId(item) !== propertyId);
      const recentProperty = {
        id: propertyId,
        title: property.title,
        description: property.description,
        images: property.images,
        location: property.location,
        price: property.price,
        rating: property.rating,
        reviewCount: property.reviewCount,
        maxGuests: property.maxGuests,
        bedrooms: property.bedrooms,
        beds: property.beds,
        bathrooms: property.bathrooms,
        host: property.host,
        viewedAt: new Date().toISOString()
      };
      const updated = dedupeRecentSearches([recentProperty, ...filtered]).slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error saving recent search to localStorage:', error);
      return [];
    }
  };

  const handlePropertyNavigation = (property: any) => {
    const propertyId = property?.id || property?._id;
    if (!propertyId) return;

    const normalizedProperty = {
      id: propertyId,
      title: property?.title,
      description: property?.description,
      images: property?.images || [],
      location: property?.location || {},
      price: property?.price || {
        amount: property?.pricing?.basePrice || 0,
        currency: property?.pricing?.currency || 'INR'
      },
      rating: property?.rating?.average || property?.rating || 0,
      reviewCount: property?.reviewCount || 0,
      maxGuests: property?.maxGuests || 2,
      bedrooms: property?.bedrooms || 1,
      beds: property?.beds || 1,
      bathrooms: property?.bathrooms || 1,
      host: property?.host
    };

    const updated = savePropertyToRecent(normalizedProperty);
    if (updated) setRecentSearches(updated);

    router.push(`/rooms/${propertyId}`);
  };



  const clearRecentSearches = () => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing recent searches from localStorage:', error);
    }
  };


  // Load recent searches from local storage only
  const loadRecentSearches = () => {
    try {
      setRecentLoading(true);
      const recent = getRecentSearches();
      setRecentSearches(recent);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error('Error loading recent searches:', error);
      setRecentSearches([]);
    } finally {
      setRecentLoading(false);
    }
  };


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
  const scrollDirection = useScrollDirection();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [selectedStay, setSelectedStay] = useState<string | null>(null);
  const [wishlistName, setWishlistName] = useState('');
  const [wishlists, setWishlists] = useState<any[]>([]);

  // Fetch weekend properties from database
  const fetchWeekendProperties = async () => {
    try {
      setWeekendLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/sponsored?limit=6`);

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

  // Fetch all cities and their properties
  // const fetchAllCitiesAndProperties = async () => {
  //   try {
  //     // First, fetch all properties to get unique cities
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings?limit=100`);

  //     if (response.ok) {
  //       const data = await response.json();
  //       const allProperties = data.data?.listings || [];

  //       // Group properties by city
  //       // const cityGroups: {[key: string]: any[]} = {};
  //       // const cityData: Array<{
  //       //   name: string;
  //       //   image: string;
  //       //   description: string;
  //       //   propertyCount: number;
  //       // }> = [];

  //       // Transform property data to match Stay interface
  // const transformedProperties = allProperties.map((property: any) => ({
  //   id: property._id,
  //   title: property.title,
  //   description: property.description,
  //   images: property.images?.map((img: any) => img.url || img) || [],
  //   location: {
  //     city: property.location?.city || 'Unknown',
  //     state: property.location?.state || '',
  //     country: property.location?.country || 'India',
  //     coordinates: property.location?.coordinates || [0, 0]
  //   },
  //   price: {
  //     amount: property.pricing?.basePrice || 0,
  //     currency: property.pricing?.currency || 'INR'
  //   },
  //   rating: property.rating?.average || property.rating || 0,
  //   reviewCount: property.reviewCount || 0,
  //   maxGuests: property.maxGuests || 2,
  //   bedrooms: property.bedrooms || 1,
  //   beds: property.beds || 1,
  //   bathrooms: property.bathrooms || 1,
  //   tags: property.amenities || [],
  //   instantBookable: property.instantBookable || false,
  //   amenities: property.amenities || [],
  //   host: {
  //     id: property.host?._id || property.host || 'unknown',
  //     name: property.host?.name || 'Host',
  //     avatar: property.host?.profileImage || '',
  //     isSuperhost: property.host?.isSuperhost || false
  //   },
  //   createdAt: property.createdAt || new Date(),
  //   updatedAt: property.updatedAt || new Date()
  // }));

  // transformedProperties.forEach((property: any) => {
  //   const cityName = property.location.city;
  //   if (cityName && !cityGroups[cityName]) {
  //     cityGroups[cityName] = [];
  //   }
  //   if (cityName) {
  //     cityGroups[cityName].push(property);
  //   }
  // });

  // // Group transformed properties by city
  // const cityGroups: {[key: string]: any[]} = {};
  // const cityData: Array<{
  //   name: string;
  //   image: string;
  //   description: string;
  //   propertyCount: number;
  // }> = [];


  //       // allProperties.forEach((property: any) => {
  //       //   const cityName = property.location?.city;
  //       //   if (cityName && !cityGroups[cityName]) {
  //       //     cityGroups[cityName] = [];
  //       //   }
  //       //   if (cityName) {
  //       //     cityGroups[cityName].push(property);
  //       //   }
  //       // });

  //       // Create city data with images and descriptions
  //       Object.keys(cityGroups).forEach(cityName => {
  //         const properties = cityGroups[cityName];
  //         const firstProperty = properties[0];

  //         cityData.push({
  //           name: cityName,
  //           image: firstProperty?.images?.[0]?.url || '/placeholder-city.jpg',
  //           description: getCityDescription(cityName),
  //           propertyCount: properties.length
  //         });

  //         setCityProperties(prev => ({ ...prev, [cityName]: properties }));
  //       });

  //       // Sort cities by property count (descending) and limit to top cities
  //       cityData.sort((a, b) => b.propertyCount - a.propertyCount);
  //       setAllCities(cityData.slice(0, 8)); // Show top 8 cities

  //     } else {
  //       console.error('Failed to fetch cities:', response.status);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching cities and properties:', error);
  //   }
  // };

  // Fetch all cities and their properties
  const fetchAllCitiesAndProperties = async () => {
    try {
      // First, fetch all properties to get unique cities
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings?limit=100`);

      if (response.ok) {
        const data = await response.json();
        const allProperties = data.data?.listings || [];

        // Transform property data to match Stay interface
        const transformedProperties = allProperties.map((property: any) => ({
          id: property._id,
          title: property.title,
          description: property.description,
          images: property.images?.map((img: any) => img.url || img) || [],
          location: {
            city: property.location?.city || 'Unknown',
            state: property.location?.state || '',
            country: property.location?.country || 'India',
            coordinates: property.location?.coordinates || [0, 0]
          },
          price: {
            amount: property.pricing?.basePrice || 0,
            currency: property.pricing?.currency || 'INR'
          },
          rating: property.rating?.average || property.rating || 0,
          reviewCount: property.reviewCount || 0,
          maxGuests: property.maxGuests || 2,
          bedrooms: property.bedrooms || 1,
          beds: property.beds || 1,
          bathrooms: property.bathrooms || 1,
          tags: [
            ...(property.tags || []),
            ...(property.isTopRated ? ['favourite', 'top-rated'] : []),
            ...(property.isFeatured ? ['featured'] : []),
            ...(property.isSponsored ? ['sponsored'] : []),
            ...(property.isNew ? ['new'] : [])
          ],
          isTopRated: property.isTopRated || false,
          isFeatured: property.isFeatured || false,
          instantBookable: property.instantBookable || false,
          amenities: property.amenities || [],
          host: {
            id: property.host?._id || property.host || 'unknown',
            name: property.host?.name || 'Host',
            avatar: property.host?.profileImage || '',
            isSuperhost: property.host?.isSuperhost || false
          },
          createdAt: property.createdAt || new Date(),
          updatedAt: property.updatedAt || new Date()
        }));

        // Group transformed properties by city
        const cityGroups: { [key: string]: any[] } = {};
        const cityData: Array<{
          name: string;
          image: string;
          description: string;
          propertyCount: number;
        }> = [];

        transformedProperties.forEach((property: any) => {
          const cityName = property.location.city;
          if (cityName && !cityGroups[cityName]) {
            cityGroups[cityName] = [];
          }
          if (cityName) {
            cityGroups[cityName].push(property);
          }
        });

        // Create city data with images and descriptions
        Object.keys(cityGroups).forEach(cityName => {
          const properties = cityGroups[cityName];
          const firstProperty = properties[0];

          cityData.push({
            name: cityName,
            image: firstProperty?.images?.[0] || '/placeholder-city.jpg',
            description: getCityDescription(cityName),
            propertyCount: properties.length
          });

          setCityProperties(prev => ({ ...prev, [cityName]: properties }));
        });

        // Sort cities by property count (descending) and limit to top cities
        cityData.sort((a, b) => b.propertyCount - a.propertyCount);
        setAllCities(cityData.slice(0, 8)); // Show top 8 cities

      } else {
        console.error('Failed to fetch cities:', response.status);
      }
    } catch (error) {
      console.error('Error fetching cities and properties:', error);
    }
  };

  // Helper function to get city descriptions
  const getCityDescription = (cityName: string): string => {
    const descriptions: { [key: string]: string } = {
      'Ahmedabad': 'Heritage City',
      'Delhi': 'Capital Heritage',
      'Mumbai': 'City of Dreams',
      'Bangalore': 'Silicon Valley',
      'Chennai': 'Cultural Capital',
      'Kolkata': 'City of Joy',
      'Hyderabad': 'Pearl City',
      'Pune': 'Oxford of East',
      'Jaipur': 'Pink City',
      'Goa': 'Beaches & Nightlife',
      'Manali': 'Mountains & Adventure',
      'Udaipur': 'City of Lakes',
      'Kochi': 'Queen of Arabian Sea',
      'Chandigarh': 'City Beautiful',
      'Lucknow': 'City of Nawabs',
      'Indore': 'Clean City'
    };
    return descriptions[cityName] || 'Amazing Destination';
  };

  useEffect(() => {
    fetchAllCitiesAndProperties();
  }, []);

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
    fetchPopularDestinations();
    loadRecentSearches();
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
          id: stay._id,
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
          tags: [
            ...(stay.tags || []),
            ...(stay.isTopRated ? ['favourite', 'top-rated'] : []),
            ...(stay.isFeatured || true ? ['featured'] : [])
          ],
          isTopRated: stay.isTopRated || false,
          isFeatured: stay.isFeatured || true, // It's from the featured endpoint
          amenities: stay.amenities || []
        }));

        setFeaturedStays(transformedStays);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch popular destinations managed by admin
  const fetchPopularDestinations = async () => {
    try {
      setDestLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/popular-destinations`);
      if (response.ok) {
        const data = await response.json();
        setPopularDestinations(data.data?.destinations || []);
      } else {
        console.error('Failed to fetch popular destinations:', response.status);
      }
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
    } finally {
      setDestLoading(false);
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

  const findWishlistItem = (stayId: string) => {
    for (const wl of wishlists) {
      const item = wl.items.find((i: any) => (i.itemId._id || i.itemId) === stayId);
      if (item) return { wishlistId: wl._id, wishlistItemId: item._id };
    }
    return null;
  };

  const handleFavorite = async (stayId: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (favorites.has(stayId)) {
      const found = findWishlistItem(stayId);
      if (!found) return;

      await apiClient.removeFromWishlist(found.wishlistId, found.wishlistItemId);
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(stayId);
        return newSet;
      });
      setWishlists(prev =>
        prev.map(wl =>
          wl._id === found.wishlistId
            ? { ...wl, items: wl.items.filter(i => i._id !== found.wishlistItemId) }
            : wl
        )
      );
      return;
    }

    if (wishlists.length === 0) {
      setSelectedStay(stayId);
      setShowWishlistModal(true);
      return;
    }

    try {
      const wishlist = wishlists[0];
      const res = await apiClient.addToWishlist(wishlist._id, {
        itemType: 'Property',
        itemId: stayId
      });

      setWishlists(prev => prev.map(wl => wl._id === wishlist._id ? res.data : wl));
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.add(stayId);
        return newSet;
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };


  useEffect(() => {
    const loadWishlists = async () => {
      try {
        const res = await apiClient.getMyWishlists();
        if (res.success && res.data) {
          setWishlists(res.data);

          const favSet = new Set<string>();
          res.data.forEach((wl: any) => {
            wl.items?.forEach((item: any) => {
              const itemId = item.itemId?._id || item.itemId?.id || (typeof item.itemId === 'string' ? item.itemId : null);
              if (itemId) {
                favSet.add(itemId.toString());
              }
            });
          });
          setFavorites(favSet);
        }
      } catch (error) {
        console.error('Error loading wishlists:', error);
      }
    };

    loadWishlists();
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
  };

  const formatPrice = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getCTAConfig = () => {
    if (typeof window === 'undefined') {
      return { label: 'Explore stays', action: '/search' };
    }

    const path = window.location.pathname;

    // Room details page
    if (path.startsWith('/rooms/')) {
      return { label: 'Reserve', action: '#booking' };
    }

    // Search / listing page
    if (path.startsWith('/search')) {
      return { label: 'View map', action: 'toggle-map' };
    }

    // Host-specific CTA (for other pages, but not the home page)
    if (user?.role === 'host' && path == '/profile') {
      return { label: 'Host dashboard', action: '/host/dashboard' };
    }

    // Default (home / anywhere else)
    return null;
  };

  const cta  = getCTAConfig();

  const [pendingBooking, setPendingBooking] = useState<{ id: string, propertyName: string, imageSrc: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tripme_pending_booking');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.expiresAt > Date.now()) {
          setPendingBooking(parsed);
        } else {
          localStorage.removeItem('tripme_pending_booking');
        }
      }
    } catch (e) {
      console.error('Error loading pending booking', e);
    }
  }, []);


  const ContinueBookingCard = ({ propertyName, imageSrc }: { propertyName: string, imageSrc: string }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-4 max-w-sm">
    <img src={imageSrc} className="w-16 h-16 rounded-xl object-cover" alt="Property" />
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Continue Booking</p>
      <h4 className="font-semibold text-gray-900 line-clamp-1">{propertyName}</h4>
    </div>
    <button className="bg-[#4285F4] text-white p-2 rounded-full">
      <ChevronRight size={20} />
    </button>
  </div>
);

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
        {/* Mobile Header Spacer to prevent overlap when fixed header is present */}
        <div className="block md:hidden pt-[169px]"></div>

        {/* Latest Viewed Properties */}
        {pendingBooking && (
          <div className="block md:hidden px-4 py-4 cursor-pointer" onClick={() => router.push(`/rooms/${pendingBooking.id}`)}>
            <ContinueBookingCard propertyName={pendingBooking.propertyName} imageSrc={pendingBooking.imageSrc} />
          </div>
        )}

        {(recentLoading || recentSearches.length > 0) && (
          <div className="block md:hidden">
            {/* Dynamic Cities Section */}

            <section className="px-4 pb-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl
                   font-bold text-gray-900">Recently Viewed</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">Pick up where you left off</p>
                </div>
                {recentSearches.length > 0 && (
                  <button
                    onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
                    className="text-xs font-semibold text-gray-400 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {recentLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="min-w-[220px] rounded-2xl overflow-hidden animate-pulse">
                      <div className="h-[150px] bg-gray-200 rounded-2xl mb-3" />
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : recentSearches.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                  {recentSearches.slice(0, MAX_RECENT_SEARCHES).map((stay: any, index: number) => (
                    <div
                      key={`${stay.id || stay._id || 'recent'}-${index}`}
                      className="min-w-[100px] max-w-[100px] flex-shrink-0 cursor-pointer group"
                      onClick={() => handlePropertyNavigation(stay)}
                    >
                      {/* Image */}
                      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-2.5 bg-gray-100">
                        <img
                          src={stay.images?.[0] || '/placeholder-hotel.jpg'}
                          alt={stay.title || 'Property'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Rating badge */}
                        {stay.rating > 0 && (
                          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {stay.rating?.toFixed ? stay.rating.toFixed(1) : stay.rating}
                          </div>
                        )}
                        {/* Heart */}
                        <button
                          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md z-30 hover:scale-110 transition-transform"
                          onClick={e => { 
                            e.stopPropagation(); 
                            const id = stay.id || stay._id;
                            if (id) handleFavorite(id);
                          }}
                        >
                          <Heart 
                            className={`w-4 h-4 transition-colors ${
                              favorites.has(stay.id || stay._id) ? 'fill-red-500 text-red-500' : 'text-gray-700'
                            }`} 
                          />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="space-y-0.5 px-0.5">
                        <h3 className="font-semibold text-xs text-gray-900 line-clamp-1 leading-tight">
                          {stay.title || 'Untitled Property'}
                        </h3>
                        <p className="text-[10px] text-gray-400 line-clamp-1">
                          {` ${stay.beds} Beds `}
                          
                        </p>

                        {/* <p className="text-sm font-bold text-gray-900 pt-0.5">
                          {formatPrice(stay.price?.amount || 0, stay.price?.currency || 'INR')}
                          <span className="font-normal text-gray-500 text-xs"> / night</span>
                        </p> */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        )}

          <section className="md:hidden py-1 bg-white ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 md:mb-8">Popular Destinations</h2>

              {/* City-wise Horizontal Property Display */}
              <div className="space-y-4">
                {allCities.map((city) => (
                  <div key={city.name} className="space-y-2">
                    {/* City Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                    
                        <div>
                          <h3 className="text-xs font-bold text-gray-900">{city.name}</h3>
                          <p className="text-[10px] text-gray-600">{city.description}</p>
                          <p className="text-[8px] text-gray-500">{city.propertyCount} stays</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/search?city=${encodeURIComponent(city.name)}`)}
                        className="flex items-center gap-2 text-gray-700 hover:text-black font-medium transition-colors"
                      >
                        {/* View all */}
                        <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                   <ArrowRight className="w-4 h-4" />
                </div>
                      </button>
                    </div>

                    {/* Horizontal Properties Scroll - Stay Cards */}
                    {/* Horizontal Properties Scroll - Stay Cards */}
                    <div className="relative">
                      {cityProperties[city.name]?.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                          {cityProperties[city.name].map((property: any) => (
                            <div key={property.id} className="flex-shrink-0">
                              <StayCard
                                stay={property}
                                className="w-[150px]"
                                isFavorite={
                                  favorites.has(property.id)}
                                onFavorite={handleFavorite}
                                onCardClick={(stay) => {
                                  const updated = savePropertyToRecent(stay);
                                  if (updated) setRecentSearches(updated);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No properties available in {city.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* <section className="md:hidden px-4 pt-8 ">
            <h2 className="text-xl font-semibold mb-3">
              Active coupons
            </h2>

            <div className="
                  scroll-x-only
                  flex gap-4
                  snap-x snap-mandatory
                  pb-2
                "
            >
              {activeCoupons.map(coupon => (
                <div
                  key={coupon._id}
                  className="
          min-w-[85%]
          snap-center
          bg-white
          rounded-2xl
          border
          p-4
        "
                >
                  <p className="text-sm font-semibold mb-1">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.amount}% OFF`
                      : `₹${coupon.amount} OFF`}
                  </p>

                  <h3 className="text-lg font-bold mb-4">
                    {coupon.code}
                  </h3>

                  <button
                    onClick={() => copyCouponCode(coupon.code)}
                    className="w-full bg-black text-white py-2 rounded-xl"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </section> */}



          {/* ================= MOBILE POPULAR DESTINATIONS ================= */}
          {/* {popularDestinations.length > 0 && (
            <section className="px-4 mt-10 md:hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">Explore India</p>
                  <h2 className="text-xl font-bold text-gray-900">Popular Destinations</h2>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
                {popularDestinations.map((dest) => (
                  <div
                    key={dest._id}
                    className="min-w-[60%] snap-center flex-shrink-0 cursor-pointer group relative rounded-2xl overflow-hidden h-36 shadow-md"
                    onClick={() => router.push(`/search?city=${encodeURIComponent(dest.searchCity || dest.name)}`)}
                  >
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white font-bold text-sm drop-shadow">{dest.name}</p>
                      {dest.staysLabel && <p className="text-white/80 text-xs">{dest.staysLabel}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )} */}

            <section className="md:hidden py-1 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* Heading */}
    <div className="mb-12">
      <h2 className="text-lg md:4xl font-bold text-gray-900">
        Top-Recommended Destinations
      </h2>
    </div>

    {destLoading ? (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-80 bg-gray-200 rounded-[2rem] animate-pulse"
          />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {popularDestinations.slice(0, 6).map((dest, index) => (
          
          <div
            key={index}
            onClick={() =>
              router.push(`/search?city=${encodeURIComponent(dest.name)}`)
            }
            className="group bg-white rounded-[1rem] md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
          >
            
            {/* IMAGE CONTAINER */}
            <div className="relative  h-[80px] sm:h-[190px] md:h-[220px] w-full overflow-hidden">
              
              {/* Image */}
              <img
                src={dest.image || "/placeholder.jpg"}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Optional subtle dark overlay */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300" />

              {/* Wave overlay (THIS FIXES WHITE GAP ISSUE) */}
              <div className="absolute bottom-0 left-0 w-full h-9 bg-white wave-bottom" />
            </div>

            {/* TITLE */}
            <div className="py-4 text-center">
              <span className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                {dest.name}
              </span>
            </div>

          </div>
        ))}
      </div>
    )}
  </div>
           </section>


          {/* ================= MOBILE WEEKEND OFFERS ================= */}
          <section className="px-4 mt-10 md:hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium" style={{ color: '#e85d75' }}>Weekend offers</p>
                <h2 className="text-xl font-bold text-gray-900">Deals for the weekend</h2>
              </div>
              <button onClick={() => router.push('/search')} className="text-xs text-gray-400 font-semibold underline">
                <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                   <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                   <ArrowRight className="w-4 h-4" />
                </div>
                </div>
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {weekendProperties.map((property) => {
                const propId = property._id;
                const isFav = favorites.has(propId);
                return (
                  <div key={propId} className="min-w-[78%] snap-center flex-shrink-0">
                    <StayCard
                      stay={{
                        id: propId,
                        title: property.title,
                        description: property.description || '',
                        images: property.images || [],
                        location: property.location || {},
                        price: property.price || { amount: property.pricing?.basePrice || 0, currency: 'INR' },
                        rating: property.rating?.average || property.rating || 0,
                        reviewCount: property.reviewCount || 0,
                        bedrooms: property.bedrooms || 0,
                        beds: property.beds || 0,
                        bathrooms: property.bathrooms || 0,
                        tags: ['weekend-deal'],
                        
                      }}
                      varient="featured"
                      isFavorite={isFav}
                      onFavorite={handleFavorite}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* ================= MOBILE FEATURED STAYS ================= */}
          <section className="px-4 mt-10 mb-10 md:hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium" style={{ color: '#7c3aed' }}>Handpicked for you</p>
                <h2 className="text-xl font-bold text-gray-900">Featured stays</h2>
              </div>
              <button onClick={() => router.push('/search')} className="text-xs text-gray-400 font-semibold underline">
                <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                   <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {featuredStays.map((stay) => {
                const stayId = stay._id;
                const isFav = favorites.has(stayId);
                return (
                  <div key={stayId} className="min-w-[78%] snap-center flex-shrink-0">
                    <StayCard
                      stay={{
                        id: stayId,
                        title: stay.title,
                        description: stay.description || '',
                        images: stay.images || [],
                        location: stay.location || {},
                        price: stay.price || { amount: 0, currency: 'INR' },
                        rating: stay.rating || 0,
                        reviewCount: stay.reviewCount || 0,
                        bedrooms: 0,
                        beds: 0,
                        bathrooms: 0,
                        tags: ['featured'],
                        
                      }}
                      varient="featured"
                      isFavorite={isFav}
                      onFavorite={handleFavorite}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          
          <section className="mb-100 md:hidden" >

          </section>



          {/* ================= MOBILE STICKY CTA ================= */}
          {/* <div className="fixed bottom-[72px] left-0 right-0 md:hidden z-40">
          <div className="px-4">
            <div className="bg-black text-white rounded-2xl p-4 shadow-xl flex gap-3">
              <button
                onClick={() => router.push('/search')}
                className="flex-1 bg-white text-black py-3 rounded-xl font-semibold"
              >
                Explore stays
              </button>

              <button
                onClick={() =>
                  router.push(user?.role === 'host'
                    ? '/host/dashboard'
                    : '/become-host')
                }
                className="flex-1 border border-white/20 py-3 rounded-xl text-sm"
              >
                {user?.role === 'host' ? 'Dashboard' : 'Become host'}
              </button>
            </div>
          </div>
        </div> */}

          {/* ================= MOBILE CTA ================= */}
         {cta && (
  <div
    className={`
      fixed left-0 right-0 z-40 sm:hidden
      transition-all duration-300 ease-out
      ${scrollDirection === 'down'
        ? 'bottom-4 opacity-100 translate-y-0'
        : 'bottom-[-80px] opacity-0 translate-y-4 pointer-events-none'}
    `}
  >
    <div className="px-4">
      <div className="bg-black text-white rounded-2xl p-4 shadow-xl flex gap-3">

        {/* PRIMARY CTA */}
        <button
          onClick={() => {
            if (cta.action === 'toggle-map') {
              document.dispatchEvent(new CustomEvent('toggle-map'));
            } else if (cta.action === '#booking') {
              document
                .getElementById('booking')
                ?.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.location.href = cta.action;
            }
          }}
          className="flex-1 bg-white text-black py-3 rounded-xl font-semibold"
        >
          {cta.label}
        </button>

        {/* OPTIONAL secondary */}
        <button
          onClick={() => window.location.href = '/search'}
          className="flex-1 border border-white/20 py-3 rounded-xl text-sm"
        >
          Filters
        </button>

      </div>
    </div>
  </div>
)}
        <div className="hidden md:block">
          {/* Hero Section - Two Column Layout Inspired by Image */}
          <section className="relative min-h-screen flex items-center pt-24 pb-8">
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

          {recentSearches.length > 0 && (
            <section className="py-5 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
                    <p className="text-sm text-gray-500 mt-1">Pick up where you left off</p>
                  </div>
                  <button
                    onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
                    className="text-sm text-gray-400 hover:text-gray-700 underline transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                {recentLoading ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="min-w-[220px] max-w-[220px] rounded-2xl overflow-hidden animate-pulse">
                        <div className="h-[170px] bg-gray-200 rounded-2xl mb-3" />
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {recentSearches.slice(0, MAX_RECENT_SEARCHES).map((stay: any, index: number) => (
                      <div
                        key={`${stay.id || stay._id || 'recent'}-${index}`}
                        className="min-w-[240px] max-w-[240px] flex-shrink-0 cursor-pointer group"
                        onClick={() => handlePropertyNavigation(stay)}
                      >
                        {/* Image */}
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 mb-3">
                          <img
                            src={stay.images?.[0] || '/placeholder-hotel.jpg'}
                            alt={stay.title || 'Property'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Rating badge */}
                          {stay.rating > 0 && (
                            <div className="absolute bottom-2.5 left-2.5 bg-black/55 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {stay.rating?.toFixed ? stay.rating.toFixed(1) : stay.rating}
                            </div>
                          )}
                          {/* Heart */}
                          <button
                            className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
                            onClick={e => { e.stopPropagation(); }}
                          >
                            <Heart className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>

                        {/* Info */}
                        <div className="space-y-1 px-0.5">
                          <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 leading-snug">
                            {stay.title || 'Untitled Property'}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {[stay.location?.city, stay.location?.state].filter(Boolean).join(', ')}
                          </p>
                          <p className="text-sm font-bold text-gray-900 pt-0.5">
                            {formatPrice(stay.price?.amount || 0, stay.price?.currency || 'INR')}
                            <span className="font-normal text-gray-500 text-xs"> / night</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Dynamic Cities Section */}
          <section className="py-5 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Popular Destinations</h2>

              {/* City-wise Horizontal Property Display */}
              <div className="space-y-12">
                {allCities.map((city) => (
                  <div key={city.name} className="space-y-4">
                    {/* City Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* <div className="w-16 h-16 rounded-lg overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover"
                />
              </div> */}
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{city.name}</h3>
                          <p className="text-gray-600">{city.description}</p>
                          <p className="text-sm text-gray-500">{city.propertyCount} stays</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/search?city=${encodeURIComponent(city.name)}`)}
                        className="flex items-center gap-2 text-gray-700 hover:text-black font-medium text-[#174EA6] hover:text-[#6366f1] transition-colors"
                      >
                        {/* View all */}
                       <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                  <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                   <ArrowRight className="w-4 h-4" />
                </div>
                </div>
                      </button>
                    </div>

                    {/* Horizontal Properties Scroll - Stay Cards */}
                    {/* Horizontal Properties Scroll - Stay Cards */}
                    <div className="relative">
                      {cityProperties[city.name]?.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                          {cityProperties[city.name].map((property: any) => (
                            <div key={property.id} className="flex-shrink-0">
                              <StayCard
                                stay={property}
                                className="w-72"
                                isFavorite={
                                  favorites.has(property.id)}
                                onFavorite={handleFavorite}
                                onCardClick={(stay) => {
                                  const updated = savePropertyToRecent(stay);
                                  if (updated) setRecentSearches(updated);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No properties available in {city.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* Dynamic Coupon Section - Fixed Height Carousel */}
          <section className="py-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-gray-900 mb-8">Active Coupons</h2>
                <p className="text-start text-gray-600 font-body">
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
                    <div className="h-50 overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 h-full">
                        {getVisibleCoupons().map((coupon) => (
                          <div
  key={coupon._id}
  className="group relative bg-white rounded-2xl border border-gray-200 
  p-5 h-full flex flex-col overflow-hidden
  transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
>

  {/* Top Gradient Accent */}
  <div className="absolute top-0 left-0 w-full h-1.5 
  bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

  {/* Ticket Cut Circles */}
  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full" />
  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full" />

  {/* Discount Header */}
  <div className="mb-3">
    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
      {coupon.discountType === "percentage"
        ? `${coupon.amount}% OFF`
        : `₹${coupon.amount} OFF`}
    </h2>

    <p className="text-xs text-gray-500 mt-1">
      Valid till {new Date(coupon.validTo).toLocaleDateString()}
    </p>
  </div>

  {/* Coupon Code */}
  <div className="flex items-center justify-between mb-3">
    <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono tracking-widest text-gray-800">
      {coupon.code}
    </div>

    <span className="text-xs font-medium text-gray-500">
      {Math.ceil(
        (new Date(coupon.validTo).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
      )}d left
    </span>
  </div>

  {/* Conditions */}
  <div className="text-xs text-gray-600 space-y-1 mb-4">
    {coupon.minBookingAmount && (
      <p>Min booking ₹{coupon.minBookingAmount}</p>
    )}
    {coupon.discountType === "percentage" && coupon.maxDiscount && (
      <p>Max discount ₹{coupon.maxDiscount}</p>
    )}
  </div>

  {/* Usage Bar */}
  {coupon.usageLimit ? (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>Usage</span>
        <span className="font-medium text-gray-900">
          {coupon.usedCount || 0}/{coupon.usageLimit}
        </span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{
            width: `${Math.min(
              ((coupon.usedCount || 0) / coupon.usageLimit) * 100,
              100
            )}%`
          }}
        />
      </div>
    </div>
  ) : (
    <span className="inline-flex text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full mb-4">
      Unlimited usage
    </span>
  )}

  {/* Apply Button */}
  <button
    onClick={() => copyCouponCode(coupon.code)}
    disabled={copiedCoupon === coupon.code}
    className={`mt-auto w-full rounded-xl py-2 text-sm font-semibold transition
      ${
        copiedCoupon === coupon.code
          ? "bg-gray-100 text-gray-600 cursor-default"
          : "bg-gray-900 text-white hover:bg-black"
      }`}
  >
    {copiedCoupon === coupon.code ? "Applied ✓" : "Apply Coupon"}
  </button>
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
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${Math.floor(currentCouponIndex / 3) === index
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

            <section className="py-5 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* Heading */}
    <div className="mb-12">
      <h2 className="text-4xl font-bold text-gray-900">
        Top-Recommended Destinations
      </h2>
    </div>

    {destLoading ? (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-80 bg-gray-200 rounded-[2rem] animate-pulse"
          />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {popularDestinations.slice(0, 6).map((dest, index) => (
          
          <div
            key={index}
            onClick={() =>
              router.push(`/search?city=${encodeURIComponent(dest.name)}`)
            }
            className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
          >
            
            {/* IMAGE CONTAINER */}
            <div className="relative h-[220px] w-full overflow-hidden">
              
              {/* Image */}
              <img
                src={dest.image || "/placeholder.jpg"}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Optional subtle dark overlay */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-300" />

              {/* Wave overlay (THIS FIXES WHITE GAP ISSUE) */}
              <div className="absolute bottom-0 left-0 w-full h-9 bg-white wave-bottom" />
            </div>

            {/* TITLE */}
            <div className="py-4 text-center">
              <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                {dest.name}
              </span>
            </div>

          </div>
        ))}
      </div>
    )}
  </div>
           </section>

          {/* Weekend Offers Section */}
          <section className="py-5 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header Section */}
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, #e85d75 0%, #f5a623 100%)', color: '#fff' }}>🏖 Weekend Offers</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Deals For The Weekend</h2>
                  <p className="text-gray-500 mt-1 text-sm">Limited-time stays for your next spontaneous escape</p>
                </div>
                <button onClick={() => router.push('/search')} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                  <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                   <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                   <ArrowRight className="w-4 h-4" />
                </div>
                </div>
                </button>
              </div>

              {weekendLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-[4/3]   bg-gray-200 rounded-t-2xl" />
                      <div className="p-4 bg-white rounded-b-2xl space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-1/3 mt-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : weekendProperties.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No weekend offers available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {weekendProperties.slice(0, 6).map((property) => (
                    <StayCard
                      key={property._id}
                      className="w-72"
                      stay={{
                        id: property._id,
                        title: property.title,
                        description: property.description || '',
                        images: property.images || [],
                        location: property.location || {},
                        price: property.price || { amount: property.pricing?.basePrice || 0, currency: property.pricing?.currency || 'INR' },
                        rating: property.rating?.average || property.rating || 0,
                        reviewCount: property.reviewCount || 0,
                        bedrooms: property.bedrooms || 0,
                        beds: property.beds || 0,
                        bathrooms: property.bathrooms || 0,
                        tags: ['weekend-deal'],
                      }}
                      isFavorite={favorites.has(property._id)}
                      onFavorite={handleFavorite}
                      onCardClick={(stay) => {
                        const updated = savePropertyToRecent(stay);
                        if (updated) setRecentSearches(updated);
                      }}
                      varient="featured"
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Featured Stays */}
          <section className="py-5 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 60%, #b45309 100%)', color: '#fff' }}>⭐ Featured</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Featured Stays</h2>
                  <p className="text-gray-500 mt-1 text-sm">Handpicked accommodations for an unforgettable experience</p>
                </div>
                <button onClick={() => router.push('/search')} className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                   <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                   <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                   <ArrowRight className="w-4 h-4" />
                </div>
                </div>
                </button>
              </div>

              {featuredStays.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredStays.map((stay) => (
                    <StayCard
                      key={stay.id}
                      className="w-72"
                      stay={{
                        id: stay.id,
                        title: stay.title,
                        description: stay.description || '',
                        images: stay.images || [],
                        location: stay.location || {},
                        price: stay.price || { amount: 0, currency: 'INR' },
                        rating: stay.rating || 0,
                        reviewCount: stay.reviewCount || 0,
                        bedrooms: 0,
                        beds: 0,
                        bathrooms: 0,
                        tags: ['featured'],
                      }}
                      isFavorite={favorites.has(stay._id)}
                      onFavorite={handleFavorite}
                      onCardClick={(s) => {
                        const updated = savePropertyToRecent(s);
                        if (updated) setRecentSearches(updated);
                      }}
                      varient="featured"
                    />
                  ))}
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
          <section className="py-5 bg-gradient-to-br from-gray-900 to-gray-800">
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
                  <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                  <div className="flex items-center gap-1 text-sm font-semibold text-[#174EA6] hover:text-[#6366f1] transition-colors">
                   <ArrowRight className="w-4 h-4" />
                </div>
                </div>
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

        </div>


      </main>
      <Footer />

      {/* Prices Include All Fees Popup */}
      <PricesPopup />

      {/* Wishlist Modal */}
      {showWishlistModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Create new wishlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  className="border border-gray-300 w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Summer Vacation, My Dream Stays"
                  value={wishlistName}
                  onChange={e => setWishlistName(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 50 characters</p>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setShowWishlistModal(false)}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-2.5 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-200"
                  onClick={createWishlistAndSave}
                  disabled={!wishlistName.trim() || wishlistName.length > 50}
                >
                  Create & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// <section className="py-20 bg-white">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//               {destLoading ? (
//                 <div className="grid grid-cols-4 gap-4 h-[500px]">
//                   <div className="space-y-3">
//                     <div className="h-8 w-3/4 bg-gray-200 rounded-xl mb-4 animate-pulse" />
//                     <div className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
//                   </div>
//                   {[1, 2, 3].map(i => (
//                     <div key={i} className="space-y-3">
//                       <div className="h-[90%] bg-gray-200 rounded-2xl animate-pulse" />
//                     </div>
//                   ))}
//                 </div>
//               ) : popularDestinations.length === 0 ? (
//                 <div className="text-center py-16">
//                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <MapPin className="w-8 h-8 text-gray-400" />
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-2">No Popular Destinations Yet</h3>
//                   <p className="text-gray-500">Destinations added by the admin will appear here.</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-4 gap-4 h-[500px]">
//                    <h2 className="text-4xl font-bold text-gray-900 mb-2">Top-Recommended Destinations</h2>

//                   {/* Block 1: Title on top, Image below */}
//                   <div className="space-y-3">
                   
//                     <div
//                       className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
//                       onClick={() => router.push(`/search?city=${encodeURIComponent(popularDestinations[0]?.searchCity || popularDestinations[0]?.name || '')}`)}
//                     >
//                       <img
//                         src={popularDestinations[0]?.image || '/placeholder-destination.jpg'}
//                         alt={popularDestinations[0]?.name || ''}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
//                       <div className="absolute top-3 left-3">
//                         <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold">
//                           <span className="text-lg">🇮🇳</span>
//                           <span>{popularDestinations[0]?.name}</span>
//                         </div>
//                       </div>
//                       <div className="absolute bottom-3 right-3">
//                         <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
//                           <ArrowRight className="w-4 h-4 text-gray-700" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Block 2: One big image */}
//                   {popularDestinations[1] && (
//                     <div className="space-y-3">
//                       <div
//                         className="group relative h-[90%] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
//                         onClick={() => router.push(`/search?city=${encodeURIComponent(popularDestinations[1]?.searchCity || popularDestinations[1]?.name || '')}`)}
//                       >
//                         <img
//                           src={popularDestinations[1]?.image || '/placeholder-destination.jpg'}
//                           alt={popularDestinations[1]?.name || ''}
//                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
//                         <div className="absolute top-3 left-3">
//                           <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold">
//                             <span className="text-lg">🇮🇳</span>
//                             <span>{popularDestinations[1]?.name}</span>
//                           </div>
//                         </div>
//                         <div className="absolute bottom-3 right-3">
//                           <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
//                             <ArrowRight className="w-4 h-4 text-gray-700" />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Block 3: One big image */}
//                   {popularDestinations[2] && (
//                     <div className="space-y-3">
//                       <div
//                         className="group relative h-[90%] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
//                         onClick={() => router.push(`/search?city=${encodeURIComponent(popularDestinations[2]?.searchCity || popularDestinations[2]?.name || '')}`)}
//                       >
//                         <img
//                           src={popularDestinations[2]?.image || '/placeholder-destination.jpg'}
//                           alt={popularDestinations[2]?.name || ''}
//                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
//                         <div className="absolute top-3 left-3">
//                           <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold">
//                             <span className="text-lg">🇮🇳</span>
//                             <span>{popularDestinations[2]?.name}</span>
//                           </div>
//                         </div>
//                         <div className="absolute bottom-3 right-3">
//                           <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
//                             <ArrowRight className="w-4 h-4 text-gray-700" />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Block 4: Image on top, Subheading on bottom */}
//                   {popularDestinations[3] && (
//                     <div className="space-y-3">
//                       <div
//                         className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
//                         onClick={() => router.push(`/search?city=${encodeURIComponent(popularDestinations[3]?.searchCity || popularDestinations[3]?.name || '')}`)}
//                       >
//                         <img
//                           src={popularDestinations[3]?.image || '/placeholder-destination.jpg'}
//                           alt={popularDestinations[3]?.name || ''}
//                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
//                         <div className="absolute top-3 left-3">
//                           <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold">
//                             <span className="text-lg">🇮🇳</span>
//                             <span>{popularDestinations[3]?.name}</span>
//                           </div>
//                         </div>
//                         <div className="absolute bottom-3 right-3">
//                           <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
//                             <ArrowRight className="w-4 h-4 text-gray-700" />
//                           </div>
//                         </div>
//                       </div>
//                       <p className="text-sm text-gray-600">When it comes to planning a dream vacation, some destinations stand out as top recommendations for travelers worldwide.</p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </section>
