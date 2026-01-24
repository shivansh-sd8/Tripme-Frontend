"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  Tv, 
  Car, 
  Snowflake, 
  Waves, 
  UtensilsCrossed,
  Shirt,
  Dumbbell,
  Briefcase,
  ShieldCheck,
  Flame,
  Coffee
} from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';

const amenitiesList = [
  { id: 'wifi', label: 'Wifi', icon: Wifi },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed },
  { id: 'washer', label: 'Washer', icon: Shirt },
  { id: 'parking', label: 'Free parking', icon: Car },
  { id: 'ac', label: 'Air conditioning', icon: Snowflake },
  { id: 'workspace', label: 'Dedicated workspace', icon: Briefcase },
  { id: 'pool', label: 'Pool', icon: Waves },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'fireplace', label: 'Fireplace', icon: Flame },
  { id: 'security', label: 'Security cameras', icon: ShieldCheck },
];

export default function AmenitiesPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(data.amenities || []);

  const toggleAmenity = (id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    updateData({ amenities: selected });
    // Move to Step 3: pricing
    router.push('/host/property/new/pricing');
  };

  return (
    <OnboardingLayout
      currentMainStep={2}
      currentSubStep="amenities"
      onNext={handleNext}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Tell guests what your place has to offer
        </h1>
        <p className="text-gray-500 mb-8">
          You can add more amenities after you publish.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {amenitiesList.map((amenity) => {
            const Icon = amenity.icon;
            const isSelected = selected.includes(amenity.id);
            
            return (
              <button
                key={amenity.id}
                onClick={() => toggleAmenity(amenity.id)}
                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <Icon className={`w-7 h-7 mb-2 ${isSelected ? 'text-gray-900' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                  {amenity.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
