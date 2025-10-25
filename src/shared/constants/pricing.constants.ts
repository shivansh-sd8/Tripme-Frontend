/**
 * Frontend Display Constants Only
 * NO PRICING CALCULATIONS - Only display what backend sends
 */

/**
 * Format currency amount for display
 * @param amount - Amount to format
 * @param currency - Currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Display constants for UI only
 */
export const DISPLAY_CONSTANTS = {
  // Currency settings
  DEFAULT_CURRENCY: 'INR',
  SUPPORTED_CURRENCIES: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
  
  // Display limits
  MAX_DISPLAY_AMOUNT: 1000000, // ₹10,00,000
  MIN_DISPLAY_AMOUNT: 0,
} as const;

/**
 * WARNING: This function is deprecated and should not be used
 * All pricing calculations now happen on the backend
 * @deprecated Use securePricingAPI.calculatePricing() instead
 */
export function validatePricing(pricing: {
  basePrice: number;
  cleaningFee?: number;
  serviceFee?: number;
  securityDeposit?: number;
}): { isValid: boolean; errors: string[] } {
  console.warn('⚠️ validatePricing is deprecated. All pricing calculations happen on backend now.');
  
  // Return valid to prevent breaking existing code
  // Real validation happens on backend
  return {
    isValid: true,
    errors: []
  };
}