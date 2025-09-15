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
