"use client";
import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from 'lucide-react';

interface PropertyAvailabilityCalendarProps {
  propertyId: string;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

interface AvailabilityData {
  [key: string]: {
    status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold';
    price?: number;
  };
}

export default function PropertyAvailabilityCalendar({ 
  propertyId, 
  onDateSelect, 
  selectedDate 
}: PropertyAvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [loading, setLoading] = useState(true);
  const [selectedDateState, setSelectedDateState] = useState<Date | null>(selectedDate || null);

  useEffect(() => {
    fetchAvailability();
  }, [propertyId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPropertyAvailability(propertyId);
      
      if (response.success && response.data) {
        const availabilityData: AvailabilityData = {};
        
        // Transform the availability data
        response.data.forEach((slot: any) => {
          const dateKey = format(new Date(slot.date), 'yyyy-MM-dd');
          availabilityData[dateKey] = {
            status: slot.status,
            price: slot.price
          };
        });
        
        setAvailability(availabilityData);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unavailable':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'booked':
        return <XCircle className="w-4 h-4 text-purple-500" />;
      case 'maintenance':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'on-hold':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'booked':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const dayContentRenderer = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayData = availability[dateKey];
    const isSelected = selectedDateState && format(selectedDateState, 'yyyy-MM-dd') === dateKey;
    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

    return (
      <div 
        className={`
          w-full h-full flex flex-col items-center justify-center p-1 rounded-lg transition-all duration-200
          ${isSelected ? 'bg-indigo-100 border-2 border-indigo-500' : ''}
          ${isToday ? 'ring-2 ring-blue-300' : ''}
          ${isPast ? 'opacity-50' : 'hover:bg-gray-50 cursor-pointer'}
        `}
        onClick={() => {
          if (!isPast && dayData?.status === 'available') {
            setSelectedDateState(date);
            onDateSelect?.(date);
          }
        }}
      >
        <span className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
          {date.getDate()}
        </span>
        {dayData && (
          <div className="flex items-center gap-1 mt-1">
            {getStatusIcon(dayData.status)}
          </div>
        )}
        {dayData?.price && (
          <span className="text-xs text-gray-600 font-medium">
            ₹{dayData.price}
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Availability Calendar</h3>
            <p className="text-sm text-gray-600">Loading availability...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
          <CalendarIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Availability Calendar</h3>
          <p className="text-sm text-gray-600">Check available dates and prices</p>
        </div>
      </div>

      <div className="mb-6">
        <Calendar
          date={selectedDateState || new Date()}
          onChange={(date) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayData = availability[dateKey];
            if (dayData?.status === 'available') {
              setSelectedDateState(date);
              onDateSelect?.(date);
            }
          }}
          minDate={new Date()}
          dayContentRenderer={dayContentRenderer}
          className="w-full"
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-green-800">Available</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium text-red-800">Unavailable</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 border border-purple-200">
          <XCircle className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-800">Booked</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-800">Maintenance</span>
        </div>
      </div>

      {selectedDateState && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <span className="font-medium text-indigo-900">Selected Date</span>
          </div>
          <p className="text-indigo-800">
            {format(selectedDateState, 'EEEE, MMMM do, yyyy')}
          </p>
          {availability[format(selectedDateState, 'yyyy-MM-dd')]?.price && (
            <p className="text-sm text-indigo-600 mt-1">
              Price: ₹{availability[format(selectedDateState, 'yyyy-MM-dd')].price}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
