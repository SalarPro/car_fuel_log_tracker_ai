# CarTrack - Vehicle Expense Management Application

## Overview

CarTrack is a comprehensive car management and expense tracking application that helps users monitor their vehicle expenses, fuel consumption, and maintenance schedules. The application uses Firebase for authentication and data storage, with a React frontend and Express backend. Each user's data is fully isolated and secure using Firebase's authentication and Firestore database rules.

**Core Features:**
- Multi-car management with odometer tracking
- Fuel refill logging with consumption analytics
- Service/maintenance tracking with reminder alerts
- General expense tracking with categories
- Multi-currency support (default: IQD)
- Offline support via Firestore caching
- Light/dark theme support

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for auth/theme
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Development**: tsx for TypeScript execution
- **Build**: esbuild for production bundling
- **Static Serving**: Express serves built frontend in production

### Data Storage
- **Primary Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication (email/password)
- **Offline Support**: Firestore IndexedDB persistence enabled
- **Schema Definition**: Drizzle ORM with PostgreSQL schema (for potential future migration)

**Firestore Data Structure:**
```
users/{userId}/
  ├── settings/preferences (currency, timestamps)
  └── cars/{carId}/
      ├── fuel_logs/{logId}
      ├── services/{serviceId}
      └── expenses/{expenseId}
```

### Authentication Flow
- Firebase Authentication handles user registration and login
- Auth state managed via React Context (`AuthContext`)
- Protected routes redirect unauthenticated users to login
- User settings stored in Firestore under user document

### Design System
- Material Design inspired with Linear/Notion aesthetics
- Inter font family for data-heavy UI
- Consistent spacing using Tailwind units (2, 4, 6, 8, 12, 16)
- Dashboard uses responsive grid layout (1-3 columns)
- Sidebar navigation with car list and quick actions

## External Dependencies

### Firebase Services
- **Firebase Authentication**: User registration and login (email/password)
- **Firebase Firestore**: Primary database for all user data, cars, fuel logs, services, and expenses
- Environment variables required:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`

### Database (Optional/Future)
- **PostgreSQL**: Drizzle ORM schema defined but currently using Firebase Firestore
- Environment variable: `DATABASE_URL` (required for Drizzle migrations)

### Key NPM Packages
- **UI**: @radix-ui primitives, lucide-react icons, class-variance-authority
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **Date Handling**: date-fns
- **Data Fetching**: @tanstack/react-query
- **Carousel**: embla-carousel-react
- **Charts**: recharts (via shadcn chart component)

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- **Type Checking**: TypeScript with strict mode
- **CSS Processing**: PostCSS with Tailwind and Autoprefixer