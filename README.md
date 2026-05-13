# MTU Centralized Lost and Found Portal (LAFP)

*A high-trust, automated property recovery ecosystem for Mountain Top University*

## The Problem

Mountain Top University's current lost and found system relies on manual, fragmented processes across multiple departments. Students navigate disconnected spreadsheets, physical logbooks, and inconsistent reporting channels, resulting in delayed reunifications and administrative overhead. The MTU LAFP transforms this landscape into a unified, intelligent platform that automates matching and streamlines the entire recovery workflow.

## Core Features

### 🔍 Automated Matching Engine
High-confidence cross-referencing between lost and found reports using sophisticated algorithms that analyze item categories, locations, timestamps, and descriptive attributes to generate accurate match predictions with confidence scoring.

### 🔐 Verification Gate
A secure multi-step claim process requiring non-public item details and verification text to prevent fraudulent claims while ensuring legitimate owners can successfully recover their property.

### 🎛️ Admin Command Center
Comprehensive inventory management, user oversight, and claim review queue with real-time analytics, user role management, and bulk operations for efficient administration.

### 📱 Responsive UX
Collapsible sidebar navigation, glassmorphism headers, and mobile-ready layouts built on the "Clinical Vanguard" design philosophy—minimalistic interfaces with strict 8px grid systems and high-contrast visual hierarchy.

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Real-time Listeners
- **Icons**: Lucide React
- **Package Manager**: pnpm
- **Monorepo**: Turborepo

## Architecture

This project employs a **Server-First** approach leveraging Next.js App Router's hybrid rendering model:

- **Server Components**: Handle secure data fetching, authentication checks, and database operations directly on the server
- **Client Components**: Manage interactive UI elements, real-time subscriptions, and user interactions
- **API Routes**: Provide RESTful endpoints for complex business logic and external integrations
- **Server Actions**: Enable secure form submissions and data mutations with type safety

The architecture ensures optimal performance by executing data-intensive operations server-side while maintaining rich interactivity through strategic client-side hydration.

## Project Structure

```
mtu-lafp/
├── apps/
│   └── web/                 # Next.js frontend application
│       ├── src/
│       │   ├── app/         # App Router pages and layouts
│       │   ├── components/  # Reusable UI components
│       │   ├── lib/         # Utility libraries and configurations
│       │   └── types/       # TypeScript type definitions
│       └── package.json
├── packages/
│   ├── database/           # Prisma schema and database utilities
│   ├── shared-types/       # Shared TypeScript definitions
│   └── config-*/           # Shared configuration packages
├── supabase/               # Database migrations and Supabase config
├── methodology.md          # Project development methodology
├── turbo.json             # Turborepo configuration
└── package.json           # Root package configuration
```

## Key Features by User Role

### Students
- Report lost or found items through an intuitive 4-step wizard
- Search and filter items by category, location, and date
- Submit claims with secure verification requirements
- Track claim status and receive real-time notifications
- Manage personal profiles and matriculation numbers

### Administrators
- Comprehensive dashboard with analytics and insights
- User management with role-based access control
- Inventory oversight with bulk operations
- Claim review queue with verification tools
- Real-time monitoring of system activity

## Database Schema

The system utilizes a normalized PostgreSQL schema with the following core entities:

- **Profiles**: User accounts linked to Supabase Auth
- **Items**: Lost and found reports with rich metadata
- **Categories & Locations**: Hierarchical classification systems
- **Matches**: Automated matching results with confidence scores
- **Claims**: Verification workflows with approval processes
- **Tags**: Flexible tagging system for item classification

## Getting Started

For detailed setup instructions, please refer to our [Development Setup Guide](./DEVSETUP.md).

## Contributing

This project follows institutional development standards. All contributions must adhere to the "Clinical Vanguard" design principles and pass comprehensive testing before integration.

## License

© 2026 Mountain Top University. All rights reserved.
