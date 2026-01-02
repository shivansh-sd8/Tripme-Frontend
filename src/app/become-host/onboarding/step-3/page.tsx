"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { useOnboarding } from '@/core/context/OnboardingContext';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function Step3Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, updateData } = useOnboarding();
  const listingId = searchParams?.get('listingId');
  const [address, setAddress] = useState(data.location?.address || '');
  const [city, setCity] = useState(data.location?.city || '');
  const [state, setState] = useState(data.location?.state || '');
  const [country, setCountry] = useState(data.location?.country || 'India');
  const [isLoading, setIsLoading] = useState(false);

  // Update form fields when data changes (e.g., from existing listing)
  useEffect(() => {
    if (data.location) {
      setAddress(data.location.address || '');
      setCity(data.location.city || '');
      setState(data.location.state || '');
      setCountry(data.location.country || 'India');
    }
  }, [data.location]);

  const handleNext = () => {
    if (!address || !city || !state) {
      alert('Please fill in all required fields');
      return;
    }

    updateData({
      location: {
        address,
        city,
        state,
        country,
      },
    });

    // Preserve listingId in URL if continuing existing listing
    const nextUrl = listingId 
      ? `/become-host/onboarding/step-4?listingId=${listingId}`
      : '/become-host/onboarding/step-4';
    router.push(nextUrl);
  };

  return (
    <OnboardingLayout currentStep={3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Where is your place located?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help guests find your listing by adding your location
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Street Address *
              </label>
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your street address"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  City *
                </label>
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  State *
                </label>
                <Input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter state"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Country *
              </label>
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter country"
                className="w-full"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your exact address will be kept private until after booking confirmation.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end mt-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleNext}
              disabled={!address || !city || !state || isLoading}
              className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-8 py-4 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}

