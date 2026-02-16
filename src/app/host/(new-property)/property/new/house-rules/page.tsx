"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Users, 
  Music, 
 Zap,
  Dog, 
  PartyPopper, 
  Camera, 
  Car,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import OnboardingLayout from '@/components/host/OnboardingLayout';
import { useOnboarding } from '@/core/context/OnboardingContext';
import { useParams, useSearchParams } from "next/navigation";

const commonRules = [
  {
    id: 'noSmoking',
    icon: Zap,
    title: 'No smoking',
    description: 'Smoking is not allowed anywhere on the property.',
    category: 'health'
  },
  {
    id: 'noParties',
    icon: PartyPopper,
    title: 'No parties or events',
    description: 'Parties, events, or loud gatherings are not permitted.',
    category: 'behavior'
  },
  {
    id: 'quietHours',
    icon: Clock,
    title: 'Quiet hours',
    description: 'Please keep noise to a minimum between 10 PM and 8 AM.',
    category: 'behavior'
  },
  {
    id: 'respectProperty',
    icon: Home,
    title: 'Respect the property',
    description: 'Treat the home like your own and keep it clean.',
    category: 'general'
  }
];

const additionalRules = [
  {
    id: 'pets',
    icon: Dog,
    title: 'Pets',
    options: [
      { value: 'allowed', label: 'Pets allowed', description: 'Guests can bring pets' },
      { value: 'not_allowed', label: 'No pets', description: 'No pets allowed' },
      { value: 'conditional', label: 'Pets considered', description: 'Pets may be allowed with prior approval' }
    ]
  },
  {
    id: 'checkIn',
    icon: Clock,
    title: 'Check-in/Check-out',
    options: [
      { value: 'flexible', label: 'Flexible', description: 'Flexible timing' },
      { value: 'strict', label: 'Strict timing', description: 'Strict check-in/out times' }
    ]
  },
  {
    id: 'photography',
    icon: Camera,
    title: 'Photography/Videography',
    options: [
      { value: 'allowed', label: 'Allowed', description: 'Guests can take photos' },
      { value: 'not_allowed', label: 'Not allowed', description: 'No photography/videography' },
      { value: 'conditional', label: 'With permission', description: 'Only with host permission' }
    ]
  },
  {
    id: 'parking',
    icon: Car,
    title: 'Parking',
    options: [
      { value: 'free', label: 'Free parking', description: 'Free parking available' },
      { value: 'paid', label: 'Paid parking', description: 'Paid parking available' },
      { value: 'street', label: 'Street parking', description: 'Street parking only' },
      { value: 'none', label: 'No parking', description: 'No parking available' }
    ]
  }
];

export default function HouseRulesPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [selectedRules, setSelectedRules] = useState<string[]>(data.houseRules?.common || []);
  const [selectedAdditionalRules, setSelectedAdditionalRules] = useState(data.houseRules?.additional || {});

  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id;
  const isEditMode = searchParams.get("mode") === "edit";

  const handleRuleToggle = (ruleId: string) => {
    setSelectedRules(prev => 
      prev.includes(ruleId) 
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };


const handleAdditionalRuleChange = (ruleId: string, value: string) => {
  console.log('Rule change:', ruleId, value);
  setSelectedAdditionalRules(prev => ({
    ...prev,
    [ruleId]: value
  }));
};

  const handleNext = () => {
    updateData({
      houseRules: {
        common: selectedRules,
        additional: selectedAdditionalRules
      }

    });

    console.log("house rule",data.houseRules);

    if (isEditMode && id) {
      router.push(`/host/property/${id}/booking-settings?mode=edit`);
    } else {
      router.push('/host/property/new/booking-settings');
    }
  };

  return (
    <OnboardingLayout
      flow="property"
      currentMainStep={4}
      currentSubStep="house-rules"
      onNext={handleNext}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            House rules
          </h1>
          <p className="text-gray-500 text-lg">
            Help guests understand what to expect during their stay.
          </p>
        </div>

        {/* Common Rules */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Common house rules
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonRules.map((rule) => {
              const Icon = rule.icon;
              const isSelected = selectedRules.includes(rule.id);
              
              return (
                <motion.button
                  key={rule.id}
                  onClick={() => handleRuleToggle(rule.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isSelected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {rule.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {rule.description}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Additional Rules */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            Additional rules
          </h2>
          
          <div className="space-y-6">
           {additionalRules.map((rule) => {
  const Icon = rule.icon;
  const selectedValue = selectedAdditionalRules[rule.id];
  
  return (
    <div key={rule.id} className="bg-white p-6 rounded-2xl border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900">
          {rule.title}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rule.options.map((option) => (
          <label
            key={option.value}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedValue === option.value
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name={rule.id}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => handleAdditionalRuleChange(rule.id, e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {option.label}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {option.description}
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedValue === option.value
                  ? 'border-gray-900 bg-gray-900'
                  : 'border-gray-300'
              }`}>
                {selectedValue === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
})}
          </div>
        </div>

        {/* Custom Rules */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Additional house rules (optional)
          </h2>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200">
            <textarea
              placeholder="Add any additional house rules that guests should know about..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
              rows={4}
              value={selectedAdditionalRules.custom || ''}
              onChange={(e) => handleAdditionalRuleChange('custom', e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-2">
              Be specific about any rules that are important for your property
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                House rules tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Be clear and specific about your expectations</li>
                <li>• Focus on rules that are essential for your property</li>
                <li>• Consider local laws and regulations</li>
                <li>• Keep rules reasonable and guest-friendly</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}