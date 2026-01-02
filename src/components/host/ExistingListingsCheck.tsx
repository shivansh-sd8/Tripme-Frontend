"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Plus, Loader2, FileText, MapPin, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useOnboarding } from '@/core/context/OnboardingContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Listing {
  _id: string;
  title?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  placeType?: string;
  status?: string;
  isDraft?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ExistingListingsCheckProps {
  onContinue: (listingId?: string) => void;
}

export default function ExistingListingsCheck({ onContinue }: ExistingListingsCheckProps) {
  const router = useRouter();
  const { updateData } = useOnboarding();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExistingListings();
  }, []);

  const fetchExistingListings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all listings including drafts
      const response = await apiClient.getMyListings({ status: 'all' });
      
      if (response.success && response.data) {
        const data = response.data as any;
        const fetchedListings = data.listings || (Array.isArray(data) ? data : []);
        
        // Filter for draft or incomplete listings
        const draftListings = fetchedListings.filter((listing: Listing) => 
          listing.status === 'draft' || listing.isDraft === true
        );
        
        setListings(draftListings);
      }
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError('Failed to load existing listings');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueListing = async (listing: Listing) => {
    // Load existing listing data into onboarding context
    updateData({
      listingId: listing._id,
      propertyType: listing.placeType as any,
      location: listing.location ? {
        address: listing.location.address || '',
        city: listing.location.city || '',
        state: listing.location.state || '',
        country: listing.location.country || 'India',
      } : undefined,
    });

    // Continue to step 2 with listing ID
    router.push(`/become-host/onboarding/step-2?listingId=${listing._id}`);
  };

  const handleCreateNew = () => {
    // Reset onboarding data and start fresh
    updateData({});
    onContinue();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF385C] mx-auto mb-4" />
          <p className="text-gray-600">Checking for existing listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {listings.length > 0 ? 'Continue Your Listing' : 'Start Creating'}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {listings.length > 0
            ? 'You have unfinished listings. Continue where you left off or create a new one.'
            : 'Ready to create your first listing? Let\'s get started!'}
        </p>
      </motion.div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {listings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Draft Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listings.map((listing) => (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleContinueListing(listing)}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FFF5F5] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home className="w-6 h-6 text-[#FF385C]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {listing.title || 'Untitled Listing'}
                      </h3>
                      {listing.location && (
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm truncate">
                            {listing.location.city && listing.location.state
                              ? `${listing.location.city}, ${listing.location.state}`
                              : listing.location.address || 'Location not set'}
                          </span>
                        </div>
                      )}
                      {listing.updatedAt && (
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Last updated: {new Date(listing.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          Draft
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <Card className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#FFF5F5] rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-8 h-8 text-[#FF385C]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {listings.length > 0 ? 'Create New Listing' : 'Get Started'}
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            {listings.length > 0
              ? 'Start fresh with a new listing. You can always come back to finish your drafts later.'
              : 'Begin your hosting journey by creating your first listing. It only takes a few minutes!'}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleCreateNew}
              className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-8 py-4 text-lg font-semibold rounded-lg"
              size="lg"
            >
              {listings.length > 0 ? 'Create New Listing' : 'Start Creating'}
            </Button>
          </motion.div>
        </div>
      </Card>
    </div>
  );
}

