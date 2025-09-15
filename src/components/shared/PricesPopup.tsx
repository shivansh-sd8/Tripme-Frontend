"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PricesPopupProps {
  onClose?: () => void;
  showOnce?: boolean;
  storageKey?: string;
}

const PricesPopup: React.FC<PricesPopupProps> = ({ 
  onClose, 
  showOnce = true, 
  storageKey = 'prices_popup_shown' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if popup should be shown
    if (showOnce && typeof window !== 'undefined') {
      const hasShownPopup = localStorage.getItem(storageKey);
      if (hasShownPopup) {
        return; // Don't show if already shown
      }
    }

    // Show popup after a short delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [showOnce, storageKey]);

  const handleClose = () => {
    setIsVisible(false);
    
    // Mark as shown in localStorage if showOnce is true
    if (showOnce && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }
    
    // Call custom onClose if provided
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-50 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto transform transition-all duration-300 scale-100 opacity-100 relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 z-10"
          >
            <X size={16} className="text-gray-600" />
          </button>

          {/* Content */}
          <div className="p-6 text-center">
            {/* Animated Price Tag Icon - Exact match to image */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Main price tag - Pink with exact proportions */}
                <div className="w-14 h-18 bg-pink-500 rounded-lg shadow-lg flex items-center justify-center relative animate-bounce">
                  {/* Price tag hole - White circle */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full"></div>
                  {/* Ring through hole - Gray ring */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-2 border-gray-400 rounded-full animate-pulse"></div>
                </div>
                
                {/* Floating sparkles around the price tag */}
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-2 w-1 h-1 bg-pink-300 rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
              </div>
            </div>

            {/* Text - Exact match to Airbnb's wording and styling */}
            <h3 className="text-lg font-medium text-gray-900 mb-6 leading-tight">
              Now you'll see one price for your trip, all fees included.
            </h3>

            {/* Action Button - Exact match to Airbnb's dark button */}
            <button
              onClick={handleClose}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PricesPopup;
