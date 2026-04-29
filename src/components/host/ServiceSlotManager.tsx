"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  format, addDays, startOfDay, isBefore, isSameDay,
  addMinutes, addHours, parse,
} from "date-fns";
import {
  Calendar, Clock, Plus, Trash2, Save, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, ArrowLeft, Info, Loader2,
  AlertTriangle, RefreshCw, Pause,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";

/* ─── Types ───────────────────────────────────────────────── */
type SlotStatus = "available" | "unavailable" | "on-hold";

interface GeneratedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
}

interface DayData {
  slots: GeneratedSlot[];
}

/* ─── Constants ───────────────────────────────────────────── */
const STATUS_CONFIG: Record<SlotStatus, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  available: {
    label: "Available",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-400",
    icon: <CheckCircle size={12} />,
  },
  unavailable: {
    label: "Unavailable",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-300",
    icon: <XCircle size={12} />,
  },
  "on-hold": {
    label: "On Hold",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-300",
    icon: <Pause size={12} />,
  },
};

const STATUS_CYCLE: SlotStatus[] = ["available", "unavailable", "on-hold"];

/* ─── Helpers ─────────────────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function durationToMinutes(value: number, unit: string): number {
  switch (unit) {
    case "minutes": return value;
    case "hours": return value * 60;
    case "days": return value * 60 * 24;
    default: return value;
  }
}

function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

function generateSlotsFromWindow(
  date: Date,
  windowStart: string,   // "HH:MM"
  windowEnd: string,     // "HH:MM"
  durationMinutes: number,
): GeneratedSlot[] {
  const [sh, sm] = windowStart.split(":").map(Number);
  const [eh, em] = windowEnd.split(":").map(Number);

  const base = startOfDay(date);
  let current = addMinutes(addHours(base, sh), sm);
  const end = addMinutes(addHours(base, eh), em);

  const slots: GeneratedSlot[] = [];

  while (current.getTime() + durationMinutes * 60_000 <= end.getTime()) {
    const slotEnd = new Date(current.getTime() + durationMinutes * 60_000);
    slots.push({ id: uid(), startTime: new Date(current), endTime: slotEnd, status: "available" });
    current = addMinutes(current, durationMinutes);
  }

  return slots;
}

/* ─── Component ─────────────────────────────────────────────── */
interface Props {
  serviceId: string;
}

export default function ServiceSlotManager({ serviceId }: Props) {
  const router = useRouter();
  const today = startOfDay(new Date());

  /* ── Service (for duration) ── */
  const [serviceDuration, setServiceDuration] = useState<{ value: number; unit: string }>({ value: 60, unit: "minutes" });
  const [serviceTitle, setServiceTitle] = useState("");

  /* ── Calendar nav ── */
  const [weekStart, setWeekStart] = useState<Date>(today);
  const [activeDate, setActiveDate] = useState<Date | null>(null);

  /* ── Slot data: keyed by "yyyy-MM-dd" ── */
  const [dayMap, setDayMap] = useState<Record<string, DayData>>({});
  const [pristine, setPristine] = useState<string>("");  // JSON snapshot for change detection

  /* ── Window generator inputs ── */
  const [winStart, setWinStart] = useState("09:00");
  const [winEnd, setWinEnd] = useState("18:00");

  /* ── UI state ── */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /* ─── Load service + existing slots on mount ────────────── */
  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);

    Promise.all([
      apiClient.getService(serviceId),
      apiClient.getServiceAvailability(serviceId),
    ])
      .then(([svcRes, availRes]: [any, any]) => {
        // Service duration & title
        const svc = svcRes?.data?.service;
        if (svc?.duration) setServiceDuration(svc.duration);
        if (svc?.title) setServiceTitle(svc.title);

        // Existing slots
        const rawSlots: any[] = availRes?.data?.availableSlots || [];
        const map: Record<string, DayData> = {};
        rawSlots.forEach((s: any) => {
          const ds = format(new Date(s.startTime), "yyyy-MM-dd");
          if (!map[ds]) map[ds] = { slots: [] };
          map[ds].slots.push({
            id: uid(),
            startTime: new Date(s.startTime),
            endTime: new Date(s.endTime),
            status: (s.status as SlotStatus) || (s.isAvailable ? "available" : "unavailable"),
          });
        });

        setDayMap(map);
        setPristine(JSON.stringify(map, slotReplacer));
      })
      .catch((e: any) => setErrorMsg(e?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, [serviceId]);

  /* ─── Derived ────────────────────────────────────────────── */
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const activeDateStr = activeDate ? format(activeDate, "yyyy-MM-dd") : null;
  const activeSlots = activeDateStr ? dayMap[activeDateStr]?.slots ?? [] : [];
  const durationMins = durationToMinutes(serviceDuration.value, serviceDuration.unit);
  const configuredDates = Object.keys(dayMap).filter(ds => dayMap[ds]?.slots?.length > 0).sort();

  const availableCount = activeSlots.filter(s => s.status === "available").length;
  const totalCount = activeSlots.length;

  /* detect unsaved changes */
  const currentJson = JSON.stringify(dayMap, slotReplacer);
  const hasChanges = currentJson !== pristine;

  /* ─── Generate slots ──────────────────────────────────────── */
  const handleGenerate = () => {
    if (!activeDateStr || !activeDate) return;
    const [sh, sm] = winStart.split(":").map(Number);
    const [eh, em] = winEnd.split(":").map(Number);
    if (eh * 60 + em <= sh * 60 + sm) {
      setErrorMsg("End time must be after start time.");
      return;
    }
    if (durationMins <= 0) {
      setErrorMsg("Service duration is invalid.");
      return;
    }

    // Warn if overwriting existing
    const existing = dayMap[activeDateStr]?.slots ?? [];
    if (existing.length > 0 && !confirm(`This will replace ${existing.length} existing slot(s) for this date. Continue?`)) return;

    const newSlots = generateSlotsFromWindow(activeDate, winStart, winEnd, durationMins);
    if (newSlots.length === 0) {
      setErrorMsg(`Window is too small for the ${serviceDuration.value} ${serviceDuration.unit} service duration.`);
      return;
    }

    setDayMap(prev => ({ ...prev, [activeDateStr]: { slots: newSlots } }));
    setErrorMsg(null);
  };

  /* ─── Toggle slot status ─────────────────────────────────── */
  const toggleSlotStatus = useCallback((slotId: string) => {
    if (!activeDateStr) return;
    setDayMap(prev => {
      const day = prev[activeDateStr];
      if (!day) return prev;
      return {
        ...prev,
        [activeDateStr]: {
          slots: day.slots.map(s => {
            if (s.id !== slotId) return s;
            const idx = STATUS_CYCLE.indexOf(s.status);
            return { ...s, status: STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length] };
          }),
        },
      };
    });
  }, [activeDateStr]);

  /* ─── Bulk toggle ────────────────────────────────────────── */
  const setAllStatus = (status: SlotStatus) => {
    if (!activeDateStr) return;
    setDayMap(prev => {
      const day = prev[activeDateStr];
      if (!day) return prev;
      return { ...prev, [activeDateStr]: { slots: day.slots.map(s => ({ ...s, status })) } };
    });
  };

  /* ─── Remove day ────────────────────────────────────────────── */
  const removeDay = (ds: string) => {
    setDayMap(prev => { const n = { ...prev }; delete n[ds]; return n; });
    if (activeDateStr === ds) setActiveDate(null);
  };

  /* ─── Save to backend ───────────────────────────────────────── */
  const saveAll = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const allSlots = Object.values(dayMap).flatMap(day =>
      day.slots.map(s => ({
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        isAvailable: s.status === "available",
        status: s.status,
      }))
    );

    try {
      await apiClient.updateServiceAvailability(serviceId, allSlots as any);
      const avail = allSlots.filter(s => s.isAvailable).length;
      setSuccessMsg(`✅ Saved ${allSlots.length} slot(s) across ${configuredDates.length} date(s) · ${avail} available`);
      setPristine(JSON.stringify(dayMap, slotReplacer));
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to save slots");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-medium mb-3 transition-colors"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <h1 className="text-2xl font-black text-slate-900">Manage Time Slots</h1>
          {serviceTitle && (
            <p className="text-slate-500 text-sm mt-0.5">
              {serviceTitle} · {serviceDuration.value} {serviceDuration.unit} per slot
            </p>
          )}
        </div>

        {/* Status banners */}
        {(successMsg || errorMsg) && (
          <div className={`mb-5 flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium ${successMsg ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
            {successMsg ? <CheckCircle size={15} /> : <XCircle size={15} />}
            <span className="flex-1">{successMsg || errorMsg}</span>
            <button onClick={() => { setSuccessMsg(null); setErrorMsg(null); }} className="opacity-50 hover:opacity-100 text-lg leading-none">×</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={36} className="animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* ══════════ LEFT: Calendar + Editor ══════════ */}
            <div className="lg:col-span-3 space-y-4">

              {/* Week calendar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-700">{format(weekStart, "MMMM yyyy")}</h2>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setWeekStart(d => addDays(d, -7))}
                      disabled={isBefore(addDays(weekStart, -1), today)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setWeekStart(d => addDays(d, 7))} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 mb-1.5">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {weekDates.map(date => {
                    const ds = format(date, "yyyy-MM-dd");
                    const isPast = isBefore(date, today);
                    const isActive = activeDate && isSameDay(date, activeDate);
                    const isToday = isSameDay(date, today);
                    const daySlots = dayMap[ds]?.slots ?? [];
                    const hasAvail = daySlots.some(s => s.status === "available");
                    const hasMixed = daySlots.length > 0;

                    return (
                      <button
                        key={ds}
                        disabled={isPast}
                        onClick={() => setActiveDate(date)}
                        className={`
                          flex flex-col items-center py-2 rounded-xl transition-all text-sm
                          ${isPast ? "text-slate-300 cursor-not-allowed" : isActive ? "bg-slate-900 text-white shadow-md" : "hover:bg-slate-100 text-slate-700 cursor-pointer"}
                          ${isToday && !isActive ? "ring-2 ring-purple-500" : ""}
                        `}
                      >
                        <span className="font-semibold text-base leading-none">{format(date, "d")}</span>
                        {hasMixed && (
                          <span className={`mt-1 w-1.5 h-1.5 rounded-full ${isActive ? (hasAvail ? "bg-green-400" : "bg-red-400") : (hasAvail ? "bg-green-500" : "bg-red-400")}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-3">
                  🟢 Has available slots · 🔴 All unavailable · Click date to edit
                </p>
              </div>

              {/* Slot Editor panel */}
              {activeDate ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                  {/* Panel header */}
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                      <Clock size={15} className="text-purple-500" />
                      {format(activeDate, "EEEE, MMMM d")}
                    </h3>
                    {activeSlots.length > 0 && (
                      <span className="text-[11px] font-semibold text-slate-500">
                        {availableCount}/{totalCount} available
                      </span>
                    )}
                  </div>

                  {/* Generator section */}
                  <div className="px-5 py-4 bg-purple-50/50 border-b border-purple-100">
                    <p className="text-xs font-semibold text-purple-700 mb-3 flex items-center gap-1.5">
                      <RefreshCw size={12} /> Auto-Generate Slots
                    </p>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">From</label>
                        <input
                          type="time"
                          value={winStart}
                          onChange={e => setWinStart(e.target.value)}
                          className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 bg-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase">To</label>
                        <input
                          type="time"
                          value={winEnd}
                          onChange={e => setWinEnd(e.target.value)}
                          className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 bg-white"
                        />
                      </div>
                      <button
                        onClick={handleGenerate}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition"
                      >
                        <RefreshCw size={13} /> Generate
                      </button>
                    </div>
                    <p className="text-[10px] text-purple-600 mt-2 opacity-70">
                      Will create {serviceDuration.value}-{serviceDuration.unit} slots · tap each slot to toggle status
                    </p>
                  </div>

                  {/* Slots grid */}
                  <div className="p-5">
                    {activeSlots.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Calendar size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No slots yet — use "Generate" above to create them.</p>
                      </div>
                    ) : (
                      <>
                        {/* Bulk actions */}
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <span className="text-[11px] text-slate-400 font-medium mr-1">Set all:</span>
                          {(Object.entries(STATUS_CONFIG) as [SlotStatus, typeof STATUS_CONFIG[SlotStatus]][]).map(([status, cfg]) => (
                            <button
                              key={status}
                              onClick={() => setAllStatus(status)}
                              className={`flex items-center gap-1 text-[10px] font-semibold px-2. py-1 px-2 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} transition hover:opacity-80`}
                            >
                              {cfg.icon} {cfg.label}
                            </button>
                          ))}
                        </div>

                        {/* Slot chips */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {activeSlots.map(slot => {
                            const cfg = STATUS_CONFIG[slot.status];
                            return (
                              <button
                                key={slot.id}
                                onClick={() => toggleSlotStatus(slot.id)}
                                title={`Click to change status. Currently: ${cfg.label}`}
                                className={`
                                  flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border-2 font-semibold text-xs
                                  transition-all duration-150 hover:shadow-md active:scale-95
                                  ${cfg.bg} ${cfg.text} ${cfg.border}
                                `}
                              >
                                <span className="flex items-center gap-1 mb-0.5">{cfg.icon} {format(slot.startTime, "h:mm a")}</span>
                                <span className={`text-[9px] font-bold uppercase opacity-60`}>{cfg.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        <p className="text-[10px] text-slate-400 text-center mt-3">
                          Click any slot to cycle: Available → Unavailable → On Hold
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/60 rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center text-slate-400">
                  <Calendar size={32} className="mx-auto mb-2 opacity-25" />
                  <p className="text-sm">Select a date above to configure slots</p>
                </div>
              )}
            </div>

            {/* ══════════ RIGHT: Summary + Save ══════════ */}
            <div className="lg:col-span-2 space-y-4">

              {/* Save card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <Save size={16} className="text-purple-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Summary</h3>
                  {hasChanges && (
                    <span className="ml-auto flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                      <AlertTriangle size={11} /> Unsaved
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-1.5 mb-5">
                  {[
                    ["Dates configured", configuredDates.length],
                    ["Total slots", Object.values(dayMap).reduce((s, d) => s + d.slots.length, 0)],
                    ["Available slots", Object.values(dayMap).reduce((s, d) => s + d.slots.filter(sl => sl.status === "available").length, 0)],
                    ["Unavailable / On hold", Object.values(dayMap).reduce((s, d) => s + d.slots.filter(sl => sl.status !== "available").length, 0)],
                  ].map(([label, val]) => (
                    <div key={String(label)} className="flex justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveAll}
                  disabled={saving || !hasChanges}
                  className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${saving || !hasChanges
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                    }`}
                >
                  {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save All Slots</>}
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-2">Replaces all existing slot data</p>
              </div>

              {/* Slot status legend */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Status Legend</h4>
                <div className="space-y-2">
                  {(Object.entries(STATUS_CONFIG) as [SlotStatus, typeof STATUS_CONFIG[SlotStatus]][]).map(([status, cfg]) => (
                    <div key={status} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                      <span className={cfg.text}>{cfg.icon}</span>
                      <div>
                        <p className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</p>
                        <p className="text-[10px] text-slate-400">
                          {status === "available" ? "Visible & bookable by guests" : status === "unavailable" ? "Hidden from guests" : "Temporarily blocked, hidden"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configured dates with quick-access */}
              {configuredDates.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-500" /> Configured Dates
                  </h4>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {configuredDates.map(ds => {
                      const day = dayMap[ds];
                      const date = new Date(ds + "T00:00:00");
                      const avail = day.slots.filter(s => s.status === "available").length;
                      const isActive = activeDateStr === ds;
                      return (
                        <div
                          key={ds}
                          onClick={() => { setActiveDate(date); setWeekStart(startOfDay(date)); }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${isActive ? "border-purple-200 bg-purple-50" : "border-slate-100 hover:bg-slate-50"}`}
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-700">{format(date, "EEE, MMM d")}</p>
                            <p className="text-[10px] text-slate-400">{avail}/{day.slots.length} available</p>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); removeDay(ds); }}
                            className="p-1 text-red-300 hover:text-red-500 rounded-lg transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info tip */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex gap-2">
                  <Info size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-blue-600 space-y-1">
                    <p className="font-semibold">How it works</p>
                    <p>Enter your working hours → click <strong>Generate</strong> → slots split automatically by service duration.</p>
                    <p>Click any slot to mark it <strong>Unavailable</strong> (lunch break, break time) or <strong>On Hold</strong>.</p>
                    <p>Only <strong>Available</strong> slots appear on the booking page for guests.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* JSON replacer that converts Dates to ISO strings for comparison */
function slotReplacer(_key: string, value: any) {
  if (value instanceof Date) return value.toISOString();
  return value;
}
