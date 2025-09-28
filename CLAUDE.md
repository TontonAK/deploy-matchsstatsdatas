# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start dev server**: `npm run dev` (opens at http://localhost:3000)
- **Build production**: `npm run build`
- **Start production**: `npm start`
- **Lint code**: `npm run lint`

## Database Operations

- **Start PostgreSQL**: `docker-compose up -d` (starts PostgreSQL on port 5432)
- **Generate Prisma client**: `npx prisma generate` (outputs to `src/generated/prisma/`)
- **Apply migrations**: `npx prisma migrate dev`
- **View database**: `npx prisma studio`

## Architecture Overview

This is a Next.js 15 application for match statistics tracking in rugby/sports clubs.

### Core Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components, Lucide React icons
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with email/password and admin plugin
- **State Management**: React Hook Form with Zod validation, TanStack Query
- **Actions**: Next Safe Action for type-safe server actions
- **UI Components**: Custom component library with CVA (Class Variance Authority)
- **Utilities**: clsx, tailwind-merge, date-fns, nuqs (URL state management)
- **Development**: ESLint 9, TypeScript strict mode, Vitest for testing
- **Themes**: next-themes for dark/light mode support

### Key Architecture Patterns

**Database Design**: Multi-tenant sports statistics system with:
- `Club` → `Team` → `User` (players/coaches) hierarchy
- `Match` system with home/away teams and detailed statistics tracking
- Role-based access (Player, Coach, Admin)
- Better Auth integration for sessions and accounts

**File Structure**:
- `app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components organized by domain
- `src/lib/` - Core utilities (auth, database, validation)
- `prisma/` - Database schema and migrations
- `src/generated/prisma/` - Generated Prisma client (excluded from TypeScript compilation)

**Authentication Flow**: Better Auth with Prisma adapter, supporting email/password authentication with session management and role-based access control (Player, Coach, Admin).

**Component Organization**: Domain-driven structure with components grouped by feature:
- `ui/` - Reusable UI primitives (buttons, forms, dialogs, etc.)
- `dashboard/` - Dashboard-specific components
- `matchs/` - Match-related components
- `navigation/` - Header, navbar, and navigation components
- `stats/` - Statistics display components
- `themes/` - Theme and dark mode components
- `svg/` - Custom SVG icon components
- `form/` - Form-specific utilities (color picker, etc.)

**Server Actions**: Type-safe server actions using Next Safe Action with role-based authorization and input validation via Zod schemas.

## Important Configuration

- **TypeScript paths**: `@/*` maps to `src/*`, `@app/*` maps to `app/*`
- **Prisma client**: Generated to `src/generated/prisma/` and excluded from TypeScript compilation
- **Database URL**: Uses `DATABASE_URL` environment variable for PostgreSQL connection
- **ESLint**: ESLint 9 with TypeScript ESLint, configured for Next.js with strict rules
- **PostCSS**: Tailwind CSS 4 with PostCSS configuration
- **Image domains**: Configured for `img.matchsstatslivecdn.com` for club and player images

## Development Notes

- **Database**: PostgreSQL runs via Docker Compose with credentials in docker-compose.yml
- **Prisma**: Custom generation path to avoid TypeScript conflicts with build process
- **Authentication**: Better Auth with PostgreSQL persistence and admin plugin for role management
- **UI System**: Radix UI primitives with custom styling and CVA for component variants
- **State Management**: Form state with React Hook Form, URL state with nuqs, server state with TanStack Query
- **Code Quality**: TypeScript strict mode, ESLint with comprehensive rules
- **Testing**: Vitest setup with Testing Library for React components
- **Styling**: Tailwind CSS 4 with custom animations and theme support

## Code Quality & Architecture Principles

- **Type Safety**: Full TypeScript coverage with strict mode and Zod validation
- **Server Actions**: Type-safe actions with role-based authorization patterns
- **Component Design**: Composable UI components with consistent API patterns
- **Error Handling**: Centralized error handling with SafeError patterns
- **Permission System**: Role-based access control integrated throughout the application