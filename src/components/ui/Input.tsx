import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'compact';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    id,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              "block text-sm font-semibold text-[#222222]",
              variant === 'compact' ? 'mb-1' : 'mb-2',
              
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            className={cn(
              "w-full border rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md",
              variant === 'compact' ? "py-2 text-sm" : "py-3",
              leftIcon ? "pl-12" : (variant === 'compact' ? "pl-6" : "pl-4"),
              rightIcon ? "pr-12" : (variant === 'compact' ? "pr-6" : "pr-4"),
              error 
                ? "border-red-300 focus:ring-red-500" 
                : "border-gray-300 focus:border-purple-500",
              className
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 