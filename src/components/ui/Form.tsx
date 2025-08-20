import React from 'react';
import { cn } from '@/utils/utils';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'auth';
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ 
    className, 
    title, 
    subtitle,
    variant = 'default',
    children,
    ...props 
  }, ref) => {
    const baseStyles = "w-full";
    
    const variants = {
      default: "",
      auth: "space-y-6"
    };

    return (
      <div className={cn(baseStyles, variants[variant], className)}>
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-gray-600 font-body">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        <form
          ref={ref}
          className="space-y-6"
          {...props}
        >
          {children}
        </form>
      </div>
    );
  }
);

Form.displayName = 'Form';

export default Form; 