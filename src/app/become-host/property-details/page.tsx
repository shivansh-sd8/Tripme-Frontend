"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Building2,
  Home,
  Hotel,
  House,
  Trees,
  Warehouse,
  TreePine,
  Ship
} from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { StructureType, useOnboarding } from '@/core/context/OnboardingContext';

const propertyList = [
  { id: 'villa', label: 'Villa', icon: Building2 },
  { id: 'apartment', label: 'Apartment', icon: Home },
  { id: 'house', label: 'House', icon: House },
  { id: 'hostel', label: 'Hostel', icon: Hotel },
  { id: 'trees', label: 'Cottage', icon: Trees },
  { id: 'cabin', label: 'Cabin', icon: Warehouse },
  { id: 'boat', label: 'Boat', icon: Ship },
  { id: 'treehouse', label: 'Treehouse', icon: TreePine },
 
];

export default function PropertyTypePage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
const [structureType, setStructureType] = useState<StructureType | undefined>(
  data.structureType
);

 



const selectPropertyType = (id: StructureType) => {
  setStructureType(id);
};


const handleNext = () => {
  if (!structureType) return;
  updateData({ structureType });
  router.push('/become-host/pricing');
};

  return (
    <OnboardingLayout
      currentMainStep={2}
      currentSubStep="structure-type"
      onNext={handleNext}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Select your property type
        </h1>
        {/* <p className="text-gray-500 mb-8">
          You can add more amenities after you publish.
        </p> */}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {propertyList.map((structureType) => {
            const Icon = structureType.icon;
             const isSelected = structureType.id === structureType?.id;
            
            return (
              <button
                key={structureType.id}
               onClick={() => selectPropertyType(structureType.id as StructureType)}
                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <Icon className={`w-7 h-7 mb-2 ${isSelected ? 'text-gray-900' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                  {structureType.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
