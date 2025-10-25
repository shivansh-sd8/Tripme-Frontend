/**
 * Date Display Utilities Only
 * Frontend should NOT calculate pricing - only display backend data
 */

import { differenceInDays, differenceInHours, addDays, addHours } from 'date-fns';

/**
 * Calculate nights between two dates consistently
 * For accommodation bookings, count actual nights stayed
 * @param startDate - Check-in date
 * @param endDate - Check-out date
 * @returns Number of nights
 */
export function calculateNights(startDate: Date, endDate: Date): number {
  if (!startDate || !endDate) return 0;
  
  // Ensure dates are Date objects
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  // For accommodation bookings, count the number of nights stayed
  // This is the number of days between check-in and check-out
  // Nov 1 to Nov 5 = 4 nights (Nov 1, 2, 3, 4)
  const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
  const timeDiff = endDateOnly.getTime() - startDateOnly.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  
  return Math.max(0, daysDiff);
}

/**
 * Calculate hours between two dates for 24-hour bookings
 * @param startDateTime - Check-in date and time
 * @param endDateTime - Check-out date and time
 * @returns Number of hours
 */
export function calculateHours(startDateTime: Date, endDateTime: Date): number {
  if (!startDateTime || !endDateTime) return 0;
  
  const start = startDateTime instanceof Date ? startDateTime : new Date(startDateTime);
  const end = endDateTime instanceof Date ? endDateTime : new Date(endDateTime);
  
  return differenceInHours(end, start);
}

/**
 * Calculate total hours for 24-hour booking with extensions
 * @param baseHours - Base hours (usually 24)
 * @param extensionHours - Additional hours
 * @returns Total hours
 */
export function calculateTotalHours(baseHours: number = 24, extensionHours: number = 0): number {
  return baseHours + extensionHours;
}

/**
 * Calculate checkout time for 24-hour booking
 * @param checkInDateTime - Check-in date and time
 * @param totalHours - Total hours to stay
 * @returns Check-out date and time
 */
export function calculateCheckoutTime(checkInDateTime: Date, totalHours: number): Date {
  if (!checkInDateTime) return new Date();
  
  const checkIn = checkInDateTime instanceof Date ? checkInDateTime : new Date(checkInDateTime);
  return addHours(checkIn, totalHours);
}

/**
 * Validate date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Validation result
 */
export function validateDateRange(startDate: Date, endDate: Date): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!startDate || !endDate) {
    errors.push('Both start and end dates are required');
    return { isValid: false, errors };
  }
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    errors.push('Invalid date format');
    return { isValid: false, errors };
  }
  
  if (start >= end) {
    errors.push('Check-out date must be after check-in date');
    return { isValid: false, errors };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (start < today) {
    errors.push('Check-in date cannot be in the past');
    return { isValid: false, errors };
  }
  
  return { isValid: true, errors };
}

/**
 * Format date for display
 * @param date - Date to format
 * @param includeTime - Whether to include time
 * @returns Formatted date string
 */
export function formatDateForDisplay(date: Date, includeTime: boolean = false): string {
  if (!date) return '';
  
  const d = date instanceof Date ? date : new Date(date);
  
  if (includeTime) {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get date range as string
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export function getDateRangeString(startDate: Date, endDate: Date): string {
  if (!startDate || !endDate) return '';
  
  const start = formatDateForDisplay(startDate);
  const end = formatDateForDisplay(endDate);
  const nights = calculateNights(startDate, endDate);
  
  return `${start} - ${end} (${nights} night${nights !== 1 ? 's' : ''})`;
}
