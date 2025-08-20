import { ValidationResult, ValidationError } from '@/shared/types';

export interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

export function validateForm<T extends Record<string, any>>(
  schema: ValidationSchema,
  data: T
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    let error: string | null = null;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    // Min length validation
    if (!error && rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (!error && rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (!error && rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      error = `${field.charAt(0).toUpperCase() + field.slice(1)} format is invalid`;
    }

    // Custom validation
    if (!error && rules.custom) {
      error = rules.custom(value);
    }

    if (error) {
      errors[field] = error;
    }
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

// Common validation schemas
export const loginSchema: ValidationSchema = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    required: true,
    minLength: 6,
  },
};

export const signupSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    custom: (value) => {
      if (!/(?=.*[a-z])/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/(?=.*\d)/.test(value)) {
        return 'Password must contain at least one number';
      }
      if (!/(?=.*[@$!%*?&])/.test(value)) {
        return 'Password must contain at least one special character (@$!%*?&)';
      }
      return null;
    },
  },
  confirmPassword: {
    required: true,
    custom: (value) => {
      // This will be handled in the form submission logic
      return null;
    },
  },
  phone: {
    required: true,
    pattern: /^\+?[\d\s\-\(\)]+$/,
  },
  agreeToTerms: {
    required: true,
    custom: (value) => {
      if (!value) {
        return 'You must agree to the terms and conditions';
      }
      return null;
    },
  },
};

export const propertySchema: ValidationSchema = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 100,
  },
  description: {
    required: true,
    minLength: 20,
    maxLength: 1000,
  },
  type: {
    required: true,
  },
  price: {
    required: true,
    custom: (value) => {
      if (typeof value !== 'number' || value <= 0) {
        return 'Price must be a positive number';
      }
      return null;
    },
  },
  location: {
    required: true,
    custom: (value) => {
      if (!value.address || !value.city || !value.country) {
        return 'Complete address information is required';
      }
      return null;
    },
  },
};

export const bookingSchema: ValidationSchema = {
  checkIn: {
    required: true,
    custom: (value) => {
      const checkInDate = new Date(value);
      const today = new Date();
      if (checkInDate <= today) {
        return 'Check-in date must be in the future';
      }
      return null;
    },
  },
  checkOut: {
    required: true,
    custom: (value, data) => {
      const checkInDate = new Date(data.checkIn);
      const checkOutDate = new Date(value);
      if (checkOutDate <= checkInDate) {
        return 'Check-out date must be after check-in date';
      }
      return null;
    },
  },
  guests: {
    required: true,
    custom: (value) => {
      if (typeof value !== 'number' || value < 1) {
        return 'Number of guests must be at least 1';
      }
      return null;
    },
  },
}; 