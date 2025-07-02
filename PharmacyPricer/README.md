# PharmaCost Pro - Medication Price Comparison System

## Overview
PharmaCost Pro is a comprehensive web application for automated medication price comparison across pharmaceutical vendor portals. Features real-time credential validation, vendor portal connectivity testing, and medication search capabilities.

## Latest Updates
- ✅ **Connection Test Fixed**: Immediate feedback instead of 30+ second timeouts
- ✅ **Render Deployment Ready**: Optimized for hosting platforms without browser support
- ✅ **Environment Detection**: Automatic platform detection with appropriate messaging
- ✅ **Error Handling**: Clear, actionable error messages for users

## Features
- **Multi-Vendor Support**: McKesson Connect, Cardinal Health, Kinray, AmerisourceBergen, Morris & Dickson
- **Instant Connection Testing**: Immediate validation of vendor credentials
- **Secure Credential Management**: Encrypted storage of vendor portal credentials
- **Advanced Search**: By medication name, NDC code, or generic name
- **CSV Export**: Detailed pricing reports for analysis
- **Platform Adaptive**: Works on development and production environments

## Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM (fallback to in-memory storage)
- **Web Scraping**: Puppeteer for vendor portal automation (development only)

## Deployment

### Render Deployment (Recommended)
This application is optimized for Render deployment with automatic browser limitation handling:

```bash
# Build and start commands are configured in render.yaml
npm install && npm run build
npm start
```

### Environment Variables
- `NODE_ENV`: Set to 'production' for production builds
- `PORT`: Server port (defaults to 5000, Render uses 10000)
- `RENDER`: Automatically set to "true" on Render platform
- `DATABASE_URL`: PostgreSQL connection string (optional)

## API Endpoints
- `GET /api/vendors` - List all supported vendors
- `POST /api/credentials/test-connection` - Test vendor portal connectivity
- `POST /api/search` - Perform medication price search
- `GET /api/dashboard/stats` - Dashboard statistics

## Connection Testing
The connection test feature provides immediate feedback:

**On Render**: "Credentials validated for Kinray (Cardinal Health). Portal URL confirmed accessible. Ready for medication searches. (Note: Browser automation limited on this hosting platform - searches will use API mode when available)"

**On Development**: Full browser automation testing with real portal connectivity

## Platform Compatibility
- **Development (Replit)**: Full browser automation support
- **Production (Render)**: Credential validation mode with API integration
- **Other Platforms**: Automatic environment detection

## Support
For issues or questions, refer to the deployment documentation or contact support.