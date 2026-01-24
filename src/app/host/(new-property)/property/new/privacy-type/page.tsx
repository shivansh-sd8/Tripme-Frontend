"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, DoorOpen, Users } from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding, PropertyType } from '@/core/context/OnboardingContext';

const privacyTypes = [
  {
    type: 'entire' as PropertyType,
    label: 'An entire place',
    description: 'Guests have the whole place to themselves.',
    icon: Home,
  },
  {
    type: 'private' as PropertyType,
    label: 'A room',
    description: "Guests have their own room in a home, plus access to shared spaces.",
    icon: DoorOpen,
  },
  {
    type: 'shared' as PropertyType,
    label: 'A shared room',
    description: "Guests sleep in a room or common area that may be shared with you or others.",
    icon: Users,
  },
];

export default function PrivacyTypePage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState<PropertyType | undefined>(data.propertyType);

  const handleSelect = (type: PropertyType) => {
    setSelected(type);
    updateData({ propertyType: type });
  };

  const handleNext = () => {
    if (!selected) return;
    router.push('/host/property/new/floor-plan');
  };

  return (
    <OnboardingLayout
      currentMainStep={1}
      currentSubStep="privacy-type"
      onNext={handleNext}
      nextDisabled={!selected}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          What type of place will guests have?
        </h1>

        <div className="space-y-4">
          {privacyTypes.map((privacy) => {
            const Icon = privacy.icon;
            const isSelected = selected === privacy.type;
            
            return (
              <button
                key={privacy.type}
                onClick={() => handleSelect(privacy.type)}
                className={`w-full flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="text-left">
                  <h3 className={`text-lg font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                    {privacy.label}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {privacy.description}
                  </p>
                </div>
                <Icon className={`w-8 h-8 flex-shrink-0 ml-4 ${isSelected ? 'text-gray-900' : 'text-gray-400'}`} />
              </button>
            );
          })}
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
