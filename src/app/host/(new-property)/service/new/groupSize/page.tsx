"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/host/OnboardingLayout";
import { serviceOnboarding } from "@/core/context/ServiceContext";


const MIN_ALLOWED = 1;
const MAX_ALLOWED = 100;

export default function ServiceGroupSizePage() {
  const router = useRouter();
  const { data, updateData, goToNextSubStep } = serviceOnboarding();

  const [minPeople, setMinPeople] = useState<number>(
    data.groupSize?.min || 1
  );
  const [maxPeople, setMaxPeople] = useState<number>(
    data.groupSize?.max || 5
  );

  const isValid =
    minPeople >= MIN_ALLOWED &&
    maxPeople >= minPeople &&
    maxPeople <= MAX_ALLOWED;

  const handleNext = () => {
    if (!isValid) return;

    updateData({
      groupSize: {
        min: minPeople,
        max: maxPeople,
      },
    });

    const nextUrl = goToNextSubStep();
    if (nextUrl) router.push(nextUrl);
  };

  return (
    <OnboardingLayout
      flow="service"
      currentMainStep={3}
      currentSubStep="groupSize"
      nextDisabled={!isValid}
      onNext={handleNext}
    >
      {/* Title */}
      <h1 className="text-3xl font-semibold mb-3">
        How many people can join?
      </h1>

      <p className="text-gray-500 mb-8">
        Set a minimum and maximum group size for your service.
      </p>

      <div className="max-w-md space-y-6">
        {/* Min people */}
        <div>
          <label className="block text-lg font-medium mb-2">
            Minimum guests
          </label>
          <input
            type="number"
            min={MIN_ALLOWED}
            value={minPeople}
            onChange={(e) => setMinPeople(Number(e.target.value))}
            className="w-full text-xl px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Max people */}
        <div>
          <label className="block text-lg font-medium mb-2">
            Maximum guests
          </label>
          <input
            type="number"
            min={minPeople}
            value={maxPeople}
            onChange={(e) => setMaxPeople(Number(e.target.value))}
            className="w-full text-xl px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Helper text */}
        <p className="text-sm text-gray-400">
          Guests will be charged per person if you enabled per-person pricing.
        </p>

        {!isValid && (
          <p className="text-sm text-red-500">
            Maximum guests must be greater than or equal to minimum.
          </p>
        )}
      </div>
    </OnboardingLayout>
  );
}
