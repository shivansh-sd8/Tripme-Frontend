# TripMe - Scalable Next.js Application Structure

This document outlines the scalable file structure and organization for the TripMe application.

## 📁 Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication domain
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── user/                     # User management domain
│   │   └── profile/
│   ├── trips/                    # Trip/booking domain
│   │   ├── [city]/
│   │   └── bookings/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── shared/                  # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ProtectedRoute.tsx
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Form.tsx
│   │   ├── Card.tsx
│   │   ├── Checkbox.tsx
│   │   └── Divider.tsx
│   ├── auth/                    # Authentication components
│   ├── user/                    # User-related components
│   │   └── ProfileContent.tsx
│   ├── trips/                   # Trip-related components
│   │   ├── SearchForm.tsx
│   │   └── StayCard.tsx
│   └── bookings/                # Booking-related components
│       └── BookingsContent.tsx
├── lib/                         # Core libraries and services
│   ├── auth.ts                  # Authentication manager
│   ├── api.ts                   # API client
│   ├── validation.ts            # Form validation schemas
│   └── utils.ts                 # Utility functions
├── types/                       # TypeScript type definitions
│   └── index.ts                 # All application types
└── config/                      # Configuration files
    ├── env.ts                   # Environment variables
    └── constants.ts             # Global constants
```

## 🏗️ Architecture Principles

### 1. Domain-Driven Organization
- **Auth Domain**: Login, signup, password reset
- **User Domain**: Profile management, user settings
- **Trips Domain**: City pages, search, property listings
- **Bookings Domain**: Booking management, reservations

### 2. Component Organization
- **Shared Components**: Used across multiple domains (Header, Footer, ProtectedRoute)
- **UI Components**: Reusable, atomic components (Button, Input, Form)
- **Domain Components**: Specific to business domains (ProfileContent, BookingsContent)

### 3. Type Safety
- Centralized type definitions in `src/types/`
- Consistent interfaces across the application
- Strong typing for API responses and form data

### 4. Configuration Management
- Environment variables validation with Zod
- Centralized constants for consistency
- Type-safe configuration access

## 🔧 Key Features

### Authentication
- Global auth state management
- Protected routes
- Token-based authentication
- Remember me functionality

### Form Validation
- Zod schemas for type-safe validation
- Consistent error handling
- Reusable validation functions

### API Integration
- Centralized API client
- Error handling and retry logic
- Type-safe API responses

### UI/UX
- Consistent design system
- Responsive components
- Loading states and error handling
- Accessibility features

## 🚀 Development Guidelines

### Adding New Features
1. **Routes**: Add to appropriate domain folder in `src/app/`
2. **Components**: Place in domain-specific folder under `src/components/`
3. **Types**: Add to `src/types/index.ts`
4. **API**: Extend `src/lib/api.ts`
5. **Validation**: Add schemas to `src/lib/validation.ts`

### Import Conventions
```typescript
// Types
import { User, Booking } from '@/types';

// Components
import Header from '@/components/shared/Header';
import SearchForm from '@/components/trips/SearchForm';

// Libraries
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api';

// Configuration
import { config } from '@/config/env';
import { APP_CONSTANTS } from '@/config/constants';
```

### Environment Variables
- All environment variables are validated on startup
- Use `config` object for type-safe access
- Add new variables to `src/config/env.ts`

## 📦 Scalability Benefits

1. **Clear Separation of Concerns**: Each domain has its own folder structure
2. **Reusable Components**: UI components can be shared across domains
3. **Type Safety**: Centralized types prevent inconsistencies
4. **Configuration Management**: Centralized config with validation
5. **Easy Navigation**: Intuitive folder structure for developers
6. **Maintainable**: Clear organization makes code easier to maintain
7. **Testable**: Isolated components and services are easier to test

## 🔄 Migration Notes

- All imports have been updated to reflect new structure
- No functionality has been changed or removed
- TypeScript compilation passes without errors
- All existing routes continue to work as expected

## 📝 Next Steps

1. **Services Directory**: Consider renaming `lib/` to `services/` for better clarity
2. **Testing**: Add test files alongside components
3. **Documentation**: Add JSDoc comments to key functions
4. **Performance**: Implement code splitting for large components
5. **Monitoring**: Add error tracking and analytics 