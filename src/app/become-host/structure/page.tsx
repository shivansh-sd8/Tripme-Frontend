"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Building2, 
  Hotel, 
  Warehouse,
  TreePine,
  Sailboat,
  Caravan,
  Castle,
  Tent
} from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding, StructureType } from '@/core/context/OnboardingContext';

const structureTypes = [
  { type: 'house' as StructureType, label: 'House', icon: Home },
  { type: 'apartment' as StructureType, label: 'Apartment', icon: Building2 },
  { type: 'guesthouse' as StructureType, label: 'Guesthouse', icon: Home },
  { type: 'hotel' as StructureType, label: 'Hotel', icon: Hotel },
  { type: 'villa' as StructureType, label: 'Villa', icon: Home },
  { type: 'cottage' as StructureType, label: 'Cottage', icon: Home },
  { type: 'cabin' as StructureType, label: 'Cabin', icon: TreePine },
  { type: 'farm' as StructureType, label: 'Farm stay', icon: Warehouse },
  { type: 'boat' as StructureType, label: 'Boat', icon: Sailboat },
  { type: 'camper' as StructureType, label: 'Camper/RV', icon: Caravan },
  { type: 'treehouse' as StructureType, label: 'Treehouse', icon: TreePine },
  { type: 'tent' as StructureType, label: 'Tent', icon: Tent },
  { type: 'castle' as StructureType, label: 'Castle', icon: Castle },
];

export default function StructurePage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState<StructureType | undefined>(data.structureType);

  const handleSelect = (type: StructureType) => {
    setSelected(type);
    updateData({ structureType: type });
  };

  const handleNext = () => {
    if (!selected) return;
    router.push('/become-host/privacy-type');
  };

  return (
    <OnboardingLayout
      currentMainStep={1}
      currentSubStep="structure"
      onNext={handleNext}
      nextDisabled={!selected}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          Which of these best describes your place?
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {structureTypes.map((structure) => {
            const Icon = structure.icon;
            const isSelected = selected === structure.type;
            
            return (
              <button
                key={structure.type}
                onClick={() => handleSelect(structure.type)}
                className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-gray-900' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                  {structure.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}
