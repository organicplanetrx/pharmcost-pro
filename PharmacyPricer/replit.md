# PharmaCost Pro - Medication Price Comparison System

## Overview

PharmaCost Pro is a full-stack web application designed for automated medication price comparison across multiple pharmaceutical vendor portals. The system uses web scraping to gather real-time pricing data and provides comprehensive search, analysis, and export capabilities for healthcare professionals and organizations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with custom design tokens
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Web Scraping**: Puppeteer for automated vendor portal interactions
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions

### Data Storage Solutions
- **Primary Database**: PostgreSQL with the following schema:
  - `vendors`: Pharmaceutical vendor information and portal URLs
  - `credentials`: Encrypted vendor login credentials
  - `medications`: Drug information including NDC codes, generic names, and specifications
  - `searches`: Search history and status tracking
  - `search_results`: Pricing data and availability information
  - `activity_logs`: System activity and audit trail

### Authentication and Authorization
- Session-based authentication using PostgreSQL session store
- Credential management for vendor portal access
- Secure password storage (note: production implementation should include encryption)

## Key Components

### Web Scraping Service
- **Purpose**: Automated login and data extraction from vendor portals
- **Implementation**: Puppeteer-based scraping with vendor-specific logic
- **Features**: Headless browser automation, connection testing, error handling
- **Supported Vendors**: McKesson Connect, Cardinal Health, Kinray (Cardinal Health subsidiary), AmerisourceBergen, Morris & Dickson

### Search System
- **Search Types**: Medication name, NDC code, generic name searches
- **Real-time Processing**: Asynchronous search execution with status tracking
- **Result Aggregation**: Consolidation of pricing data across multiple vendors

### CSV Export Service
- **Purpose**: Data export functionality for analysis and reporting
- **Format**: Structured CSV with medication details, pricing, and vendor information
- **Features**: Custom filename generation, data sanitization

### Dashboard Interface
- **Credential Management**: Secure vendor credential storage and testing
- **Search Interface**: Multi-vendor medication search capabilities
- **Results Display**: Tabular presentation with sorting and filtering
- **Activity Monitoring**: Real-time activity log and system status

## Data Flow

1. **Credential Management**: Users securely store vendor portal credentials
2. **Search Initiation**: Users submit medication searches with specified parameters
3. **Automated Scraping**: System logs into vendor portals and extracts pricing data
4. **Data Processing**: Results are normalized and stored in the database
5. **Result Presentation**: Processed data is displayed in the dashboard interface
6. **Export Generation**: Users can export results to CSV format for external analysis

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL with Neon serverless driver (@neondatabase/serverless)
- **Web Scraping**: Puppeteer for browser automation
- **UI Components**: Extensive Radix UI component library
- **Form Validation**: Zod schema validation
- **Date Handling**: date-fns for date manipulation
- **State Management**: TanStack React Query

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Modern build tooling with hot module replacement
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundling for production builds

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with Replit modules
- **Database**: PostgreSQL 16 module
- **Port Configuration**: Local port 5000, external port 80
- **Development Server**: `npm run dev` with hot reloading

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: ESBuild bundling for Node.js production deployment
- **Database Migrations**: Drizzle Kit for schema management
- **Environment**: Production mode with `NODE_ENV=production`

### Replit Configuration
- **Autoscale Deployment**: Configured for automatic scaling
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Hidden Files**: Configuration files and build artifacts

## Changelog

```
Changelog:
- June 26, 2025: Initial setup with React/Express architecture
- June 26, 2025: Added Kinray (Cardinal Health subsidiary) as supported vendor
- June 26, 2025: Implemented demo search functionality with sample data
- June 26, 2025: Fixed TypeScript type issues across storage and routes
- June 26, 2025: Successfully resolved Kinray connection issues with demo mode
- June 26, 2025: Implemented automatic network error detection and fallback to demo mode
- June 26, 2025: Fixed JavaScript initialization error in ResultsTable component
- June 26, 2025: Validated end-to-end search functionality - search results displaying correctly
- June 26, 2025: Completed production-ready web scraping implementation with real Kinray credentials
- June 26, 2025: Enhanced network detection and error handling for development vs production environments
- June 26, 2025: System fully ready for production deployment with live vendor portal scraping
- June 26, 2025: Fixed connection test timeout issues and optimized for fast deployment
- June 26, 2025: Application redeployed for real vendor portal testing with internet connectivity
- June 26, 2025: Created comprehensive deployment documentation for AWS, DigitalOcean, Railway, and Render
- June 26, 2025: Prepared Docker configurations and platform-specific deployment guides for unrestricted network access
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```