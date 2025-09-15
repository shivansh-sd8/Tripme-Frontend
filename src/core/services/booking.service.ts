import { Booking, Property, ApiResponse, PaginatedResponse, PaginationParams } from '@/shared/types';
import { apiClient } from '@/infrastructure/api/clients/api-client';

export class BookingService {
  private static instance: BookingService;

  private constructor() {}

  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  public async createBooking(bookingData: {
    propertyId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }): Promise<ApiResponse<Booking>> {
    try {
      return await apiClient.createBooking(bookingData);
    } catch (error: any) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  public async getBookings(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    try {
      return await apiClient.getBookings(params);
    } catch (error: any) {
      console.error('Get bookings error:', error);
      throw error;
    }
  }

  public async getBooking(id: string): Promise<ApiResponse<Booking>> {
    try {
      return await apiClient.getBooking(id);
    } catch (error: any) {
      console.error('Get booking error:', error);
      throw error;
    }
  }

  public async updateBookingStatus(
    id: string, 
    status: 'confirmed' | 'cancelled' | 'completed'
  ): Promise<ApiResponse<Booking>> {
    try {
      return await apiClient.updateBookingStatus(id, status);
    } catch (error: any) {
      console.error('Update booking status error:', error);
      throw error;
    }
  }

  public async checkInGuest(id: string, notes?: string): Promise<ApiResponse<Booking>> {
    try {
      return await apiClient.checkInGuest(id, notes);
    } catch (error: any) {
      console.error('Check-in guest error:', error);
      throw error;
    }
  }

  public async downloadReceipt(id: string): Promise<void> {
    try {
      await apiClient.downloadReceipt(id);
    } catch (error: any) {
      console.error('Download receipt error:', error);
      throw error;
    }
  }

  public async getHostBookings(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    try {
      return await apiClient.getHostBookings(params);
    } catch (error: any) {
      console.error('Get host bookings error:', error);
      throw error;
    }
  }

  public async getUserBookings(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    try {
      return await apiClient.getUserBookings(params);
    } catch (error: any) {
      console.error('Get user bookings error:', error);
      throw error;
    }
  }

  public calculateBookingFee(subtotal: number): {
    platformFee: number;
    hostEarning: number;
  } {
    // Note: Platform fee rate is now dynamic and fetched from backend
    // This is a fallback value - the actual rate should come from the backend
    const platformFeeRate = 0.15; // Fallback rate (will be overridden by dynamic rate)
    const platformFee = subtotal * platformFeeRate;
    const hostEarning = subtotal - platformFee;

    return {
      platformFee: Math.round(platformFee * 100) / 100,
      hostEarning: Math.round(hostEarning * 100) / 100,
    };
  }

  public canCancelBooking(booking: Booking): boolean {
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const isBeforeCheckIn = now < checkInDate;
    const isNotCheckedIn = !booking.checkedIn;
    const isNotCompleted = booking.status !== 'completed';

    return isBeforeCheckIn && isNotCheckedIn && isNotCompleted;
  }

  public canCheckIn(booking: Booking): boolean {
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const isCheckInDay = now.toDateString() === checkInDate.toDateString();
    const isConfirmed = booking.status === 'confirmed';
    const isNotCheckedIn = !booking.checkedIn;

    return isCheckInDay && isConfirmed && isNotCheckedIn;
  }
}

export const bookingService = BookingService.getInstance(); 