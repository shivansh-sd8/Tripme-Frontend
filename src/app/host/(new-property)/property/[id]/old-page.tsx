"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  MapPin, 
  Users, 
  Bed, 
  Bath,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Listing {
  _id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'suspended' | 'deleted';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  isPublished?: boolean;
  images?: Array<{ url: string } | string>;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  pricing?: {
    basePrice?: number;
    currency?: string;
  };
  details?: {
    guests?: number;
    bedrooms?: number;
    beds?: number;
    bathrooms?: number;
  };
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = React.use(params);
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getListing(id);
      
      if (response.success && response.data) {
        const data = response.data as any;
        setListing(data.listing || data);
      } else {
        setError('Listing not found');
      }
    } catch (err: any) {
      console.error('Error fetching listing:', err);
      setError(err?.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!listing) return null;
    
    if (listing.status === 'draft' && listing.approvalStatus === 'pending') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
          <Clock className="w-4 h-4" />
          Pending Approval
        </span>
      );
    }
    if (listing.status === 'draft' && listing.approvalStatus === 'rejected') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 text-sm font-medium rounded-full">
          <AlertCircle className="w-4 h-4" />
          Rejected
        </span>
      );
    }
    if (listing.approvalStatus === 'approved' && !listing.isPublished) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-full">
          <CheckCircle className="w-4 h-4" />
          Ready to Publish
        </span>
      );
    }
    if (listing.status === 'published' && listing.isPublished) {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium rounded-full">
          <CheckCircle className="w-4 h-4" />
          Published
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
        <Clock className="w-4 h-4" />
        Draft
      </span>
    );
  };

  const getImageUrl = (image: { url: string } | string): string => {
    if (typeof image === 'string') return image;
    return image.url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/host/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/host/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {listing.title || 'Untitled Listing'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {listing.isPublished && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/listing/${listing._id}`)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Listing
                </Button>
              )}
              <Button
                onClick={() => router.push(`/host/property/${listing._id}/edit`)}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Edit className="w-4 h-4" />
                Edit Property
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {listing.images && listing.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-1">
                  <div className="col-span-2 aspect-video">
                    <img
                      src={getImageUrl(listing.images[0])}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {listing.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-video">
                      <img
                        src={getImageUrl(image)}
                        alt={`${listing.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>No images uploaded</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About this place</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {listing.description || 'No description provided.'}
              </p>
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="capitalize">{amenity.replace(/-/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-baseline gap-1 mb-4">
                <IndianRupee className="w-6 h-6 text-gray-900" />
                <span className="text-3xl font-bold text-gray-900">
                  {listing.pricing?.basePrice?.toLocaleString() || '0'}
                </span>
                <span className="text-gray-500">/ night</span>
              </div>
              
              {listing.location && (
                <div className="flex items-start gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    {[listing.location.address, listing.location.city, listing.location.state]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}

              {listing.details && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span>{listing.details.guests || 0} guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Bed className="w-5 h-5" />
                    <span>{listing.details.bedrooms || 0} bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Bed className="w-5 h-5" />
                    <span>{listing.details.beds || 0} beds</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Bath className="w-5 h-5" />
                    <span>{listing.details.bathrooms || 0} baths</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/host/property/${listing._id}/edit`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <Edit className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Edit Property Details</span>
                </button>
                <button
                  onClick={() => router.push(`/host/property/${listing._id}/availability`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Manage Availability</span>
                </button>
              </div>
            </div>

            {/* Status Info */}
            {listing.status === 'draft' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Draft Listing</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Complete your listing and submit for approval to start receiving bookings.
                    </p>
                    <Button
                      onClick={() => router.push(`/host/property/${listing._id}/edit`)}
                      className="mt-3 bg-amber-600 hover:bg-amber-700 text-white text-sm"
                    >
                      Complete Listing
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
