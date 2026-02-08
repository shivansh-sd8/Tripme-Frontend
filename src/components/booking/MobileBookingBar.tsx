"use client";

import Button from "@/shared/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface MobileBookingBarProps {
  property: any;
  dateRange: any;
  nights: number;
  pricing?: any;

  availabilityChecked: boolean;
  availabilityLoading: boolean;
  selectionStep: string;
  ownerProperty: any;
  setShowTimePrompt: (val: boolean) => void;
  // setShowTimeSelector: (val: boolean) => void;

  formatPrice: (value: number) => string;
  formatDate: (date: Date) => string;

  setShowDatePicker: (val: boolean) => void;
  setSelectionStep: (step: string) => void;

  checkAvailability: () => void;
  handleBooking: () => void;
  setTimeConfirmed: (val: boolean) => void;
}

export default function MobileBookingBar({
  property,
  dateRange,
  nights,
  pricing,
  availabilityChecked,
  availabilityLoading,
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
}: MobileBookingBarProps) {
  const router = useRouter();
  


  /* 🔔 Haptic Feedback (mobile safe) */
  const haptic = (type: "light" | "medium" = "light") => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(type === "light" ? 10 : 20);
    }
  };

  /* 🔽 Auto-collapse after availability */
  const collapsed = availabilityChecked;

  /* 💰 Price logic */
  const displayPrice = availabilityChecked && pricing?.total
    ? formatPrice(pricing.total)
    : formatPrice(property?.pricing?.basePrice || 0);

  const priceLabel = availabilityChecked ? "total" : " / night";

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
        { !ownerProperty ? (
          <div className="bg-white border-t shadow-2xl px-4 py-3">

          {/* Price + Dates */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {displayPrice}
                <span className="text-sm font-normal text-gray-600">
                  {priceLabel}
                </span>
              </div>

              {!collapsed && (
                <div className="text-xs text-gray-500">
                  {dateRange.startDate && dateRange.endDate
                    ? `${formatDate(dateRange.startDate)} – ${formatDate(
                        dateRange.endDate
                      )}`
                    : "Select dates"}
                </div>
              )}

              {collapsed && (
                <div className="text-xs text-green-600 font-medium">
                  {nights} night{nights > 1 ? "s" : ""} selected
                </div>
              )}
            </div>

             (
              <button
                onClick={() => {
                  haptic();
                  setShowDatePicker(true);
                  setTimeConfirmed(true);
                  setSelectionStep("checkin");
                }}
                className="text-sm font-semibold text-indigo-600"
              >
                Edit
              </button>
            )
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => {
              haptic("medium");
               if (!availabilityChecked) {
    setShowTimePrompt(true);
    return;
  }

   handleBooking();
              // availabilityChecked && nights > 0
              //   ? handleBooking()
              //   : checkAvailability();
            }}
            disabled={
              availabilityLoading ||
              (!availabilityChecked && selectionStep !== "complete")
            }
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              availabilityChecked && nights > 0
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                : "bg-indigo-600 text-white"
            }`}
          >
            {availabilityLoading
              ? "Checking availability..."
              : availabilityChecked && nights > 0
              ? `Continue to book`
              : "Check availability"}
          </Button>

        </div>) :
        ( <div className="bg-white border-t shadow-2xl px-4 py-3">
    <Button
      onClick={() => router.push(`/host/property/${property.id}/edit`)}
      className="w-full py-3 rounded-xl font-semibold
                 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
    >
      Edit your property
    </Button>
  </div>
         )} 
      </motion.div>
    </AnimatePresence>
  );
}
