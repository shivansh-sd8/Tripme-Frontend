"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import Button from '../ui/Button';

interface Listing {
  _id: string;
  title: string;
  status: 'draft' | 'published' | 'suspended' | 'deleted';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  isPublished?: boolean;
  images?: string[];
  location?: {
    city?: string;
    state?: string;
  };
  pricing?: {
    basePrice?: number;
  };
  createdAt: string;
  updatedAt: string;
  completionStep?: number;
}

interface Reservation {
  _id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  listing?: {
    title: string;
  };
}

interface HostingDashboardProps {
  onCreateNewListing: () => void;
}

const HostingDashboard: React.FC<HostingDashboardProps> = ({ onCreateNewListing }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');
  const [listings, setListings] = useState<Listing[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyListings();
      
      if (response.success && response.data) {
        const data = response.data as any;
        if (data.listings) {
          setListings(data.listings);
        } else if (Array.isArray(data)) {
          setListings(data);
        }
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await apiClient.deleteListing(listingToDelete._id);
      
      if (response.success) {
        setListings(prev => prev.filter(l => l._id !== listingToDelete._id));
        setShowDeleteModal(false);
        setListingToDelete(null);
      } else {
        alert('Failed to delete listing');
      }
    } catch (err: any) {
      console.error('Error deleting listing:', err);
      alert(err?.message || 'Failed to delete listing');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleListingClick = (listing: Listing) => {
    // Navigate to continue editing the listing
    router.push(`/host/property/${listing._id}`);
  };

  const getDraftListings = () => {
    return listings.filter(l => 
      l.status === 'draft' || !l.isPublished
    );
  };

  const getPublishedListings = () => {
    return listings.filter(l => 
      l.status === 'published' && l.isPublished
    );
  };

  const hasAnyListings = listings.length > 0;
  const draftListings = getDraftListings();
  const publishedListings = getPublishedListings();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Tabs */}
      <div className="flex justify-center pt-8 pb-6">
        <div className="inline-flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'today'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Empty State - No Reservations */}
        <div className="text-center mb-12">
          {/* Notebook SVG Icon */}
          <div className="w-48 h-48 mx-auto mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <rect x="20" y="30" width="140" height="160" fill="#D4A574" rx="4" />
              <rect x="30" y="40" width="60" height="140" fill="#F9F9F9" rx="2" />
              {[...Array(11)].map((_, i) => (
                <line
                  key={i}
                  x1="35"
                  y1={50 + i * 12}
                  x2="85"
                  y2={50 + i * 12}
                  stroke="#E5E5E5"
                  strokeWidth="1"
                />
              ))}
              <rect x="100" y="40" width="50" height="140" fill="#FFFFFF" rx="2" />
              {[...Array(6)].map((_, i) => (
                <rect
                  key={i}
                  x={105 + (i % 3) * 15}
                  y={45 + Math.floor(i / 3) * 20}
                  width="12"
                  height="12"
                  fill="#F5F5F5"
                  stroke="#E5E5E5"
                  strokeWidth="1"
                  rx="1"
                />
              ))}
              <path
                d="M 100 40 L 100 180 L 110 175 L 100 180 L 90 175 Z"
                fill="#FF385C"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            You don't have any reservations
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            To get booked, you'll need to complete and publish your listing.
          </p>

          {draftListings.length > 0 ? (
            <Button
              onClick={() => handleListingClick(draftListings[0])}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg px-6 py-3"
            >
              Complete your listing
            </Button>
          ) : (
            <Button
              onClick={onCreateNewListing}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg px-6 py-3"
            >
              Create a listing
            </Button>
          )}
        </div>

        {/* Listings Section */}
        {hasAnyListings && (
          <div className="mt-12 border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your listings</h2>
              <button
                onClick={onCreateNewListing}
                className="text-sm text-[#FF385C] font-medium hover:underline"
              >
                + Create new listing
              </button>
            </div>

            {/* Draft/In Progress Listings */}
            {draftListings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                  In Progress ({draftListings.length})
                </h3>
                <div className="space-y-3">
                  {draftListings.map((listing) => (
                    <ListingCard
                      key={listing._id}
                      listing={listing}
                      onClick={() => handleListingClick(listing)}
                      onDelete={() => {
                        setListingToDelete(listing);
                        setShowDeleteModal(true);
                      }}
                      onMenuToggle={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                      isMenuOpen={openMenuId === listing._id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Published Listings */}
            {publishedListings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                  Published ({publishedListings.length})
                </h3>
                <div className="space-y-3">
                  {publishedListings.map((listing) => (
                    <ListingCard
                      key={listing._id}
                      listing={listing}
                      onClick={() => handleListingClick(listing)}
                      onDelete={() => {
                        setListingToDelete(listing);
                        setShowDeleteModal(true);
                      }}
                      onMenuToggle={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                      isMenuOpen={openMenuId === listing._id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && listingToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Delete listing?</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setListingToDelete(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{listingToDelete.title || 'Untitled listing'}"? 
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setListingToDelete(null);
                }}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteListing}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Listing Card Component
interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
  onDelete: () => void;
  onMenuToggle: (id: string) => void;
  isMenuOpen: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  onClick, 
  onDelete,
  onMenuToggle,
  isMenuOpen
}) => {
  const getStatusBadge = () => {
    if (listing.status === 'draft' && listing.approvalStatus === 'pending') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          <Clock className="w-3 h-3" />
          Pending approval
        </span>
      );
    }
    if (listing.status === 'draft' && listing.approvalStatus === 'rejected') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
          <AlertCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    }
    if (listing.approvalStatus === 'approved' && !listing.isPublished) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          Ready to publish
        </span>
      );
    }
    if (listing.status === 'published' && listing.isPublished) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          Published
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
        <Clock className="w-3 h-3" />
        Draft
      </span>
    );
  };

  return (
    <div
      className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={typeof listing.images[0] === 'string' ? listing.images[0] : (listing.images[0] as any)?.url}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">
          {listing.title || 'Untitled listing'}
        </h4>
        {listing.location && (listing.location.city || listing.location.state) && (
          <p className="text-sm text-gray-500 truncate">
            {[listing.location.city, listing.location.state].filter(Boolean).join(', ')}
          </p>
        )}
        <div className="mt-1">
          {getStatusBadge()}
        </div>
      </div>

      {/* Actions Menu */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onMenuToggle(listing._id)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]">
            <button
              onClick={onClick}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
              Edit listing
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostingDashboard;
