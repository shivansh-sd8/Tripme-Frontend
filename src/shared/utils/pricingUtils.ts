/**
 * Shared Utilities
 * Centralized utilities for frontend
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Dynamic platform fee rate (fetched from backend)
let dynamicPlatformFeeRate: number | null = null;

/**
 * Round to two decimal places consistently
 * @param value - Value to round
 * @returns Rounded value
 */
export function toTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Fetch current platform fee rate from backend
 * @returns Promise<number> Current platform fee rate
 */
export async function fetchPlatformFeeRate(): Promise<number> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const response = await fetch(`${apiUrl}/public/platform-fee`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.success) {
        dynamicPlatformFeeRate = data.data.platformFeeRate;
        console.log(`✅ Platform fee rate fetched: ${(dynamicPlatformFeeRate * 100).toFixed(1)}%`);
        return dynamicPlatformFeeRate;
      }
    }
  } catch (error) {
    console.error('❌ Error fetching platform fee rate:', error);
  }
  
  // Return fallback rate if fetch fails
  console.warn('⚠️ Using fallback platform fee rate: 15%');
  return 0.15;
}

/**
 * Get current platform fee rate (cached or fallback)
 * @returns Current platform fee rate
 */
export function getPlatformFeeRate(): number {
  return dynamicPlatformFeeRate || 0.15;
}

/**
 * Calculate pricing breakdown with dynamic platform fee rate
 * @param params - Pricing parameters
 * @returns Complete pricing breakdown
 */
export function calculatePricingBreakdown(params: {
  basePrice: number;
  nights?: number;
  cleaningFee?: number;
  serviceFee?: number;
  securityDeposit?: number;
  extraGuestPrice?: number;
  extraGuests?: number;
  hourlyExtension?: number;
  discountAmount?: number;
  currency?: string;
  platformFeeRate?: number;
}) {
  const {
    basePrice,
    nights = 1,
    cleaningFee = 0,
    serviceFee = 0,
    securityDeposit = 0,
    extraGuestPrice = 0,
    extraGuests = 0,
    hourlyExtension = 0,
    discountAmount = 0,
    currency = 'INR',
    platformFeeRate
  } = params;

  // Use provided rate or get current rate
  const currentRate = platformFeeRate || getPlatformFeeRate();

  // Calculate base amount
  let baseAmount = basePrice * nights;
  
  // Add extra guest charges
  if (extraGuests > 0) {
    baseAmount += extraGuestPrice * extraGuests * nights;
  }
  
  // Add host-set fees (excluding security deposit - it's held separately)
  const hostFees = cleaningFee + serviceFee;
  
  // Add hourly extension
  const extensionCost = hourlyExtension || 0;
  
  // Calculate subtotal for host earning (excluding security deposit)
  const hostSubtotal = baseAmount + hostFees + extensionCost - discountAmount;
  
  // Calculate total subtotal (including security deposit for customer payment)
  const totalSubtotal = hostSubtotal + securityDeposit;
  
  // Calculate TripMe service fee (on host subtotal only, not security deposit)
  const platformFee = toTwoDecimals(hostSubtotal * currentRate);
  
  // Calculate GST (18% of total subtotal including security deposit)
  const gst = toTwoDecimals(totalSubtotal * 0.18);
  
  // Calculate processing fee (2.9% + ₹30 fixed on total subtotal)
  const processingFee = toTwoDecimals(totalSubtotal * 0.029 + 30);
  
  // Calculate total amount (what customer pays)
  const totalAmount = toTwoDecimals(totalSubtotal + platformFee + gst + processingFee);
  
  // Calculate host earning (host subtotal minus TripMe service fee - security deposit is held separately)
  const hostEarning = toTwoDecimals(hostSubtotal - platformFee);
  
  // Calculate platform revenue (TripMe service fee + processing fee)
  const platformRevenue = toTwoDecimals(platformFee + processingFee);

  return {
    // Base pricing
    baseAmount: toTwoDecimals(baseAmount),
    nights,
    extraGuests,
    extraGuestCost: toTwoDecimals(extraGuestPrice * extraGuests * nights),
    
    // Host-set fees
    cleaningFee: toTwoDecimals(cleaningFee),
    serviceFee: toTwoDecimals(serviceFee),
    securityDeposit: toTwoDecimals(securityDeposit),
    hostFees: toTwoDecimals(hostFees),
    
    // Extensions and discounts
    hourlyExtension: toTwoDecimals(extensionCost),
    discountAmount: toTwoDecimals(discountAmount),
    
    // Subtotal (before platform fee and taxes)
    subtotal: toTwoDecimals(totalSubtotal),
    hostSubtotal: toTwoDecimals(hostSubtotal),
    
    // TripMe service fees
    platformFee: toTwoDecimals(platformFee),
    processingFee: toTwoDecimals(processingFee),
    platformRevenue: toTwoDecimals(platformRevenue),
    
    // Taxes
    gst: toTwoDecimals(gst),
    
    // Final amounts
    totalAmount: toTwoDecimals(totalAmount),
    hostEarning: toTwoDecimals(hostEarning),
    
    // Currency
    currency,
    
    // Rate used for calculation
    platformFeeRate: currentRate,
    
    // Breakdown for display
    breakdown: {
      // What customer sees
      customerBreakdown: {
        baseAmount: toTwoDecimals(baseAmount),
        cleaningFee: toTwoDecimals(cleaningFee),
        serviceFee: toTwoDecimals(serviceFee),
        securityDeposit: toTwoDecimals(securityDeposit),
        hourlyExtension: toTwoDecimals(extensionCost),
        discountAmount: toTwoDecimals(discountAmount),
        subtotal: toTwoDecimals(totalSubtotal),
        platformFee: toTwoDecimals(platformFee),
        gst: toTwoDecimals(gst),
        processingFee: toTwoDecimals(processingFee),
        totalAmount: toTwoDecimals(totalAmount)
      },
      
      // What host sees
      hostBreakdown: {
        baseAmount: toTwoDecimals(baseAmount),
        cleaningFee: toTwoDecimals(cleaningFee),
        serviceFee: toTwoDecimals(serviceFee),
        securityDeposit: toTwoDecimals(securityDeposit),
        hourlyExtension: toTwoDecimals(extensionCost),
        discountAmount: toTwoDecimals(discountAmount),
        subtotal: toTwoDecimals(hostSubtotal),
        platformFee: toTwoDecimals(platformFee),
        hostEarning: toTwoDecimals(hostEarning)
      },
      
      // What TripMe sees
      platformBreakdown: {
        platformFee: toTwoDecimals(platformFee),
        processingFee: toTwoDecimals(processingFee),
        gst: toTwoDecimals(gst),
        platformRevenue: toTwoDecimals(platformRevenue)
      }
    }
  };
}

/**
 * Calculate hourly extension cost using shared rates
 * @param basePrice - Daily base price
 * @param hours - Extension hours (6, 12, or 18)
 * @returns Extension cost
 */
export function calculateHourlyExtension(basePrice: number, hours: number): number {
  const HOURLY_RATES = {
    6: 0.30,   // 30% of daily rate
    12: 0.60,  // 60% of daily rate
    18: 0.75   // 75% of daily rate
  };
  
  const rate = HOURLY_RATES[hours as keyof typeof HOURLY_RATES] || 0;
  return toTwoDecimals(basePrice * rate);
}

/**
 * Validate pricing calculation consistency
 * @param frontendPricing - Frontend calculation result
 * @param backendPricing - Backend calculation result
 * @returns Validation result
 */
export function validatePricingConsistency(frontendPricing: any, backendPricing: any) {
  const errors: Array<{
    field: string;
    frontend: number;
    backend: number;
    difference: number;
  }> = [];
  const tolerance = 0.01; // 1 paisa tolerance
  
  // Check key values
  const checks = [
    { name: 'subtotal', frontend: frontendPricing.subtotal, backend: backendPricing.subtotal },
    { name: 'platformFee', frontend: frontendPricing.platformFee, backend: backendPricing.platformFee },
    { name: 'gst', frontend: frontendPricing.gst, backend: backendPricing.gst },
    { name: 'processingFee', frontend: frontendPricing.processingFee, backend: backendPricing.processingFee },
    { name: 'totalAmount', frontend: frontendPricing.totalAmount, backend: backendPricing.totalAmount }
  ];
  
  for (const check of checks) {
    const difference = Math.abs(check.frontend - check.backend);
    if (difference > tolerance) {
      errors.push({
        field: check.name,
        frontend: check.frontend,
        backend: check.backend,
        difference: difference
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    tolerance
  };
}

// ===== GENERAL UTILITIES =====

/**
 * Merge class names with Tailwind CSS
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price with currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: INR)
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate URL-friendly slug
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Debounce function calls
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
