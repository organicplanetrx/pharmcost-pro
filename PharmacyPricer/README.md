# PharmaCost Pro - Medication Price Comparison System

## Overview
PharmaCost Pro is a comprehensive web application for automated medication price comparison across pharmaceutical vendor portals. Features real-time price tracking, vendor credential management, and CSV export capabilities.

## Features
- **Multi-Vendor Support**: McKesson Connect, Cardinal Health, Kinray, AmerisourceBergen, Morris & Dickson
- **Real-Time Price Comparison**: Automated web scraping for live pricing data
- **Secure Credential Management**: Encrypted storage of vendor portal credentials
- **Advanced Search**: By medication name, NDC code, or generic name
- **CSV Export**: Detailed pricing reports for analysis
- **Connection Testing**: Immediate feedback for vendor portal connectivity

## Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Web Scraping**: Puppeteer for vendor portal automation

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm install
npm run build
npm start
```

## Deployment
This application is configured for deployment on Render with automatic build and health check configuration.

## Connection Test Features
- **Immediate Feedback**: No more 30+ second timeouts
- **Real Error Messages**: Actual server responses instead of generic errors
- **Kinray Integration**: Full portal connectivity testing
- **Multiple Vendor Support**: Extensible architecture for additional vendors

## Environment Variables
- `NODE_ENV`: Set to 'production' for production builds
- `PORT`: Server port (defaults to 5000)
- `DATABASE_URL`: PostgreSQL connection string (optional - uses in-memory storage if not provided)

## API Endpoints
- `GET /api/vendors` - List all supported vendors
- `POST /api/credentials/test-connection` - Test vendor portal connectivity
- `POST /api/search` - Perform medication price search
- `GET /api/dashboard/stats` - Dashboard statistics

## Support
For issues or questions, refer to the deployment documentation or contact support.