import React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
  text?: string;
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ text, className }) => {
  return (
    <div className={cn("relative my-6", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      {text && (
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">{text}</span>
        </div>
      )}
    </div>
  );
};

export default Divider; 