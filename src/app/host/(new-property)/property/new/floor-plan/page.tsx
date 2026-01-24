"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';

interface CounterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

function Counter({ label, value, onChange, min = 0, max = 50 }: CounterProps) {
  return (
    <div className="flex items-center justify-between py-6 border-b border-gray-200 last:border-b-0">
      <span className="text-lg text-gray-900">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-lg font-medium w-8 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function FloorPlanPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  
  const [guests, setGuests] = useState(data.floorPlan?.guests || 4);
  const [bedrooms, setBedrooms] = useState(data.floorPlan?.bedrooms || 1);
  const [beds, setBeds] = useState(data.floorPlan?.beds || 1);
  const [bathrooms, setBathrooms] = useState(data.floorPlan?.bathrooms || 1);

  const handleNext = () => {
    updateData({
      floorPlan: {
        guests,
        bedrooms,
        beds,
        bathrooms,
      },
    });
    router.push('/host/property/new/location');
  };

  return (
    <OnboardingLayout
      currentMainStep={1}
      currentSubStep="floor-plan"
      onNext={handleNext}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Share some basics about your place
        </h1>
        <p className="text-gray-500 mb-8">
          You'll add more details later, like bed types.
        </p>

        <div className="max-w-lg">
          <Counter
            label="Guests"
            value={guests}
            onChange={setGuests}
            min={1}
            max={16}
          />
          <Counter
            label="Bedrooms"
            value={bedrooms}
            onChange={setBedrooms}
            min={0}
            max={50}
          />
          <Counter
            label="Beds"
            value={beds}
            onChange={setBeds}
            min={1}
            max={50}
          />
          <Counter
            label="Bathrooms"
            value={bathrooms}
            onChange={setBathrooms}
            min={0.5}
            max={50}
          />
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
