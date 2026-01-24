"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  TrendingUp, 
  Percent, 
  IndianRupee,
  Sun,
  Clock,
  Users,
  Sparkles,
  Shield
} from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';

export default function PriceSummaryPage() {
  const router = useRouter();
  const { data } = useOnboarding();
  
  const basePrice = data.pricing?.basePrice || 2500;
  const extraGuestPrice = data.pricing?.extraGuestPrice || 0;
  const cleaningFee = data.pricing?.cleaningFee || 0;
  const securityDeposit = data.pricing?.securityDeposit || 0;
  const anytimeCheckInEnabled = data.pricing?.anytimeCheckInEnabled || false;
  const anytimeCheckInPrice = data.pricing?.anytimeCheckInPrice || 0;
  const hourlyExtensionEnabled = data.hourlyBooking?.enabled || false;
  const hourlyRates = data.hourlyBooking?.hourlyRates || { sixHours: 0.30, twelveHours: 0.60, eighteenHours: 0.90 };

  // Platform fee calculation (example: 3% host fee)
  const platformFeePercent = 3;
  const platformFee = Math.round(basePrice * platformFeePercent / 100);
  const hostEarnings = basePrice - platformFee;

  // GST calculation (18% on platform fee)
  const gstOnPlatformFee = Math.round(platformFee * 0.18);

  const handleNext = () => {
    router.push('/host/property/new/booking-settings');
  };

  return (
    <OnboardingLayout
      currentMainStep={3}
      currentSubStep="price-summary"
      onNext={handleNext}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Your pricing summary
        </h1>
        <p className="text-gray-500 mb-8">
          Here's what you'll earn from each booking
        </p>

        {/* Main Earnings Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your earnings per night</h2>
              <p className="text-sm text-gray-600">After platform fees</p>
            </div>
          </div>

          <div className="text-center py-6">
            <div className="text-5xl font-bold text-green-600 flex items-center justify-center">
              <IndianRupee className="w-10 h-10" />
              {hostEarnings.toLocaleString()}
            </div>
            <p className="text-gray-600 mt-2">You'll receive per night</p>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl p-4 mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Base price per night</span>
              <span className="font-semibold text-gray-900">₹{basePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-red-600">
              <span className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Platform fee ({platformFeePercent}%)
              </span>
              <span className="font-semibold">-₹{platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-red-600 text-sm">
              <span className="pl-6">GST on platform fee (18%)</span>
              <span>-₹{gstOnPlatformFee.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Your earnings</span>
              <span className="font-bold text-green-600 text-xl">₹{(hostEarnings - gstOnPlatformFee).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Additional Fees Summary */}
        {(extraGuestPrice > 0 || cleaningFee > 0 || securityDeposit > 0) && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Additional fees you've set
            </h3>
            <div className="space-y-3">
              {extraGuestPrice > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4" />
                    Extra guest price
                  </span>
                  <span className="font-semibold text-gray-900">₹{extraGuestPrice.toLocaleString()}/night</span>
                </div>
              )}
              {cleaningFee > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="flex items-center gap-2 text-gray-700">
                    <Sparkles className="w-4 h-4" />
                    Cleaning fee
                  </span>
                  <span className="font-semibold text-gray-900">₹{cleaningFee.toLocaleString()}</span>
                </div>
              )}
              {securityDeposit > 0 && (
                <div className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-gray-700">
                    <Shield className="w-4 h-4" />
                    Security deposit (refundable)
                  </span>
                  <span className="font-semibold text-gray-900">₹{securityDeposit.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Anytime Check-in Summary */}
        {anytimeCheckInEnabled && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Anytime Check-in</h3>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Enabled
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">24/7 check-in price</span>
                <span className="font-bold text-orange-600 text-xl">₹{anytimeCheckInPrice.toLocaleString()}/night</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Guests can check-in anytime and checkout after 23 hours
              </p>
            </div>
          </div>
        )}

        {/* Hourly Extension Summary */}
        {hourlyExtensionEnabled && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hourly Extension</h3>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Enabled
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '6 Hours', rate: hourlyRates.sixHours, icon: '⏰' },
                { label: '12 Hours', rate: hourlyRates.twelveHours, icon: '🕐' },
                { label: '18 Hours', rate: hourlyRates.eighteenHours, icon: '🕕' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-3 text-center">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  <div className="text-purple-600 font-bold">{Math.round(item.rate * 100)}%</div>
                  <div className="text-xs text-gray-500">₹{Math.round(basePrice * item.rate).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Great pricing!</p>
              <p className="text-sm text-blue-700 mt-1">
                You can adjust your prices anytime from your hosting dashboard. Competitive pricing helps you get more bookings.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
