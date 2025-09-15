"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Plus, Check } from 'lucide-react';
import { HourlyBookingSettings, HourlyPricingBreakdown } from '@/types';

interface HourlyBookingSelectorProps {
  hourlySettings: HourlyBookingSettings;
  basePrice: number;
  nights: number;
  checkInDate?: Date;
  checkOutDate?: Date;
  checkInTime?: string; // e.g., "15:00"
  checkOutTime?: string; // e.g., "11:00"
  onExtensionChange: (extension: number | null) => void;
  onPricingChange: (pricing: HourlyPricingBreakdown | null) => void;
  className?: string;
}

const HourlyBookingSelector: React.FC<HourlyBookingSelectorProps> = ({
  hourlySettings,
  basePrice,
  nights,
  checkInDate,
  checkOutDate,
  checkInTime = "15:00",
  checkOutTime = "11:00",
  onExtensionChange,
  onPricingChange,
  className = ""
}) => {
  const [selectedExtension, setSelectedExtension] = useState<number | null>(null);
  const [pricingBreakdown, setPricingBreakdown] = useState<HourlyPricingBreakdown | null>(null);

  // Calculate new checkout time based on extension
  const calculateNewCheckoutTime = (extensionHours: number) => {
    if (!checkOutDate || isNaN(checkOutDate.getTime())) return null;
    
    try {
      // Create checkout time with the actual checkout time (e.g., 11:00 AM)
      const [hours, minutes] = checkOutTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return null;
      
      const baseCheckoutTime = new Date(checkOutDate);
      baseCheckoutTime.setHours(hours, minutes, 0, 0);
      
      // Add extension hours
      const newCheckoutTime = new Date(baseCheckoutTime);
      newCheckoutTime.setHours(newCheckoutTime.getHours() + extensionHours);
      
      return newCheckoutTime;
    } catch (error) {
      console.warn('Error calculating new checkout time:', error);
      return null;
    }
  };

  // Get the base checkout time for display
  const getBaseCheckoutTime = () => {
    if (!checkOutDate || isNaN(checkOutDate.getTime())) return null;
    
    try {
      const [hours, minutes] = checkOutTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return null;
      
      const baseCheckoutTime = new Date(checkOutDate);
      baseCheckoutTime.setHours(hours, minutes, 0, 0);
      
      return baseCheckoutTime;
    } catch (error) {
      console.warn('Error getting base checkout time:', error);
      return null;
    }
  };

  // Format time for display
  const formatTime = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return 'Invalid time';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const extensionOptions = [
    { hours: 6, label: '6 Hours', description: `${Math.round(hourlySettings.hourlyRates.sixHours * 100)}% of daily rate` },
    { hours: 12, label: '12 Hours', description: `${Math.round(hourlySettings.hourlyRates.twelveHours * 100)}% of daily rate` },
    { hours: 18, label: '18 Hours', description: `${Math.round(hourlySettings.hourlyRates.eighteenHours * 100)}% of daily rate` }
  ];

  useEffect(() => {
    if (!hourlySettings.enabled) return;

    const dailyTotal = basePrice * nights;
    const extraGuestPrice = 0; // This would come from props if needed
    const cleaningFee = 0; // This would come from props if needed
    const serviceFee = 0; // This would come from props if needed
    const securityDeposit = 0; // This would come from props if needed

    let hourlyTotal = 0;
    let hourlyBreakdown = null;

    if (selectedExtension && selectedExtension > 0) {
      let hourlyRate = 0;
      let description = '';

      if (selectedExtension >= 24) {
        // 24+ hours = full day
        hourlyRate = 1.0;
        hourlyTotal = basePrice;
        description = 'Full day extension';
      } else if (selectedExtension === 18) {
        hourlyRate = hourlySettings.hourlyRates.eighteenHours;
        hourlyTotal = basePrice * hourlyRate;
        description = '18-hour extension (75% of daily rate)';
      } else if (selectedExtension === 12) {
        hourlyRate = hourlySettings.hourlyRates.twelveHours;
        hourlyTotal = basePrice * hourlyRate;
        description = '12-hour extension (60% of daily rate)';
      } else if (selectedExtension === 6) {
        hourlyRate = hourlySettings.hourlyRates.sixHours;
        hourlyTotal = basePrice * hourlyRate;
        description = '6-hour extension (30% of daily rate)';
      }

      hourlyBreakdown = {
        hours: selectedExtension,
        rate: hourlyRate,
        description,
        total: hourlyTotal
      };
    }

    // Note: Platform fee rate is now dynamic and fetched from backend
    // This is a fallback value - the actual rate should come from the backend
    const platformFeeRate = 0.15; // Fallback rate (will be overridden by dynamic rate)
    const platformFee = (dailyTotal + hourlyTotal) * platformFeeRate;
    const hostEarning = (dailyTotal + hourlyTotal) - platformFee;

    const breakdown: HourlyPricingBreakdown = {
      daily: {
        nights,
        basePrice: dailyTotal,
        extraGuests: 0,
        total: dailyTotal
      },
      hourly: hourlyBreakdown,
      fees: {
        cleaningFee,
        serviceFee,
        securityDeposit,
        platformFee: Math.round(platformFee * 100) / 100,
        hostEarning: Math.round(hostEarning * 100) / 100
      },
      totals: {
        subtotal: dailyTotal + hourlyTotal,
        total: dailyTotal + hourlyTotal + cleaningFee + serviceFee + securityDeposit
      }
    };

    setPricingBreakdown(breakdown);
    onPricingChange(breakdown);
  }, [selectedExtension, basePrice, nights, hourlySettings]);

  const handleExtensionSelect = (hours: number) => {
    if (selectedExtension === hours) {
      // Deselect if already selected
      setSelectedExtension(null);
      onExtensionChange(null);
    } else {
      setSelectedExtension(hours);
      onExtensionChange(hours);
    }
  };

  if (!hourlySettings.enabled) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Extend Your Stay</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Add extra hours to your booking for more flexibility
        </p>
      </div>

      <div className="space-y-3">
        {extensionOptions.map((option) => (
          <button
            key={option.hours}
            onClick={() => handleExtensionSelect(option.hours)}
            className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-200 ${
              selectedExtension === option.hours
                ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedExtension === option.hours
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {selectedExtension === option.hours && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ₹{Math.round(basePrice * (option.hours === 6 ? hourlySettings.hourlyRates.sixHours : 
                                           option.hours === 12 ? hourlySettings.hourlyRates.twelveHours : 
                                           hourlySettings.hourlyRates.eighteenHours))}
                </div>
                <div className="text-xs text-gray-500">additional</div>
              </div>
            </div>
          </button>
        ))}

        {/* Checkout Time Change Display */}
        {selectedExtension && checkOutDate && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Checkout Time Change</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Original checkout:</span>
                <span className="text-blue-900 font-medium">
                  {(() => {
                    const baseTime = getBaseCheckoutTime();
                    return baseTime ? `${formatDate(baseTime)} at ${formatTime(baseTime)}` : 'Calculating...';
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">New checkout:</span>
                <span className="text-blue-900 font-medium">
                  {(() => {
                    const newTime = calculateNewCheckoutTime(selectedExtension);
                    return newTime ? `${formatDate(newTime)} at ${formatTime(newTime)}` : 'Calculating...';
                  })()}
                </span>
              </div>
              <div className="text-xs text-blue-600 mt-2">
                +{selectedExtension} hours extension
              </div>
            </div>
          </div>
        )}

        {selectedExtension && pricingBreakdown && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Pricing Breakdown</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Base stay ({pricingBreakdown.daily.nights} nights)</span>
                <span className="text-gray-900 font-medium">₹{pricingBreakdown.daily.basePrice}</span>
              </div>
              {pricingBreakdown.hourly && (
                <div className="flex justify-between">
                  <span className="text-gray-700">{pricingBreakdown.hourly.description}</span>
                  <span className="text-gray-900 font-medium">+₹{pricingBreakdown.hourly.total}</span>
                </div>
              )}
              <div className="border-t pt-1 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₹{pricingBreakdown.totals.total}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>• Extensions are added to your checkout time</p>
        <p>• 24+ hour extensions are charged as a full day</p>
        <p>• Rates are calculated as a percentage of your daily rate</p>
      </div>
    </div>
  );
};

export default HourlyBookingSelector;
