import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:5001/api'),
  
  // App Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default('TripMe'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Authentication
  NEXT_PUBLIC_AUTH_TOKEN_KEY: z.string().default('tripme_token'),
  
  // External Services (for future use)
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  
  // Analytics (for future use)
  NEXT_PUBLIC_GA_TRACKING_ID: z.string().optional(),
  NEXT_PUBLIC_MIXPANEL_TOKEN: z.string().optional(),
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Export validated environment variables
export const config = {
  api: {
    url: env.NEXT_PUBLIC_API_URL,
  },
  app: {
    name: env.NEXT_PUBLIC_APP_NAME,
    version: env.NEXT_PUBLIC_APP_VERSION,
    environment: env.NODE_ENV,
  },
  auth: {
    tokenKey: env.NEXT_PUBLIC_AUTH_TOKEN_KEY,
  },
  services: {
    googleMaps: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    stripe: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  analytics: {
    gaTrackingId: env.NEXT_PUBLIC_GA_TRACKING_ID,
    mixpanelToken: env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },
} as const;

// Type for the config object
export type AppConfig = typeof config;

// Helper function to check if we're in development
export const isDevelopment = config.app.environment === 'development';

// Helper function to check if we're in production
export const isProduction = config.app.environment === 'production';

// Helper function to check if we're in test
export const isTest = config.app.environment === 'test'; 