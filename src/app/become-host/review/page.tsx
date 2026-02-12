"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Users, Bed, Bath, Home, Clock, Shield, Image ,Edit , Zap, Dog, PartyPopper, Camera, Car} from 'lucide-react';import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useAuth } from '@/core/store/auth-context';

export default function ReviewPage() {
  const router = useRouter();
  const { data, resetData } = useOnboarding();
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


   const getEditUrl = (step: string) => {
  return `/become-host/${step}?return=review`;
};

   const EditButton = ({ step }: { step: string }) => (
    <button
      onClick={() => router.push(getEditUrl(step))}
      className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
    >
      <Edit className="w-3 h-3" />
      Edit
    </button>
  );
  const handlePublish = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // First, become a host if not already
      if (user?.role !== 'host') {
        const hostResponse = await apiClient.becomeHost({});
        if (hostResponse.success && hostResponse.data?.user) {
          updateUser(hostResponse.data.user);
        }
      }

      // Create the listing with images
      // Map structure type to valid backend type
      const typeMapping: Record<string, string> = {
        'house': 'house',
        'apartment': 'apartment',
        'villa': 'villa',
        'cottage': 'cottage',
        'cabin': 'cabin',
        'treehouse': 'treehouse',
        'boat': 'boat',
        'hostel': 'hostel',
        'guesthouse': 'house',
        'hotel': 'apartment',
        'bnb': 'house',
        'farm': 'cottage',
      };

      const listingType = typeMapping[data.structureType || 'house'] || 'house';
      
      // Build full address for userAddress field
      const fullAddress = [
        data.location?.address,
        data.location?.city,
        data.location?.state,
        data.location?.country || 'India',
        data.location?.pincode
      ].filter(Boolean).join(', ');

      const listingData = {
        title: data.title || 'My Listing',
        description: data.description || 'A beautiful place to stay with all modern amenities and comfortable living spaces.',
        type: listingType,
        propertyType: 'standard', // premium, standard, budget, luxury
        placeType: data.propertyType || 'entire',
        location: {
          type: 'Point',
          coordinates: [
            data.location?.coordinates?.lng || 77.5946, // Default to Bangalore
            data.location?.coordinates?.lat || 12.9716
          ],
          address: data.location?.address || 'Address not specified',
          userAddress: fullAddress || 'Address not specified, India',
          city: data.location?.city || 'City',
          state: data.location?.state || 'State',
          country: data.location?.country || 'India',
          postalCode: data.location?.pincode || '000000',
        },
        maxGuests: data.floorPlan?.guests || 4,
        bedrooms: data.floorPlan?.bedrooms || 1,
        beds: data.floorPlan?.beds || 1,
        bathrooms: data.floorPlan?.bathrooms || 1,
        amenities: data.amenities || [],
        images: (data.photos || []).map((url: string, index: number) => ({
          url,
          isPrimary: index === 0,
        })),
        pricing: {
          basePrice: data.pricing?.basePrice || 2500,
          currency: 'INR',
          extraGuestPrice: data.pricing?.extraGuestPrice || 0,
          cleaningFee: data.pricing?.cleaningFee || 0,
          securityDeposit: data.pricing?.securityDeposit || 0,
          weeklyDiscount: data.pricing?.weeklyDiscount || 0,
          monthlyDiscount: data.pricing?.monthlyDiscount || 0,
          weekendPremium: data.pricing?.weekendPremium || 0,
          ...(data.pricing?.anytimeCheckInEnabled && {
            basePrice24Hour: data.pricing.anytimeCheckInPrice,
          }),
        },
        minNights: data.availability?.minNights || 1,
        maxNights: data.availability?.maxNights || 365,
        instantBook: data.availability?.instantBook ?? true,
        ...(data.pricing?.anytimeCheckInEnabled && {
          enable24HourBooking: true,
        }),
        ...(data.hourlyBooking?.enabled && {
          hourlyBooking: {
            enabled: true,
            minStayDays: data.hourlyBooking.minStayDays || 1,
            hourlyRates: {
              sixHours: data.hourlyBooking.hourlyRates.sixHours,
              twelveHours: data.hourlyBooking.hourlyRates.twelveHours,
              eighteenHours: data.hourlyBooking.hourlyRates.eighteenHours,
            },
          },
        }),
      };

      const response = await apiClient.createListing(listingData);

      if (response.success) {
        resetData();
        router.push('/host/Dashboard');
      } else {
        setError(response.message || 'Failed to create listing');
      }
    } catch (err: any) {
      console.error('Error creating listing:', err);
      setError(err?.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout flow='property'
      currentMainStep={3}
      currentSubStep="review"
      onNext={handlePublish}
      nextLabel={isSubmitting ? 'Publishing...' : 'Publish listing'}
      nextDisabled={isSubmitting}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Review your listing
        </h1>
        <p className="text-gray-500 mb-8">
          Here's what we'll show to guests. Make sure everything looks good.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6 max-w-lg">
          {/* Title */}
         <div className="p-4 bg-gray-50 rounded-xl">
                     <div className="flex items-center justify-between mb-1">
                       <div className="flex items-center gap-2 text-sm text-gray-500">
                         <Home className="w-4 h-4" />
                         Title
                       </div>
                       <EditButton step="title" />
                     </div>
                     <p className="text-lg font-medium text-gray-900">
                       {data.title || 'No title set'}
                     </p>
                   </div>

           <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-gray-500">Description</div>
              <EditButton step="description" />
            </div>
            <p className="text-gray-900 line-clamp-3">
              {data.description || 'No description set'}
            </p>
          </div>

          {/* Location */}
          {/* <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <MapPin className="w-4 h-4" />
              Location
            </div>
            <p className="text-lg font-medium text-gray-900">
              {data.location ? `${data.location.city}, ${data.location.state}` : 'No location set'}
            </p>
          </div> */}
          <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          Location
                        </div>
                        <EditButton step="location" />
                      </div>
                      {data.location ?
                        <p className="text-lg font-medium text-gray-900">
                          {data.location.address},
                        {data.location.city}, {data.location.state}
                      </p>
                      :  <p className="text-lg font-medium text-gray-900">
                         No location set
                      </p>
                      }
                      {/* <p className="text-lg font-medium text-gray-900">
                        {data.location ? `${data.location.city}, ${data.location.state}` : 'No location set'}
                      </p> */}
                    </div>

                     {/* property type */}
                               <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Home className="w-4 h-4" />
                                    Property Type
                                  </div>
                                  <EditButton step="structure" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-gray-900 capitalize">
                                    {data.structureType || 'Not specified'} 
                                  </p>
                                </div>
                              </div>

          {/* Floor Plan */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        Space details
                      </div>
                      <EditButton step="floor-plan" />
                    </div>
                    <div className="flex flex-wrap gap-4 text-gray-900">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {data.floorPlan?.guests || 4} guests
                      </span>
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {data.floorPlan?.bedrooms || 1} bedrooms
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {data.floorPlan?.bathrooms || 1} bathrooms
                      </span>
                    </div>
                  </div>

          {/* Price */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-gray-500">Price per night</div>
              <EditButton step="pricing" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">
              ₹{(data.pricing?.basePrice || 2500).toLocaleString()}
            </p>
          </div>
          {/* Amenities */}
          {/* {data.amenities && data.amenities.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-500 mb-2">Amenities</div>
              <div className="flex flex-wrap gap-2">
                {data.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 capitalize"
                  >
                    {amenity.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )} */}

          {/* Amenities */}
{data.amenities && data.amenities.length > 0 && (
  <div className="p-4 bg-gray-50 rounded-xl">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-gray-500">Amenities</div>
      <EditButton step="amenities" />
    </div>
    <div className="flex flex-wrap gap-2">
      {data.amenities.map((amenity) => (
        <span
          key={amenity}
          className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 capitalize"
        >
          {amenity.replace('-', ' ')}
        </span>
      ))}
    </div>
  </div>
)}

 {/* Photos Preview */}
        {data.photos && data.photos.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Image className="w-4 h-4" />
              Photos ({data.photos.length})
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {data.photos.slice(0, 5).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              ))}
              {data.photos.length > 5 && (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-gray-600">+{data.photos.length - 5}</span>
                </div>
              )}
            </div>
          </div>
        )}


                 
{/* House Rules */}
{data.houseRules && (
  <div className="p-4 bg-gray-50 rounded-xl">
    <div className="flex items-center justify-between mb-3">
      <div className="text-sm text-gray-500">House Rules</div>
      <EditButton step="house-rules" />
    </div>
    
    {/* Common Rules - Only show selected ones */}
    {data.houseRules.common && data.houseRules.common.length > 0 && (
      <div className="space-y-2 mb-3">
        {data.houseRules.common.map((ruleId) => {
          // Create a minimal rule object with just what we need
          const selectedRule = {
            id: ruleId,
            title: ruleId.charAt(0).toUpperCase() + ruleId.slice(1).replace(/([A-Z])/g, ' $1'), // Convert "noSmoking" -> "No Smoking"
            icon: ruleId === 'noSmoking' ? Zap : 
                   ruleId === 'noParties' ? PartyPopper :
                   ruleId === 'quietHours' ? Clock :
                   Home, // Default icon
          };
          
          const Icon = selectedRule.icon;
          return (
            <div key={ruleId} className="flex items-center gap-2 text-sm">
              <Icon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">{selectedRule.title}</span>
            </div>
          );
        })}
      </div>
    )}

    {/* Additional Rules - Only show selected ones */}
    {data.houseRules.additional && Object.keys(data.houseRules.additional).length > 0 && (
      <div className="space-y-2">
        {Object.entries(data.houseRules.additional).map(([key, value]) => {
          if (key === 'custom' && value) {
            return (
              <div key={key} className="text-sm text-gray-900">
                <strong>Additional Rules:</strong> {value}
              </div>
            );
          }
          
          // Create minimal rule object for selected additional rules
          const ruleTitles = {
            pets: 'Pets',
            checkIn: 'Check-in Policy',
            photography: 'Photography',
            parking: 'Parking'
          };
          
          const ruleLabels = {
            allowed: 'Allowed',
            not_allowed: 'Not Allowed',
            conditional: 'With Permission',
            flexible: 'Flexible',
            strict: 'Strict',
            free:  'Free',
            paid: 'Paid',
            street: 'Street',
            none: 'No Parking'
          };
          
          return (
            <div key={key} className="flex items-center gap-2 text-sm">
              {key !== 'custom' && (
                <>
                  {key === 'pets' && <Dog className="w-4 h-4 text-gray-500" />}
                  {key === 'checkIn' && <Clock className="w-4 h-4 text-gray-500" />}
                  {key === 'photography' && <Camera className="w-4 h-4 text-gray-500" />}
                  {key === 'parking' && <Car className="w-4 h-4 text-gray-500" />}
                  <span className="text-gray-900">
                    {ruleTitles[key]}: <span className="font-medium">{ruleLabels[value]}</span>
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
)}
  {/* Booking Settings */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm text-gray-500">Booking Settings</div>
              <EditButton step="booking-settings" />
            </div>
            <p className="text-gray-900">
              {data.availability?.instantBook ? 'Instant Book' : 'Request to Book'} • 
              Min {data.availability?.minNights || 1} nights
            </p>
             {/* Check-in/Check-out times */}
    <div className="flex items-center gap-4 text-sm mb-1">
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-gray-500" />
        <span className="text-gray-600 text-xs">Check-in:</span>
        <span className="text-gray-900 font-medium">{data.checkInTime || '3:00 PM'}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-gray-500" />
        <span className="text-gray-600 text-xs">Check-out:</span>
        <span className="text-gray-900 font-medium">{data.checkOutTime || '11:00 AM'}</span>
      </div>
    </div>

     {/* Cancellation Policy */}
    <div className="flex items-center gap-1 text-sm mb-1">
      <Shield className="w-3 h-3 text-gray-500" />
      <span className="text-gray-600">Policy:</span>
      <span className="text-gray-900 font-medium capitalize">
        {data.cancellationPolicy || 'Moderate'}
      </span>
    </div>
           
          </div>


        </div>

      

        {/* KYC Notice */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">KYC Verification</p>
              <p className="text-sm text-amber-700 mt-1">
                You have <strong>15 days</strong> after publishing to complete KYC verification. 
                Your listing will be active during this period. Complete KYC from your dashboard to get verified host badge.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Ready to publish!</p>
              <p className="text-sm text-green-700 mt-1">
                Your listing will go live immediately. You can start receiving bookings right away.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
