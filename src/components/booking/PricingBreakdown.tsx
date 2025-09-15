"use client";

import React, { useState } from 'react';
import { formatCurrency, PRICING_CONSTANTS } from '@/shared/constants/pricing.constants';
import { toTwoDecimals } from '@/shared/utils/pricingUtils';

interface PricingBreakdownProps {
  pricing: {
    basePrice: number;
    nights: number;
    extraGuestPrice?: number;
    extraGuests?: number;
    cleaningFee?: number;
    serviceFee?: number;
    securityDeposit?: number;
    hourlyExtension?: number;
    discountAmount?: number;
    currency?: string;
    // Calculated properties
    platformFee?: number;
    subtotal?: number;
    gst?: number;
    processingFee?: number;
    total?: number;
    hostEarning?: number;
  };
  showPlatformFees?: boolean;
  showHostEarning?: boolean;
  variant?: 'customer' | 'host' | 'platform';
}

export default function PricingBreakdown({ 
  pricing, 
  showPlatformFees = true, 
  showHostEarning = false,
  variant = 'customer' 
}: PricingBreakdownProps) {
  
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const {
    basePrice,
    nights = 1,
    extraGuestPrice = 0,
    extraGuests = 0,
    cleaningFee = 0,
    serviceFee = 0,
    securityDeposit = 0,
    hourlyExtension = 0,
    discountAmount = 0,
    currency = PRICING_CONSTANTS.DEFAULT_CURRENCY,
    // Calculated properties
    platformFee: passedPlatformFee,
    subtotal: passedSubtotal,
    gst: passedGst,
    processingFee: passedProcessingFee,
    total: passedTotal,
    hostEarning: passedHostEarning
  } = pricing;

  // Calculate pricing breakdown
  const baseAmount = basePrice * nights;
  const extraGuestCost = extraGuestPrice * extraGuests * nights;
  const hostFees = cleaningFee + serviceFee + securityDeposit;
  const calculatedSubtotal = baseAmount + extraGuestCost + hostFees + hourlyExtension - discountAmount;
  
  // Use passed values if available, otherwise calculate
  const subtotal = passedSubtotal ?? calculatedSubtotal;
  
  // If platformFee is not provided, use fallback calculation
  const platformFee = passedPlatformFee ?? toTwoDecimals(subtotal * PRICING_CONSTANTS.PLATFORM_FEE_RATE * 100) / 100;
  
  const gst = passedGst ?? toTwoDecimals(subtotal * PRICING_CONSTANTS.GST_RATE * 100) / 100;
  const processingFee = passedProcessingFee ?? toTwoDecimals((subtotal * PRICING_CONSTANTS.PROCESSING_FEE_RATE + PRICING_CONSTANTS.PROCESSING_FEE_FIXED) * 100) / 100;
  
  const totalAmount = passedTotal ?? (subtotal + platformFee + gst + processingFee);
  const hostEarning = passedHostEarning ?? (subtotal - platformFee);

  const formatPrice = (amount: number) => formatCurrency(amount, currency);

  return (
    <div className="space-y-3">
      {/* Base Price */}
      <div className="flex justify-between items-center py-2">
        <span className="text-gray-700 font-medium">
          {formatPrice(basePrice)} × {nights} night{nights > 1 ? 's' : ''}
        </span>
        <span className="text-gray-900 font-semibold">{formatPrice(baseAmount)}</span>
      </div>

      {/* Extra Guest Charges */}
      {extraGuests > 0 && extraGuestPrice > 0 && (
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">
            Extra guest{extraGuests > 1 ? 's' : ''} ({extraGuests} × {formatPrice(extraGuestPrice)})
          </span>
          <span className="text-gray-900">{formatPrice(extraGuestCost)}</span>
        </div>
      )}

      {/* Host-Set Fees */}
      {cleaningFee > 0 && (
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Cleaning fee</span>
          <span className="text-gray-900">{formatPrice(cleaningFee)}</span>
        </div>
      )}

      {serviceFee > 0 && (
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Service fee</span>
          <span className="text-gray-900">{formatPrice(serviceFee)}</span>
        </div>
      )}

      {securityDeposit > 0 && (
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Security deposit</span>
          <span className="text-gray-900">{formatPrice(securityDeposit)}</span>
        </div>
      )}

      {/* Hourly Extension */}
      {hourlyExtension > 0 && (
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Hourly extension</span>
          <span className="text-gray-900">{formatPrice(hourlyExtension)}</span>
        </div>
      )}

      {/* Discount */}
      {discountAmount > 0 && (
        <div className="flex justify-between items-center py-2 text-green-600">
          <span className="font-medium">Discount</span>
          <span className="font-semibold">-{formatPrice(discountAmount)}</span>
        </div>
      )}

      {/* Subtotal */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-700 font-medium">Subtotal</span>
          <span className="text-gray-900 font-semibold">{formatPrice(subtotal)}</span>
        </div>
      </div>

      {/* Platform Fees Section - Always show for customer view */}
      {variant === 'customer' && (
        <>
          {/* Platform Fees Summary */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">
                Platform fees & taxes
              </span>
              <span className="text-gray-900 font-semibold">
                {formatPrice(platformFee + gst + processingFee)}
              </span>
            </div>
            
            {/* Toggle Button */}
            <button
              onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
              className="flex items-center justify-center w-full mt-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="mr-1">
                {showDetailedBreakdown ? 'Hide' : 'Show'} breakdown
              </span>
              <span className="text-lg">
                {showDetailedBreakdown ? '▲' : '▼'}
              </span>
            </button>
            
            {/* Detailed Breakdown */}
            {showDetailedBreakdown && (
              <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">TripMe Service Fee ({subtotal > 0 ? toTwoDecimals((platformFee / subtotal) * 100) : 0}%)</span>
                  <span className="text-gray-900">{formatPrice(platformFee)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="text-gray-900">{formatPrice(gst)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Processing fee (2.9% + ₹30)</span>
                  <span className="text-gray-900">{formatPrice(processingFee)}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Host Earning (only for host view) */}
      {showHostEarning && variant === 'host' && (
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">TripMe Service Fee ({subtotal > 0 ? toTwoDecimals((platformFee / subtotal) * 100) : 0}%)</span>
          <span className="text-gray-900">-{formatPrice(platformFee)}</span>
        </div>
      )}

      {/* Total */}
      <div className="border-t border-emerald-200 pt-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">
            {variant === 'host' ? 'Your Earning' : 'Total'}
          </span>
          <span className="text-xl font-bold text-emerald-600">
            {formatPrice(variant === 'host' ? hostEarning : totalAmount)}
          </span>
        </div>
      </div>

      {/* Additional Info */}
      {variant === 'customer' && (
        <div className="text-xs text-gray-500 mt-2">
          <p>• Security deposit will be refunded after check-out if no damages</p>
          <p>• TripMe Service Fee covers booking management and customer support</p>
          <p>• All prices include applicable taxes</p>
        </div>
      )}

      {variant === 'host' && (
        <div className="text-xs text-gray-500 mt-2">
          <p>• You receive {formatPrice(hostEarning)} after TripMe Service Fee</p>
          <p>• Payout processed within 24 hours of guest check-in</p>
          <p>• TripMe Service Fee covers payment processing and support</p>
        </div>
      )}
    </div>
  );
}
