/**
 * Frontend Pricing Constants
 * This file defines pricing constants that match the backend pricing configuration
 * 
 * NOTE: This file is now DEPRECATED. Use shared/utils/pricingUtils.ts instead.
 * This file is kept for backward compatibility only.
 */

// Re-export from shared utilities
export { 
  toTwoDecimals,
  fetchPlatformFeeRate,
  getPlatformFeeRate,
  calculatePricingBreakdown,
  calculateHourlyExtension,
  validatePricingConsistency,
  // General utilities
  cn,
  formatPrice,
  formatDate,
  generateSlug,
  debounce
} from '../utils/pricingUtils';

export const PRICING_CONSTANTS = {
  // Platform fees (percentage of subtotal) - This will be overridden by dynamic rate
  PLATFORM_FEE_RATE: 0.15, // 15% TripMe service fee (fallback)
  PROCESSING_FEE_RATE: 0.029, // 2.9% processing fee
  PROCESSING_FEE_FIXED: 30, // ₹30 fixed processing fee
  
  // Tax rates
  GST_RATE: 0.18, // 18% GST (Goods and Services Tax)
  
  // Default service fees (if not set by host)
  DEFAULT_SERVICE_FEE_RATE: 0.05, // 5% of base price
  
  // Currency settings
  DEFAULT_CURRENCY: 'INR',
  SUPPORTED_CURRENCIES: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
  
  // Minimum amounts
  MIN_BASE_PRICE: 1,
  MIN_CLEANING_FEE: 0,
  MIN_SERVICE_FEE: 0,
  MIN_SECURITY_DEPOSIT: 0,
  
  // Maximum amounts (for validation)
  MAX_BASE_PRICE: 1000000, // ₹10,00,000
  MAX_CLEANING_FEE: 10000, // ₹10,000
  MAX_SERVICE_FEE: 50000, // ₹50,000
  MAX_SECURITY_DEPOSIT: 50000, // ₹50,000
  
  // Hourly booking rates (percentage of daily rate)
  HOURLY_RATES: {
    SIX_HOURS: 0.30, // 30% of daily rate
    TWELVE_HOURS: 0.60, // 60% of daily rate
    EIGHTEEN_HOURS: 0.75 // 75% of daily rate
  },
  
  // Discount limits
  MAX_WEEKLY_DISCOUNT: 100, // 100% max
  MAX_MONTHLY_DISCOUNT: 100, // 100% max
  MAX_COUPON_DISCOUNT: 100, // 100% max
} as const;

/**
 * Calculate pricing breakdown for frontend display
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
    currency = PRICING_CONSTANTS.DEFAULT_CURRENCY,
    platformFeeRate
  } = params;

  // Calculate base amount
  let baseAmount = basePrice * nights;
  
  // Add extra guest charges
  if (extraGuests > 0) {
    baseAmount += extraGuestPrice * extraGuests * nights;
  }
  
  // Add host-set fees
  const hostFees = cleaningFee + serviceFee + securityDeposit;
  
  // Add hourly extension
  const extensionCost = hourlyExtension || 0;
  
  // Calculate subtotal (before platform fee and taxes)
  const subtotal = baseAmount + hostFees + extensionCost - discountAmount;
  
  // Calculate TripMe service fee (dynamic rate of subtotal)
  const currentRate = platformFeeRate || getPlatformFeeRate();
  const platformFee = Math.round(subtotal * currentRate * 100) / 100;
  
  // Calculate GST (18% of subtotal)
  const gst = Math.round(subtotal * PRICING_CONSTANTS.GST_RATE * 100) / 100;
  
  // Calculate processing fee (2.9% + ₹30 fixed)
  const processingFee = Math.round((subtotal * PRICING_CONSTANTS.PROCESSING_FEE_RATE + PRICING_CONSTANTS.PROCESSING_FEE_FIXED) * 100) / 100;
  
  // Calculate total amount (what customer pays)
  const totalAmount = subtotal + platformFee + gst + processingFee;
  
  // Calculate host earning (subtotal minus TripMe service fee)
  const hostEarning = Math.round((subtotal - platformFee) * 100) / 100;
  
  // Calculate platform revenue (TripMe service fee + processing fee)
  const platformRevenue = platformFee + processingFee;
  
  return {
    // Base pricing
    baseAmount: Math.round(baseAmount * 100) / 100,
    nights,
    extraGuests,
    extraGuestCost: Math.round(extraGuestPrice * extraGuests * nights * 100) / 100,
    
    // Host-set fees
    cleaningFee: Math.round(cleaningFee * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    securityDeposit: Math.round(securityDeposit * 100) / 100,
    hostFees: Math.round(hostFees * 100) / 100,
    
    // Extensions and discounts
    hourlyExtension: Math.round(extensionCost * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    
    // Subtotal (before platform fee and taxes)
    subtotal: Math.round(subtotal * 100) / 100,
    
    // TripMe service fees
    platformFee: Math.round(platformFee * 100) / 100,
    processingFee: Math.round(processingFee * 100) / 100,
    platformRevenue: Math.round(platformRevenue * 100) / 100,
    
    // Taxes
    gst: Math.round(gst * 100) / 100,
    
    // Final amounts
    totalAmount: Math.round(totalAmount * 100) / 100,
    hostEarning: Math.round(hostEarning * 100) / 100,
    
    // Currency
    currency,
    
    // Breakdown for display
    breakdown: {
      // What customer sees
      customerBreakdown: {
        baseAmount: Math.round(baseAmount * 100) / 100,
        cleaningFee: Math.round(cleaningFee * 100) / 100,
        serviceFee: Math.round(serviceFee * 100) / 100,
        securityDeposit: Math.round(securityDeposit * 100) / 100,
        hourlyExtension: Math.round(extensionCost * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
        gst: Math.round(gst * 100) / 100,
        processingFee: Math.round(processingFee * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
      },
      
      // What host sees
      hostBreakdown: {
        baseAmount: Math.round(baseAmount * 100) / 100,
        cleaningFee: Math.round(cleaningFee * 100) / 100,
        serviceFee: Math.round(serviceFee * 100) / 100,
        securityDeposit: Math.round(securityDeposit * 100) / 100,
        hourlyExtension: Math.round(extensionCost * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
        hostEarning: Math.round(hostEarning * 100) / 100
      },
      
      // What TripMe sees
      platformBreakdown: {
        platformFee: Math.round(platformFee * 100) / 100,
        processingFee: Math.round(processingFee * 100) / 100,
        gst: Math.round(gst * 100) / 100,
        platformRevenue: Math.round(platformRevenue * 100) / 100
      }
    }
  };
}

/**
 * Calculate hourly extension cost
 * @param basePrice - Daily base price
 * @param hours - Extension hours (6, 12, or 18)
 * @returns Extension cost
 */
export function calculateHourlyExtension(basePrice: number, hours: number): number {
  const rate = PRICING_CONSTANTS.HOURLY_RATES[`${hours === 6 ? 'SIX' : hours === 12 ? 'TWELVE' : 'EIGHTEEN'}_HOURS`];
  return Math.round(basePrice * rate * 100) / 100;
}

/**
 * Format currency amount
 * @param amount - Amount to format
 * @param currency - Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = PRICING_CONSTANTS.DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Validate pricing parameters
 * @param pricing - Pricing object to validate
 * @returns Validation result
 */
export function validatePricing(pricing: {
  basePrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  securityDeposit?: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (pricing.basePrice < PRICING_CONSTANTS.MIN_BASE_PRICE) {
    errors.push(`Base price must be at least ₹${PRICING_CONSTANTS.MIN_BASE_PRICE}`);
  }
  
  if (pricing.basePrice > PRICING_CONSTANTS.MAX_BASE_PRICE) {
    errors.push(`Base price cannot exceed ₹${PRICING_CONSTANTS.MAX_BASE_PRICE}`);
  }
  
  if ((pricing.cleaningFee || 0) < PRICING_CONSTANTS.MIN_CLEANING_FEE) {
    errors.push(`Cleaning fee must be at least ₹${PRICING_CONSTANTS.MIN_CLEANING_FEE}`);
  }
  
  if ((pricing.cleaningFee || 0) > PRICING_CONSTANTS.MAX_CLEANING_FEE) {
    errors.push(`Cleaning fee cannot exceed ₹${PRICING_CONSTANTS.MAX_CLEANING_FEE}`);
  }
  
  if ((pricing.serviceFee || 0) < PRICING_CONSTANTS.MIN_SERVICE_FEE) {
    errors.push(`Service fee must be at least ₹${PRICING_CONSTANTS.MIN_SERVICE_FEE}`);
  }
  
  if ((pricing.serviceFee || 0) > PRICING_CONSTANTS.MAX_SERVICE_FEE) {
    errors.push(`Service fee cannot exceed ₹${PRICING_CONSTANTS.MAX_SERVICE_FEE}`);
  }
  
  if ((pricing.securityDeposit || 0) < PRICING_CONSTANTS.MIN_SECURITY_DEPOSIT) {
    errors.push(`Security deposit must be at least ₹${PRICING_CONSTANTS.MIN_SECURITY_DEPOSIT}`);
  }
  
  if ((pricing.securityDeposit || 0) > PRICING_CONSTANTS.MAX_SECURITY_DEPOSIT) {
    errors.push(`Security deposit cannot exceed ₹${PRICING_CONSTANTS.MAX_SECURITY_DEPOSIT}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
