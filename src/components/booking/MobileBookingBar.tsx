"use client";

import Button from "@/shared/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertCircle, Calendar, CheckCircle, Clock, Zap } from "lucide-react";

interface MobileBookingBarProps {
  property: any;
  dateRange: any;
  nights: number;
  pricing?: any;

  availabilityChecked: boolean;
  availabilityLoading: boolean;
  availabilityError?: string;
  selectionStep: string;
  ownerProperty: any;
  setShowTimePrompt: (val: boolean) => void;

  formatPrice: (value: number) => string;
  formatDate: (date: Date) => string;

  setShowDatePicker: (val: boolean) => void;
  setSelectionStep: (step: string) => void;

  checkAvailability: () => void;
  /** now this should be handleCompleteBooking */
  handleBooking: () => void;
  setTimeConfirmed: (val: boolean) => void;

  // Inline time picker
  checkInTimeStr?: string;
  setCheckInTimeStr?: (val: string) => void;
  timeOptions?: string[];
  formatTimeHour?: (hour: number) => string;
  isHourlyProperty?: boolean;
}

export default function MobileBookingBar({
  property,
  dateRange,
  nights,
  pricing,
  availabilityChecked,
  availabilityLoading,
  availabilityError,
  selectionStep,
  formatPrice,
  formatDate,
  setShowDatePicker,
  setSelectionStep,
  checkAvailability,
  handleBooking,
  ownerProperty,
  setShowTimePrompt,
  setTimeConfirmed,
  checkInTimeStr,
  setCheckInTimeStr,
  timeOptions = [],
  formatTimeHour,
  isHourlyProperty = false,
}: MobileBookingBarProps) {
  const router = useRouter();

  /* 🔔 Haptic Feedback (mobile safe) */
  const haptic = (type: "light" | "medium" = "light") => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(type === "light" ? 10 : 20);
    }
  };

  /* 💰 Price logic */
  const pricingTotal = pricing?.total ?? pricing?.totalAmount;
  const hasPricingTotal = typeof pricingTotal === "number" && pricingTotal > 0;
  const displayPrice = hasPricingTotal
    ? formatPrice(pricingTotal)
    : formatPrice(property?.pricing?.basePrice || 0);

  const priceLabel = hasPricingTotal ? " total" : " / night";

  /* 🕐 Parse next available time from error */
  const maintenanceMatch = availabilityError?.match(/after\s+([\d:]+\s*[AP]M)/i);
  const nextAvailableTime = maintenanceMatch?.[1] ?? null;

  /* 📅 Parse "next available date" style errors — backend may say "Available from Mar 15" */
  const dateMatch = availabilityError?.match(/(?:available\s+(?:from|after|on)\s+)([A-Za-z]+\s+\d{1,2}(?:,?\s*\d{4})?)/i);
  const nextAvailableDate = dateMatch?.[1] ?? null;

  const showError = !!availabilityError
    && !availabilityError.toLowerCase().includes("please select")
    && selectionStep === "complete";

  const datesSelected = selectionStep === "complete" && !!dateRange.startDate && !!dateRange.endDate;

  return (
    <AnimatePresence>
      <motion.div
        key="mobile-booking-bar"
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="lg:hidden fixed bottom-0 inset-x-0 z-50"
      >
        {!ownerProperty ? (
          <div className="bg-white border-t shadow-2xl px-4 pt-3 pb-4 space-y-3">

            {/* ─── Price + Edit Row ─── */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {displayPrice}
                  <span className="text-sm font-normal text-gray-600">{priceLabel}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {dateRange.startDate && dateRange.endDate
                    ? `${formatDate(dateRange.startDate)} – ${formatDate(dateRange.endDate)}`
                    : "Select dates"}
                </div>
                {availabilityChecked && (
                  <div className="text-xs text-green-600 font-medium">
                    {nights} night{nights > 1 ? "s" : ""} · Available ✓
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  haptic();
                  setShowDatePicker(true);
                  setTimeConfirmed(true);
                  setSelectionStep("checkin");
                }}
                className="text-sm font-semibold text-indigo-600 px-2 py-1"
              >
                Edit
              </button>
            </div>

            {/* ─── Inline Time Picker (compact stepper — visible when dates selected + hourly property) ─── */}
            {datesSelected && isHourlyProperty && checkInTimeStr && setCheckInTimeStr && timeOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#4285F4]" />
                    <span className="text-sm font-medium text-blue-800">Check-in Time</span>
                  </div>
                  {/* Compact Stepper */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        haptic();
                        const idx = timeOptions.indexOf(checkInTimeStr);
                        const prev = timeOptions[(idx - 1 + timeOptions.length) % timeOptions.length];
                        setCheckInTimeStr(prev);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-blue-300 text-[#4285F4] font-bold text-base hover:bg-blue-100 active:scale-95 transition-all"
                    >
                      ‹
                    </button>
                    <span className="text-sm font-bold text-blue-700 min-w-[80px] text-center">
                      {(() => {
                        const [h] = checkInTimeStr.split(":").map(Number);
                        return formatTimeHour ? formatTimeHour(h) : checkInTimeStr;
                      })()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        haptic();
                        const idx = timeOptions.indexOf(checkInTimeStr);
                        const next = timeOptions[(idx + 1) % timeOptions.length];
                        setCheckInTimeStr(next);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-blue-300 text-[#4285F4] font-bold text-base hover:bg-blue-100 active:scale-95 transition-all"
                    >
                      ›
                    </button>
                  </div>
                </div>
                <p className="text-xs text-blue-500 mt-1">
                  Tap arrows to pick your check-in time
                </p>
              </motion.div>
            )}

            {/* ─── Availability Error Card ─── */}
            {showError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl overflow-hidden border border-orange-200"
              >
                {/* Header */}
                <div className="bg-orange-50 px-3 py-2 flex items-center gap-2 border-b border-orange-100">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-orange-800">Not Available</span>
                </div>

                {/* Body */}
                <div className="bg-white px-3 py-2 space-y-2">
                  {nextAvailableTime ? (
                    /* Maintenance conflict — show next available time */
                    <>
                      <p className="text-xs text-gray-600">
                        Maintenance period ends before your selected check-in time.
                      </p>
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide">Next Available</p>
                          <p className="text-sm font-bold text-emerald-800">Check-in after {nextAvailableTime}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Please pick a time after {nextAvailableTime}
                      </p>
                    </>
                  ) : nextAvailableDate ? (
                    /* Next available date from backend */
                    <>
                      <p className="text-xs text-gray-600">
                        Your selected dates are fully booked.
                      </p>
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-emerald-700 font-medium uppercase tracking-wide">Next Available Date</p>
                          <p className="text-sm font-bold text-emerald-800">{nextAvailableDate}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Generic unavailability */
                    <>
                      <p className="text-xs text-gray-600">{availabilityError}</p>
                      <p className="text-xs text-gray-400">
                        Please choose different dates or adjust your check-in time.
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── CTA Button ─── */}
            <Button
              onClick={() => {
                haptic("medium");
                if (!dateRange.startDate || !dateRange.endDate || selectionStep !== "complete") {
                  setShowDatePicker(true);
                  return;
                }
                handleBooking(); // This is now handleCompleteBooking
              }}
              disabled={availabilityLoading || selectionStep !== "complete"}
              className={`w-full py-3 rounded-xl font-bold text-base transition-all duration-300 shadow-lg ${selectionStep === "complete"
                ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {availabilityLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Checking availability...
                </span>
              ) : selectionStep !== "complete" ? (
                <span className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {selectionStep === "checkin" ? "Select Check-in Date" : "Select Check-out Date"}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Complete Booking
                </span>
              )}
            </Button>

          </div>
        ) : (
          <div className="bg-white border-t shadow-2xl px-4 py-3">
            <Button
              onClick={() => router.push(`/host/property/${property.id}`)}
              className="w-full py-3 rounded-xl font-semibold bg-[#4285f4] text-white"
            >
              Edit your property
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
