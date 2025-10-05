"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';
import { availabilityCalendarStyles } from '@/styles/calendars';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { apiClient } from '@/infrastructure/api/clients/api-client';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Trash2, Save, AlertTriangle, Wrench, Pause, Eye, ExternalLink } from 'lucide-react';

type TargetType = 'listing' | 'service';

interface AvailabilityManagerProps {
  targetType: TargetType;
  targetId: string;
}

interface SelectionItem {
  date: Date;
  status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold';
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
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold'>('available');
  const [reason, setReason] = useState<string>('');
  const [selections, setSelections] = useState<SelectionItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dayMeta, setDayMeta] = useState<Record<string, { status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold' }>>({});

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
          const map: Record<string, { status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold' }> = {};
          
          // Process existing availability records
          arr.forEach((it: any) => {
            const d = format(new Date(it.date), 'yyyy-MM-dd');
            // Map backend status to our frontend status
            let status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold';
            switch (it.status) {
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
              case 'blocked':
              default:
                status = 'unavailable';
                break;
            }
            map[d] = { status };
          });
          
          // Fill in missing dates as unavailable (default state)
          const today = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 3); // Show next 3 months
          
          const currentDate = new Date(today);
          while (currentDate <= endDate) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            if (!map[dateStr]) {
              map[dateStr] = { status: 'unavailable' };
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          setDayMeta(map);
        } else {
          const availRes = await apiClient.getServiceAvailability(targetId);
          const slots = (availRes as any)?.data?.availableSlots || (availRes as any)?.data?.data?.availableSlots || [];
          const map: Record<string, { status: 'available' | 'unavailable' | 'booked' | 'maintenance' | 'on-hold' }> = {};
          
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
          
          // Fill in missing dates as unavailable for services too
          const today = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 3);
          
          const currentDate = new Date(today);
          while (currentDate <= endDate) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            if (!map[dateStr]) {
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
          
          const mapped = {
            date: format(s.date, 'yyyy-MM-dd'),
            status: backendStatus,
            reason: s.reason
          };
          console.log('📅 Mapping selection:', { frontend: s.status, backend: backendStatus, date: mapped.date });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Manage Availability
              </h1>
              <p className="text-lg text-slate-600 font-medium">
                Set your {targetType === 'listing' ? 'property' : 'service'} availability calendar
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  if (targetType === 'listing') {
                    router.push(`/rooms/${targetId}`);
                  } else {
                    router.push(`/services/${targetId}`);
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View {targetType === 'listing' ? 'Property' : 'Service'}
              </Button>
              <Button 
                onClick={() => router.back()} 
                variant="outline"
                className="px-6 py-3 text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
              >
                ← Back
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">{success}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Control Panel - Left Sidebar */}
          <div className="xl:col-span-4 order-1 xl:order-none">
            <Card className="p-6 space-y-6 rounded-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="text-center pb-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Quick Controls</h2>
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
                    onClick={() => setSelectionType('range')}
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
                    onClick={() => setSelectionType('single')}
                  >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Single Day
                  </button>
                </div>
              </div>

              {/* Status Selection */}
              <div>
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

              {/* Date Input */}
              {selectionType === 'single' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Select Date</label>
                  <input
                    type="date"
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    value={format(singleDate, 'yyyy-MM-dd')}
                    onChange={e => {
                      const selectedDate = new Date(e.target.value);
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
              <div className="space-y-3">
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
              <div className="space-y-3 pt-4 border-t border-slate-200">
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
            </Card>
          </div>

          {/* Calendar - Right Side */}
          <div className="xl:col-span-8 order-2 xl:order-none">
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
                     const status = meta?.status || 'unavailable';
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
                           ${getStatusColorClasses()}
                         `}
                         onMouseEnter={() => {
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
                         <span className="text-sm font-bold">
                           {date.getDate()}
                         </span>
                       </div>
                     );
                   }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selections Summary */}
        <div className="mt-8">
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
      </div>
    </div>
  );
}


