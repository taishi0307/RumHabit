# Habit Tracker Application

## Overview

This is a full-stack habit tracking application built with React, Express, and PostgreSQL. The app focuses on workout habit tracking with goals for distance, heart rate, and duration. It features a modern UI with calendar visualization, statistics tracking, and goal management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reloading with Vite integration
- **Build**: esbuild for production bundling

### Data Storage Solutions
- **Database**: PostgreSQL (configured for Neon Database)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Shared schema definitions between client and server
- **Migrations**: Drizzle Kit for schema management
- **Development Storage**: In-memory storage implementation for development

## Key Components

### Database Schema
- **goals**: Stores user fitness goals (distance, heart rate, duration)
- **workouts**: Records individual workout sessions with metrics
- **habitData**: Tracks daily achievement status for each goal

### API Endpoints
- `GET /api/goals/current` - Retrieve current user goals
- `PUT /api/goals` - Update user goals
- `GET /api/workouts` - Fetch workout history
- `POST /api/workouts` - Create new workout entry
- `GET /api/habit-data` - Retrieve habit tracking data
- `POST /api/habit-data` - Create/update daily habit data
- `GET /api/statistics` - Get aggregated statistics

### Frontend Components
- **Home Page**: Main dashboard with statistics, calendar, and settings
- **CalendarView**: Visual habit tracking calendar
- **StatisticsCard**: Displays streak, total days, and achievement rates
- **GoalSettingsModal**: Modal for updating fitness goals
- **WorkoutHistory**: List of recent workout sessions

## Data Flow

1. **Goal Management**: Users set fitness goals through the settings modal
2. **Workout Tracking**: Workout data is recorded and stored with timestamps
3. **Habit Evaluation**: Daily habit data is generated based on goal achievement
4. **Statistics Calculation**: Server calculates streaks and achievement rates
5. **Calendar Visualization**: Frontend displays achievement status on calendar

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with extensive Radix UI component library
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Data Fetching**: TanStack Query for server state management
- **Form Validation**: Zod for schema validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM with Zod integration for type safety
- **Development**: tsx for TypeScript execution, Vite for development server

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with file watching for auto-restart
- **Database**: Development uses in-memory storage (MemStorage class)

### Production
- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles server
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **Static Files**: Express serves built frontend assets
- **Environment**: NODE_ENV=production enables production optimizations

### Configuration
- **Environment Variables**: DATABASE_URL required for production
- **Build Commands**: `npm run build` creates production artifacts
- **Start Command**: `npm start` runs production server

The application uses a monorepo structure with shared TypeScript definitions, enabling type safety across the full stack. The development setup includes hot reloading and error overlays for rapid development.