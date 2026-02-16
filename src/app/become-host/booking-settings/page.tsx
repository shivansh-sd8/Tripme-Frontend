"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Zap, 
  MessageSquare, 
  CheckCircle,
  Calendar,
  AlertCircle,
  Clock,
  Shield 
} from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';

type BookingType = 'instant' | 'request';

export default function BookingSettingsPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  
  const [bookingType, setBookingType] = useState<BookingType>(
    data.availability?.instantBook ? 'instant' : 'instant'
  );
  const [minNights, setMinNights] = useState(data.availability?.minNights || 1);
  const [maxNights, setMaxNights] = useState(data.availability?.maxNights || 365);
 const [checkInTime, setCheckInTime] = useState(data.checkInTime || '15:00');
const [checkOutTime, setCheckOutTime] = useState(data.checkOutTime || '11:00');
const [cancellationPolicy, setCancellationPolicy] = useState(data.cancellationPolicy || 'moderate');

  const handleNext = () => {
    updateData({
      availability: {
        instantBook: bookingType === 'instant',
        minNights,
        maxNights,
      },
       checkInTime,
      checkOutTime,
      cancellationPolicy,
    });
    router.push('/become-host/kyc');
  };

  return (
    <OnboardingLayout flow='property'
      currentMainStep={3}
      currentSubStep="booking-settings"
      onNext={handleNext}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Choose how guests book
        </h1>
        <p className="text-gray-500 mb-8">
          You can change this setting anytime from your listing dashboard.
        </p>

        {/* Booking Type Selection */}
        <div className="space-y-4 mb-10">
          {/* Instant Book */}
          <motion.button
            onClick={() => setBookingType('instant')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
              bookingType === 'instant'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                bookingType === 'instant' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <Zap className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Instant Book</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Recommended
                  </span>
                </div>
                <p className="text-gray-600 mt-1">Guests can book automatically without waiting for your approval.</p>
                <ul className="mt-4 space-y-2">
                  {[
                    'Get more bookings - guests prefer instant confirmation',
                    'No need to respond to booking requests',
                    'You can still set requirements for guests',
                    'Cancel penalty-free within 24 hours if needed',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                bookingType === 'instant' ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
              }`}>
                {bookingType === 'instant' && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
            </div>
          </motion.button>

          {/* Request Approval */}
          <motion.button
            onClick={() => setBookingType('request')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
              bookingType === 'request'
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${
                bookingType === 'request' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Approve each request</h3>
                <p className="text-gray-600 mt-1">Review and approve each booking request before guests can book.</p>
                <ul className="mt-4 space-y-2">
                  {[
                    'Review guest profiles before accepting',
                    'Ask questions before confirming',
                    'You have 24 hours to respond to requests',
                    'May receive fewer bookings',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                bookingType === 'request' ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
              }`}>
                {bookingType === 'request' && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
            </div>
          </motion.button>
        </div>

        {/* Trip Length Settings */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Trip length
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum nights
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMinNights(Math.max(1, minNights - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-medium w-12 text-center">{minNights}</span>
                <button
                  onClick={() => setMinNights(Math.min(maxNights, minNights + 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum nights
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMaxNights(Math.max(minNights, maxNights - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-medium w-12 text-center">{maxNights}</span>
                <button
                  onClick={() => setMaxNights(Math.min(365, maxNights + 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

          <div className="border-t border-gray-200 pt-8">
  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
    <Clock className="w-5 h-5" />
    Check-in & Check-out times
  </h2>
  
  <div className="grid grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Check-in time
      </label>
      <select
        value={checkInTime}
        onChange={(e) => setCheckInTime(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      >
        {Array.from({ length: 24 }, (_, i) => {
          const hour = i.toString().padStart(2, '0');
          return (
            <option key={hour} value={`${hour}:00`}>
              {hour}:00
            </option>
          );
        })}
      </select>
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Check-out time
      </label>
      <select
        value={checkOutTime}
        onChange={(e) => setCheckOutTime(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      >
        {Array.from({ length: 24 }, (_, i) => {
          const hour = i.toString().padStart(2, '0');
          return (
            <option key={hour} value={`${hour}:00`}>
              {hour}:00
            </option>
          );
        })}
      </select>
    </div>

 
  </div>
     {/* Cancellation Policy */}
{/* Cancellation Policy */}
<div className="border-t border-gray-200 pt-8">
  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
    <Shield className="w-5 h-5" />
    Cancellation policy
  </h2>
  
  <div className="space-y-3">
    {[
      { value: 'flexible', label: 'Flexible', description: 'Guests can cancel up to 24 hours before check-in for a full refund' },
      { value: 'moderate', label: 'Moderate', description: 'Guests can cancel up to 5 days before check-in for a full refund' },
      { value: 'strict', label: 'Strict', description: 'Guests can cancel up to 14 days before check-in for a 50% refund' },
    ].map((policy) => (
      <label
        key={policy.value}
        className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
          cancellationPolicy === policy.value
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input
          type="radio"
          name="cancellationPolicy"
          value={policy.value}
          checked={cancellationPolicy === policy.value}
          onChange={(e) => setCancellationPolicy(e.target.value)}
          className="sr-only"
        />
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">{policy.label}</div>
            <div className="text-sm text-gray-600 mt-1">{policy.description}</div>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            cancellationPolicy === policy.value ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
          }`}>
            {cancellationPolicy === policy.value && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>
        </div>
      </label>
    ))}
  </div>
</div>
</div>

        {/* Info box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">You're in control</p>
              <p className="text-sm text-blue-700 mt-1">
                You can block specific dates, set custom pricing for seasons, and adjust all these settings anytime from your hosting dashboard.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
