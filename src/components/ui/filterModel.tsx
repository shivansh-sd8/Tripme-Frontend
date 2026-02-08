import React, { ReactNode, useEffect } from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center
                bg-black/30 backdrop-blur-[2px]">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] p-6 relative animate-fade-in overflow-y-auto">
          <div className="sticky top-0 bg-white z-10
                    px-6 py-4 border-b flex justify-between">
      <h2 className="text-lg font-semibold">Filters</h2>
      <button onClick={onClose}>✕</button>
    </div>

    {/* Scrollable content */}
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8">
      {/* Recommended, Price, Amenities etc */}
       {title && <h2 className="text-xl font-semibold mb-4 text-gray-900">{title}</h2>}
        <div>{children}</div>
    </div>
    <div className="sticky bottom-0 bg-white
                    px-6 py-4 border-t flex justify-between">
      <button className="text-sm underline">Clear all</button>
      <button className="bg-black text-white px-6 py-3 rounded-xl">
        Show results
      </button>
    </div>

       
      </div>
    </div>
  );
};

export default FilterModal; 


