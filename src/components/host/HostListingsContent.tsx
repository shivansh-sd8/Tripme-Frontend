"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/store/auth-context';
import { 
  Home, 
  Edit, 
  Eye, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Calendar,
  Star,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  X,
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
  Heart,
  Share2,
  Shield,
  PawPrint,
  Cigarette,
  CalendarDays
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import { Property } from '@/types';
import { apiClient } from '@/infrastructure/api/clients/api-client';

interface HostListing extends Omit<Property, 'createdAt' | 'updatedAt' | 'images'> {
  _id: string;
  status: 'draft' | 'published' | 'suspended' | 'deleted';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
  bookingCount?: number;
  averageRating?: number;
  totalEarnings?: number;
  images: string[]; // Backend returns images as string URLs
}

// Property Preview Modal Component
const PropertyPreviewModal: React.FC<{
  property: HostListing | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ property, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

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

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Property Preview</h2>
                <p className="text-sm text-gray-600">How guests see your listing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Gallery */}
          <div className="mb-8">
            <div className="grid grid-cols-4 gap-2">
              {/* Main large image */}
              <div className="col-span-4 lg:col-span-2 row-span-2">
                <img
                  src={
                    (property.images?.[selectedImage] as any)?.url || 
                    (typeof property.images?.[selectedImage] === 'string' ? property.images[selectedImage] : null) || 
                    '/placeholder-property.jpg'
                  }
                  alt={property.title}
                  className="w-full h-[300px] lg:h-[400px] object-cover rounded-2xl"
                />
              </div>
              {/* Smaller images */}
              {property.images?.slice(1, 5).map((img: any, index: number) => (
                <div key={index} className="col-span-2 lg:col-span-1">
                  <img
                    src={(img as any)?.url || (typeof img === 'string' ? img : null) || '/placeholder-property.jpg'}
                    alt={property.title}
                    className="w-full h-[150px] lg:h-[195px] object-cover rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(index + 1)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {/* Header Section */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{property.averageRating || 4.5}</span>
                        <span className="text-gray-500">({property.bookingCount || 0} reviews)</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{property.location?.city}, {property.location?.state}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-200 mb-6" />

              {/* Property Details */}
              <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl mb-1">👥</div>
                    <div className="text-sm text-gray-600">Up to {property.maxGuests} guests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🛏️</div>
                    <div className="text-sm text-gray-600">{property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🛌</div>
                    <div className="text-sm text-gray-600">{property.beds} bed{property.beds > 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🚿</div>
                    <div className="text-sm text-gray-600">{property.bathrooms} bathroom{property.bathrooms > 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-200 mb-6" />

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About this place</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Divider */}
              <hr className="border-gray-200 mb-6" />

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">What this place offers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.amenities.map((amenity: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        {getAmenityIcon(amenity)}
                        <span className="text-gray-700 capitalize">{amenity.replace('-', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* House Rules */}
              {property.houseRules && property.houseRules.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">House rules</h2>
                  <div className="space-y-2">
                    {property.houseRules.map((rule: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cancellation policy</h2>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 capitalize">
                    {property.cancellationPolicy || 'Moderate'} cancellation policy
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(property.pricing?.basePrice || 0)}
                      </span>
                      <span className="text-gray-600">night</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{property.averageRating || 4.5}</span>
                      <span>•</span>
                      <span>{property.bookingCount || 0} reviews</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-gray-300 rounded-lg p-3">
                        <label className="text-xs font-medium text-gray-700">Check-in</label>
                        <div className="text-sm text-gray-900">{property.checkInTime || '15:00'}</div>
                      </div>
                      <div className="border border-gray-300 rounded-lg p-3">
                        <label className="text-xs font-medium text-gray-700">Check-out</label>
                        <div className="text-sm text-gray-900">{property.checkOutTime || '11:00'}</div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg"
                    >
                      Reserve
                    </Button>

                    <p className="text-center text-sm text-gray-600">
                      You won't be charged yet
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Minimum stay</span>
                        <span className="font-medium">{property.minNights || 1} night{property.minNights > 1 ? 's' : ''}</span>
                      </div>
                      {property.pricing?.cleaningFee && property.pricing.cleaningFee > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Cleaning fee</span>
                          <span className="font-medium">{formatPrice(property.pricing.cleaningFee)}</span>
                        </div>
                      )}
                      {property.pricing?.serviceFee && property.pricing.serviceFee > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Service fee</span>
                          <span className="font-medium">{formatPrice(property.pricing.serviceFee)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HostListingsContent: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<HostListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [previewProperty, setPreviewProperty] = useState<HostListing | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getMyListings();
      
      if (response.success && response.data) {
        const data = response.data as any;
        
        if (data.listings) {
          setListings(data.listings);
        } else if (Array.isArray(data)) {
          // If the response is directly an array
          setListings(data);
        } else {
          console.error('Unexpected data structure:', data);
          setError('Failed to load listings - unexpected data structure');
        }
      } else {
        console.error('API response not successful:', response);
        setError('Failed to load listings');
      }
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError(err?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiClient.deleteListing(listingId);
      
      if (response.success) {
        setListings(prev => prev.filter(listing => listing._id !== listingId));
      } else {
        alert('Failed to delete listing');
      }
    } catch (err: any) {
      console.error('Error deleting listing:', err);
      alert(err?.message || 'Failed to delete listing');
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: string) => {
    try {
      let response;
      
      if (newStatus === 'published') {
        response = await apiClient.publishListing(listingId);
      } else if (newStatus === 'draft') {
        response = await apiClient.unpublishListing(listingId);
      } else {
        // Fallback to regular update for other status changes
        response = await apiClient.updateListing(listingId, { status: newStatus });
      }
      
      if (response.success) {
        // Use the updated listing data from the backend response
        const updatedListing = response.data?.listing;
        if (updatedListing) {
          setListings(prev => prev.map(listing => 
            listing._id === listingId 
              ? { 
                  ...listing, 
                  ...updatedListing,
                  _id: listingId // Ensure ID is preserved
                }
              : listing
          ));
        } else {
          // Fallback to manual update if response doesn't include listing data
          setListings(prev => prev.map(listing => 
            listing._id === listingId 
              ? { 
                  ...listing, 
                  status: newStatus as any,
                  approvalStatus: newStatus === 'published' ? 'pending' : listing.approvalStatus,
                  isDraft: newStatus === 'draft'
                }
              : listing
          ));
        }
      } else {
        alert('Failed to update listing status');
      }
    } catch (err: any) {
      console.error('Error updating listing status:', err);
      alert(err?.message || 'Failed to update listing status');
    }
  };

  const handlePublishApproved = async (listingId: string) => {
    try {
      const response = await apiClient.publishApprovedListing(listingId);
      
      if (response.success) {
        // Use the updated listing data from the backend response
        const updatedListing = response.data?.listing;
        if (updatedListing) {
          setListings(prev => prev.map(listing => 
            listing._id === listingId 
              ? { 
                  ...listing, 
                  ...updatedListing,
                  _id: listingId // Ensure ID is preserved
                }
              : listing
          ));
        } else {
          // Fallback to manual update
          setListings(prev => prev.map(listing => 
            listing._id === listingId 
              ? { 
                  ...listing, 
                  status: 'published',
                  isPublished: true
                }
              : listing
          ));
        }
      } else {
        alert('Failed to publish listing');
      }
    } catch (err: any) {
      console.error('Error publishing approved listing:', err);
      alert(err?.message || 'Failed to publish listing');
    }
  };

  const getStatusIcon = (listing: HostListing) => {
    // Handle approval workflow
    if (listing.status === 'draft' && listing.approvalStatus === 'pending') {
      return <Clock className="w-4 h-4 text-blue-500" />;
    }
    if (listing.status === 'draft' && listing.approvalStatus === 'rejected') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (listing.status === 'draft' && !listing.approvalStatus) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    
    // Handle regular status
    switch (listing.status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDisplayStatus = (listing: HostListing) => {
    // Handle approval workflow
    if (listing.status === 'draft' && listing.approvalStatus === 'pending') {
      return 'Pending Approval';
    }
    if (listing.status === 'draft' && listing.approvalStatus === 'rejected') {
      return 'Rejected';
    }
    // Show "Approved - Ready to Publish" for approved but unpublished listings (exclude suspended/deleted)
    if (listing.approvalStatus === 'approved' && !listing.isPublished && listing.status !== 'suspended' && listing.status !== 'deleted') {
      return 'Approved - Ready to Publish';
    }
    if (listing.status === 'draft' && !listing.approvalStatus) {
      return 'Draft';
    }
    if (listing.status === 'published' && listing.isPublished) {
      return 'Published';
    }
    
    // Handle regular status
    return listing.status.charAt(0).toUpperCase() + listing.status.slice(1);
  };

  const getStatusColor = (listing: HostListing) => {
    // Handle approval workflow
    if (listing.status === 'draft' && listing.approvalStatus === 'pending') {
      return 'bg-blue-100 text-blue-800';
    }
    if (listing.status === 'draft' && listing.approvalStatus === 'rejected') {
      return 'bg-red-100 text-red-800';
    }
    // Green color for approved but unpublished listings (exclude suspended/deleted)
    if (listing.approvalStatus === 'approved' && !listing.isPublished && listing.status !== 'suspended' && listing.status !== 'deleted') {
      return 'bg-green-100 text-green-800';
    }
    if (listing.status === 'draft' && !listing.approvalStatus) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (listing.status === 'published' && listing.isPublished) {
      return 'bg-emerald-100 text-emerald-800';
    }
    
    // Handle regular status
    switch (listing.status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'deleted':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Filter and sort listings
  const filteredListings = listings
    .filter(listing => {
      const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           listing.location.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'price':
          return (b.pricing?.basePrice || 0) - (a.pricing?.basePrice || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading your listings</h2>
            <p className="text-gray-600">Gathering your property information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={fetchListings} className="w-full">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pt-8 md:pt-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
      

        <div className="mb-6 md:mb-8 px-4 md:px-0">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
    
    {/* Title Section: Responsive sizing and alignment */}
    <div className="space-y-3">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Icon: Slightly smaller on mobile to save horizontal space */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
          <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-display tracking-tight">
            My Listings
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-tight">
            Manage your properties and services
          </p>
        </div>
      </div>
    </div>
    
    {/* Actions Section: Grid for 2-column buttons on mobile */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-3">
      <Button 
        onClick={() => router.push('/host/dashboard')}
        variant="outline"
        className="w-full lg:w-auto flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white py-6 lg:py-2 rounded-xl text-sm font-semibold transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Dashboard</span>
      </Button>
      
      <Button 
        onClick={() => router.push('/host/property/new/about-your-place')}
        className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-6 lg:py-2 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        <span>Add Listing</span>
      </Button>
    </div>

  </div>
        </div>

        {/* Summary Stats */}
        {/* {listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <Home className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {listings.filter(l => l.status === 'published').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Draft Properties</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {listings.filter(l => l.status === 'draft' && !l.approvalStatus).length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {listings.filter(l => l.status === 'draft' && l.approvalStatus === 'pending').length}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(listings.reduce((sum, l) => sum + (l.totalEarnings || 0), 0))}
                  </p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">₹</span>
                </div>
              </div>
            </Card>
          </div>
        )} */}
        {listings.length > 0 && (
  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 mb-8">
    {/* Common Card Logic for the first 4 cards */}
    {[
      { label: "Total", value: listings.length, icon: Home, color: "from-purple-500 to-purple-600", textColor: "text-gray-900" },
      { label: "Live", value: listings.filter(l => l.status === 'published').length, icon: CheckCircle, color: "from-emerald-500 to-emerald-600", textColor: "text-emerald-600" },
      { label: "Drafts", value: listings.filter(l => l.status === 'draft' && !l.approvalStatus).length, icon: Clock, color: "from-yellow-500 to-yellow-600", textColor: "text-yellow-600" },
      { label: "Pending", value: listings.filter(l => l.status === 'draft' && l.approvalStatus === 'pending').length, icon: Clock, color: "from-blue-500 to-blue-600", textColor: "text-blue-600" }
    ].map((stat, idx) => (
      <Card key={idx} className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02]">
        {/* Icon First & Centered */}
        <div className={`w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3 shrink-0`}>
          <stat.icon className="w-5 h-5 md:w-7 md:h-7 text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
          <p className={`text-xl md:text-3xl font-black ${stat.textColor}`}>{stat.value}</p>
        </div>
      </Card>
    ))}

    {/* Total Earnings - Full width (col-span-2) on mobile, icon-first centered */}
    <Card className="col-span-2 lg:col-span-1 p-4 md:p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02]">
      <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mb-3 shrink-0">
        <span className="text-white font-black text-lg md:text-2xl">₹</span>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Total Earnings</p>
        <p className="text-xl md:text-3xl font-black text-gray-900">
          {formatPrice(listings.reduce((sum, l) => sum + (l.totalEarnings || 0), 0))}
        </p>
      </div>
    </Card>
  </div>
)}
       

        {/* Filters and Search */}
        {/* <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Search className="w-3 h-3 text-white" />
              </div>
              Search & Filter
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search listings by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                  className="bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 focus:ring-purple-200"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200 hover:shadow-md"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 font-medium transition-all duration-200 hover:shadow-md"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="updatedAt">Recently Updated</option>
                  <option value="title">Title A-Z</option>
                  <option value="price">Price High-Low</option>
                </select>
              </div>
            </div>
          </div>
        </div> */}
        <div className="mb-8 px-1">
  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-purple-200/50 shadow-xl">
    {/* Header - Hidden or simplified on very small screens to save space */}
    <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shrink-0">
        <Search className="w-3 h-3 text-white" />
      </div>
      Search & Filter
    </h2>

    <div className="flex flex-col lg:flex-row gap-4">
      {/* 1. Search Bar - Always full width on mobile */}
      <div className="w-full lg:flex-1">
        <Input
          placeholder="Search listings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-gray-400" />}
          className="bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 focus:ring-purple-200 rounded-xl h-11"
        />
      </div>

      {/* 2. Filters Row - Two columns on mobile, auto-width on desktop */}
      <div className="grid grid-cols-2 lg:flex gap-3">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full lg:w-auto pl-3 pr-8 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm font-medium text-gray-700 appearance-none transition-all cursor-pointer hover:shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="suspended">Suspended</option>
          </select>
          {/* Custom Arrow for select */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
             <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full lg:w-auto pl-3 pr-8 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-sm font-medium text-gray-700 appearance-none transition-all cursor-pointer hover:shadow-sm"
          >
            <option value="createdAt">Newest</option>
            <option value="updatedAt">Updated</option>
            <option value="title">A-Z</option>
            <option value="price">Price</option>
          </select>
          {/* Custom Arrow for select */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
             <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Listings Grid */}
      {filteredListings.length === 0 ? (
  <Card className="p-8 md:p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
      <Home className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
    </div>
    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">No listings found</h3>
    <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 max-w-xs md:max-w-md mx-auto">
      {listings.length === 0 
        ? "You haven't created any listings yet. Start by adding your first property."
        : "No listings match your current filters. Try adjusting your search."
      }
    </p>
    <Button 
      onClick={() => router.push('/host/property/new')}
      className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-6 px-8 rounded-xl shadow-lg"
    >
      <Plus className="w-5 h-5 mr-2" />
      Create Listing
    </Button>
  </Card>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {filteredListings.map((listing) => (
      <Card 
        key={listing._id} 
        className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-2xl flex flex-col"
      >
        {/* Image Section */}
        <div className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden shrink-0">
          <img
            src={(listing.images?.[0] as any)?.url || listing.images?.[0] || '/placeholder-property.jpg'}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${getStatusColor(listing)}`}>
              {getDisplayStatus(listing)}
            </span>
          </div>
          <div className="absolute top-2 left-2">
            <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-[11px] font-bold ml-1">{listing.averageRating || 0}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-4 md:pt-6 md:p-5 flex-1 flex flex-col">
          <div className="mb-2">
            <h3 className="font-bold text-gray-900 line-clamp-1 text-base md:text-lg">{listing.title}</h3>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3 mr-1 text-purple-500" />
              <span className="truncate">{listing.location?.city}, {listing.location?.state}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 border-y border-gray-50 py-3">
             <div className="flex gap-3 text-[11px] font-medium text-gray-600">
                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-purple-500"/> {listing.maxGuests}</span>
                <span className="flex items-center gap-1"><Home className="w-3 h-3 text-purple-500"/> {listing.bedrooms} Bed</span>
             </div>
             <div className="text-right">
                <span className="text-base font-black text-gray-900">{formatPrice(listing.pricing?.basePrice || 0)}</span>
                <span className="text-[10px] text-gray-500 block">/night</span>
             </div>
          </div>

          {/* Optimized Mobile Actions */}
          <div className="mt-auto space-y-2">
            {/* Row 1: Primary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-purple-100 bg-purple-50/30 text-xs font-bold py-5"
                onClick={() => router.push(`/host/property/${listing._id}`)}
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-purple-100 bg-purple-50/30 text-xs font-bold py-5"
                onClick={() => router.push(`/host/property/${listing._id}/availability`)}
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" /> Dates
              </Button>
            </div>

            {/* Row 2: Secondary View Action */}
            <Button
              variant="outline"
              className="w-full rounded-xl border-slate-200 text-xs font-bold py-5"
              onClick={() => { setPreviewProperty(listing); setIsPreviewOpen(true); }}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview Listing
            </Button>

            {/* Status-Based Actions (Full Width) */}
            {listing.status === 'draft' && !listing.approvalStatus && (
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-5 rounded-xl"
                onClick={() => handleStatusChange(listing._id, 'published')}
              >
                Submit for Approval
              </Button>
            )}

            {listing.approvalStatus === 'approved' && !listing.isPublished && (
              <Button
                className="w-full bg-indigo-600 text-white text-xs font-bold py-5 rounded-xl shadow-md"
                onClick={() => handlePublishApproved(listing._id)}
              >
                Go Live Now
              </Button>
            )}
          </div>
        </div>
      </Card>
    ))}
  </div>
)}
      </div>
      <PropertyPreviewModal
        property={previewProperty}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};

export default HostListingsContent; 