"use client";
import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, isPast } from 'date-fns';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';

interface PropertyAvailabilityCalendarProps {
  propertyId: string;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  isHostView?: boolean; // If true, show booking details (times, guest name)
  checkInDate?: Date | null;
  checkOutDate?: Date | null;
  selectionStep?: 'checkin' | 'checkout' | 'complete';
}

interface AvailabilityData {
  [key: string]: {
    status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold' | 'blocked' | 'partially-available';
    price?: number;
    // Booking details for booked dates
    bookingId?: string;
    checkInDate?: string;   // Full check-in date
    checkOutDate?: string;  // Full check-out date
    checkInTime?: string;
    checkOutTime?: string;
    guestName?: string;
    // Hour-based availability restrictions
    availableHours?: Array<{ startTime: string; endTime: string }>;
    // Maintenance info (only for today's date if active)
    maintenance?: {
      start?: string;
      end?: string;
      availableAfter?: string;
      ended?: boolean; // True if maintenance has completed
    };
  };
}

export default function PropertyAvailabilityCalendar({ 
  propertyId, 
  onDateSelect, 
  selectedDate,
  isHostView = false, // Default to guest view (no booking details)
  checkInDate,
  checkOutDate,
  selectionStep = 'checkin'
}: PropertyAvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateState, setSelectedDateState] = useState<Date | null>(selectedDate || null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Sync selectedDateState with checkInDate when provided
  useEffect(() => {
    if (checkInDate) {
      setSelectedDateState(checkInDate);
      // Navigate calendar to show check-in date month
      setCurrentMonth(checkInDate);
    } else if (selectedDate) {
      setSelectedDateState(selectedDate);
    }
  }, [checkInDate, selectedDate]);

  // Navigate calendar to show check-out date month if available
  useEffect(() => {
    if (checkOutDate) {
      setCurrentMonth(checkOutDate);
    }
  }, [checkOutDate]);

  // Format time to 12-hour format
  const formatTime12Hour = (timeStr: string | undefined) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour}:${(m || 0).toString().padStart(2, '0')} ${period}`;
  };

  useEffect(() => {
    fetchAvailability();
    
    // Auto-refresh every 5 minutes to update maintenance status
    const refreshInterval = setInterval(() => {
      fetchAvailability();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [propertyId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      
      // Fetch availability for the next 6 months
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await apiClient.getAvailability(propertyId, startDateStr, endDateStr);
      
      if (response.success && response.data?.availability) {
        const availabilityData: AvailabilityData = {};
        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        
        // Transform the availability data - include booking details if present
        response.data.availability.forEach((slot: any) => {
          const dateKey = format(new Date(slot.date), 'yyyy-MM-dd');
          
          // Check if maintenance is active for this date
          let effectiveStatus = slot.status;
          let maintenanceInfo = slot.maintenance;
          
          // Preserve 'partially-available' status from backend (for checkout dates)
          if (effectiveStatus === 'partially-available') {
            // Keep the status and maintenance info as-is
            console.log(`🔵 Preserving partially-available status for ${dateKey}`);
          }
          // Handle maintenance for checkout dates (can be today or future dates)
          else if (maintenanceInfo?.end) {
            const maintenanceEnd = new Date(maintenanceInfo.end);
            const maintenanceStart = maintenanceInfo.start ? new Date(maintenanceInfo.start) : null;
            const isMaintenanceActive = maintenanceStart && now >= maintenanceStart && now < maintenanceEnd;
            
            // For today's date: show maintenance status if active
            if (dateKey === todayStr) {
              if (isMaintenanceActive) {
                effectiveStatus = 'maintenance';
                console.log(`🔧 Maintenance active until ${format(maintenanceEnd, 'h:mm a')}`);
              } else if (now >= maintenanceEnd) {
                // Maintenance has ended today - fully available
                effectiveStatus = 'available';
                maintenanceInfo = { ...maintenanceInfo, ended: true };
              }
            } else {
              // For future checkout dates: preserve 'partially-available' status from backend
              // This allows users to select the date with check-in time after maintenance end
              if (effectiveStatus === 'booked' || effectiveStatus === 'blocked') {
                // Backend should have set this to 'partially-available', but if not, override it
                effectiveStatus = 'partially-available';
              }
              // Keep maintenance info for future dates so we can validate check-in time
              // Don't clear it - we need it to show "Available after X PM" message
            }
          } else {
            // No maintenance info - if status is maintenance, change to available
            if (effectiveStatus === 'maintenance') {
              effectiveStatus = 'available';
            }
          }
          
          availabilityData[dateKey] = {
            status: effectiveStatus,
            price: slot.price,
            // Include booking details for booked dates
            bookingId: slot.bookedBy?._id || slot.bookedBy,
            checkInDate: slot.bookedBy?.checkIn || slot.checkInDate,
            checkOutDate: slot.bookedBy?.checkOut || slot.checkOutDate,
            checkInTime: slot.bookedBy?.checkInTime || slot.checkInTime,
            checkOutTime: slot.bookedBy?.checkOutTime || slot.checkOutTime,
            guestName: slot.bookedBy?.user?.name || slot.guestName,
            // Include hour-based availability restrictions
            availableHours: slot.availableHours || [],
            // Include maintenance info for partially-available dates (future checkout dates) and today
            maintenance: maintenanceInfo
          };
        });
        
        setAvailability(availabilityData);
        console.log('📅 Availability loaded:', Object.keys(availabilityData).length, 'dates');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string, hasHourRestrictions: boolean = false) => {
    switch (status) {
      case 'available':
        // If date has hour restrictions, use blue styling; otherwise green
        if (hasHourRestrictions) {
          return {
            bg: 'bg-blue-100 hover:bg-blue-200',
            text: 'text-blue-700',
            border: 'border-blue-300',
            icon: <Clock className="w-3 h-3 text-blue-600" />,
            dot: 'bg-blue-500'
          };
        }
        return {
          bg: 'bg-green-100 hover:bg-green-200',
          text: 'text-green-700',
          border: 'border-green-300',
          icon: <CheckCircle className="w-3 h-3 text-green-600" />,
          dot: 'bg-green-500'
        };
      case 'unavailable':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-300',
          icon: <XCircle className="w-3 h-3 text-red-600" />,
          dot: 'bg-red-500'
        };
      case 'booked':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-700',
          border: 'border-purple-300',
          icon: <XCircle className="w-3 h-3 text-purple-600" />,
          dot: 'bg-purple-500'
        };
      case 'maintenance':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          border: 'border-orange-300',
          icon: <Wrench className="w-3 h-3 text-orange-600" />,
          dot: 'bg-orange-500'
        };
      case 'on-hold':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-300',
          icon: <Clock className="w-3 h-3 text-yellow-600" />,
          dot: 'bg-yellow-500'
        };
      case 'blocked':
        return {
          bg: 'bg-gray-200',
          text: 'text-gray-600',
          border: 'border-gray-400',
          icon: <XCircle className="w-3 h-3 text-gray-600" />,
          dot: 'bg-gray-500'
        };
      case 'partially-available':
        return {
          bg: 'bg-blue-100 hover:bg-blue-200',
          text: 'text-blue-700',
          border: 'border-blue-300',
          icon: <Clock className="w-3 h-3 text-blue-600" />,
          dot: 'bg-blue-500'
        };
      default: {
        // For both host and guest view: unavailable by default (host must explicitly set availability)
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-300',
          icon: <XCircle className="w-3 h-3 text-red-600" />,
          dot: 'bg-red-500'
        };
      }
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM')}
          </span>
          <span className="text-lg text-gray-500">
            {format(currentMonth, 'yyyy')}
          </span>
        </div>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayData = availability[dateKey];
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selectedDateState && isSameDay(day, selectedDateState);
        const isCheckIn = checkInDate && isSameDay(day, checkInDate);
        const isCheckOut = checkOutDate && isSameDay(day, checkOutDate);
        const isTodayDate = isToday(day);
        const isPastDate = isPast(day) && !isTodayDate;
        
        // Check if date is between check-in and check-out (for range highlighting)
        const isInRange = checkInDate && checkOutDate && 
          day > checkInDate && day < checkOutDate && 
          isCurrentMonth && !isPastDate;
        
        // Determine status - both host and guest default to unavailable (host must explicitly set as available)
        const status = dayData?.status || 'unavailable';
        const hasHourRestrictions = dayData?.availableHours && dayData.availableHours.length > 0;
        const style = getStatusStyle(status, hasHourRestrictions);
        
        // Can only select available dates that are not in the past
        // Also allow selecting partially-available dates (for checkout dates with maintenance)
        const isSelectable = isCurrentMonth && !isPastDate && (status === 'available' || status === 'partially-available');

        const clonedDay = day;
        
        days.push(
          <div
            key={day.toString()}
            className={`
              relative min-h-[48px] p-1 rounded-lg transition-all duration-200 cursor-pointer
              ${!isCurrentMonth ? 'opacity-30' : ''}
              ${isPastDate ? 'opacity-40 cursor-not-allowed' : ''}
              ${isCheckIn ? 'ring-2 ring-blue-500 ring-offset-1 bg-blue-50' : ''}
              ${isCheckOut ? 'ring-2 ring-green-500 ring-offset-1 bg-green-50' : ''}
              ${isInRange ? 'bg-indigo-100 border-indigo-300 border' : ''}
              ${isSelected && !isCheckIn && !isCheckOut && !isInRange ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
              ${isTodayDate && !isCheckIn && !isCheckOut && !isInRange ? 'ring-2 ring-blue-400' : ''}
              ${isCurrentMonth && !isPastDate && !isCheckIn && !isCheckOut && !isInRange ? style.bg : ''}
              ${isCurrentMonth && !isPastDate && !isCheckIn && !isCheckOut && !isInRange ? `border ${style.border}` : ''}
              ${isCurrentMonth && !isPastDate && (isCheckIn || isCheckOut) ? 'border-2' : ''}
            `}
            onClick={() => {
              if (isSelectable) {
                setSelectedDateState(clonedDay);
                onDateSelect?.(clonedDay);
              }
            }}
            onMouseEnter={() => setHoveredDate(dateKey)}
            onMouseLeave={() => setHoveredDate(null)}
          >
            {/* Check-in/Check-out labels */}
            {isCheckIn && isCurrentMonth && (
              <div className="absolute top-0 left-0 right-0 text-[8px] font-bold text-blue-700 bg-blue-200 rounded-t-lg px-1 text-center">
                Check-in
              </div>
            )}
            {isCheckOut && isCurrentMonth && (
              <div className="absolute top-0 left-0 right-0 text-[8px] font-bold text-green-700 bg-green-200 rounded-t-lg px-1 text-center">
                Check-out
              </div>
            )}
            
            {/* Date number */}
            <div className={`text-sm font-medium text-center ${isCurrentMonth ? (isCheckIn || isCheckOut || isInRange ? 'text-gray-900' : style.text) : 'text-gray-400'} ${(isCheckIn || isCheckOut) ? 'mt-1' : ''}`}>
              {format(day, 'd')}
            </div>
            
            {/* Status icon - show for current month and non-past dates */}
            {isCurrentMonth && !isPastDate && (
              <div className="flex justify-center mt-0.5">
                {style.icon}
              </div>
            )}
            
            {/* Price if available */}
            {dayData?.price && isCurrentMonth && !isPastDate && (
              <div className="text-[10px] text-center text-gray-600 mt-0.5">
                ₹{dayData.price}
              </div>
            )}
            
            {/* Tooltip for booked dates showing check-in/out dates and times - HOST VIEW ONLY */}
            {isHostView && hoveredDate === dateKey && status === 'booked' && isCurrentMonth && (
              <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                <div className="font-semibold mb-1">Booked</div>
                {(dayData?.checkInDate || dayData?.checkInTime) && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>In: {dayData?.checkInDate ? format(new Date(dayData.checkInDate), 'MMM d') : ''}{dayData?.checkInTime ? `, ${formatTime12Hour(dayData.checkInTime)}` : ''}</span>
                  </div>
                )}
                {(dayData?.checkOutDate || dayData?.checkOutTime) && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-green-400" />
                    <span>Out: {dayData?.checkOutDate ? format(new Date(dayData.checkOutDate), 'MMM d') : ''}{dayData?.checkOutTime ? `, ${formatTime12Hour(dayData.checkOutTime)}` : ''}</span>
                  </div>
                )}
                {dayData?.guestName && (
                  <div className="text-gray-300 mt-1">
                    Guest: {dayData.guestName}
                  </div>
                )}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}

            {/* Tooltip for maintenance dates - VISIBLE TO ALL (guests and hosts) */}
            {hoveredDate === dateKey && status === 'maintenance' && isCurrentMonth && dayData?.maintenance?.availableAfter && (
              <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-orange-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                <div className="font-semibold mb-1 flex items-center gap-1">
                  <Wrench className="w-3 h-3" />
                  Maintenance in Progress
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-200" />
                  <span>Available after: {format(new Date(dayData.maintenance.availableAfter), 'h:mm a')}</span>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-orange-600"></div>
              </div>
            )}

            {/* Tooltip for partially available dates - available after maintenance */}
            {hoveredDate === dateKey && status === 'partially-available' && isCurrentMonth && dayData?.maintenance?.availableAfter && (
              <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                <div className="font-semibold mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Partially Available
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-200" />
                  <span>Available after: {format(new Date(dayData.maintenance.availableAfter), 'h:mm a')}</span>
                </div>
                <div className="text-blue-200 text-[10px] mt-1">
                  Select check-in time after maintenance period
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
              </div>
            )}

            {/* Tooltip for dates with hour restrictions - GUEST VIEW */}
            {!isHostView && hoveredDate === dateKey && status === 'available' && isCurrentMonth && hasHourRestrictions && (
              <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg shadow-lg">
                <div className="font-semibold mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Available Hours
                </div>
                {dayData.availableHours?.map((range, idx) => (
                  <div key={idx} className="text-blue-200">
                    {formatTime12Hour(range.startTime)} - {formatTime12Hour(range.endTime)}
                  </div>
                ))}
                <div className="text-blue-200 text-[10px] mt-1">
                  Select check-in time within these hours
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
              </div>
            )}

            {/* Tooltip for unavailable dates - GUEST VIEW */}
            {!isHostView && hoveredDate === dateKey && status === 'unavailable' && isCurrentMonth && (
              <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                <div className="font-semibold mb-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Unavailable
                </div>
                <div className="text-red-200 text-[10px]">
                  This date is not available for booking
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-600"></div>
              </div>
            )}

            {/* Tooltip for available dates with maintenance that has ended - show "Cleaning complete" */}
            {hoveredDate === dateKey && status === 'available' && isCurrentMonth && dayData?.maintenance?.availableAfter && !hasHourRestrictions && (
              <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-green-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                <div className="font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Ready for Check-in
                </div>
                <div className="text-green-200 text-[10px] mt-1">
                  Cleaned & available since {format(new Date(dayData.maintenance.availableAfter), 'h:mm a')}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-green-600"></div>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
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

      {/* Calendar */}
      <div className="mb-6">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-800">Available</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
          <XCircle className="w-4 h-4 text-red-600" />
          <span className="font-medium text-red-800">Unavailable</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 border border-purple-200">
          <XCircle className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-purple-800">Booked</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
          <Wrench className="w-4 h-4 text-orange-600" />
          <span className="font-medium text-orange-800">Maintenance</span>
        </div>
      </div>

      {/* Selected Date Info */}
      {selectedDateState && (
        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
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
