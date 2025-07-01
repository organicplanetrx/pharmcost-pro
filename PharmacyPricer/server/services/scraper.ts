import puppeteer, { Browser, Page } from 'puppeteer';
import { Credential, Vendor, MedicationSearchResult } from '@shared/schema';

export interface ScrapingService {
  login(vendor: Vendor, credential: Credential): Promise<boolean>;
  searchMedication(searchTerm: string, searchType: 'name' | 'ndc' | 'generic'): Promise<MedicationSearchResult[]>;
  cleanup(): Promise<void>;
}

export class PuppeteerScrapingService implements ScrapingService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private currentVendor: Vendor | null = null;

  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images',
          '--disable-javascript-harmony-shipping',
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--ignore-certificate-errors-spki-list',
          '--allow-running-insecure-content',
          '--disable-blink-features=AutomationControlled',
          '--disable-default-apps',
          '--disable-sync',
          '--no-default-browser-check',
          '--disable-client-side-phishing-detection',
          '--disable-background-networking',
          '--proxy-server=direct://',
          '--proxy-bypass-list=*'
        ]
      });
    }
    
    if (!this.page) {
      this.page = await this.browser.newPage();
      
      // Set a more realistic user agent
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
      
      // Set viewport
      await this.page.setViewport({ width: 1366, height: 768 });
      
      // Set additional headers to appear more like a real browser
      await this.page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      });
      
      // Remove automation indicators
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      });
    }
  }

  async login(vendor: Vendor, credential: Credential): Promise<boolean> {
    try {
      await this.initBrowser();
      if (!this.page) throw new Error('Failed to initialize browser page');

      this.currentVendor = vendor;
      
      // Navigate to vendor portal with error handling
      console.log(`Attempting to connect to ${vendor.name} at ${vendor.portalUrl}`);
      
      try {
        const response = await this.page.goto(vendor.portalUrl, { 
          waitUntil: 'domcontentloaded', 
          timeout: 8000 
        });
        
        if (!response || !response.ok()) {
          throw new Error(`HTTP ${response?.status() || 'No response'} - Portal unreachable`);
        }
        
        console.log(`Successfully connected to ${vendor.name} portal`);
        
      } catch (navigationError: any) {
        // Check if this is a network/DNS issue or timeout that indicates no internet access
        if (navigationError.message.includes('ERR_NAME_NOT_RESOLVED') || 
            navigationError.message.includes('ERR_INTERNET_DISCONNECTED') ||
            navigationError.message.includes('net::ERR_') ||
            navigationError.message.includes('Could not resolve host') ||
            navigationError.message.includes('Navigation timeout') ||
            navigationError.name === 'TimeoutError') {
          
          console.log(`Development environment detected - no external network access`);
          console.log(`In production, this would connect to: ${vendor.portalUrl}`);
          
          // Simulate what would happen in production with real credentials
          console.log(`Production mode would:`);
          console.log(`1. Navigate to ${vendor.portalUrl}`);
          console.log(`2. Login with username: ${credential.username}`);
          console.log(`3. Search for medications using real portal interface`);
          console.log(`4. Extract live pricing and availability data`);
          
          // Return false to indicate connection failed (not demo mode)
          return false;
        }
        
        // For other types of errors, log and re-throw
        console.error(`Connection error for ${vendor.name}:`, navigationError.message);
        throw new Error(`Failed to connect to ${vendor.name}: ${navigationError.message}`);
      }
      
      // Implement vendor-specific login logic
      switch (vendor.name) {
        case 'McKesson Connect':
          return await this.loginMcKesson(credential);
        case 'Cardinal Health':
          return await this.loginCardinal(credential);
        case 'Kinray (Cardinal Health)':
          return await this.loginKinray(credential);
        case 'AmerisourceBergen':
          return await this.loginAmerisource(credential);
        case 'Morris & Dickson':
          return await this.loginMorrisDickson(credential);
        default:
          throw new Error(`Unsupported vendor: ${vendor.name}`);
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  private async loginMcKesson(credential: Credential): Promise<boolean> {
    if (!this.page) return false;
    
    try {
      // Wait for login form elements
      await this.page.waitForSelector('input[name="username"], input[name="userId"], input[type="email"]', { timeout: 10000 });
      await this.page.waitForSelector('input[name="password"], input[type="password"]', { timeout: 10000 });
      
      // Fill in credentials
      const usernameSelector = await this.page.$('input[name="username"], input[name="userId"], input[type="email"]');
      const passwordSelector = await this.page.$('input[name="password"], input[type="password"]');
      
      if (usernameSelector && passwordSelector) {
        await usernameSelector.type(credential.username);
        await passwordSelector.type(credential.password);
        
        // Submit form
        const submitButton = await this.page.$('button[type="submit"], input[type="submit"], button:contains("Sign In"), button:contains("Login")');
        if (submitButton) {
          await submitButton.click();
          
          // Wait for redirect or dashboard
          await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
          
          // Check if login was successful by looking for dashboard elements
          const isDashboard = await this.page.$('.dashboard, .main-content, .welcome') !== null;
          const isError = await this.page.$('.error, .alert-danger, .login-error') !== null;
          
          return isDashboard && !isError;
        }
      }
      
      return false;
    } catch (error) {
      console.error('McKesson login error:', error);
      return false;
    }
  }

  private async loginCardinal(credential: Credential): Promise<boolean> {
    if (!this.page) return false;
    
    try {
      // Similar implementation for Cardinal Health
      await this.page.waitForSelector('input[name="username"], input[name="email"]', { timeout: 10000 });
      await this.page.waitForSelector('input[name="password"]', { timeout: 10000 });
      
      await this.page.type('input[name="username"], input[name="email"]', credential.username);
      await this.page.type('input[name="password"]', credential.password);
      
      await this.page.click('button[type="submit"], input[type="submit"]');
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      
      const isSuccess = await this.page.$('.dashboard, .main-menu') !== null;
      return isSuccess;
    } catch (error) {
      console.error('Cardinal login error:', error);
      return false;
    }
  }

  private async loginKinray(credential: Credential): Promise<boolean> {
    if (!this.page) return false;
    
    try {
      console.log('Attempting Kinray login...');
      
      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const pageUrl = this.page.url();
      console.log(`Current URL: ${pageUrl}`);
      
      // Simple form field detection and filling
      const usernameSelectors = [
        'input[name="username"]', 'input[name="user"]', 'input[name="email"]',
        '#username', '#user', '#email', 'input[type="text"]'
      ];
      
      const passwordSelectors = [
        'input[name="password"]', 'input[name="pass"]', 
        '#password', '#pass', 'input[type="password"]'
      ];
      
      let usernameFound = false;
      let passwordFound = false;
      
      // Try to find and fill username
      for (const selector of usernameSelectors) {
        try {
          const field = await this.page.$(selector);
          if (field) {
            console.log(`Found username field: ${selector}`);
            await field.type(credential.username);
            usernameFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Try to find and fill password
      for (const selector of passwordSelectors) {
        try {
          const field = await this.page.$(selector);
          if (field) {
            console.log(`Found password field: ${selector}`);
            await field.type(credential.password);
            passwordFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!usernameFound || !passwordFound) {
        console.log(`Login fields found: username=${usernameFound}, password=${passwordFound}`);
        console.log('Portal accessible but login form differs from expected structure');
        return false;
      }
      
      // Try to submit the form
      const submitSelectors = [
        'button[type="submit"]', 'input[type="submit"]',
        'button:contains("Login")', 'button:contains("Sign In")',
        '.login-btn', '.submit-btn'
      ];
      
      let submitSuccess = false;
      for (const selector of submitSelectors) {
        try {
          const button = await this.page.$(selector);
          if (button) {
            console.log(`Found submit button: ${selector}`);
            await button.click();
            submitSuccess = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!submitSuccess) {
        // Try Enter key as fallback
        console.log('No submit button found, trying Enter key');
        await this.page.keyboard.press('Enter');
      }
      
      // Wait for navigation with better timeout handling
      let navigationSuccess = false;
      try {
        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 });
        navigationSuccess = true;
        console.log('Navigation completed successfully');
      } catch (e) {
        console.log('Navigation timeout - checking current page status...');
      }
      
      // Wait a bit more for page to settle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if login was successful
      const finalUrl = this.page.url();
      console.log(`Final URL after login attempt: ${finalUrl}`);
      
      // Check for success indicators
      if (!finalUrl.includes('login') && !finalUrl.includes('signin')) {
        console.log('Login successful - redirected away from login page');
        return true;
      }
      
      // Check for dashboard or main content
      try {
        const dashboardElement = await this.page.$('.dashboard, .main-content, .home, [class*="main"], [class*="dashboard"]');
        if (dashboardElement) {
          console.log('Login successful - found dashboard elements');
          return true;
        }
      } catch (e) {
        console.log('No dashboard elements found');
      }
      
      // Check for error messages
      try {
        const errorElement = await this.page.$('.error, .alert-danger, [class*="error"], [class*="invalid"]');
        if (errorElement) {
          const errorText = await errorElement.evaluate(el => el.textContent);
          console.log(`Login error detected: ${errorText}`);
        }
      } catch (e) {
        console.log('No error elements found');
      }
      
      console.log('Login attempt completed - credentials may be invalid or portal structure changed');
      return false;
      
    } catch (error) {
      console.error('Kinray login error:', error);
      return false;
    }
  }

  private async loginAmerisource(credential: Credential): Promise<boolean> {
    if (!this.page) return false;
    
    try {
      // AmerisourceBergen login implementation
      await this.page.waitForSelector('#username, #email, input[name="username"]', { timeout: 10000 });
      await this.page.waitForSelector('#password, input[name="password"]', { timeout: 10000 });
      
      await this.page.type('#username, #email, input[name="username"]', credential.username);
      await this.page.type('#password, input[name="password"]', credential.password);
      
      await this.page.click('button[type="submit"], #loginButton');
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      
      const isSuccess = await this.page.$('.portal-home, .user-dashboard') !== null;
      return isSuccess;
    } catch (error) {
      console.error('AmerisourceBergen login error:', error);
      return false;
    }
  }

  private async loginMorrisDickson(credential: Credential): Promise<boolean> {
    if (!this.page) return false;
    
    try {
      // Morris & Dickson login implementation
      await this.page.waitForSelector('input[name="username"], #userName', { timeout: 10000 });
      await this.page.waitForSelector('input[name="password"], #password', { timeout: 10000 });
      
      await this.page.type('input[name="username"], #userName', credential.username);
      await this.page.type('input[name="password"], #password', credential.password);
      
      await this.page.click('button[type="submit"], .login-button');
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      
      const isSuccess = await this.page.$('.main-content, .dashboard') !== null;
      return isSuccess;
    } catch (error) {
      console.error('Morris & Dickson login error:', error);
      return false;
    }
  }

  async searchMedication(searchTerm: string, searchType: 'name' | 'ndc' | 'generic'): Promise<MedicationSearchResult[]> {
    if (!this.page || !this.currentVendor) {
      throw new Error('Not logged in to any vendor');
    }

    try {
      // Navigate to search page
      await this.navigateToSearch();
      
      // Perform search based on vendor
      switch (this.currentVendor.name) {
        case 'McKesson Connect':
          return await this.searchMcKesson(searchTerm, searchType);
        case 'Cardinal Health':
          return await this.searchCardinal(searchTerm, searchType);
        case 'Kinray (Cardinal Health)':
          return await this.searchKinray(searchTerm, searchType);
        case 'AmerisourceBergen':
          return await this.searchAmerisource(searchTerm, searchType);
        case 'Morris & Dickson':
          return await this.searchMorrisDickson(searchTerm, searchType);
        default:
          return [];
      }
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  private async navigateToSearch(): Promise<void> {
    if (!this.page) return;
    
    // Look for common search navigation elements
    const searchLinks = [
      'a[href*="search"]',
      'a[href*="product"]',
      'a[href*="catalog"]',
      '.search-nav',
      '.product-search'
    ];
    
    for (const selector of searchLinks) {
      const link = await this.page.$(selector);
      if (link) {
        await link.click();
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
        break;
      }
    }
  }

  private async searchMcKesson(searchTerm: string, searchType: string): Promise<MedicationSearchResult[]> {
    if (!this.page) return [];
    
    try {
      // Wait for search form
      await this.page.waitForSelector('input[name="search"], #searchInput, .search-input', { timeout: 10000 });
      
      // Clear and type search term
      await this.page.evaluate(() => {
        const searchInput = document.querySelector('input[name="search"], #searchInput, .search-input') as HTMLInputElement;
        if (searchInput) searchInput.value = '';
      });
      
      await this.page.type('input[name="search"], #searchInput, .search-input', searchTerm);
      
      // Submit search
      await this.page.click('button[type="submit"], .search-button, #searchBtn');
      await this.page.waitForSelector('.search-results, .product-list, .results-table', { timeout: 15000 });
      
      // Extract results
      return await this.page.evaluate((vendorName) => {
        const results: MedicationSearchResult[] = [];
        const rows = document.querySelectorAll('.search-results tr, .product-list .product-item, .results-table tbody tr');
        
        rows.forEach((row) => {
          const nameEl = row.querySelector('.product-name, .medication-name, td:nth-child(1)');
          const ndcEl = row.querySelector('.ndc, .product-ndc, td:nth-child(2)');
          const sizeEl = row.querySelector('.package-size, .size, td:nth-child(3)');
          const priceEl = row.querySelector('.price, .cost, td:nth-child(4)');
          const statusEl = row.querySelector('.status, .availability, td:nth-child(5)');
          
          if (nameEl && priceEl) {
            results.push({
              medication: {
                id: 0,
                name: nameEl.textContent?.trim() || '',
                genericName: null,
                ndc: ndcEl?.textContent?.trim() || null,
                packageSize: sizeEl?.textContent?.trim() || null,
                strength: null,
                dosageForm: null,
              },
              cost: priceEl.textContent?.replace(/[^0-9.]/g, '') || '0',
              availability: statusEl?.textContent?.trim() || 'unknown',
              vendor: vendorName,
            });
          }
        });
        
        return results;
      }, this.currentVendor.name);
      
    } catch (error) {
      console.error('McKesson search error:', error);
      return [];
    }
  }

  private async searchCardinal(searchTerm: string, searchType: string): Promise<MedicationSearchResult[]> {
    // Similar implementation for Cardinal Health
    if (!this.page) return [];
    
    try {
      await this.page.waitForSelector('#searchInput, .search-field', { timeout: 10000 });
      await this.page.type('#searchInput, .search-field', searchTerm);
      await this.page.click('.search-submit, #searchButton');
      await this.page.waitForSelector('.results-container, .product-results', { timeout: 15000 });
      
      return await this.page.evaluate((vendorName) => {
        const results: MedicationSearchResult[] = [];
        // Extract Cardinal-specific result structure
        return results;
      }, this.currentVendor?.name || 'Cardinal Health');
      
    } catch (error) {
      console.error('Cardinal search error:', error);
      return [];
    }
  }

  private async searchKinray(searchTerm: string, searchType: string): Promise<MedicationSearchResult[]> {
    if (!this.page) return [];
    
    try {
      // Kinray portal search implementation
      await this.page.waitForSelector('#productSearch, .search-input, input[name="search"]', { timeout: 10000 });
      
      // Clear and type search term
      await this.page.evaluate(() => {
        const searchInput = document.querySelector('#productSearch, .search-input, input[name="search"]') as HTMLInputElement;
        if (searchInput) searchInput.value = '';
      });
      
      await this.page.type('#productSearch, .search-input, input[name="search"]', searchTerm);
      
      // Submit search
      await this.page.click('button[type="submit"], .search-btn, #searchSubmit');
      await this.page.waitForSelector('.search-results, .product-grid, .results-table', { timeout: 15000 });
      
      // Extract results
      return await this.page.evaluate((vendorName) => {
        const results: MedicationSearchResult[] = [];
        const rows = document.querySelectorAll('.search-results .product-row, .product-grid .product-item, .results-table tbody tr');
        
        rows.forEach((row) => {
          const nameEl = row.querySelector('.product-name, .item-name, td:nth-child(1)');
          const ndcEl = row.querySelector('.ndc, .product-code, td:nth-child(2)');
          const sizeEl = row.querySelector('.package, .size, td:nth-child(3)');
          const priceEl = row.querySelector('.price, .cost, .unit-price, td:nth-child(4)');
          const statusEl = row.querySelector('.availability, .status, td:nth-child(5)');
          
          if (nameEl && priceEl) {
            results.push({
              medication: {
                id: 0,
                name: nameEl.textContent?.trim() || '',
                genericName: null,
                ndc: ndcEl?.textContent?.trim() || null,
                packageSize: sizeEl?.textContent?.trim() || null,
                strength: null,
                dosageForm: null,
              },
              cost: priceEl.textContent?.replace(/[^0-9.]/g, '') || '0',
              availability: statusEl?.textContent?.trim() || 'unknown',
              vendor: vendorName,
            });
          }
        });
        
        return results;
      }, this.currentVendor?.name || 'Kinray');
      
    } catch (error) {
      console.error('Kinray search error:', error);
      return [];
    }
  }

  private async searchAmerisource(searchTerm: string, searchType: string): Promise<MedicationSearchResult[]> {
    // Similar implementation for AmerisourceBergen
    if (!this.page) return [];
    return [];
  }

  private async searchMorrisDickson(searchTerm: string, searchType: string): Promise<MedicationSearchResult[]> {
    // Similar implementation for Morris & Dickson
    if (!this.page) return [];
    return [];
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    this.currentVendor = null;
  }
}

export const scrapingService = new PuppeteerScrapingService();
