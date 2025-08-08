# TutorMitra - Online Tutoring Platform

## Overview

TutorMitra is a modern web application for connecting students with tutors for personalized learning experiences. The platform allows students to browse tutors by subject, rating, and availability, book tutoring sessions, and manage their learning journey. The application features a clean, responsive design built with React and TypeScript on the frontend, Express.js on the backend, and uses PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints following conventional patterns (/api/subjects, /api/tutors, /api/bookings)
- **Error Handling**: Centralized error middleware with structured JSON responses
- **Development**: Hot reloading with custom Vite integration for full-stack development

### Data Storage
- **Database**: PostgreSQL as the primary database
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Data Models**: Three main entities - Subjects, Tutors, and Bookings with proper relationships
- **Fallback Storage**: In-memory storage implementation for development/testing

### Component Architecture
- **Design System**: Consistent component library using Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Modal System**: Reusable dialog components for booking and other interactions
- **Responsive Design**: Mobile-first approach with Tailwind's responsive utilities
- **Loading States**: Skeleton components and loading indicators for better UX

### Development Architecture
- **Monorepo Structure**: Client, server, and shared code in a single repository
- **Shared Types**: Common TypeScript types and schemas shared between frontend and backend
- **Path Aliases**: Organized imports using TypeScript path mapping
- **Code Quality**: ESLint and TypeScript for code consistency and type checking

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production database
- **Drizzle ORM**: Type-safe database toolkit for schema definition and queries
- **Drizzle Kit**: CLI tool for database migrations and schema management

### UI and Styling
- **Radix UI**: Headless UI primitives for accessible component foundation
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for creating component variants

### Development Tools
- **Vite**: Build tool and development server with hot module replacement
- **TypeScript**: Static type checking for enhanced developer experience
- **PostCSS**: CSS processing for Tailwind and other transformations

### State Management and Forms
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Schema validation for runtime type checking

### Utility Libraries
- **Date-fns**: Date manipulation and formatting utilities
- **clsx/twMerge**: Conditional className utilities for dynamic styling
- **Wouter**: Lightweight routing solution for React applications