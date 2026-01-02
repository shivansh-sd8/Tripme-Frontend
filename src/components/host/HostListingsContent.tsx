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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-display">
                    My Listings
                  </h1>
                  <p className="text-gray-600">Manage your properties and services</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => router.push('/host/dashboard')}
                variant="outline"
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/become-host/about-your-place')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Listing
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {listings.length > 0 && (
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
        )}

        {/* Filters and Search */}
        <div className="mb-8">
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
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No listings found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {listings.length === 0 
                ? "You haven't created any listings yet. Start by adding your first property to begin earning."
                : "No listings match your current filters. Try adjusting your search criteria."
              }
            </p>
            <Button 
              onClick={() => router.push('/host/property/new')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Listing
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, index) => (
              <Card 
                key={listing._id} 
                className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={
                      (listing.images?.[0] as any)?.url || 
                      (typeof listing.images?.[0] === 'string' ? listing.images[0] : null) || 
                      '/placeholder-property.jpg'
                    }
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(listing)}`}>
                      {getDisplayStatus(listing)}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-semibold ml-1">{listing.averageRating || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-lg">{listing.title}</h3>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                    <span>
                      {listing.location?.city || 'Unknown City'}, {listing.location?.state || 'Unknown State'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-purple-600" />
                        <span>{listing.maxGuests || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-1 text-purple-600" />
                        <span>{listing.bedrooms || 0} bed</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        {formatPrice(listing.pricing?.basePrice || 0)}
                      </p>
                      <p className="text-xs text-gray-600">per night</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-6 p-3 bg-gray-50/50 rounded-xl">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-purple-600" />
                      {listing.bookingCount || 0} bookings
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-purple-600" />
                      {formatDate(listing.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white hover:shadow-md text-gray-700 font-medium rounded-lg transition-all duration-200"
                      onClick={() => {
                
                        if (!listing._id) {
                          alert('Error: Listing ID is missing. Cannot open edit page.');
                          return;
                        }
                        router.push(`/host/property/${listing._id}/edit`);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white hover:shadow-md text-gray-700 font-medium rounded-lg transition-all duration-200"
                      onClick={() => router.push(`/host/property/${listing._id}/availability`)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Set Availability
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-white hover:shadow-md text-gray-700 font-medium rounded-lg transition-all duration-200"
                      onClick={() => {
                        setPreviewProperty(listing);
                        setIsPreviewOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>

                  {/* Status Actions */}
                  {listing.status === 'draft' && !listing.approvalStatus && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg transition-all duration-200 hover:scale-105"
                      onClick={() => handleStatusChange(listing._id, 'published')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit for Approval
                    </Button>
                  )}
                  {listing.status === 'draft' && listing.approvalStatus === 'pending' && (
                    <div className="w-full mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center text-blue-700">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Submitted for Approval</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Your listing is under review by our admin team
                      </p>
                    </div>
                  )}
                  {/* Show Publish button when approved but NOT published (exclude suspended/deleted) */}
                  {listing.approvalStatus === 'approved' && !listing.isPublished && listing.status !== 'suspended' && listing.status !== 'deleted' && (
                    <div className="w-full mt-3 space-y-2">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Approved by Admin</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Your listing is approved and ready to publish
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg transition-all duration-200 hover:scale-105"
                        onClick={() => handlePublishApproved(listing._id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Publish Listing
                      </Button>
                    </div>
                  )}
                  {listing.status === 'draft' && listing.approvalStatus === 'rejected' && (
                    <div className="w-full mt-3 space-y-2">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-700">
                          <XCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Listing Rejected</span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          Please review and resubmit your listing
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg transition-all duration-200 hover:scale-105"
                        onClick={() => handleStatusChange(listing._id, 'published')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resubmit for Approval
                      </Button>
                    </div>
                  )}
                  {listing.status === 'published' && listing.isPublished && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 hover:bg-amber-100 text-amber-700 font-medium rounded-lg transition-all duration-200 hover:scale-105"
                      onClick={() => handleStatusChange(listing._id, 'draft')}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Unpublish Listing
                    </Button>
                  )}
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