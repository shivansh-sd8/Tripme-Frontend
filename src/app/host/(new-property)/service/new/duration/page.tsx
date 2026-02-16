"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/host/OnboardingLayout";
import { serviceOnboarding } from "@/core/context/ServiceContext";


const MIN_ALLOWED = 1;
const MAX_ALLOWED = 30;

export default function ServiceDurationPage() {
  const router = useRouter();
  const { data, updateData, goToNextSubStep } = serviceOnboarding();

  const [minDuration, setMinDuration] = useState<number>(
    data.duration?.minDuration || 2
  );
  const [maxDuration, setMaxDuration] = useState<number>(
    data.duration?.maxDuration || 4
  );
  const [unit, setUnit] = useState<
  "minutes" | "hours" | "days"
>(() => {
  // ✅ Load saved unit directly without conversion
  const savedUnit = data.duration?.unit;
  return savedUnit || "hours"; // ✅ Don't convert, just use as-is
});

  const isValid =
    minDuration >= MIN_ALLOWED &&
    maxDuration >= minDuration &&
    maxDuration <= MAX_ALLOWED;

  const handleNext = () => {
    if (!isValid) return;

    updateData({
      duration: {
        minDuration,
        maxDuration,
        unit,
      },
    });

    const nextUrl = goToNextSubStep();
    if (nextUrl) router.push(nextUrl);
  };

  return (
    <OnboardingLayout
      flow="service"
      currentMainStep={3}
      currentSubStep="duration"
      nextDisabled={!isValid}
      onNext={handleNext}
    >
      {/* Title */}
      <h1 className="text-3xl font-semibold mb-3">
        How long does your service last?
      </h1>

      <p className="text-gray-500 mb-8">
        Give guests a realistic time range.
      </p>

      {/* Duration range */}
      <div className="max-w-md space-y-6">
        <div className="flex items-center gap-4">
          <input
            type="number"
            min={MIN_ALLOWED}
            value={minDuration}
            onChange={(e) => setMinDuration(Number(e.target.value))}
            className="w-full text-xl px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
          />

          <span className="text-gray-500 font-medium">to</span>

          <input
            type="number"
            min={minDuration}
            value={maxDuration}
            onChange={(e) => setMaxDuration(Number(e.target.value))}
            className="w-full text-xl px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Unit selector */}
        <select
          value={unit}
          onChange={(e) =>
           setUnit(e.target.value as "minutes" | "hours" | "days")
          }
          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-black"
        >
          <option value="hours">Hours</option>
          <option value="minutes">Minutes</option>
          <option value="days">Days</option>
        
        </select>

        <p className="text-sm text-gray-400">
          Example: 2–4 hours
        </p>

        {!isValid && (
          <p className="text-sm text-red-500">
            Maximum duration must be greater than or equal to minimum.
          </p>
        )}
      </div>
    </OnboardingLayout>
  );
}
