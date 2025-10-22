"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface BookingData {
  propertyId: string;
  startDate: Date | null;
  endDate: Date | null;
  // 24-hour booking selections
  is24Hour?: boolean;
  checkInTime?: string; // HH:mm selected by user
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  hourlyExtension: number | null;
  specialRequests: string;
  pricing?: {
    basePrice: number;
    cleaningFee: number;
    serviceFee: number;
    securityDeposit: number;
    totalPrice: number;
  };
}

interface BookingContextType {
  bookingData: BookingData | null;
  setBookingData: (data: BookingData) => void;
  updateBookingData: (updates: Partial<BookingData>) => void;
  clearBookingData: () => void;
  isBookingDataComplete: () => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [bookingData, setBookingDataState] = useState<BookingData | null>(null);

  const setBookingData = useCallback((data: BookingData) => {
    setBookingDataState(data);
  }, []);

  const updateBookingData = useCallback((updates: Partial<BookingData>) => {
    setBookingDataState(prev => {
      if (!prev) {
        // If no existing data, create new with required fields
        return {
          propertyId: updates.propertyId || '',
          startDate: updates.startDate || null,
          endDate: updates.endDate || null,
          is24Hour: updates.is24Hour || false,
          checkInTime: updates.checkInTime,
          guests: updates.guests || { adults: 1, children: 0, infants: 0 },
          hourlyExtension: updates.hourlyExtension || null,
          specialRequests: updates.specialRequests || '',
          ...updates
        };
      }
      return { ...prev, ...updates };
    });
  }, []);

  const clearBookingData = useCallback(() => {
    setBookingDataState(null);
  }, []);

  const isBookingDataComplete = useCallback(() => {
    if (!bookingData) return false;
    return !!(
      bookingData.propertyId &&
      bookingData.startDate &&
      bookingData.endDate &&
      bookingData.guests.adults > 0
    );
  }, [bookingData]);

  const value: BookingContextType = {
    bookingData,
    setBookingData,
    updateBookingData,
    clearBookingData,
    isBookingDataComplete
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
