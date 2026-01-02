"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';

interface BecomeHostIntroProps {
  onGetStarted: () => void;
  onExit?: () => void;
}

const BecomeHostIntro: React.FC<BecomeHostIntroProps> = ({ onGetStarted, onExit }) => {
  const router = useRouter();

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      router.push('/');
    }
  };

  const handleGetStartedClick = () => {
    // Navigate to the new Airbnb-style onboarding flow
    router.push('/become-host/about-your-place');
  };

  const steps = [
    {
      number: 1,
      title: 'Tell us about your place',
      description: 'Share some basic info, such as where it is and how many guests can stay.',
      image: '/images/host-step-1.png',
      fallbackEmoji: '🏠'
    },
    {
      number: 2,
      title: 'Make it stand out',
      description: "Add 5 or more photos plus a title and description – we'll help you out.",
      image: '/images/host-step-2.png',
      fallbackEmoji: '📸'
    },
    {
      number: 3,
      title: 'Finish up and publish',
      description: 'Choose a starting price, verify a few details, then publish your listing.',
      image: '/images/host-step-3.png',
      fallbackEmoji: '🎉'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Image
            src="/logo.png"
            alt="TripMe"
            width={100}
            height={40}
            className="h-10 w-auto object-contain"
          />
          <button
            onClick={handleExit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Title */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                It's easy to get started on TripMe
              </h1>
            </motion.div>

            {/* Right Side - Steps */}
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="flex items-start gap-6 pb-8 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex-shrink-0 w-8 text-xl font-semibold text-gray-900">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-base">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-24 h-20 flex items-center justify-center">
                    <span className="text-5xl">{step.fallbackEmoji}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Get Started Button */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-end">
          <motion.button
            onClick={handleGetStartedClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#FF385C] hover:bg-[#E61E4D] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Get started
          </motion.button>
        </div>
      </footer>
    </div>
  );
};

export default BecomeHostIntro;
