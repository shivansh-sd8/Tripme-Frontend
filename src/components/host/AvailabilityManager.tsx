"use client";
import React, { useEffect, useMemo, useState  } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';
import { availabilityCalendarStyles } from '@/styles/calendars';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useRouter } from 'next/navigation';
import { Calendar,X , Clock,ChevronLeft,ArrowLeft, CheckCircle, XCircle, Plus, Trash2, Save, AlertTriangle, Wrench, Pause, Eye, ExternalLink } from 'lucide-react';

type TargetType = 'listing' | 'service';

interface AvailabilityManagerProps {
  targetType: TargetType;
  targetId: string;
}

interface SelectionItem {
  date: Date;
  status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold' | 'partially-available';
  reason?: string;
}

// Available status options with descriptions
const STATUS_OPTIONS = [
  {
    value: 'available',
    label: 'Available',
    description: 'Open for booking',
    icon: CheckCircle,
    color: 'emerald',
    bgColor: 'emerald-50',
    textColor: 'emerald-700',
    borderColor: 'emerald-200'
  },
  {
    value: 'partially-available',
    label: 'Partially Available',
    description: 'Available after maintenance/cleaning',
    icon: Clock,
    color: 'blue',
    bgColor: 'blue-50',
    textColor: 'blue-700',
    borderColor: 'blue-200'
  },
  {
    value: 'unavailable',
    label: 'Unavailable',
    description: 'Not available for booking',
    icon: XCircle,
    color: 'red',
    bgColor: 'red-50',
    textColor: 'red-700',
    borderColor: 'red-200'
  },
  {
    value: 'booked',
    label: 'Booked',
    description: 'Already booked by guest',
    icon: Eye,
    color: 'purple',
    bgColor: 'purple-50',
    textColor: 'purple-700',
    borderColor: 'purple-200'
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    description: 'Under maintenance/repair',
    icon: Wrench,
    color: 'orange',
    bgColor: 'orange-50',
    textColor: 'orange-700',
    borderColor: 'orange-200'
  },
  {
    value: 'on-hold',
    label: 'On Hold',
    description: 'Temporarily unavailable',
    icon: Pause,
    color: 'yellow',
    bgColor: 'yellow-50',
    textColor: 'yellow-700',
    borderColor: 'yellow-200'
  }
];

export default function AvailabilityManager({ targetType, targetId }: AvailabilityManagerProps) {
  const router = useRouter();
  const [range, setRange] = useState<{ startDate: Date; endDate: Date }>({ startDate: new Date(), endDate: new Date() });
  const [selectionType, setSelectionType] = useState<'range' | 'single'>('single');
  const [singleDate, setSingleDate] = useState<Date>(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipDate, setTooltipDate] = useState<string | null>(null); // For booking details tooltip
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold' | 'partially-available'>('available');
  const [reason, setReason] = useState<string>('');
  const [selections, setSelections] = useState<SelectionItem[]>([]);
  const [availableHours, setAvailableHours] = useState<Array<{ startTime: string; endTime: string }>>([]);
  const [unavailableHours, setUnavailableHours] = useState<Array<{ startTime: string; endTime: string }>>([]);
  const [onHoldHours, setOnHoldHours] = useState<Array<{ startTime: string; endTime: string }>>([]);
  const [isAllDayAvailable, setIsAllDayAvailable] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isMobile = useIsMobile();
 


  const [dayMeta, setDayMeta] = useState<Record<string, { 
    status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold' | 'partially-available';
    checkInDate?: string;   // Full check-in date
    checkOutDate?: string;  // Full check-out date
    checkInTime?: string;
    checkOutTime?: string;
    guestName?: string;
  }>>({});
  
  // ========================================
  // NEW: Maintenance time configuration
  // If this causes issues, comment out this section and the related UI below
  // ========================================
  const [maintenanceHours, setMaintenanceHours] = useState<number>(2);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  // ========================================
  // END NEW: Maintenance time state
  // ========================================

  const selectionCount = selections.length;

  const sortedSelections = useMemo(() => {
    return [...selections].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [selections]);

  const onDateRangeChange = (ranges: any) => {
    const { selection } = ranges;
    if (selectionType === 'single') {
      // For single date selection, set both start and end to the same date
      setRange({ startDate: selection.startDate, endDate: selection.startDate });
      setSingleDate(selection.startDate);
    } else {
      // For range selection, use the actual range
      setRange({ startDate: selection.startDate, endDate: selection.endDate });
    }
    
    // Track if we're in the middle of selecting
    if (selection.startDate && !selection.endDate) {
      setIsSelecting(true);
    } else if (selection.startDate && selection.endDate) {
      setIsSelecting(false);
    }
  };

  // Load current availability from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        if (targetType === 'listing') {
          const availRes = await apiClient.getAvailability(targetId);
          const arr = (availRes as any)?.data?.availability || (availRes as any)?.data?.data?.availability || (availRes as any)?.data || [];
          const map: Record<string, { 
            status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold' | 'partially-available';
            checkInDate?: string;
            checkOutDate?: string;
            checkInTime?: string;
            checkOutTime?: string;
            guestName?: string;
          }> = {};
          
          // Process existing availability records
          arr.forEach((it: any) => {
            const d = format(new Date(it.date), 'yyyy-MM-dd');
            // Map backend status to our frontend status
            let status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold' | 'partially-available';
            switch (it.status) {
              case 'available':
                status = 'available';
                break;
              case 'partially-available':
                status = 'partially-available';
                break;
              case 'booked':
                status = 'booked';
                break;
              case 'maintenance':
                status = 'maintenance';
                break;
              case 'on-hold':
                status = 'on-hold';
                break;
              case 'blocked':
              default:
                status = 'unavailable';
                break;
            }
            // Include booking details for booked dates (from backend populate)
            map[d] = { 
              status,
              checkInDate: it.checkInDate,
              checkOutDate: it.checkOutDate,
              checkInTime: it.checkInTime,
              checkOutTime: it.checkOutTime,
              guestName: it.guestName,
              availableHours: it.availableHours || [], // Add availableHours
              unavailableHours: it.unavailableHours || [], // Add unavailableHours
              onHoldHours: it.onHoldHours || [] // Add onHoldHours
            };
          });
          
          // ========================================
          // Fill in missing dates as UNAVAILABLE - host must explicitly set dates as available
          // ========================================
          const today = new Date();
          const endDateFill = new Date();
          endDateFill.setMonth(endDateFill.getMonth() + 3); // Show next 3 months
          
          const currentDate = new Date(today);
          while (currentDate <= endDateFill) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            if (!map[dateStr]) {
              // Default to 'unavailable' - host must explicitly mark dates as available
              map[dateStr] = { status: 'unavailable' };
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          setDayMeta(map);
        } else {
          const availRes = await apiClient.getServiceAvailability(targetId);
          const slots = (availRes as any)?.data?.availableSlots || (availRes as any)?.data?.data?.availableSlots || [];
          const map: Record<string, { 
            status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold';
            checkInTime?: string;
            checkOutTime?: string;
            guestName?: string;
          }> = {};
          
          // Process service availability slots
          slots.forEach((slot: any) => {
            if (!slot?.startTime) return;
            const d = format(new Date(slot.startTime), 'yyyy-MM-dd');
            // Map service availability to status
            let status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold';
            if (slot.status) {
              switch (slot.status) {
                case 'available':
                  status = 'available';
                  break;
                case 'booked':
                  status = 'booked';
                  break;
                case 'maintenance':
                  status = 'maintenance';
                  break;
                case 'on-hold':
                  status = 'on-hold';
                  break;
                default:
                  status = 'unavailable';
                  break;
              }
            } else {
              status = slot.isAvailable ? 'available' : 'unavailable';
            }
            map[d] = { status };
          });
          
          // Fill in missing dates as UNAVAILABLE for services - host must explicitly set dates as available
          const today = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 3);
          
          const currentDate = new Date(today);
          while (currentDate <= endDate) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            if (!map[dateStr]) {
              // Default to 'unavailable' - host must explicitly mark dates as available
              map[dateStr] = { status: 'unavailable' };
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          setDayMeta(map);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load availability');
      }
    };
    fetchData();
     
  }, [targetType, targetId]);

  const addSelectionFromRange = () => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    const days: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    setSelections(prev => {
      const dedup = new Map(prev.map(item => [format(item.date, 'yyyy-MM-dd'), item]));
      for (const d of days) {
        dedup.set(format(d, 'yyyy-MM-dd'), { 
          date: d, 
          status: selectedStatus,
          reason: reason.trim() || undefined
        });
      }
      return Array.from(dedup.values());
    });
    // Reset hour ranges after adding selection
    setAvailableHours([]);
    setUnavailableHours([]);
    setOnHoldHours([]);
    setIsAllDayAvailable(true);
  };

  const addSelectionSingle = () => {
    const d = new Date(singleDate);
    setSelections(prev => {
      const dedup = new Map(prev.map(item => [format(item.date, 'yyyy-MM-dd'), item]));
      dedup.set(format(d, 'yyyy-MM-dd'), { 
        date: d, 
        status: selectedStatus,
        reason: reason.trim() || undefined
      });
      return Array.from(dedup.values());
    });
    // Reset hour ranges after adding selection
    setAvailableHours([]);
    setUnavailableHours([]);
    setOnHoldHours([]);
    setIsAllDayAvailable(true);
  };

  const removeSelection = (dateStr: string) => {
    setSelections(prev => prev.filter(s => format(s.date, 'yyyy-MM-dd') !== dateStr));
  };

  const clearAll = () => setSelections([]);

  const saveAvailability = async () => {
    if (!targetId || selections.length === 0) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🚀 Saving availability for:', { targetType, targetId, selections });
      
      if (targetType === 'listing') {
        const payload = selections.map(s => {
          // Map frontend status back to backend status
          let backendStatus: string;
          switch (s.status) {
            case 'available':
              backendStatus = 'available';
              break;
            case 'unavailable':
              backendStatus = 'blocked';
              break;
            case 'booked':
              backendStatus = 'booked';
              break;
            case 'maintenance':
              backendStatus = 'maintenance';
              break;
            case 'on-hold':
              backendStatus = 'on-hold';
              break;
            default:
              backendStatus = 'blocked';
          }
          
          const mapped: any = {
            date: format(s.date, 'yyyy-MM-dd'),
            status: backendStatus,
            reason: s.reason
          };
          
          // Add availableHours if status is 'available' and not all day
          if (backendStatus === 'available' && !isAllDayAvailable && availableHours.length > 0) {
            mapped.availableHours = availableHours;
          } else if (backendStatus === 'available' && isAllDayAvailable) {
            mapped.availableHours = []; // Empty array means all day available
          }
          
          // Add unavailableHours if status is 'available' and unavailable hours are set
          if (backendStatus === 'available' && unavailableHours.length > 0) {
            mapped.unavailableHours = unavailableHours;
          }
          
          // Add onHoldHours if status is 'on-hold' and on-hold hours are set
          if (backendStatus === 'on-hold' && onHoldHours.length > 0) {
            mapped.onHoldHours = onHoldHours;
          }
          
          console.log('📅 Mapping selection:', { frontend: s.status, backend: backendStatus, date: mapped.date, availableHours: mapped.availableHours, unavailableHours: mapped.unavailableHours, onHoldHours: mapped.onHoldHours });
          return mapped;
        });
        
        console.log('📤 Sending to backend:', { updates: payload });
        const response = await apiClient.bulkUpdateAvailability(targetId, { updates: payload });
        console.log('✅ Backend response:', response);
        
      } else {
        const availableSlots = selections.map(s => {
          const start = new Date(format(s.date, 'yyyy-MM-dd') + 'T00:00:00');
          const end = new Date(format(s.date, 'yyyy-MM-dd') + 'T23:59:59');
          
          // Map frontend status to service availability
          let backendStatus: string;
          switch (s.status) {
            case 'available':
              backendStatus = 'available';
              break;
            case 'unavailable':
              backendStatus = 'blocked';
              break;
            case 'booked':
              backendStatus = 'booked';
              break;
            case 'maintenance':
              backendStatus = 'maintenance';
              break;
            case 'on-hold':
              backendStatus = 'on-hold';
              break;
            default:
              backendStatus = 'blocked';
          }
          
          const mapped = { 
            startTime: start, 
            endTime: end, 
            isAvailable: s.status === 'available',
            status: backendStatus,
            reason: s.reason
          };
          console.log('🛠️ Mapping service slot:', { frontend: s.status, backend: backendStatus, date: format(s.date, 'yyyy-MM-dd') });
          return mapped;
        });
        
        console.log('📤 Sending service availability to backend:', availableSlots);
        const response = await apiClient.updateServiceAvailability(targetId, availableSlots as any);
        console.log('✅ Service backend response:', response);
      }
      
      setSuccess('Availability updated successfully! 🎉');
      // Refresh the data
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      console.error('❌ Error saving availability:', e);
      setError(e?.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0];
  };
  function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-6 px-2 md:px-0">
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
    
    {/* Title Section: Compact & Left Aligned */}
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors md:hidden"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">
          Manage Availability
        </h1>
      </div>
      <p className="text-xs md:text-base text-slate-500 font-medium">
        Calendar for {targetType === 'listing' ? 'Property' : 'Service'}
      </p>
    </div>

    {/* Buttons Section: Single line on mobile */}
    <div className="flex items-center gap-2">
      <Button 
        onClick={() => router.back()} 
        variant="ghost"
        className="hidden md:flex items-center text-slate-600 font-bold"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <Button 
        onClick={() => {
          const path = targetType === 'listing' ? `/rooms/${targetId}` : `/services/${targetId}`;
          router.push(path);
        }}
        className="flex-1 md:flex-none h-10 px-4 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>View {targetType === 'listing' ? 'Property' : 'Service'}</span>
      </Button>
    </div>
  </div>

  {/* Status Messages: Ultra-Slim */}
  {(error || success) && (
    <div className={`mt-4 p-2.5 rounded-lg border flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
      error ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
    }`}>
      {error ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
      <span className="text-[11px] md:text-sm font-bold truncate">{error || success}</span>
    </div>
  )}
</div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Control Panel - Left Sidebar */}
          <div className="xl:col-span-4 order-1 xl:order-none">
            <Card className="p-4 md:p-6 space-y-6 rounded-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="text-center pb-4 border-b border-slate-200">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-2">Quick Controls</h2>
                <p className="text-slate-600 text-sm">Configure your availability settings</p>
              </div>

              {/* Selection Type Toggle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Selection Mode</label>
                <div className="inline-flex rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
                  <button
                    type="button"
                    className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                      selectionType === 'range' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => 
                      {
                        setSelectionType('range')
                        if(isMobile){
                          setIsCalendarOpen(true)
                        }
                      }
                    }
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date Range
                  </button>
                  <button
                    type="button"
                    className={`px-6 py-3 text-sm font-medium border-l-2 border-slate-200 transition-all duration-200 ${
                      selectionType === 'single' 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={
                      () => {
                        setSelectionType('single')
                        if(isMobile){
                          setIsCalendarOpen(true)
                        }
                      }
                    }
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Single Day
                  </button>
                </div>
              </div>

              {/* Status Selection */}
              {/* <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Availability Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedStatus === option.value;
                    
                    // Get proper color classes for each status when selected
                    const getSelectedStatusClasses = (statusValue: string) => {
                      switch (statusValue) {
                        case 'available':
                          return 'bg-emerald-50 border-emerald-200 text-emerald-700';
                        case 'unavailable':
                          return 'bg-red-50 border-red-200 text-red-700';
                        case 'booked':
                          return 'bg-purple-50 border-purple-200 text-purple-700';
                        case 'maintenance':
                          return 'bg-orange-50 border-orange-200 text-orange-700';
                        case 'on-hold':
                          return 'bg-yellow-50 border-yellow-200 text-yellow-700';
                        case 'partially-available':
                          return 'bg-blue-50 border-blue-200 text-blue-700';
                        default:
                          return 'bg-slate-50 border-slate-200 text-slate-700';
                      }
                    };
                    
                    const getIconColorClasses = (statusValue: string) => {
                      switch (statusValue) {
                        case 'available':
                          return 'text-emerald-500';
                        case 'unavailable':
                          return 'text-red-500';
                        case 'booked':
                          return 'text-purple-500';
                        case 'maintenance':
                          return 'text-orange-500';
                        case 'on-hold':
                          return 'text-yellow-500';
                        default:
                          return 'text-slate-500';
                      }
                    };
                    
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedStatus(option.value as any)}
                        className={`
                          p-3 rounded-xl border-2 transition-all duration-200 text-left
                          ${isSelected 
                            ? `${getSelectedStatusClasses(option.value)} shadow-md` 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${getIconColorClasses(option.value)}`} />
                          <span className="font-semibold text-sm">{option.label}</span>
                        </div>
                        <p className="text-xs opacity-80">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div> */}
              
              <div>
  <div className="flex items-center justify-between mb-3">
    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
      Set Status
    </label>
    <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
      Tap to select
    </span>
  </div>
  
  {/* Horizontal Scroll on very small screens, or tight grid */}
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {STATUS_OPTIONS.map((option) => {
      const Icon = option.icon;
      const isSelected = selectedStatus === option.value;
      
      const getColors = (val: string) => {
        switch (val) {
          case 'available': return 'border-emerald-500 text-emerald-700 bg-emerald-50';
          case 'unavailable': return 'border-red-500 text-red-700 bg-red-50';
          case 'booked': return 'border-purple-500 text-purple-700 bg-purple-50';
          case 'maintenance': return 'border-orange-500 text-orange-700 bg-orange-50';
          default: return 'border-slate-400 text-slate-700 bg-slate-50';
        }
      };

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => setSelectedStatus(option.value as any)}
          className={`
            flex items-center gap-2 p-2 rounded-lg border transition-all active:scale-95
            ${isSelected 
              ? `${getColors(option.value)} shadow-sm ring-1 ring-inset ring-black/5` 
              : 'bg-white border-slate-200 text-slate-600'
            }
          `}
        >
          {/* Smaller, simpler icon */}
          <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-60'}`} />
          
          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-[11px] font-bold leading-none truncate w-full">
              {option.label}
            </span>
          </div>
        </button>
      );
    })}
  </div>

  {/* Dynamic Description: Only shows for the SELECTED item to save space */}
  <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
    <p className="text-[10px] text-slate-500 italic">
      <span className="font-bold uppercase mr-1">Note:</span>
      {STATUS_OPTIONS.find(o => o.value === selectedStatus)?.description || "Select a status to see details."}
    </p>
  </div>
</div>

              {/* Reason Input */}
              {(selectedStatus === 'unavailable' || selectedStatus === 'maintenance' || selectedStatus === 'on-hold') && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder={`e.g., ${selectedStatus === 'unavailable' ? 'Personal use, renovation' : selectedStatus === 'maintenance' ? 'Plumbing repair, electrical work' : 'Temporary closure, staff shortage'}`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              )}

              {/* Available Hours Selection - Only show if status is 'available' */}
              {selectedStatus === 'available' && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Available Hours
                  </label>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="allDayAvailable"
                      checked={isAllDayAvailable}
                      onChange={(e) => {
                        setIsAllDayAvailable(e.target.checked);
                        if (e.target.checked) {
                          setAvailableHours([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="allDayAvailable" className="text-sm text-slate-600">
                      Available all day (24 hours)
                    </label>
                  </div>

                  {!isAllDayAvailable && (
                    <div className="space-y-3">
                      {availableHours.map((range, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                Start Time
                              </label>
                              <input
                                type="time"
                                value={range.startTime}
                                onChange={(e) => {
                                  const updated = [...availableHours];
                                  updated[index].startTime = e.target.value;
                                  setAvailableHours(updated);
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                End Time
                              </label>
                              <input
                                type="time"
                                value={range.endTime}
                                onChange={(e) => {
                                  const updated = [...availableHours];
                                  updated[index].endTime = e.target.value;
                                  setAvailableHours(updated);
                                }}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAvailableHours(availableHours.filter((_, i) => i !== index));
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => {
                          setAvailableHours([...availableHours, { startTime: '09:00', endTime: '17:00' }]);
                        }}
                        className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Time Range
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* On-Hold Hours Selection - Only show if status is 'on-hold' */}
              {selectedStatus === 'on-hold' && (
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    On-Hold Hours
                  </label>
                  <p className="text-xs text-slate-500">
                    Set specific time ranges when the property is temporarily on hold. Leave empty to set entire day as on-hold.
                  </p>
                  
                  <div className="space-y-3">
                    {onHoldHours.map((range, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={range.startTime}
                              onChange={(e) => {
                                const updated = [...onHoldHours];
                                updated[index].startTime = e.target.value;
                                setOnHoldHours(updated);
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={range.endTime}
                              onChange={(e) => {
                                const updated = [...onHoldHours];
                                updated[index].endTime = e.target.value;
                                setOnHoldHours(updated);
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOnHoldHours(onHoldHours.filter((_, i) => i !== index));
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setOnHoldHours([...onHoldHours, { startTime: '22:00', endTime: '23:00' }]);
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add On-Hold Time Range
                    </button>
                  </div>
                </div>
              )}

              {/* Date Input */}
              {selectionType === 'single' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Select Date</label>
                  <input
                    type="date"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    value={format(singleDate, 'yyyy-MM-dd')}
                    onChange={e => {
                      // Parse date string to LOCAL midnight (not UTC)
                      // new Date('YYYY-MM-DD') creates UTC midnight which shifts by 1 day in some timezones
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      const selectedDate = new Date(year, month - 1, day); // Creates LOCAL midnight
                      const today = new Date(new Date().setHours(0, 0, 0, 0));
                      if (selectedDate >= today) {
                        setSingleDate(selectedDate);
                      }
                    }}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Cannot select dates in the past
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="hidden md:block space-y-3">
                <Button 
                  onClick={selectionType === 'range' ? addSelectionFromRange : addSelectionSingle} 
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {selectionType === 'range' ? 'Add Date Range' : 'Add Single Date'}
                </Button>
                
                <div className="text-center py-3 bg-slate-50 rounded-xl">
                  <span className="text-2xl font-bold text-slate-800">{selectionCount}</span>
                  <p className="text-sm text-slate-600">dates selected</p>
                </div>
              </div>

              {/* Current Status Summary */}
              <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Current Status Summary</h4>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((option) => {
                    const count = Object.values(dayMeta).filter(meta => meta.status === option.value).length;
                    const Icon = option.icon;
                    
                    // Get proper color classes for each status
                    const getStatusColorClasses = (statusValue: string) => {
                      switch (statusValue) {
                        case 'available':
                          return 'text-emerald-600';
                        case 'partially-available':
                          return 'text-blue-600';
                        case 'unavailable':
                          return 'text-red-600';
                        case 'booked':
                          return 'text-purple-600';
                        case 'maintenance':
                          return 'text-orange-600';
                        case 'on-hold':
                          return 'text-yellow-600';
                        default:
                          return 'text-slate-600';
                      }
                    };
                    
                    const getIconColorClasses = (statusValue: string) => {
                      switch (statusValue) {
                        case 'available':
                          return 'text-emerald-500';
                        case 'partially-available':
                          return 'text-blue-500';
                        case 'unavailable':
                          return 'text-red-500';
                        case 'booked':
                          return 'text-purple-500';
                        case 'maintenance':
                          return 'text-orange-500';
                        case 'on-hold':
                          return 'text-yellow-500';
                        default:
                          return 'text-slate-500';
                      }
                    };
                    
                    return (
                      <div key={option.value} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className={getIconColorClasses(option.value)} />
                          <span className="text-slate-600">{option.label}</span>
                        </div>
                        <span className={`font-semibold ${getStatusColorClasses(option.value)}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Dates</span>
                    <span className="font-semibold text-slate-800">{Object.keys(dayMeta).length}</span>
                  </div>
                </div>
              </div>

              {/* Management Actions */}
              <div className="hidden md:block space-y-3 pt-4 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  onClick={clearAll} 
                  disabled={selectionCount === 0} 
                  className="w-full py-3 text-slate-600 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button 
                  onClick={saveAvailability} 
                  disabled={selectionCount === 0 || saving} 
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Availability'}
                </Button>
              </div>
              
              {/* ========================================
                  NEW: Maintenance Time Configuration
                  This sets how long the property is blocked after checkout for cleaning/preparation
                  If this causes issues, comment out this entire section
                  ======================================== */}
              {targetType === 'listing' && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Wrench className="w-5 h-5 text-orange-600" />
                      <h4 className="font-semibold text-orange-800">Maintenance Time</h4>
                    </div>
                    <p className="text-sm text-orange-700 mb-3">
                      Set hours needed for cleaning/preparation after checkout. Property will be blocked automatically.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={maintenanceHours}
                        onChange={(e) => setMaintenanceHours(Math.max(1, Math.min(12, parseInt(e.target.value) || 2)))}
                        className="w-20 border-2 border-orange-200 rounded-lg px-3 py-2 text-center font-semibold text-orange-800 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                      />
                      <span className="text-sm text-orange-700">hours after checkout</span>
                    </div>
                    <Button
                      onClick={async () => {
                        setSavingMaintenance(true);
                        try {
                          await apiClient.updateMaintenanceTime(targetId, maintenanceHours);
                          setSuccess(`Maintenance time updated to ${maintenanceHours} hours!`);
                        } catch (e: any) {
                          setError(e?.message || 'Failed to update maintenance time');
                        } finally {
                          setSavingMaintenance(false);
                        }
                      }}
                      disabled={savingMaintenance}
                      className="mt-3 w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all duration-200"
                    >
                      {savingMaintenance ? 'Saving...' : 'Save Maintenance Time'}
                    </Button>
                  </div>
                </div>
              )}
              {/* ========================================
                  END NEW: Maintenance Time Configuration
                  ======================================== */}
            </Card>
          </div>

          {/* Calendar - Right Side */}
          <div className="xl:col-span-8 order-2 xl:order-none  hidden md:block">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Availability Calendar</h3>
                <p className="text-slate-600">Select dates to manage your availability</p>
              </div>
              
              {/* Enhanced Status Legend */}
              <div className="mb-6">
                <div className="flex flex-wrap justify-center gap-3 mb-4">
                  {STATUS_OPTIONS.map((option) => {
                    // Get proper color classes for each status
                    const getStatusColorClasses = (statusValue: string) => {
                      switch (statusValue) {
                        case 'available':
                          return 'bg-emerald-500';
                        case 'partially-available':
                          return 'bg-blue-500';
                        case 'unavailable':
                          return 'bg-red-500';
                        case 'booked':
                          return 'bg-purple-500';
                        case 'maintenance':
                          return 'bg-orange-500';
                        case 'on-hold':
                          return 'bg-yellow-500';
                        default:
                          return 'bg-slate-500';
                      }
                    };
                    
                    return (
                      <div key={option.value} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                        <div className={`w-4 h-4 rounded-full ${getStatusColorClasses(option.value)}`}></div>
                        <span className="text-sm font-medium text-slate-700">{option.label}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Additional Calendar Indicators */}
                <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    <span>Expired</span>
                  </div>
                </div>
              </div>
              
              <div className={availabilityCalendarStyles.availabilityCalendarWrapper}>
                <DateRange
                  ranges={[{ startDate: range.startDate, endDate: range.endDate, key: 'selection' }]}
                  onChange={onDateRangeChange}
                  minDate={new Date()}
                  showDateDisplay={false}
                  months={1}
                  direction="horizontal"
                  moveRangeOnFirstSelection={true}
                  editableDateInputs={false}
                  rangeColors={['#3b82f6']}
                   dayContentRenderer={(date: Date) => {
                     const ds = format(date, 'yyyy-MM-dd');
                     const meta = dayMeta[ds];
                     // FIXED: Default to 'available' to match room page behavior (was 'unavailable')
                     const status = meta?.status || 'available';
                     const isExpired = date < new Date(new Date().setHours(0, 0, 0, 0));
                     
                     // Check if this date is in the current selection range
                     const isInRange = date >= range.startDate && date <= range.endDate;
                     const isStartDate = format(date, 'yyyy-MM-dd') === format(range.startDate, 'yyyy-MM-dd');
                     const isEndDate = format(date, 'yyyy-MM-dd') === format(range.endDate, 'yyyy-MM-dd');
                     
                     // Check if this date is in the hover preview range (when selecting)
                     let isInHoverRange = false;
                     let isHoverStart = false;
                     let isHoverEnd = false;
                     
                     if (isSelecting && hoveredDate && range.startDate) {
                       const startDate = range.startDate < hoveredDate ? range.startDate : hoveredDate;
                       const endDate = range.startDate < hoveredDate ? hoveredDate : range.startDate;
                       isInHoverRange = date >= startDate && date <= endDate;
                       isHoverStart = format(date, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd');
                       isHoverEnd = format(date, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');
                     }
                     
                     // Get status color classes - prioritize selection colors
                     const getStatusColorClasses = () => {
                       if (isExpired) {
                         return 'bg-slate-100 text-slate-400';
                       }
                       
                       // If date is in hover preview range (while selecting), use preview colors
                       if (isInHoverRange) {
                         if (isHoverStart || isHoverEnd) {
                           return 'bg-blue-400 text-white border-2 border-blue-500 shadow-lg';
                         } else {
                           return 'bg-blue-50 text-blue-700 border border-blue-200';
                         }
                       }
                       
                       // If date is in final selection range, use selection colors
                       if (isInRange) {
                         if (isStartDate || isEndDate) {
                           return 'bg-blue-500 text-white border-2 border-blue-600';
                         } else {
                           return 'bg-blue-100 text-blue-800 border border-blue-300';
                         }
                       }
                       
                       // Otherwise use status colors
                       switch (status) {
                         case 'available':
                           return 'bg-emerald-500 text-white';
                         case 'partially-available':
                           return 'bg-blue-500 text-white';
                         case 'unavailable':
                           return 'bg-red-500 text-white';
                         case 'booked':
                           return 'bg-purple-500 text-white';
                         case 'maintenance':
                           return 'bg-orange-500 text-white';
                         case 'on-hold':
                           return 'bg-yellow-500 text-white';
                         default:
                           return 'bg-red-500 text-white';
                       }
                     };
                     
                    // Helper to format time
                    const formatTime12Hour = (timeStr: string) => {
                      if (!timeStr) return '';
                      const [hours, minutes] = timeStr.split(':').map(Number);
                      const period = hours >= 12 ? 'PM' : 'AM';
                      const displayHours = hours % 12 || 12;
                      return `${displayHours}:${minutes?.toString().padStart(2, '0') || '00'} ${period}`;
                    };
                    
                    return (
                      <div 
                        className={`
                          w-full h-full flex items-center justify-center rounded-full relative
                          ${getStatusColorClasses()}
                        `}
                        onMouseEnter={() => {
                          if (isSelecting && range.startDate) {
                            setHoveredDate(date);
                          }
                          // Show tooltip for booked dates or dates with hour restrictions
                          if ((status === 'booked' || (status === 'available' && meta?.availableHours && meta.availableHours.length > 0)) && !isExpired) {
                            setTooltipDate(ds);
                          }
                        }}
                        onMouseLeave={() => {
                          if (isSelecting) {
                            setHoveredDate(null);
                          }
                          setTooltipDate(null);
                        }}
                      >
                        <span className="text-sm font-bold">
                          {date.getDate()}
                        </span>
                        
                        {/* Tooltip for booked dates showing check-in/out dates and times */}
                        {tooltipDate === ds && status === 'booked' && !isExpired && (
                          <div className="absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                            <div className="font-semibold mb-1">Booked</div>
                            {(meta?.checkInDate || meta?.checkInTime) && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-blue-400" />
                                <span>In: {meta?.checkInDate ? format(new Date(meta.checkInDate), 'MMM d') : ''}{meta?.checkInTime ? `, ${formatTime12Hour(meta.checkInTime)}` : ''}</span>
                              </div>
                            )}
                            {(meta?.checkOutDate || meta?.checkOutTime) && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-green-400" />
                                <span>Out: {meta?.checkOutDate ? format(new Date(meta.checkOutDate), 'MMM d') : ''}{meta?.checkOutTime ? `, ${formatTime12Hour(meta.checkOutTime)}` : ''}</span>
                              </div>
                            )}
                            {meta?.guestName && (
                              <div className="text-gray-300 mt-1">
                                Guest: {meta.guestName}
                              </div>
                            )}
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}

                        {/* Tooltip for dates with hour restrictions */}
                        {tooltipDate === ds && status === 'available' && !isExpired && ((meta?.availableHours && meta.availableHours.length > 0) || (meta?.unavailableHours && meta.unavailableHours.length > 0)) && (
                          <div className="absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg shadow-lg">
                            {(meta?.availableHours && meta.availableHours.length > 0) && (
                              <>
                                <div className="font-semibold mb-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Available Hours
                                </div>
                                {meta.availableHours.map((range, idx) => (
                                  <div key={idx} className="text-blue-200">
                                    {formatTime12Hour(range.startTime)} - {formatTime12Hour(range.endTime)}
                                  </div>
                                ))}
                              </>
                            )}
                            {(meta?.unavailableHours && meta.unavailableHours.length > 0) && (
                              <>
                                {meta?.availableHours && meta.availableHours.length > 0 && <div className="mt-2 pt-2 border-t border-blue-500"></div>}
                                <div className="font-semibold mb-1 flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  Unavailable Hours
                                </div>
                                {meta.unavailableHours.map((range, idx) => (
                                  <div key={idx} className="text-red-200">
                                    {formatTime12Hour(range.startTime)} - {formatTime12Hour(range.endTime)}
                                  </div>
                                ))}
                              </>
                            )}
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
                          </div>
                        )}

                        {/* Tooltip for on-hold dates */}
                        {tooltipDate === ds && status === 'on-hold' && !isExpired && (
                          <div className="absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-yellow-600 text-white text-xs rounded-lg shadow-lg">
                            <div className="font-semibold mb-1 flex items-center gap-1">
                              <Pause className="w-3 h-3" />
                              On Hold
                            </div>
                            {meta?.onHoldHours && meta.onHoldHours.length > 0 ? (
                              <>
                                <div className="text-yellow-200">On-hold hours:</div>
                                {meta.onHoldHours.map((range, idx) => (
                                  <div key={idx} className="text-yellow-200">
                                    {formatTime12Hour(range.startTime)} - {formatTime12Hour(range.endTime)}
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="text-yellow-200">Entire day on hold</div>
                            )}
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-yellow-600"></div>
                          </div>
                        )}

                        {/* Tooltip for unavailable dates */}
                        {tooltipDate === ds && status === 'unavailable' && !isExpired && (
                          <div className="absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
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
                      </div>
                    );
                   }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selections Summary */}
        <div className="hidden md:block mt-8">
          <Card className="p-6 rounded-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Selected Dates</h2>
              <div className="text-sm text-slate-500">
                {selectionCount} date{selectionCount !== 1 ? 's' : ''} selected
              </div>
            </div>
            
            {sortedSelections.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg text-slate-500 font-medium">No dates selected yet</p>
                <p className="text-sm text-slate-400">Use the controls above to select dates</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                {sortedSelections.map((s) => {
                  const d = format(s.date, 'yyyy-MM-dd');
                  const statusConfig = getStatusConfig(s.status);
                  const Icon = statusConfig.icon;
                  
                  // Get proper color classes for each status
                  const getStatusColorClasses = (statusValue: string) => {
                    switch (statusValue) {
                      case 'available':
                        return 'bg-emerald-500';
                      case 'partially-available':
                        return 'bg-blue-500';
                      case 'unavailable':
                        return 'bg-red-500';
                      case 'booked':
                        return 'bg-purple-500';
                      case 'maintenance':
                        return 'bg-orange-500';
                      case 'on-hold':
                        return 'bg-yellow-500';
                      default:
                        return 'bg-slate-500';
                    }
                  };
                  
                  const getIconColorClasses = (statusValue: string) => {
                    switch (statusValue) {
                      case 'available':
                        return 'text-emerald-500';
                      case 'partially-available':
                        return 'text-blue-500';
                      case 'unavailable':
                        return 'text-red-500';
                      case 'booked':
                        return 'text-purple-500';
                      case 'maintenance':
                        return 'text-orange-500';
                      case 'on-hold':
                        return 'text-yellow-500';
                      default:
                        return 'text-slate-500';
                    }
                  };
                  
                  return (
                    <div key={d} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColorClasses(s.status)}`}></div>
                        <Icon className={`w-4 h-4 ${getIconColorClasses(s.status)}`} />
                        <div>
                          <div className="font-semibold text-slate-800">{d}</div>
                          <div className="text-sm text-slate-600">
                            {statusConfig.label}
                          </div>
                          {s.reason && (
                            <div className="text-xs text-slate-500 mt-1">
                              {s.reason}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => removeSelection(d)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:border-red-300 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
{/* {isMobile && (
  <div className="mt-4 mb-16 bg-white rounded-2xl p-3 shadow border">
    <h4 className="text-sm font-bold mb-2 text-slate-700">
      Availability Overview
    </h4>

    <div className="calendar-wrapper-mobile">
      <style jsx>{`
        .calendar-wrapper-mobile :global(.rdrMonthAndYearWrapper),
        .calendar-wrapper-mobile :global(.rdrNextPrevButton),
        .calendar-wrapper-mobile :global(.rdrMonthName) {
          display: none !important;
        }

        .calendar-wrapper-mobile :global(.rdrCalendarWrapper) {
          width: 100% !important;
        }

        .calendar-wrapper-mobile :global(.rdrWeekDays),
        .calendar-wrapper-mobile :global(.rdrDays) {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
        }

        .calendar-wrapper-mobile :global(.rdrDay) {
          aspect-ratio: 1;
          min-height: 36px;
        }

        .calendar-wrapper-mobile :global(.rdrDayNumber span) {
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>

      <DateRange
        ranges={[]}               // read-only
        onChange={() => {}}
        showDateDisplay={false}
        months={1}
        direction="horizontal"
        moveRangeOnFirstSelection={false}
        editableDateInputs={false}
        rangeColors={[]}
        dayContentRenderer= {(date: Date) => {
              const ds = format(date, 'yyyy-MM-dd');
              const meta = dayMeta[ds];
              const status = meta?.status || 'available';
              const isExpired = date < new Date(new Date().setHours(0, 0, 0, 0));
              
              // Check if this date is in the current selection range
              const isInRange = range.startDate && range.endDate && date >= range.startDate && date <= range.endDate;
              const isStartDate = range.startDate && format(date, 'yyyy-MM-dd') === format(range.startDate, 'yyyy-MM-dd');
              const isEndDate = range.endDate && format(date, 'yyyy-MM-dd') === format(range.endDate, 'yyyy-MM-dd');
              
              // Check if this date is in the hover preview range (when selecting)
              let isInHoverRange = false;
              let isHoverStart = false;
              let isHoverEnd = false;
              
              if (isSelecting && hoveredDate && range.startDate) {
                const startDate = range.startDate < hoveredDate ? range.startDate : hoveredDate;
                const endDate = range.startDate < hoveredDate ? hoveredDate : range.startDate;
                isInHoverRange = date >= startDate && date <= endDate;
                isHoverStart = format(date, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd');
                isHoverEnd = format(date, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');
              }
              
              // Get status color classes - NO TOOLTIPS, JUST COLORS
              const getStatusColorClasses = () => {
                if (isExpired) {
                  return 'bg-slate-100 text-slate-400';
                }
                
                // Hover preview colors (while selecting)
                if (isInHoverRange) {
                  if (isHoverStart || isHoverEnd) {
                    return 'bg-blue-400 text-white border-2 border-blue-500 shadow-lg';
                  } else {
                    return 'bg-blue-50 text-blue-700 border border-blue-200';
                  }
                }
                
                // Final selection colors
                if (isInRange) {
                  if (isStartDate || isEndDate) {
                    return 'bg-blue-500 text-white border-2 border-blue-600';
                  } else {
                    return 'bg-blue-100 text-blue-800 border border-blue-300';
                  }
                }
                
                // Status colors only
                switch (status) {
                  case 'available':
                    return 'bg-emerald-500 text-white';
                  case 'partially-available':
                    return 'bg-blue-500 text-white';
                  case 'unavailable':
                    return 'bg-red-500 text-white';
                  case 'booked':
                    return 'bg-purple-500 text-white';
                  case 'maintenance':
                    return 'bg-orange-500 text-white';
                  case 'on-hold':
                    return 'bg-yellow-500 text-white';
                  default:
                    return 'bg-red-500 text-white';
                }
              };
              
              return (
                <div 
                  className={`
                    w-full h-full flex items-center justify-center rounded-full
                    touch-manipulation cursor-pointer
                    transition-all duration-150
                    ${getStatusColorClasses()}
                  `}
                  onMouseEnter={() => {
                    // Only handle hover for selection preview, no tooltips
                    if (isSelecting && range.startDate) {
                      setHoveredDate(date);
                    }
                  }}
                  onMouseLeave={() => {
                    if (isSelecting) {
                      setHoveredDate(null);
                    }
                  }}
                >
                  <span className="text-xs sm:text-sm font-bold select-none">
                    {date.getDate()}
                  </span>
                </div>
              );
            }}// your status renderer
      />
    </div>
  </div>
)} */}
{isMobile && (
  <div className="mt-4 mb-12 bg-white rounded-2xl p-4 shadow border">
    <h4 className="text-sm font-bold mb-3 text-slate-700">
      Availability Overview
    </h4>

    <div className="calendar-wrapper-mobile">
   

      <DateRange
        ranges={[]}              // read-only
        onChange={() => {}}
        showDateDisplay={false}
        months={1}
        direction="horizontal"
        moveRangeOnFirstSelection={false}
        editableDateInputs={false}
        rangeColors={[]}
        dayContentRenderer={(date: Date) => {
          const ds = format(date, 'yyyy-MM-dd');
          const meta = dayMeta[ds];
          const status = meta?.status || 'available';

          const getColor = () => {
             switch (status) {

              
    case 'available':
      return 'text-emerald-600 font-semibold';
    case 'partially-available':
      return 'text-blue-600 font-semibold';
    case 'unavailable':
      return 'text-red-600 line-through';
    case 'booked':
      return 'text-purple-600 font-semibold';
    case 'maintenance':
      return 'text-orange-600 font-semibold';
    case 'on-hold':
      return 'text-yellow-600 font-semibold';
    default:
      return 'text-slate-500';
  }
            // switch (status) {
            //   case 'available':
            //     return 'bg-emerald-500 text-white';
            //   case 'unavailable':
            //     return 'bg-red-500 text-white';
            //   case 'booked':
            //     return 'bg-purple-500 text-white';
            //   case 'maintenance':
            //     return 'bg-orange-500 text-white';
            //   case 'on-hold':
            //     return 'bg-yellow-500 text-white';
            //   default:
            //     return 'bg-slate-200 text-slate-600';
            // }
          };

          return (
            <div
              className={`
                w-full h-full flex items-center justify-center
                rounded-full text-xs font-bold
                ${getColor()}
              `}
            >
              {date.getDate()}
            </div>
          );
        }}
      />
    </div>
  </div>
)}



      </div>

      
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
  <div className="bg-white border-t shadow-xl px-4 py-3 flex items-center justify-between">
    
    {/* LEFT: Summary */}
    <div>
      <div className="text-sm font-bold">
        {selectionCount} selected
      </div>
      <div className="text-xs text-slate-500">
        Status: {selectedStatus}
      </div>
    </div>

    {/* RIGHT: Dynamic action */}
    <Button
      onClick={saveAvailability}
      disabled={selectionCount === 0}
      className="h-10 px-6"
    >
      {selectedStatus === 'on-hold'
        ? 'Hold'
        : selectedStatus === 'unavailable'
        ? 'Block'
        : 'Save'}
    </Button>
  </div>
</div>


{isCalendarOpen && (
  <div className="fixed inset-0 z-50 bg-black/40">
    <div className="absolute bottom-0 w-full bg-white rounded-t-3xl max-h-[90vh] flex flex-col">

      {/* ===== Header (Sticky) ===== */}
      <div className="sticky top-0 bg-white z-10 border-b px-4 pt-3 pb-2 rounded-t-3xl">
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Select Dates
          </h3>
          <button
            onClick={() => setIsCalendarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== Scroll Area ===== */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4 [-webkit-overflow-scrolling:touch]">
        <style jsx>{`
          .calendar-wrapper :global(.rdrCalendarWrapper) {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .calendar-wrapper :global(.rdrMonth) {
            width: 100% !important;
            padding: 0 0.5rem;
            margin-bottom: 1.5rem !important;
          }
          
          .calendar-wrapper :global(.rdrMonthAndYearWrapper) {
            padding: 1rem 0.5rem;
            justify-content: center;
            position: sticky;
            top: -1px;
            background: white;
            z-index: 5;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid #f1f5f9;
          }
          
          /* Weekdays grid alignment */
          .calendar-wrapper :global(.rdrWeekDays) {
            display: grid !important;
            grid-template-columns: repeat(7, 1fr) !important;
            gap: 2px;
            padding: 0.5rem 0;
            margin: 0 !important;
            background: white;
          }
          
          .calendar-wrapper :global(.rdrWeekDay) {
            width: 100% !important;
            text-align: center;
            font-weight: 600;
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          /* Days grid - must match weekdays exactly */
          .calendar-wrapper :global(.rdrDays) {
            display: grid !important;
            grid-template-columns: repeat(7, 1fr) !important;
            gap: 2px;
            padding: 0;
            margin: 0 !important;
            padding-bottom: 1rem;
          }
          
          .calendar-wrapper :global(.rdrDay) {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1 !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: 40px;
          }
          
          @media (min-width: 640px) {
            .calendar-wrapper :global(.rdrDay) {
              min-height: 48px;
            }
          }
          
          .calendar-wrapper :global(.rdrDayNumber) {
            width: 100% !important;
            height: 100% !important;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .calendar-wrapper :global(.rdrDayNumber span) {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          /* Remove default selection styling */
          .calendar-wrapper :global(.rdrDayStartPreview),
          .calendar-wrapper :global(.rdrDayEndPreview),
          .calendar-wrapper :global(.rdrDayInPreview),
          .calendar-wrapper :global(.rdrStartEdge),
          .calendar-wrapper :global(.rdrEndEdge),
          .calendar-wrapper :global(.rdrInRange) {
            background: transparent !important;
            border: none !important;
          }
          
          .calendar-wrapper :global(.rdrDayDisabled) {
            background-color: transparent !important;
          }
          
          /* Prevent text selection */
          .calendar-wrapper * {
            -webkit-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          
          .calendar-wrapper :global(.rdrMonthsVertical) {
            align-items: stretch;
          }
          
          .calendar-wrapper :global(.rdrMonthsVertical .rdrMonth) {
            width: 100% !important;
          }
          
          .calendar-wrapper :global(.rdrMonthName) {
            text-align: center;
            font-weight: 600;
            padding: 0.75rem 0;
            font-size: 16px;
            color: #1e293b;
          }
          
          .calendar-wrapper :global(.rdrNextPrevButton) {
            background: #f1f5f9;
            border-radius: 0.5rem;
            width: 32px;
            height: 32px;
          }
          
          .calendar-wrapper :global(.rdrNextPrevButton:hover) {
            background: #e2e8f0;
          }
          
          /* Prevent scroll jump on date selection */
          .calendar-wrapper :global(.rdrMonthsVertical) {
            scroll-behavior: auto !important;
          }
          
          /* Add clear separation between months */
          .calendar-wrapper :global(.rdrMonth:not(:last-child)) {
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 1rem !important;
          }
          
          /* Ensure month header doesn't overlap with previous month's dates */
          .calendar-wrapper :global(.rdrMonth) {
            position: relative;
            padding-top: 0.5rem;
          }
        `}</style>
        
        <div className="calendar-wrapper w-full">
          <DateRange
            ranges={[
              { 
                startDate: range.startDate, 
                endDate: range.endDate, 
                key: 'selection' 
              }
            ]}
            onChange={(item) => {
              const selection = item.selection;
              if (selection && selection.startDate && selection.endDate) {
                onDateRangeChange(item);
              }
            }}
            minDate={new Date()}
            showDateDisplay={false}
            months={12} // Show 12 months so users can scroll to any month
            direction="vertical"
            moveRangeOnFirstSelection={false}
            editableDateInputs={false}
            rangeColors={['#3b82f6']}
            scroll={{ enabled: true }}
            dayContentRenderer={(date: Date) => {
              const ds = format(date, 'yyyy-MM-dd');
              const meta = dayMeta[ds];
              const status = meta?.status || 'available';
              const isExpired = date < new Date(new Date().setHours(0, 0, 0, 0));
              
              // Check if this date is in the current selection range
              const isInRange = range.startDate && range.endDate && date >= range.startDate && date <= range.endDate;
              const isStartDate = range.startDate && format(date, 'yyyy-MM-dd') === format(range.startDate, 'yyyy-MM-dd');
              const isEndDate = range.endDate && format(date, 'yyyy-MM-dd') === format(range.endDate, 'yyyy-MM-dd');
              
              // Check if this date is in the hover preview range (when selecting)
              let isInHoverRange = false;
              let isHoverStart = false;
              let isHoverEnd = false;
              
              if (isSelecting && hoveredDate && range.startDate) {
                const startDate = range.startDate < hoveredDate ? range.startDate : hoveredDate;
                const endDate = range.startDate < hoveredDate ? hoveredDate : range.startDate;
                isInHoverRange = date >= startDate && date <= endDate;
                isHoverStart = format(date, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd');
                isHoverEnd = format(date, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');
              }
              
              // Get status color classes - NO TOOLTIPS, JUST COLORS
              const getStatusColorClasses = () => {
                if (isExpired) {
                  return 'bg-slate-100 text-slate-400';
                }
                
                // Hover preview colors (while selecting)
                if (isInHoverRange) {
                  if (isHoverStart || isHoverEnd) {
                    return 'bg-blue-400 text-white border-2 border-blue-500 shadow-lg';
                  } else {
                    return 'bg-blue-50 text-blue-700 border border-blue-200';
                  }
                }
                
                // Final selection colors
                if (isInRange) {
                  if (isStartDate || isEndDate) {
                    return 'bg-blue-500 text-white border-2 border-blue-600';
                  } else {
                    return 'bg-blue-100 text-blue-800 border border-blue-300';
                  }
                }
                
                // Status colors only
                switch (status) {
                  case 'available':
                    return 'bg-emerald-500 text-white';
                  case 'partially-available':
                    return 'bg-blue-500 text-white';
                  case 'unavailable':
                    return 'bg-red-500 text-white';
                  case 'booked':
                    return 'bg-purple-500 text-white';
                  case 'maintenance':
                    return 'bg-orange-500 text-white';
                  case 'on-hold':
                    return 'bg-yellow-500 text-white';
                  default:
                    return 'bg-red-500 text-white';
                }
              };
              
              return (
                <div 
                  className={`
                    w-full h-full flex items-center justify-center rounded-full
                    touch-manipulation cursor-pointer
                    transition-all duration-150
                    ${getStatusColorClasses()}
                  `}
                  onMouseEnter={() => {
                    // Only handle hover for selection preview, no tooltips
                    if (isSelecting && range.startDate) {
                      setHoveredDate(date);
                    }
                  }}
                  onMouseLeave={() => {
                    if (isSelecting) {
                      setHoveredDate(null);
                    }
                  }}
                >
                  <span className="text-xs sm:text-sm font-bold select-none">
                    {date.getDate()}
                  </span>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* ===== Bottom Action Bar ===== */}
      <div className="sticky bottom-0 bg-white border-t px-4 py-3 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-900">
            {selectionCount} selected
          </div>
          <div className="text-xs text-slate-500">
            {format(range.startDate, 'MMM d')} → {format(range.endDate, 'MMM d')}
          </div>
        </div>
        <Button
  onClick={() => {
    if (selectionType === 'range') {
      addSelectionFromRange();
    } else {
      addSelectionSingle();
    }
    setIsCalendarOpen(false);
  }}
  disabled={!range.startDate || !range.endDate}
  className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
>
  {selectionType === 'range' ? 'Add Date Range' : 'Add Single Date'}
</Button>

        {/* <Button
          onClick={() => setIsCalendarOpen(false)}
          className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          Done
        </Button> */}
      </div>
    </div>
  </div>
)}

 {/* {isCalendarOpen && (
  <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute bottom-0 w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto p-5">
        
       
        <button
          onClick={() => setIsCalendarOpen(false)}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

       
        <div className={availabilityCalendarStyles.availabilityCalendarWrapper}>
                <DateRange
                  ranges={[{ startDate: range.startDate, endDate: range.endDate, key: 'selection' }]}
                  onChange={onDateRangeChange}
                  minDate={new Date()}
                  showDateDisplay={false}
                  months={1}
                  direction="horizontal"
                  moveRangeOnFirstSelection={true}
                  editableDateInputs={false}
                  rangeColors={['#3b82f6']}
                   dayContentRenderer={(date: Date) => {
                     const ds = format(date, 'yyyy-MM-dd');
                     const meta = dayMeta[ds];
                     // FIXED: Default to 'available' to match room page behavior (was 'unavailable')
                     const status = meta?.status || 'available';
                     const isExpired = date < new Date(new Date().setHours(0, 0, 0, 0));
                     
                     // Check if this date is in the current selection range
                     const isInRange = date >= range.startDate && date <= range.endDate;
                     const isStartDate = format(date, 'yyyy-MM-dd') === format(range.startDate, 'yyyy-MM-dd');
                     const isEndDate = format(date, 'yyyy-MM-dd') === format(range.endDate, 'yyyy-MM-dd');
                     
                     // Check if this date is in the hover preview range (when selecting)
                     let isInHoverRange = false;
                     let isHoverStart = false;
                     let isHoverEnd = false;
                     
                     if (isSelecting && hoveredDate && range.startDate) {
                       const startDate = range.startDate < hoveredDate ? range.startDate : hoveredDate;
                       const endDate = range.startDate < hoveredDate ? hoveredDate : range.startDate;
                       isInHoverRange = date >= startDate && date <= endDate;
                       isHoverStart = format(date, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd');
                       isHoverEnd = format(date, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');
                     }
                     
                     // Get status color classes - prioritize selection colors
                     const getStatusColorClasses = () => {
                       if (isExpired) {
                         return 'bg-slate-100 text-slate-400';
                       }
                       
                       // If date is in hover preview range (while selecting), use preview colors
                       if (isInHoverRange) {
                         if (isHoverStart || isHoverEnd) {
                           return 'bg-blue-400 text-white border-2 border-blue-500 shadow-lg';
                         } else {
                           return 'bg-blue-50 text-blue-700 border border-blue-200';
                         }
                       }
                       
                       // If date is in final selection range, use selection colors
                       if (isInRange) {
                         if (isStartDate || isEndDate) {
                           return 'bg-blue-500 text-white border-2 border-blue-600';
                         } else {
                           return 'bg-blue-100 text-blue-800 border border-blue-300';
                         }
                       }
                       
                       // Otherwise use status colors
                       switch (status) {
                         case 'available':
                           return 'bg-emerald-500 text-white';
                         case 'partially-available':
                           return 'bg-blue-500 text-white';
                         case 'unavailable':
                           return 'bg-red-500 text-white';
                         case 'booked':
                           return 'bg-purple-500 text-white';
                         case 'maintenance':
                           return 'bg-orange-500 text-white';
                         case 'on-hold':
                           return 'bg-yellow-500 text-white';
                         default:
                           return 'bg-red-500 text-white';
                       }
                     };
                     
                    // Helper to format time
                    const formatTime12Hour = (timeStr: string) => {
                      if (!timeStr) return '';
                      const [hours, minutes] = timeStr.split(':').map(Number);
                      const period = hours >= 12 ? 'PM' : 'AM';
                      const displayHours = hours % 12 || 12;
                      return `${displayHours}:${minutes?.toString().padStart(2, '0') || '00'} ${period}`;
                    };
                    
                    return (
                      <div 
                        className={`
                          w-full h-full flex items-center justify-center rounded-full relative
                          ${getStatusColorClasses()}
                        `}
                        onMouseEnter={() => {
                          if (isSelecting && range.startDate) {
                            setHoveredDate(date);
                          }
                          // Show tooltip for booked dates or dates with hour restrictions
                          if ((status === 'booked' || (status === 'available' && meta?.availableHours && meta.availableHours.length > 0)) && !isExpired) {
                            setTooltipDate(ds);
                          }
                        }}
                        onMouseLeave={() => {
                          if (isSelecting) {
                            setHoveredDate(null);
                          }
                          setTooltipDate(null);
                        }}
                      >
                        <span className="text-sm font-bold">
                          {date.getDate()}
                        </span>
                        
                       
                        {tooltipDate === ds && status === 'booked' && !isExpired && (
                          <div className="absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                            <div className="font-semibold mb-1">Booked</div>
                            {(meta?.checkInDate || meta?.checkInTime) && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-blue-400" />
                                <span>In: {meta?.checkInDate ? format(new Date(meta.checkInDate), 'MMM d') : ''}{meta?.checkInTime ? `, ${formatTime12Hour(meta.checkInTime)}` : ''}</span>
                              </div>
                            )}
                            {(meta?.checkOutDate || meta?.checkOutTime) && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-green-400" />
                                <span>Out: {meta?.checkOutDate ? format(new Date(meta.checkOutDate), 'MMM d') : ''}{meta?.checkOutTime ? `, ${formatTime12Hour(meta.checkOutTime)}` : ''}</span>
                              </div>
                            )}
                            {meta?.guestName && (
                              <div className="text-gray-300 mt-1">
                                Guest: {meta.guestName}
                              </div>
                            )}
                          
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}

                       
                        {tooltipDate === ds && status === 'available' && !isExpired && ((meta?.availableHours && meta.availableHours.length > 0) || (meta?.unavailableHours && meta.unavailableHours.length > 0)) && (
                          <div className="absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg shadow-lg">
                            {(meta?.availableHours && meta.availableHours.length > 0) && (
                              <>
                                <div className="font-semibold mb-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Available Hours
                                </div>
                                {meta.availableHours.map((range, idx) => (
                                  <div key={idx} className="text-blue-200">
                                    {formatTime12Hour(range.startTime)} - {formatTime12Hour(range.endTime)}
                                  </div>
                                ))}
                              </>
                            )}
                            {(meta?.unavailableHours && meta.unavailableHours.length > 0) && (
                              <>
                                {meta?.availableHours && meta.availableHours.length > 0 && <div className="mt-2 pt-2 border-t border-blue-500"></div>}
                                <div className="font-semibold mb-1 flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  Unavailable Hours
                                </div>
                                {meta.unavailableHours.map((range, idx) => (
                                  <div key={idx} className="text-red-200">
                                    {formatTime12Hour(range.startTime)} - {formatTime12Hour(range.endTime)}
                                  </div>
                                ))}
                              </>
                            )}
                           
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
                          </div>
                        )}

                       
                        {tooltipDate === ds && status === 'on-hold' && !isExpired && (
                          <div className="absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-yellow-600 text-white text-xs rounded-lg shadow-lg">
                            <div className="font-semibold mb-1 flex items-center gap-1">
                              <Pause className="w-3 h-3" />
                              On Hold
                            </div>
                            {meta?.onHoldHours && meta.onHoldHours.length > 0 ? (
                              <>
                                <div className="text-yellow-200">On-hold hours:</div>
                                {meta.onHoldHours.map((range, idx) => (
                                  <div key={idx} className="text-yellow-200">
                                    {formatTime12Hour(range.startTime)} - {formatTime12Hour(range.endTime)}
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="text-yellow-200">Entire day on hold</div>
                            )}
                           
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-yellow-600"></div>
                          </div>
                        )}

                      
                        {tooltipDate === ds && status === 'unavailable' && !isExpired && (
                          <div className="absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                            <div className="font-semibold mb-1 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Unavailable
                            </div>
                            <div className="text-red-200 text-[10px]">
                              This date is not available for booking
                            </div>
                           
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-600"></div>
                          </div>
                        )}
                      </div>
                    );
                   }}
                />
              </div>
      
      </div>
      </div>
)}   */}

    </div>
  );
}


