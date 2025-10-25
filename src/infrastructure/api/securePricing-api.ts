/**
 * Secure Pricing API
 * Frontend service for secure pricing calculations
 * All calculations happen on the backend - frontend only displays results
 */

import { apiClient } from './clients/api-client';

export interface SecurePricingRequest {
  propertyId: string;
  checkIn: string; // YYYY-MM-DD format
  checkOut: string; // YYYY-MM-DD format
  guests: {
    adults: number;
    children?: number;
    infants?: number;
  };
  hourlyExtension?: number;
  couponCode?: string;
  bookingType?: 'daily' | '24hour';
  checkInDateTime?: string;
  extensionHours?: number;
}

export interface SecurePricingResponse {
  success: boolean;
  data: {
    pricing: {
      basePrice: number;
      baseAmount: number;
      nights: number;
      extraGuestPrice: number;
      extraGuests: number;
      extraGuestCost: number;
      cleaningFee: number;
      serviceFee: number;
      securityDeposit: number;
      hourlyExtension: number;
      discountAmount: number;
      subtotal: number;
      platformFee: number;
      gst: number;
      processingFee: number;
      totalAmount: number;
      currency: string;
      bookingType: string;
    };
    coupon?: {
      id: string;
      code: string;
      discountType: 'percentage' | 'fixed';
      amount: number;
      maxDiscount?: number;
      discountAmount: number;
      description: string;
    };
    security: {
      pricingToken: string;
      calculatedAt: string;
      expiresAt: string;
    };
    property: {
      id: string;
      title: string;
      maxGuests: number;
      minNights: number;
      checkInTime: string;
      checkOutTime: string;
      cancellationPolicy: string;
    };
  };
  message?: string;
}

export interface PricingConfigResponse {
  success: boolean;
  data: {
    currency: string;
    taxRate: number;
    processingFeeRate: number;
    processingFeeFixed: number;
    minBookingAmount: number;
    maxBookingAmount: number;
    lastUpdated: string;
  };
}

class SecurePricingAPI {
  /**
   * Calculate secure pricing for a property booking
   * All calculations happen on the backend
   */
  async calculatePricing(request: SecurePricingRequest): Promise<SecurePricingResponse> {
    try {
      console.log('🔒 Calculating secure pricing via backend...', {
        propertyId: request.propertyId,
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        guests: request.guests
      });

      // Add cache-busting parameter to prevent caching issues
      const requestWithTimestamp = {
        ...request,
        _timestamp: Date.now()
      };
      const response = await apiClient.post('/secure-pricing/calculate', requestWithTimestamp);
      
      console.log('✅ Secure pricing calculated successfully:', {
        nights: response.data.pricing.nights,
        serviceFee: response.data.pricing.serviceFee,
        totalAmount: response.data.pricing.totalAmount,
        token: response.data.security.pricingToken.substring(0, 8) + '...'
      });
      console.log('🔍 Full pricing response:', response.data.pricing);

      return response;
    } catch (error: any) {
      console.error('❌ Error calculating secure pricing:', error);
      throw new Error(error.response?.data?.message || 'Failed to calculate pricing');
    }
  }

  /**
   * Validate pricing token
   */
  async validatePricingToken(pricingToken: string, pricingData: any): Promise<boolean> {
    try {
      const response = await apiClient.post('/secure-pricing/validate-token', {
        pricingToken,
        pricingData
      });
      return response.success;
    } catch (error: any) {
      console.error('❌ Error validating pricing token:', error);
      return false;
    }
  }

  /**
   * Get pricing configuration (public rates only)
   */
  async getPricingConfig(): Promise<PricingConfigResponse> {
    try {
      const response = await apiClient.get('/secure-pricing/config');
      return response;
    } catch (error: any) {
      console.error('❌ Error getting pricing config:', error);
      throw new Error('Failed to get pricing configuration');
    }
  }

  /**
   * Format dates for API requests
   */
  formatDateForAPI(date: Date): string {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  }

  /**
   * Validate pricing request before sending
   */
  validatePricingRequest(request: SecurePricingRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.propertyId) {
      errors.push('Property ID is required');
    }

    if (!request.checkIn) {
      errors.push('Check-in date is required');
    }

    if (!request.checkOut) {
      errors.push('Check-out date is required');
    }

    if (!request.guests || !request.guests.adults) {
      errors.push('Guest count is required');
    }

    if (request.guests) {
      const { adults, children = 0, infants = 0 } = request.guests;
      
      if (adults < 1 || adults > 20) {
        errors.push('Adult count must be between 1 and 20');
      }
      
      if (children < 0 || children > 10) {
        errors.push('Children count must be between 0 and 10');
      }
      
      if (infants < 0 || infants > 5) {
        errors.push('Infants count must be between 0 and 5');
      }
      
      if (adults + children + infants > 25) {
        errors.push('Total guest count cannot exceed 25');
      }
    }

    // Validate dates
    if (request.checkIn && request.checkOut) {
      const checkInDate = new Date(request.checkIn);
      const checkOutDate = new Date(request.checkOut);
      const now = new Date();
      
      if (isNaN(checkInDate.getTime())) {
        errors.push('Invalid check-in date format');
      }
      
      if (isNaN(checkOutDate.getTime())) {
        errors.push('Invalid check-out date format');
      }
      
      if (checkInDate < now) {
        errors.push('Check-in date cannot be in the past');
      }
      
      if (checkOutDate <= checkInDate) {
        errors.push('Check-out date must be after check-in date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const securePricingAPI = new SecurePricingAPI();
