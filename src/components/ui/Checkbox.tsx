import React, { useId } from 'react';
import { cn } from '@/utils/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  children?: React.ReactNode;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className, 
    label, 
    error,
    children,
    id,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const checkboxId = id || `checkbox-${generatedId}`;

    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            id={checkboxId}
            type="checkbox"
            className={cn(
              "h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0",
              error && "border-red-300 focus:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {(label || children) && (
            <label 
              htmlFor={checkboxId}
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              {label}
              {children}
            </label>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox; 