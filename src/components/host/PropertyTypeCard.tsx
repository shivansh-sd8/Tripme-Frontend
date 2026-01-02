"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Users, User, Briefcase } from 'lucide-react';
import { PropertyType } from '@/core/context/OnboardingContext';
import Card from '../ui/Card';

interface PropertyTypeCardProps {
  type: PropertyType;
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

export default function PropertyTypeCard({
  type,
  title,
  description,
  icon,
  selected,
  onSelect,
}: PropertyTypeCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="cursor-pointer"
    >
      <Card
        className={`h-full transition-all duration-300 ${
          selected
            ? 'border-2 border-[#FF385C] bg-[#FFF5F5] shadow-lg'
            : 'border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
        padding="lg"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${
              selected
                ? 'bg-[#FF385C] text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4 w-6 h-6 rounded-full bg-[#FF385C] flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export const propertyTypes = [
  {
    type: 'entire_place' as PropertyType,
    title: 'Entire Place',
    description: 'Guests have the whole place to themselves',
    icon: <Home className="w-8 h-8" />,
  },
  {
    type: 'private_room' as PropertyType,
    title: 'Private Room',
    description: 'Guests have a private room, but share common spaces',
    icon: <User className="w-8 h-8" />,
  },
  {
    type: 'shared_room' as PropertyType,
    title: 'Shared Room',
    description: 'Guests share a room with others',
    icon: <Users className="w-8 h-8" />,
  },
  {
    type: 'experience' as PropertyType,
    title: 'Experience/Service',
    description: 'Offer tours, activities, or services',
    icon: <Briefcase className="w-8 h-8" />,
  },
];



