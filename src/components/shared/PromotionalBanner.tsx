"use client";
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Gift, Star, TrendingUp, Clock, Tag } from 'lucide-react';

interface PromotionalOffer {
  id: string;
  type: 'credit-card' | 'discount' | 'cashback' | 'bonus';
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  code?: string;
  icon: React.ReactNode;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

const PromotionalBanner: React.FC = () => {
  const [currentOffer, setCurrentOffer] = useState<PromotionalOffer | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dummy promotional offers
  const promotionalOffers: PromotionalOffer[] = [
    {
      id: '1',
      type: 'credit-card',
      title: 'HDFC Credit Card Offer',
      description: 'Get 10% instant discount on all bookings',
      discount: '10% OFF',
      validUntil: 'Dec 31, 2024',
      code: 'HDFC10',
      icon: <CreditCard className="w-5 h-5" />,
      backgroundColor: 'bg-gradient-to-r from-blue-500 to-purple-600',
      textColor: 'text-white',
      borderColor: 'border-blue-400'
    },
    {
      id: '2',
      type: 'cashback',
      title: 'ICICI Bank Cashback',
      description: 'Earn 5% cashback on your first booking',
      discount: '5% CASHBACK',
      validUntil: 'Jan 15, 2025',
      code: 'ICICI5',
      icon: <Gift className="w-5 h-5" />,
      backgroundColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
      textColor: 'text-white',
      borderColor: 'border-green-400'
    },
    {
      id: '3',
      type: 'discount',
      title: 'New User Special',
      description: 'First-time users get 15% off on all stays',
      discount: '15% OFF',
      validUntil: 'Feb 28, 2025',
      code: 'NEW15',
      icon: <Star className="w-5 h-5" />,
      backgroundColor: 'bg-gradient-to-r from-orange-500 to-red-500',
      textColor: 'text-white',
      borderColor: 'border-orange-400'
    },
    {
      id: '4',
      type: 'bonus',
      title: 'Weekend Getaway',
      description: 'Book weekend stays and get 20% bonus discount',
      discount: '20% BONUS',
      validUntil: 'Mar 31, 2025',
      code: 'WEEKEND20',
      icon: <TrendingUp className="w-5 h-5" />,
      backgroundColor: 'bg-gradient-to-r from-purple-500 to-pink-600',
      textColor: 'text-white',
      borderColor: 'border-purple-400'
    }
  ];

  useEffect(() => {
    // Set initial offer
    setCurrentOffer(promotionalOffers[0]);

    // Auto-rotate offers every 8 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotionalOffers.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentOffer(promotionalOffers[currentIndex]);
  }, [currentIndex]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  if (!isVisible || !currentOffer) {
    return null;
  }

  return (
    <div className={`fixed top-20 left-0 right-0 z-50 px-4 py-3 ${currentOffer.backgroundColor} ${currentOffer.textColor} shadow-lg border-b ${currentOffer.borderColor}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {currentOffer.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">{currentOffer.discount}</span>
              <span className="text-sm opacity-90">•</span>
              <span className="font-semibold">{currentOffer.title}</span>
            </div>
            <p className="text-sm opacity-90">{currentOffer.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs opacity-75">Valid until {currentOffer.validUntil}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {currentOffer.code && (
            <button
              onClick={() => handleCopyCode(currentOffer.code!)}
              className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
            >
              <Tag className="w-3 h-3" />
              {currentOffer.code}
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner; 