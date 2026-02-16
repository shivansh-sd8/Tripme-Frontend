"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Sun, Clock, Users, Sparkles, IndianRupee, Percent, Calendar, Shield, AlertTriangle, Flame, Heart, MapPin, X, ChevronDown } from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';
import { useParams,useSearchParams } from 'next/navigation';
export default function PricingPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
   const params = useParams();
      const searchParams = useSearchParams();
      const id = params.id;
      const isEditMode = searchParams.get("mode") === "edit";
      const returnToReview = searchParams.get("returnToReview") === "true";

  
  
  // Base pricing
  const [basePrice, setBasePrice] = useState(data.pricing?.basePrice || 2500);
  const [extraGuestPrice, setExtraGuestPrice] = useState(data.pricing?.extraGuestPrice || 500);
  const [cleaningFee, setCleaningFee] = useState(data.pricing?.cleaningFee || 0);
  const [securityDeposit, setSecurityDeposit] = useState(data.pricing?.securityDeposit || 0);
  
  // Discounts
  const [weeklyDiscount, setWeeklyDiscount] = useState(data.pricing?.weeklyDiscount || 0);
  const [monthlyDiscount, setMonthlyDiscount] = useState(data.pricing?.monthlyDiscount || 0);
  
  // Weekend premium
  const [weekendPremium, setWeekendPremium] = useState(data.pricing?.weekendPremium || 0);
  
  // Similar listings map modal
  const [showSimilarListings, setShowSimilarListings] = useState(false);
  
  // Mock similar listings data (in real app, fetch from API based on location)
  const similarListings = [
    { id: 1, price: 2664, lat: 23.0225, lng: 72.5714, booked: true },
    { id: 2, price: 3052, lat: 23.0300, lng: 72.5600 },
    { id: 3, price: 2514, lat: 23.0400, lng: 72.5500 },
    { id: 4, price: 5028, lat: 23.0150, lng: 72.5800 },
    { id: 5, price: 2065, lat: 23.0500, lng: 72.5700 },
    { id: 6, price: 3591, lat: 23.0350, lng: 72.5650 },
    { id: 7, price: 4220, lat: 23.0550, lng: 72.5550 },
    { id: 8, price: 2424, lat: 23.0100, lng: 72.5400 },
    { id: 9, price: 3860, lat: 23.0450, lng: 72.5900 },
    { id: 10, price: 2783, lat: 23.0050, lng: 72.5350 },
  ];
  
  // Anytime check-in
  const [anytimeCheckInEnabled, setAnytimeCheckInEnabled] = useState(
    data.pricing?.anytimeCheckInEnabled || false
  );
  const [anytimeCheckInPrice, setAnytimeCheckInPrice] = useState(
    data.pricing?.anytimeCheckInPrice || Math.round((data.pricing?.basePrice || 2500) * 1.2)
  );
  
  // Hourly extension
  const [hourlyExtensionEnabled, setHourlyExtensionEnabled] = useState(
    data.hourlyBooking?.enabled || false
  );
  const [hourlyRates, setHourlyRates] = useState({
    sixHours: (data.hourlyBooking?.hourlyRates?.sixHours || 0.30) * 100,
    twelveHours: (data.hourlyBooking?.hourlyRates?.twelveHours || 0.60) * 100,
    eighteenHours: (data.hourlyBooking?.hourlyRates?.eighteenHours || 0.90) * 100,
  });

  // Guest safety items
  const [safetyItems, setSafetyItems] = useState<string[]>(
    data.amenities?.filter((a: string) => ['smoke-alarm', 'carbon-monoxide-alarm', 'first-aid-kit', 'fire-extinguisher'].includes(a)) || []
  );

  const safetyOptions = [
    { id: 'smoke-alarm', label: 'Smoke alarm', icon: AlertTriangle },
    { id: 'carbon-monoxide-alarm', label: 'Carbon monoxide alarm', icon: AlertTriangle },
    { id: 'first-aid-kit', label: 'First aid kit', icon: Heart },
    { id: 'fire-extinguisher', label: 'Fire extinguisher', icon: Flame },
  ];

  const toggleSafetyItem = (item: string) => {
    setSafetyItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleNext = () => {
    // Merge safety items with existing amenities
    const existingAmenities = data.amenities || [];
    const nonSafetyAmenities = existingAmenities.filter((a: string) => 
      !['smoke-alarm', 'carbon-monoxide-alarm', 'first-aid-kit', 'fire-extinguisher'].includes(a)
    );
    const updatedAmenities = [...nonSafetyAmenities, ...safetyItems];

    updateData({
      pricing: {
        basePrice,
        extraGuestPrice,
        cleaningFee,
        securityDeposit,
        weeklyDiscount,
        monthlyDiscount,
        weekendPremium,
        currency: 'INR',
        anytimeCheckInEnabled,
        anytimeCheckInPrice: anytimeCheckInEnabled ? anytimeCheckInPrice : undefined,
      },
      hourlyBooking: {
        enabled: hourlyExtensionEnabled,
        minStayDays: 1,
        hourlyRates: {
          sixHours: hourlyRates.sixHours / 100,
          twelveHours: hourlyRates.twelveHours / 100,
          eighteenHours: hourlyRates.eighteenHours / 100,
        },
      },
      amenities: updatedAmenities,
    });

     if (returnToReview) {
    // Return to review page
    if (isEditMode && id) {
      router.push(`/host/property/${id}/review?mode=edit`);
    } else {
      router.push('/host/property/new/review');
    }
  } else {
     if(isEditMode && id){
      router.push(`/host/property/${id}/price-summary?mode=edit`);
    }else{
      router.push('/host/property/new/price-summary');
    }
  }
  };

  return (
    <OnboardingLayout
    flow="property"
      currentMainStep={3}
      currentSubStep="pricing"
      onNext={handleNext}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Now, set your price
        </h1>
        <p className="text-gray-500 mb-8">
          You can change it anytime.
        </p>

        {/* Base Price - Large Display with Input */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setBasePrice(Math.max(100, basePrice - 100))}
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:bg-white transition-all"
            >
              <Minus className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="flex items-center justify-center">
                <span className="text-4xl font-semibold text-gray-900">₹</span>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Math.max(100, Number(e.target.value) || 0))}
                  className="text-5xl font-semibold text-gray-900 bg-transparent border-none outline-none w-40 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="text-gray-500 mt-1">per night</div>
            </div>
            
            <button
              onClick={() => setBasePrice(basePrice + 100)}
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:bg-white transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Compare Similar Listings Button */}
          <div className="text-center">
            <button
              onClick={() => setShowSimilarListings(true)}
              className="text-sm text-gray-600 hover:text-gray-900 underline flex items-center gap-1 mx-auto"
            >
              <MapPin className="w-4 h-4" />
              Compare similar listings
            </button>
          </div>
        </div>

        {/* Weekend Premium - Airbnb Style */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Set a weekend price</h2>
          <p className="text-gray-500 text-sm mb-6">Add a premium for Fridays and Saturdays.</p>
          
          <div className="text-center mb-6">
            <div className="text-5xl font-semibold text-gray-900">
              ₹{Math.round(basePrice * (1 + weekendPremium / 100)).toLocaleString()}
            </div>
            <button className="text-sm text-gray-500 mt-2 flex items-center gap-1 mx-auto">
              Guest price before taxes ₹{Math.round(basePrice * (1 + weekendPremium / 100) * 1.18).toLocaleString()}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Weekend premium</p>
                <p className="text-sm text-gray-500">Tip: Try 3%</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <input
                  type="number"
                  value={weekendPremium}
                  onChange={(e) => setWeekendPremium(Math.min(99, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-12 text-right text-lg font-semibold text-gray-900 bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-lg font-semibold text-gray-900">%</span>
              </div>
            </div>
            
            {/* Slider */}
            <div className="relative pt-2">
              <input
                type="range"
                min="0"
                max="99"
                value={weekendPremium}
                onChange={(e) => setWeekendPremium(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>99%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Fees */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Additional fees
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Extra Guest Price */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">Extra guest</label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={extraGuestPrice || ''}
                  onChange={(e) => setExtraGuestPrice(Number(e.target.value) || 0)}
                  placeholder="500"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Per extra guest/night</p>
            </div>

            {/* Cleaning Fee */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">Cleaning fee</label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={cleaningFee || ''}
                  onChange={(e) => setCleaningFee(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">One-time fee</p>
            </div>

            {/* Security Deposit */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <IndianRupee className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">Security deposit</label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={securityDeposit || ''}
                  onChange={(e) => setSecurityDeposit(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Refundable</p>
            </div>
          </div>
        </div>

        {/* Anytime Check-in */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Anytime Check-in</h3>
                <p className="text-sm text-gray-600">Allow guests to check-in at any time (24/7)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={anytimeCheckInEnabled}
                onChange={(e) => {
                  setAnytimeCheckInEnabled(e.target.checked);
                  if (e.target.checked && !anytimeCheckInPrice) {
                    setAnytimeCheckInPrice(Math.round(basePrice * 1.2));
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {anytimeCheckInEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-orange-200"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anytime check-in price (per night)
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAnytimeCheckInPrice(Math.max(basePrice, anytimeCheckInPrice - 100))}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={anytimeCheckInPrice}
                      onChange={(e) => setAnytimeCheckInPrice(Math.max(basePrice, Number(e.target.value) || basePrice))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-lg font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setAnytimeCheckInPrice(anytimeCheckInPrice + 100)}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-orange-700 mt-2">
                Suggested: ₹{Math.round(basePrice * 1.2).toLocaleString()} (20% more than base price)
              </p>
            </motion.div>
          )}
        </div>

        {/* Discounts */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Percent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Length of Stay Discounts</h3>
              <p className="text-sm text-gray-600">Offer discounts for longer stays</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Weekly Discount */}
            <div className="bg-white rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-green-600" />
                <label className="text-sm font-medium text-gray-700">Weekly (7+ nights)</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={weeklyDiscount || ''}
                  onChange={(e) => setWeeklyDiscount(Math.min(90, Math.max(0, Number(e.target.value) || 0)))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-green-600 font-semibold">%</span>
              </div>
              {weeklyDiscount > 0 && (
                <p className="text-xs text-green-700 mt-2">
                  ₹{Math.round(basePrice * 7 * (1 - weeklyDiscount/100)).toLocaleString()} for 7 nights
                </p>
              )}
            </div>

            {/* Monthly Discount */}
            <div className="bg-white rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-green-600" />
                <label className="text-sm font-medium text-gray-700">Monthly (28+ nights)</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={monthlyDiscount || ''}
                  onChange={(e) => setMonthlyDiscount(Math.min(90, Math.max(0, Number(e.target.value) || 0)))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-green-600 font-semibold">%</span>
              </div>
              {monthlyDiscount > 0 && (
                <p className="text-xs text-green-700 mt-2">
                  ₹{Math.round(basePrice * 28 * (1 - monthlyDiscount/100)).toLocaleString()} for 28 nights
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Hourly Extension */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hourly Extension</h3>
                <p className="text-sm text-gray-600">Allow guests to extend checkout by hours</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hourlyExtensionEnabled}
                onChange={(e) => setHourlyExtensionEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          {hourlyExtensionEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-purple-200"
            >
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Extension rates (% of daily rate)
              </label>
              {/* <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'sixHours', label: '6 Hours', icon: '⏰' },
                  { key: 'twelveHours', label: '12 Hours', icon: '🕐' },
                  { key: 'eighteenHours', label: '18 Hours', icon: '🕕' },
                ].map((option) => (
                  <div
                    key={option.key}
                    className="bg-white rounded-xl p-4 border border-purple-200"
                  >
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="font-semibold text-gray-900 text-sm">{option.label}</div>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setHourlyRates(prev => ({
                          ...prev,
                          [option.key]: Math.max(10, prev[option.key as keyof typeof prev] - 5)
                        }))}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-xs hover:border-purple-500 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={hourlyRates[option.key as keyof typeof hourlyRates]}
                        onChange={(e) => setHourlyRates(prev => ({
                          ...prev,
                          [option.key]: Math.min(100, Math.max(10, Number(e.target.value) || 10))
                        }))}
                        className="w-14 text-center text-xs font-bold text-purple-600 border-none outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-purple-600 font-bold">%</span>
                      <button
                        onClick={() => setHourlyRates(prev => ({
                          ...prev,
                          [option.key]: Math.min(100, prev[option.key as keyof typeof prev] + 5)
                        }))}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-xs hover:border-purple-500 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 text-center mt-2">
                      ₹{Math.round(basePrice * hourlyRates[option.key as keyof typeof hourlyRates] / 100).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div> */}
              {/* Changed grid-cols-3 to responsive breakpoints */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {[
    { key: 'sixHours', label: '6 Hours', icon: '⏰' },
    { key: 'twelveHours', label: '12 Hours', icon: '🕐' },
    { key: 'eighteenHours', label: '6 Hours', icon: '🕕' },
  ].map((option) => (
    <div
      key={option.key}
      className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm"
    >
      <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center mb-3">
        <div className="flex items-center gap-3 sm:block sm:text-center">
          <div className="text-2xl mb-1">{option.icon}</div>
          <div className="font-semibold text-gray-900 text-sm">{option.label}</div>
        </div>
        
        {/* Price display moved here for better mobile layout flow */}
        <div className="text-sm font-bold text-gray-700 sm:hidden">
           ₹{Math.round(basePrice * hourlyRates[option.key as keyof typeof hourlyRates] / 100).toLocaleString()}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setHourlyRates(prev => ({
            ...prev,
            [option.key]: Math.max(10, prev[option.key as keyof typeof prev] - 5)
          }))}
          className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg sm:text-xs hover:bg-purple-50 hover:border-purple-500 transition-colors active:scale-95"
        >
          -
        </button>
        
        <div className="flex items-center justify-center bg-gray-50 rounded-lg px-2">
          <input
            type="number"
            value={hourlyRates[option.key as keyof typeof hourlyRates]}
            onChange={(e) => setHourlyRates(prev => ({
              ...prev,
              [option.key]: Math.min(100, Math.max(10, Number(e.target.value) || 10))
            }))}
            className="w-12 text-center text-sm font-bold text-purple-600 border-none outline-none bg-transparent py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-purple-600 font-bold text-sm">%</span>
        </div>

        <button
          onClick={() => setHourlyRates(prev => ({
            ...prev,
            [option.key]: Math.min(100, prev[option.key as keyof typeof prev] + 5)
          }))}
          className="w-10 h-10 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg sm:text-xs hover:bg-purple-50 hover:border-purple-500 transition-colors active:scale-95"
        >
          +
        </button>
      </div>

      {/* Desktop/Tablet Price View */}
      <div className="hidden sm:block text-xs text-gray-500 text-center mt-2">
        ₹{Math.round(basePrice * hourlyRates[option.key as keyof typeof hourlyRates] / 100).toLocaleString()}
      </div>
    </div>
  ))}
</div>
              <p className="text-xs text-purple-700 mt-3 text-center">
                Guests can extend their checkout time at these rates
              </p>
            </motion.div>
          )}
        </div>

        {/* Guest Safety */}
        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 border border-red-200 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Guest Safety</h3>
              <p className="text-sm text-gray-600">Select safety features available at your property</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {safetyOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = safetyItems.includes(option.id);
              
              return (
                <button
                  key={option.id}
                  onClick={() => toggleSafetyItem(option.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white hover:border-red-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`font-medium text-xs ${isSelected ? 'text-red-700' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-red-700 mt-3">
            Adding safety features helps guests feel secure and can improve your listing's visibility
          </p>
        </div>

        {/* Price Comparison Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
          <div className="flex items-start gap-3">
            <IndianRupee className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Price tip</p>
              <p className="text-sm text-blue-700 mt-1">
                Similar listings in your area are priced between ₹1,500 - ₹4,000 per night. 
                Your price of ₹{basePrice.toLocaleString()} is competitive for your property type.
              </p>
              <button
                onClick={() => setShowSimilarListings(true)}
                className="text-sm text-blue-600 hover:text-blue-800 underline mt-2 font-medium"
              >
                Show similar listings on map
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Similar Listings Map Modal */}
      <AnimatePresence>
        {showSimilarListings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSimilarListings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-5xl h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <button
                  onClick={() => setShowSimilarListings(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">Compare similar listings</h2>
                <div className="w-9" /> {/* Spacer for centering */}
              </div>

              {/* Modal Content */}
              <div className="flex h-[calc(100%-65px)]">
                {/* Map Area */}
                <div className="flex-1 relative bg-gray-100">
                  {/* Simulated Map with Price Markers */}
                  <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=23.0225,72.5714&zoom=12&size=800x600&maptype=roadmap&key=demo')] bg-cover bg-center opacity-30" />
                  
                  {/* Price Markers */}
                  <div className="absolute inset-0 p-8">
                    <div className="relative w-full h-full">
                      {similarListings.map((listing, index) => {
                        // Calculate position based on index for demo
                        const positions = [
                          { top: '20%', left: '30%' },
                          { top: '35%', left: '45%' },
                          { top: '15%', left: '60%' },
                          { top: '50%', left: '25%' },
                          { top: '40%', left: '70%' },
                          { top: '60%', left: '50%' },
                          { top: '25%', left: '80%' },
                          { top: '70%', left: '35%' },
                          { top: '55%', left: '65%' },
                          { top: '45%', left: '15%' },
                        ];
                        const pos = positions[index] || { top: '50%', left: '50%' };
                        
                        return (
                          <div
                            key={listing.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                              listing.booked 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white text-gray-900 hover:scale-110'
                            } px-2 py-1 rounded-full text-xs font-semibold shadow-lg cursor-pointer transition-transform border border-gray-200`}
                            style={{ top: pos.top, left: pos.left }}
                          >
                            ₹{listing.price.toLocaleString()}
                          </div>
                        );
                      })}
                      
                      {/* Your listing marker */}
                      <div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg border-2 border-white"
                        style={{ top: '45%', left: '45%' }}
                      >
                        ₹{basePrice.toLocaleString()}
                        <span className="text-xs ml-1 opacity-80">You</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Map Controls */}
                  <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                    <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-700 hover:bg-gray-50">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-700 hover:bg-gray-50">
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info Panel */}
                <div className="w-80 border-l bg-white p-6 overflow-y-auto">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Compare similar listings</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {data.structureType ? data.structureType.charAt(0).toUpperCase() + data.structureType.slice(1) : 'Entire home/flat'} · 0-2 bedrooms
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} – {new Date(Date.now() + 365*24*60*60*1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Booked listings</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Most listings with reservations during these dates were an average of ₹1,077 – ₹26,574 per night.
                    </p>
                    <button className="text-sm text-gray-600 hover:text-gray-900 underline">
                      Learn more
                    </button>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Your price</h4>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                      <div className="text-2xl font-bold text-purple-600">₹{basePrice.toLocaleString()}</div>
                      <p className="text-sm text-purple-700 mt-1">per night</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Price distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Below ₹2,000</span>
                        <span className="font-medium">{similarListings.filter(l => l.price < 2000).length} listings</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">₹2,000 - ₹3,500</span>
                        <span className="font-medium">{similarListings.filter(l => l.price >= 2000 && l.price < 3500).length} listings</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Above ₹3,500</span>
                        <span className="font-medium">{similarListings.filter(l => l.price >= 3500).length} listings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </OnboardingLayout>
  );
}
