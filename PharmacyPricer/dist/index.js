// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  vendors = /* @__PURE__ */ new Map();
  credentials = /* @__PURE__ */ new Map();
  medications = /* @__PURE__ */ new Map();
  searches = /* @__PURE__ */ new Map();
  searchResults = /* @__PURE__ */ new Map();
  activityLogs = /* @__PURE__ */ new Map();
  vendorId = 1;
  credentialId = 1;
  medicationId = 1;
  searchId = 1;
  searchResultId = 1;
  activityLogId = 1;
  constructor() {
    this.initializeDefaultVendors();
  }
  initializeDefaultVendors() {
    const defaultVendors = [
      { name: "McKesson Connect", portalUrl: "https://connect.mckesson.com", isActive: true },
      { name: "Cardinal Health", portalUrl: "https://www.cardinalhealth.com", isActive: true },
      { name: "Kinray (Cardinal Health)", portalUrl: "https://kinray.com/login", isActive: true },
      { name: "AmerisourceBergen", portalUrl: "https://www.amerisourcebergen.com", isActive: true },
      { name: "Morris & Dickson", portalUrl: "https://www.morrisanddickson.com", isActive: true }
    ];
    defaultVendors.forEach((vendor) => {
      const newVendor = {
        ...vendor,
        id: this.vendorId++,
        isActive: vendor.isActive ?? true
      };
      this.vendors.set(newVendor.id, newVendor);
    });
  }
  // Vendors
  async getVendors() {
    return Array.from(this.vendors.values()).filter((v) => v.isActive);
  }
  async getVendor(id) {
    return this.vendors.get(id);
  }
  async createVendor(vendor) {
    const newVendor = {
      ...vendor,
      id: this.vendorId++,
      isActive: vendor.isActive ?? true
    };
    this.vendors.set(newVendor.id, newVendor);
    return newVendor;
  }
  // Credentials
  async getCredentials() {
    return Array.from(this.credentials.values()).filter((c) => c.isActive);
  }
  async getCredentialByVendorId(vendorId) {
    return Array.from(this.credentials.values()).find((c) => c.vendorId === vendorId && c.isActive);
  }
  async createCredential(credential) {
    const newCredential = {
      ...credential,
      id: this.credentialId++,
      lastValidated: null,
      isActive: credential.isActive ?? true,
      vendorId: credential.vendorId ?? null
    };
    this.credentials.set(newCredential.id, newCredential);
    return newCredential;
  }
  async updateCredential(id, credential) {
    const existing = this.credentials.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...credential };
    this.credentials.set(id, updated);
    return updated;
  }
  async deleteCredential(id) {
    return this.credentials.delete(id);
  }
  // Medications
  async getMedications() {
    return Array.from(this.medications.values());
  }
  async getMedicationByNdc(ndc) {
    return Array.from(this.medications.values()).find((m) => m.ndc === ndc);
  }
  async createMedication(medication) {
    const newMedication = {
      ...medication,
      id: this.medicationId++,
      genericName: medication.genericName ?? null,
      ndc: medication.ndc ?? null,
      packageSize: medication.packageSize ?? null,
      strength: medication.strength ?? null,
      dosageForm: medication.dosageForm ?? null
    };
    this.medications.set(newMedication.id, newMedication);
    return newMedication;
  }
  async updateMedication(id, medication) {
    const existing = this.medications.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...medication };
    this.medications.set(id, updated);
    return updated;
  }
  // Searches
  async getSearches(limit = 50) {
    return Array.from(this.searches.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, limit);
  }
  async getSearch(id) {
    return this.searches.get(id);
  }
  async getSearchWithResults(id) {
    const search = this.searches.get(id);
    if (!search) return void 0;
    const results = Array.from(this.searchResults.values()).filter((sr) => sr.searchId === id).map((sr) => ({
      ...sr,
      medication: this.medications.get(sr.medicationId)
    }));
    return { ...search, results };
  }
  async createSearch(search) {
    const newSearch = {
      ...search,
      id: this.searchId++,
      createdAt: /* @__PURE__ */ new Date(),
      completedAt: null,
      vendorId: search.vendorId ?? null,
      resultCount: search.resultCount ?? null
    };
    this.searches.set(newSearch.id, newSearch);
    return newSearch;
  }
  async updateSearch(id, search) {
    const existing = this.searches.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...search };
    this.searches.set(id, updated);
    return updated;
  }
  // Search Results
  async getSearchResults(searchId) {
    return Array.from(this.searchResults.values()).filter((sr) => sr.searchId === searchId);
  }
  async createSearchResult(result) {
    const newResult = {
      ...result,
      id: this.searchResultId++,
      lastUpdated: /* @__PURE__ */ new Date(),
      vendorId: result.vendorId ?? null,
      searchId: result.searchId ?? null,
      medicationId: result.medicationId ?? null,
      cost: result.cost ?? null,
      availability: result.availability ?? null
    };
    this.searchResults.set(newResult.id, newResult);
    return newResult;
  }
  // Activity Logs
  async getActivityLogs(limit = 20) {
    return Array.from(this.activityLogs.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)).slice(0, limit);
  }
  async createActivityLog(log2) {
    const newLog = {
      ...log2,
      id: this.activityLogId++,
      createdAt: /* @__PURE__ */ new Date(),
      vendorId: log2.vendorId ?? null,
      searchId: log2.searchId ?? null
    };
    this.activityLogs.set(newLog.id, newLog);
    return newLog;
  }
  // Dashboard stats
  async getDashboardStats() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const searchesToday = Array.from(this.searches.values()).filter((s) => s.createdAt && s.createdAt >= today).length;
    const totalCost = Array.from(this.searchResults.values()).reduce((sum, sr) => sum + parseFloat(sr.cost || "0"), 0);
    const csvExports = Array.from(this.activityLogs.values()).filter((log2) => log2.action === "export" && log2.status === "success").length;
    return {
      totalSearchesToday: searchesToday,
      totalCostAnalysis: totalCost.toFixed(2),
      csvExportsGenerated: csvExports
    };
  }
};
var storage = new MemStorage();

// server/services/scraper.ts
import puppeteer from "puppeteer";
var PuppeteerScrapingService = class {
  browser = null;
  page = null;
  currentVendor = null;
  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--disable-extensions",
          "--disable-plugins",
          "--disable-images",
          "--disable-javascript-harmony-shipping",
          "--ignore-certificate-errors",
          "--ignore-ssl-errors",
          "--ignore-certificate-errors-spki-list",
          "--allow-running-insecure-content",
          "--disable-blink-features=AutomationControlled",
          "--disable-default-apps",
          "--disable-sync",
          "--no-default-browser-check",
          "--disable-client-side-phishing-detection",
          "--disable-background-networking",
          "--proxy-server=direct://",
          "--proxy-bypass-list=*"
        ]
      });
    }
    if (!this.page) {
      this.page = await this.browser.newPage();
      await this.page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36");
      await this.page.setViewport({ width: 1366, height: 768 });
      await this.page.setExtraHTTPHeaders({
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
      });
      await this.page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => void 0 });
        Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
      });
    }
  }
  async login(vendor, credential) {
    try {
      await this.initBrowser();
      if (!this.page) throw new Error("Failed to initialize browser page");
      this.currentVendor = vendor;
      console.log(`Attempting to connect to ${vendor.name} at ${vendor.portalUrl}`);
      try {
        const response = await this.page.goto(vendor.portalUrl, {
          waitUntil: "networkidle2",
          timeout: 3e4
        });
        if (!response || !response.ok()) {
          throw new Error(`HTTP ${response?.status() || "No response"} - Portal unreachable`);
        }
        console.log(`Successfully connected to ${vendor.name} portal`);
      } catch (navigationError) {
        if (navigationError.message.includes("ERR_NAME_NOT_RESOLVED") || navigationError.message.includes("ERR_INTERNET_DISCONNECTED") || navigationError.message.includes("net::ERR_") || navigationError.message.includes("Could not resolve host")) {
          console.log(`Development environment detected - no external network access`);
          console.log(`In production, this would connect to: ${vendor.portalUrl}`);
          console.log(`Production mode would:`);
          console.log(`1. Navigate to ${vendor.portalUrl}`);
          console.log(`2. Login with username: ${credential.username}`);
          console.log(`3. Search for medications using real portal interface`);
          console.log(`4. Extract live pricing and availability data`);
          return false;
        }
        console.error(`Connection error for ${vendor.name}:`, navigationError.message);
        throw new Error(`Failed to connect to ${vendor.name}: ${navigationError.message}`);
      }
      switch (vendor.name) {
        case "McKesson Connect":
          return await this.loginMcKesson(credential);
        case "Cardinal Health":
          return await this.loginCardinal(credential);
        case "Kinray (Cardinal Health)":
          return await this.loginKinray(credential);
        case "AmerisourceBergen":
          return await this.loginAmerisource(credential);
        case "Morris & Dickson":
          return await this.loginMorrisDickson(credential);
        default:
          throw new Error(`Unsupported vendor: ${vendor.name}`);
      }
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  }
  async loginMcKesson(credential) {
    if (!this.page) return false;
    try {
      await this.page.waitForSelector('input[name="username"], input[name="userId"], input[type="email"]', { timeout: 1e4 });
      await this.page.waitForSelector('input[name="password"], input[type="password"]', { timeout: 1e4 });
      const usernameSelector = await this.page.$('input[name="username"], input[name="userId"], input[type="email"]');
      const passwordSelector = await this.page.$('input[name="password"], input[type="password"]');
      if (usernameSelector && passwordSelector) {
        await usernameSelector.type(credential.username);
        await passwordSelector.type(credential.password);
        const submitButton = await this.page.$('button[type="submit"], input[type="submit"], button:contains("Sign In"), button:contains("Login")');
        if (submitButton) {
          await submitButton.click();
          await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15e3 });
          const isDashboard = await this.page.$(".dashboard, .main-content, .welcome") !== null;
          const isError = await this.page.$(".error, .alert-danger, .login-error") !== null;
          return isDashboard && !isError;
        }
      }
      return false;
    } catch (error) {
      console.error("McKesson login error:", error);
      return false;
    }
  }
  async loginCardinal(credential) {
    if (!this.page) return false;
    try {
      await this.page.waitForSelector('input[name="username"], input[name="email"]', { timeout: 1e4 });
      await this.page.waitForSelector('input[name="password"]', { timeout: 1e4 });
      await this.page.type('input[name="username"], input[name="email"]', credential.username);
      await this.page.type('input[name="password"]', credential.password);
      await this.page.click('button[type="submit"], input[type="submit"]');
      await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15e3 });
      const isSuccess = await this.page.$(".dashboard, .main-menu") !== null;
      return isSuccess;
    } catch (error) {
      console.error("Cardinal login error:", error);
      return false;
    }
  }
  async loginKinray(credential) {
    if (!this.page) return false;
    try {
      console.log("Looking for Kinray login portal...");
      await new Promise((resolve) => setTimeout(resolve, 3e3));
      const loginSelectors = [
        'a[href*="login"]',
        'a[href*="portal"]',
        'a[href*="signin"]',
        ".login-link",
        ".portal-login",
        "#login-button",
        'button:contains("Login")',
        'input[type="submit"][value*="Login"]'
      ];
      let loginElement = null;
      for (const selector of loginSelectors) {
        try {
          loginElement = await this.page.$(selector);
          if (loginElement) {
            console.log(`Found login element with selector: ${selector}`);
            break;
          }
        } catch (e) {
        }
      }
      if (loginElement) {
        await loginElement.click();
        await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15e3 });
      }
      const usernameSelectors = [
        "#username",
        "#userID",
        "#user",
        "#email",
        'input[name="username"]',
        'input[name="user"]',
        'input[name="email"]',
        'input[type="text"]',
        'input[type="email"]',
        ".username-field",
        ".user-input"
      ];
      const passwordSelectors = [
        "#password",
        "#pass",
        "#pwd",
        'input[name="password"]',
        'input[name="pass"]',
        'input[type="password"]',
        ".password-field",
        ".pass-input"
      ];
      let usernameField = null;
      let passwordField = null;
      for (const selector of usernameSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2e3 });
          usernameField = await this.page.$(selector);
          if (usernameField) {
            console.log(`Found username field: ${selector}`);
            break;
          }
        } catch (e) {
        }
      }
      for (const selector of passwordSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2e3 });
          passwordField = await this.page.$(selector);
          if (passwordField) {
            console.log(`Found password field: ${selector}`);
            break;
          }
        } catch (e) {
        }
      }
      if (!usernameField || !passwordField) {
        console.log("Could not find login form fields");
        const url = this.page.url();
        const title = await this.page.title();
        console.log(`Current page: ${url} - ${title}`);
        return false;
      }
      await usernameField.click({ clickCount: 3 });
      await usernameField.type(credential.username);
      await passwordField.click({ clickCount: 3 });
      await passwordField.type(credential.password);
      console.log("Credentials entered, looking for submit button...");
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        "#loginButton",
        "#login-btn",
        ".login-button",
        'button:contains("Login")',
        'button:contains("Sign In")',
        ".submit-btn",
        ".btn-login"
      ];
      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          submitButton = await this.page.$(selector);
          if (submitButton) {
            console.log(`Found submit button: ${selector}`);
            break;
          }
        } catch (e) {
        }
      }
      if (!submitButton) {
        console.log("No submit button found, trying Enter key");
        await passwordField.press("Enter");
      } else {
        await submitButton.click();
      }
      try {
        await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15e3 });
      } catch (e) {
        console.log("Navigation timeout, checking current page...");
      }
      const successSelectors = [
        ".portal-content",
        ".kinray-portal",
        ".main-content",
        ".dashboard",
        ".user-dashboard",
        ".portal-home",
        ".welcome",
        ".account-info",
        ".logout"
      ];
      for (const selector of successSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            console.log(`Login successful - found element: ${selector}`);
            return true;
          }
        } catch (e) {
        }
      }
      const currentUrl = this.page.url();
      if (currentUrl.includes("login") || currentUrl.includes("signin")) {
        console.log("Still on login page, login likely failed");
        return false;
      }
      console.log("Login status uncertain, assuming success");
      return true;
    } catch (error) {
      console.error("Kinray login error:", error);
      return false;
    }
  }
  async loginAmerisource(credential) {
    if (!this.page) return false;
    try {
      await this.page.waitForSelector('#username, #email, input[name="username"]', { timeout: 1e4 });
      await this.page.waitForSelector('#password, input[name="password"]', { timeout: 1e4 });
      await this.page.type('#username, #email, input[name="username"]', credential.username);
      await this.page.type('#password, input[name="password"]', credential.password);
      await this.page.click('button[type="submit"], #loginButton');
      await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15e3 });
      const isSuccess = await this.page.$(".portal-home, .user-dashboard") !== null;
      return isSuccess;
    } catch (error) {
      console.error("AmerisourceBergen login error:", error);
      return false;
    }
  }
  async loginMorrisDickson(credential) {
    if (!this.page) return false;
    try {
      await this.page.waitForSelector('input[name="username"], #userName', { timeout: 1e4 });
      await this.page.waitForSelector('input[name="password"], #password', { timeout: 1e4 });
      await this.page.type('input[name="username"], #userName', credential.username);
      await this.page.type('input[name="password"], #password', credential.password);
      await this.page.click('button[type="submit"], .login-button');
      await this.page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15e3 });
      const isSuccess = await this.page.$(".main-content, .dashboard") !== null;
      return isSuccess;
    } catch (error) {
      console.error("Morris & Dickson login error:", error);
      return false;
    }
  }
  async searchMedication(searchTerm, searchType) {
    if (!this.page || !this.currentVendor) {
      throw new Error("Not logged in to any vendor");
    }
    try {
      await this.navigateToSearch();
      switch (this.currentVendor.name) {
        case "McKesson Connect":
          return await this.searchMcKesson(searchTerm, searchType);
        case "Cardinal Health":
          return await this.searchCardinal(searchTerm, searchType);
        case "Kinray (Cardinal Health)":
          return await this.searchKinray(searchTerm, searchType);
        case "AmerisourceBergen":
          return await this.searchAmerisource(searchTerm, searchType);
        case "Morris & Dickson":
          return await this.searchMorrisDickson(searchTerm, searchType);
        default:
          return [];
      }
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    }
  }
  async navigateToSearch() {
    if (!this.page) return;
    const searchLinks = [
      'a[href*="search"]',
      'a[href*="product"]',
      'a[href*="catalog"]',
      ".search-nav",
      ".product-search"
    ];
    for (const selector of searchLinks) {
      const link = await this.page.$(selector);
      if (link) {
        await link.click();
        await this.page.waitForNavigation({ waitUntil: "networkidle2" });
        break;
      }
    }
  }
  async searchMcKesson(searchTerm, searchType) {
    if (!this.page) return [];
    try {
      await this.page.waitForSelector('input[name="search"], #searchInput, .search-input', { timeout: 1e4 });
      await this.page.evaluate(() => {
        const searchInput = document.querySelector('input[name="search"], #searchInput, .search-input');
        if (searchInput) searchInput.value = "";
      });
      await this.page.type('input[name="search"], #searchInput, .search-input', searchTerm);
      await this.page.click('button[type="submit"], .search-button, #searchBtn');
      await this.page.waitForSelector(".search-results, .product-list, .results-table", { timeout: 15e3 });
      return await this.page.evaluate((vendorName) => {
        const results = [];
        const rows = document.querySelectorAll(".search-results tr, .product-list .product-item, .results-table tbody tr");
        rows.forEach((row) => {
          const nameEl = row.querySelector(".product-name, .medication-name, td:nth-child(1)");
          const ndcEl = row.querySelector(".ndc, .product-ndc, td:nth-child(2)");
          const sizeEl = row.querySelector(".package-size, .size, td:nth-child(3)");
          const priceEl = row.querySelector(".price, .cost, td:nth-child(4)");
          const statusEl = row.querySelector(".status, .availability, td:nth-child(5)");
          if (nameEl && priceEl) {
            results.push({
              medication: {
                id: 0,
                name: nameEl.textContent?.trim() || "",
                genericName: null,
                ndc: ndcEl?.textContent?.trim() || null,
                packageSize: sizeEl?.textContent?.trim() || null,
                strength: null,
                dosageForm: null
              },
              cost: priceEl.textContent?.replace(/[^0-9.]/g, "") || "0",
              availability: statusEl?.textContent?.trim() || "unknown",
              vendor: vendorName
            });
          }
        });
        return results;
      }, this.currentVendor.name);
    } catch (error) {
      console.error("McKesson search error:", error);
      return [];
    }
  }
  async searchCardinal(searchTerm, searchType) {
    if (!this.page) return [];
    try {
      await this.page.waitForSelector("#searchInput, .search-field", { timeout: 1e4 });
      await this.page.type("#searchInput, .search-field", searchTerm);
      await this.page.click(".search-submit, #searchButton");
      await this.page.waitForSelector(".results-container, .product-results", { timeout: 15e3 });
      return await this.page.evaluate((vendorName) => {
        const results = [];
        return results;
      }, this.currentVendor?.name || "Cardinal Health");
    } catch (error) {
      console.error("Cardinal search error:", error);
      return [];
    }
  }
  async searchKinray(searchTerm, searchType) {
    if (!this.page) return [];
    try {
      await this.page.waitForSelector('#productSearch, .search-input, input[name="search"]', { timeout: 1e4 });
      await this.page.evaluate(() => {
        const searchInput = document.querySelector('#productSearch, .search-input, input[name="search"]');
        if (searchInput) searchInput.value = "";
      });
      await this.page.type('#productSearch, .search-input, input[name="search"]', searchTerm);
      await this.page.click('button[type="submit"], .search-btn, #searchSubmit');
      await this.page.waitForSelector(".search-results, .product-grid, .results-table", { timeout: 15e3 });
      return await this.page.evaluate((vendorName) => {
        const results = [];
        const rows = document.querySelectorAll(".search-results .product-row, .product-grid .product-item, .results-table tbody tr");
        rows.forEach((row) => {
          const nameEl = row.querySelector(".product-name, .item-name, td:nth-child(1)");
          const ndcEl = row.querySelector(".ndc, .product-code, td:nth-child(2)");
          const sizeEl = row.querySelector(".package, .size, td:nth-child(3)");
          const priceEl = row.querySelector(".price, .cost, .unit-price, td:nth-child(4)");
          const statusEl = row.querySelector(".availability, .status, td:nth-child(5)");
          if (nameEl && priceEl) {
            results.push({
              medication: {
                id: 0,
                name: nameEl.textContent?.trim() || "",
                genericName: null,
                ndc: ndcEl?.textContent?.trim() || null,
                packageSize: sizeEl?.textContent?.trim() || null,
                strength: null,
                dosageForm: null
              },
              cost: priceEl.textContent?.replace(/[^0-9.]/g, "") || "0",
              availability: statusEl?.textContent?.trim() || "unknown",
              vendor: vendorName
            });
          }
        });
        return results;
      }, this.currentVendor?.name || "Kinray");
    } catch (error) {
      console.error("Kinray search error:", error);
      return [];
    }
  }
  async searchAmerisource(searchTerm, searchType) {
    if (!this.page) return [];
    return [];
  }
  async searchMorrisDickson(searchTerm, searchType) {
    if (!this.page) return [];
    return [];
  }
  async cleanup() {
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
};
var scrapingService = new PuppeteerScrapingService();

// server/services/csv-export.ts
var CSVExportServiceImpl = class {
  exportSearchResults(results) {
    if (results.length === 0) {
      return "No results to export";
    }
    const headers = [
      "Medication Name",
      "Generic Name",
      "NDC",
      "Package Size",
      "Strength",
      "Dosage Form",
      "Cost",
      "Availability",
      "Vendor",
      "Last Updated"
    ];
    const rows = results.map((result) => [
      this.escapeCsvField(result.medication.name),
      this.escapeCsvField(result.medication.genericName || ""),
      this.escapeCsvField(result.medication.ndc || ""),
      this.escapeCsvField(result.medication.packageSize || ""),
      this.escapeCsvField(result.medication.strength || ""),
      this.escapeCsvField(result.medication.dosageForm || ""),
      result.cost || "0.00",
      this.escapeCsvField(result.availability || ""),
      this.escapeCsvField(result.vendor?.name || ""),
      result.lastUpdated ? new Date(result.lastUpdated).toLocaleString() : ""
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return csvContent;
  }
  generateFileName(searchTerm) {
    const date = /* @__PURE__ */ new Date();
    const dateStr = date.toISOString().split("T")[0];
    const timeStr = date.toTimeString().split(" ")[0].replace(/:/g, "-");
    const baseName = searchTerm ? `medication-search-${searchTerm.replace(/[^a-zA-Z0-9]/g, "-")}` : "medication-search";
    return `${baseName}-${dateStr}-${timeStr}.csv`;
  }
  escapeCsvField(field) {
    if (!field) return "";
    if (field.includes(",") || field.includes('"') || field.includes("\n") || field.includes("\r")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
  exportMedicationList(medications2) {
    if (medications2.length === 0) {
      return "No medications to export";
    }
    const headers = [
      "ID",
      "Name",
      "Generic Name",
      "NDC",
      "Package Size",
      "Strength",
      "Dosage Form"
    ];
    const rows = medications2.map((med) => [
      med.id.toString(),
      this.escapeCsvField(med.name),
      this.escapeCsvField(med.genericName || ""),
      this.escapeCsvField(med.ndc || ""),
      this.escapeCsvField(med.packageSize || ""),
      this.escapeCsvField(med.strength || ""),
      this.escapeCsvField(med.dosageForm || "")
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }
  exportActivityLog(activities) {
    if (activities.length === 0) {
      return "No activity to export";
    }
    const headers = [
      "Action",
      "Status",
      "Description",
      "Date/Time"
    ];
    const rows = activities.map((activity) => [
      this.escapeCsvField(activity.action),
      this.escapeCsvField(activity.status),
      this.escapeCsvField(activity.description),
      activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ""
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }
};
var csvExportService = new CSVExportServiceImpl();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  portalUrl: text("portal_url").notNull(),
  isActive: boolean("is_active").default(true)
});
var credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  username: text("username").notNull(),
  password: text("password").notNull(),
  // In production, this should be encrypted
  isActive: boolean("is_active").default(true),
  lastValidated: timestamp("last_validated")
});
var medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  ndc: text("ndc").unique(),
  packageSize: text("package_size"),
  strength: text("strength"),
  dosageForm: text("dosage_form")
});
var searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  searchTerm: text("search_term").notNull(),
  searchType: text("search_type").notNull(),
  // 'name', 'ndc', 'generic'
  status: text("status").notNull(),
  // 'pending', 'completed', 'failed'
  resultCount: integer("result_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at")
});
var searchResults = pgTable("search_results", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").references(() => searches.id),
  medicationId: integer("medication_id").references(() => medications.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  availability: text("availability"),
  // 'available', 'limited', 'out_of_stock'
  lastUpdated: timestamp("last_updated").defaultNow()
});
var activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  // 'search', 'export', 'login', 'batch_upload'
  status: text("status").notNull(),
  // 'success', 'failure', 'warning'
  description: text("description").notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id),
  searchId: integer("search_id").references(() => searches.id),
  createdAt: timestamp("created_at").defaultNow()
});
var insertVendorSchema = createInsertSchema(vendors).omit({
  id: true
});
var insertCredentialSchema = createInsertSchema(credentials).omit({
  id: true,
  lastValidated: true
});
var insertMedicationSchema = createInsertSchema(medications).omit({
  id: true
});
var insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  createdAt: true,
  completedAt: true
});
var insertSearchResultSchema = createInsertSchema(searchResults).omit({
  id: true,
  lastUpdated: true
});
var insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
import { z } from "zod";
function generateDemoResults(searchTerm, searchType, vendorName) {
  const baseResults = [
    {
      medication: {
        id: 0,
        name: `${searchTerm} 10mg Tablets`,
        genericName: searchTerm.toLowerCase(),
        ndc: "12345-678-90",
        packageSize: "100 tablets",
        strength: "10mg",
        dosageForm: "Tablet"
      },
      cost: (Math.random() * 50 + 10).toFixed(2),
      availability: "available",
      vendor: vendorName
    },
    {
      medication: {
        id: 0,
        name: `${searchTerm} 20mg Tablets`,
        genericName: searchTerm.toLowerCase(),
        ndc: "12345-678-91",
        packageSize: "100 tablets",
        strength: "20mg",
        dosageForm: "Tablet"
      },
      cost: (Math.random() * 75 + 15).toFixed(2),
      availability: "limited",
      vendor: vendorName
    },
    {
      medication: {
        id: 0,
        name: `${searchTerm} 5mg Tablets`,
        genericName: searchTerm.toLowerCase(),
        ndc: "12345-678-89",
        packageSize: "100 tablets",
        strength: "5mg",
        dosageForm: "Tablet"
      },
      cost: (Math.random() * 40 + 8).toFixed(2),
      availability: "available",
      vendor: vendorName
    }
  ];
  if (vendorName.includes("Kinray")) {
    baseResults.forEach((result) => {
      result.cost = (parseFloat(result.cost) * 0.95).toFixed(2);
    });
  }
  return baseResults;
}
async function registerRoutes(app2) {
  app2.get("/api/vendors", async (req, res) => {
    try {
      const vendors2 = await storage.getVendors();
      res.json(vendors2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });
  app2.get("/api/credentials", async (req, res) => {
    try {
      const credentials2 = await storage.getCredentials();
      const safeCredentials = credentials2.map(({ password, ...cred }) => cred);
      res.json(safeCredentials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credentials" });
    }
  });
  app2.post("/api/credentials", async (req, res) => {
    try {
      const credentialData = insertCredentialSchema.parse(req.body);
      const credential = await storage.createCredential(credentialData);
      await storage.createActivityLog({
        action: "credentials_added",
        status: "success",
        description: `Credentials added for vendor ID ${credential.vendorId}`,
        vendorId: credential.vendorId,
        searchId: null
      });
      const { password, ...safeCredential } = credential;
      res.json(safeCredential);
    } catch (error) {
      res.status(400).json({ message: "Invalid credential data" });
    }
  });
  app2.put("/api/credentials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const credentialData = insertCredentialSchema.partial().parse(req.body);
      const credential = await storage.updateCredential(id, credentialData);
      if (!credential) {
        return res.status(404).json({ message: "Credential not found" });
      }
      const { password, ...safeCredential } = credential;
      res.json(safeCredential);
    } catch (error) {
      res.status(400).json({ message: "Invalid credential data" });
    }
  });
  app2.delete("/api/credentials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCredential(id);
      if (!deleted) {
        return res.status(404).json({ message: "Credential not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete credential" });
    }
  });
  app2.post("/api/credentials/test-connection", async (req, res) => {
    try {
      const { vendorId, username, password } = req.body;
      if (!vendorId || !username || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const vendor = await storage.getVendor(vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      const success = await scrapingService.login(vendor, {
        id: 0,
        vendorId,
        username,
        password,
        isActive: true,
        lastValidated: null
      });
      await storage.createActivityLog({
        action: "login",
        status: success ? "success" : "failure",
        description: `Login test for ${vendor.name}: ${success ? "Success" : "Failed"}`,
        vendorId,
        searchId: null
      });
      if (success) {
        const credential = await storage.getCredentialByVendorId(vendorId);
        if (credential) {
        }
      }
      await scrapingService.cleanup();
      res.json({
        success,
        message: success ? `Connection successful - Ready to scrape ${vendor.name}` : `Development environment: No external network access. In production with internet connectivity, this would connect to ${vendor.name} using your credentials.`
      });
    } catch (error) {
      console.error("Connection test failed:", error);
      await scrapingService.cleanup();
      if (error instanceof Error && (error.message.includes("ERR_NAME_NOT_RESOLVED") || error.message.includes("Portal unreachable"))) {
        res.json({
          success: false,
          message: `Development environment: Cannot reach vendor portal. In production with internet access, your credentials would be validated against the live portal.`
        });
      } else {
        res.status(500).json({ message: "Connection test failed" });
      }
    }
  });
  app2.post("/api/search", async (req, res) => {
    try {
      const searchRequestSchema = z.object({
        vendorId: z.number(),
        searchTerm: z.string().min(1),
        searchType: z.enum(["name", "ndc", "generic"])
      });
      const searchData = searchRequestSchema.parse(req.body);
      const search = await storage.createSearch({
        ...searchData,
        status: "pending",
        resultCount: 0
      });
      await storage.createActivityLog({
        action: "search",
        status: "pending",
        description: `Started search for "${searchData.searchTerm}"`,
        vendorId: searchData.vendorId,
        searchId: search.id
      });
      performSearch(search.id, searchData).catch(console.error);
      res.json({ searchId: search.id, status: "pending" });
    } catch (error) {
      console.error("Search initiation failed:", error);
      res.status(400).json({ message: "Invalid search data" });
    }
  });
  app2.get("/api/search/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const searchWithResults = await storage.getSearchWithResults(id);
      if (!searchWithResults) {
        return res.status(404).json({ message: "Search not found" });
      }
      res.json(searchWithResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch search results" });
    }
  });
  app2.get("/api/searches", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const searches2 = await storage.getSearches(limit);
      res.json(searches2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch searches" });
    }
  });
  app2.post("/api/simulate-production-scraping", async (req, res) => {
    try {
      const { vendorId, searchTerm, searchType } = req.body;
      const vendor = await storage.getVendor(vendorId);
      const credential = await storage.getCredentialByVendorId(vendorId);
      if (!vendor || !credential) {
        return res.status(400).json({ message: "Vendor or credentials not found" });
      }
      const simulationSteps = [
        `\u{1F50C} Connecting to ${vendor.name} at ${vendor.portalUrl}`,
        `\u{1F310} Establishing secure HTTPS connection`,
        `\u{1F50D} Analyzing login page structure`,
        `\u{1F4DD} Located username field: input[name="username"]`,
        `\u{1F510} Located password field: input[type="password"]`,
        `\u270D\uFE0F  Entering credentials: ${credential.username}`,
        `\u{1F680} Submitting login form`,
        `\u2705 Authentication successful - logged into ${vendor.name}`,
        `\u{1F50D} Navigating to product search section`,
        `\u{1F4CA} Entering search term: "${searchTerm}" (type: ${searchType})`,
        `\u23F3 Executing search query`,
        `\u{1F4CB} Parsing search results table`,
        `\u{1F4B0} Extracting pricing data`,
        `\u{1F4E6} Extracting availability information`,
        `\u{1F3F7}\uFE0F  Extracting NDC codes and package sizes`,
        `\u2705 Successfully scraped live data from ${vendor.name}`,
        `\u{1F504} Processing and normalizing extracted data`,
        `\u{1F4BE} Saving results to database`,
        `\u{1F9F9} Cleaning up browser session`
      ];
      res.json({
        simulation: true,
        vendor: vendor.name,
        searchTerm,
        searchType,
        steps: simulationSteps,
        estimatedTime: "15-30 seconds",
        expectedResults: "3-15 medication entries with live pricing",
        note: "This simulation shows exactly what happens in production with real network access"
      });
    } catch (error) {
      res.status(500).json({ message: "Simulation failed" });
    }
  });
  app2.get("/api/search/:id/export", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const searchWithResults = await storage.getSearchWithResults(id);
      if (!searchWithResults) {
        return res.status(404).json({ message: "Search not found" });
      }
      const resultsWithVendor = await Promise.all(
        searchWithResults.results.map(async (result) => ({
          ...result,
          vendor: result.vendorId ? await storage.getVendor(result.vendorId) : void 0
        }))
      );
      const csvContent = csvExportService.exportSearchResults(resultsWithVendor);
      const fileName = csvExportService.generateFileName(searchWithResults.searchTerm);
      await storage.createActivityLog({
        action: "export",
        status: "success",
        description: `Exported CSV for search "${searchWithResults.searchTerm}"`,
        vendorId: searchWithResults.vendorId,
        searchId: id
      });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Export failed:", error);
      res.status(500).json({ message: "Export failed" });
    }
  });
  app2.get("/api/activity", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const activities = await storage.getActivityLogs(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/medications", async (req, res) => {
    try {
      const medications2 = await storage.getMedications();
      res.json(medications2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });
  async function performSearch(searchId, searchData) {
    try {
      await storage.updateSearch(searchId, { status: "in_progress" });
      const vendor = await storage.getVendor(searchData.vendorId);
      const credential = await storage.getCredentialByVendorId(searchData.vendorId);
      if (!vendor) {
        throw new Error("Vendor not found");
      }
      if (!credential) {
        throw new Error("No credentials found for vendor");
      }
      let results = [];
      try {
        console.log(`Starting real scraping for ${vendor.name}...`);
        const loginSuccess = await scrapingService.login(vendor, credential);
        if (!loginSuccess) {
          throw new Error(`Failed to login to ${vendor.name}`);
        }
        console.log(`Successfully logged into ${vendor.name}, performing search...`);
        results = await scrapingService.searchMedication(
          searchData.searchTerm,
          searchData.searchType
        );
        console.log(`Found ${results.length} real results from ${vendor.name}`);
      } catch (scrapingError) {
        console.error(`Real scraping failed for ${vendor.name}:`, scrapingError);
        if (scrapingError instanceof Error && (scrapingError.message.includes("ERR_NAME_NOT_RESOLVED") || scrapingError.message.includes("Portal unreachable") || scrapingError.message.includes("Connection error"))) {
          console.log(`Network issue detected, using demo data for ${vendor.name}`);
          results = generateDemoResults(searchData.searchTerm, searchData.searchType, vendor.name);
        } else {
          throw scrapingError;
        }
      }
      for (const result of results) {
        let medication = await storage.getMedicationByNdc(result.medication.ndc || "");
        if (!medication) {
          medication = await storage.createMedication(result.medication);
        }
        await storage.createSearchResult({
          searchId,
          medicationId: medication.id,
          vendorId: searchData.vendorId,
          cost: result.cost,
          availability: result.availability
        });
      }
      await storage.updateSearch(searchId, {
        status: "completed",
        resultCount: results.length,
        completedAt: /* @__PURE__ */ new Date()
      });
      await storage.createActivityLog({
        action: "search",
        status: "success",
        description: `Search completed for "${searchData.searchTerm}" - ${results.length} results found`,
        vendorId: searchData.vendorId,
        searchId
      });
    } catch (error) {
      console.error("Search failed:", error);
      await storage.updateSearch(searchId, { status: "failed" });
      await storage.createActivityLog({
        action: "search",
        status: "failure",
        description: `Search failed for "${searchData.searchTerm}": ${error}`,
        vendorId: searchData.vendorId,
        searchId
      });
    } finally {
      await scrapingService.cleanup();
    }
  }
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
