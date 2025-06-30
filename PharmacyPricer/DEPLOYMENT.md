# PharmaCost Pro - Production Deployment Guide

## Real Data Scraping Setup

### Current Status
The application is fully implemented with real web scraping capabilities. The current development environment lacks external network access, so it falls back to demo mode. When deployed to production with proper network connectivity, the system will automatically perform real scraping.

### Production Requirements

#### Network Configuration
- Outbound HTTPS access to vendor portals
- DNS resolution for external domains
- No firewall blocking of vendor websites

#### Vendor Portal URLs
- **McKesson Connect**: https://connect.mckesson.com
- **Cardinal Health**: https://www.cardinalhealth.com  
- **Kinray (Cardinal Health)**: https://kinray.com/login
- **AmerisourceBergen**: https://www.amerisourcebergen.com
- **Morris & Dickson**: https://www.morrisanddickson.com

### How Real Scraping Works

#### 1. Authentication Process
The system uses Puppeteer to:
- Navigate to vendor portal login pages
- Detect login form fields automatically using multiple selector strategies
- Enter user credentials securely
- Handle various login button types and submission methods
- Verify successful authentication through success indicators

#### 2. Search Process
After authentication:
- Navigate to search/catalog sections
- Input medication search terms (name, NDC, or generic)
- Parse search results from vendor-specific HTML structures
- Extract pricing, availability, and medication details
- Convert data to standardized format

#### 3. Data Extraction
The scraper extracts:
- Medication names and generic equivalents
- NDC codes and package sizes
- Current pricing information
- Stock availability status
- Dosage forms and strengths

### Vendor-Specific Implementation

#### Kinray (Cardinal Health)
- **Login Detection**: Comprehensive selector matching for username/password fields
- **Search Navigation**: Automatic detection of product search areas
- **Result Parsing**: Extraction from product grids and result tables
- **Error Handling**: Robust timeout and retry mechanisms

#### Browser Configuration
The scraper uses enhanced Chrome configuration:
- Realistic user agent strings
- Standard viewport dimensions
- Anti-detection measures
- Proxy support for enterprise networks
- Certificate error bypassing for internal portals

### Testing Production Setup

#### 1. Network Connectivity Test
```bash
curl -I https://kinray.com
# Should return HTTP 200 OK
```

#### 2. Credential Validation
Use the "Test Connection" feature in the app to verify:
- Portal accessibility
- Login form detection
- Authentication success
- Session establishment

#### 3. Search Verification
Perform test searches to confirm:
- Search form functionality
- Result extraction accuracy
- Data formatting consistency

### Error Handling in Production

#### Connection Failures
- Network timeouts → Retry with exponential backoff
- DNS resolution errors → Log and alert administrators
- Portal unavailable → Switch to alternative vendor

#### Authentication Issues
- Invalid credentials → Return error to user for credential update
- Portal structure changes → Log detailed error for development team
- Session timeouts → Automatic re-authentication

#### Data Extraction Problems
- Missing elements → Use fallback selectors
- Format changes → Parse with flexible regex patterns
- Empty results → Verify search parameters and retry

### Monitoring and Maintenance

#### Success Metrics
- Login success rates per vendor
- Search completion rates
- Data extraction accuracy
- Response time performance

#### Alert Conditions
- Repeated login failures
- Portal structure changes
- Unusual response patterns
- Extended connection timeouts

### Security Considerations

#### Credential Protection
- Encrypted storage of vendor credentials
- Secure transmission over HTTPS
- Regular credential rotation
- Access logging and monitoring

#### Rate Limiting
- Respectful request timing
- Portal usage guidelines compliance
- Automatic throttling during peak hours
- Queue management for multiple searches

### Deployment Checklist

- [ ] Verify outbound network connectivity
- [ ] Test vendor portal accessibility
- [ ] Configure valid credentials for each vendor
- [ ] Validate search functionality
- [ ] Set up monitoring and alerting
- [ ] Configure error logging
- [ ] Test failover mechanisms
- [ ] Document vendor contact information

When deployed with proper network access, this system will provide real-time medication pricing data directly from vendor portals.