import {
  vendors,
  credentials,
  medications,
  searches,
  searchResults,
  activityLogs,
  type Vendor,
  type InsertVendor,
  type Credential,
  type InsertCredential,
  type Medication,
  type InsertMedication,
  type Search,
  type InsertSearch,
  type SearchResult,
  type InsertSearchResult,
  type ActivityLog,
  type InsertActivityLog,
  type SearchWithResults,
} from "@shared/schema";

export interface IStorage {
  // Vendors
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;

  // Credentials
  getCredentials(): Promise<Credential[]>;
  getCredentialByVendorId(vendorId: number): Promise<Credential | undefined>;
  createCredential(credential: InsertCredential): Promise<Credential>;
  updateCredential(id: number, credential: Partial<InsertCredential>): Promise<Credential | undefined>;
  deleteCredential(id: number): Promise<boolean>;

  // Medications
  getMedications(): Promise<Medication[]>;
  getMedicationByNdc(ndc: string): Promise<Medication | undefined>;
  createMedication(medication: InsertMedication): Promise<Medication>;
  updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined>;

  // Searches
  getSearches(limit?: number): Promise<Search[]>;
  getSearch(id: number): Promise<Search | undefined>;
  getSearchWithResults(id: number): Promise<SearchWithResults | undefined>;
  createSearch(search: InsertSearch): Promise<Search>;
  updateSearch(id: number, search: Partial<Search>): Promise<Search | undefined>;

  // Search Results
  getSearchResults(searchId: number): Promise<SearchResult[]>;
  createSearchResult(result: InsertSearchResult): Promise<SearchResult>;

  // Activity Logs
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalSearchesToday: number;
    totalCostAnalysis: string;
    csvExportsGenerated: number;
  }>;
}

export class MemStorage implements IStorage {
  private vendors: Map<number, Vendor> = new Map();
  private credentials: Map<number, Credential> = new Map();
  private medications: Map<number, Medication> = new Map();
  private searches: Map<number, Search> = new Map();
  private searchResults: Map<number, SearchResult> = new Map();
  private activityLogs: Map<number, ActivityLog> = new Map();
  
  private vendorId = 1;
  private credentialId = 1;
  private medicationId = 1;
  private searchId = 1;
  private searchResultId = 1;
  private activityLogId = 1;

  constructor() {
    // Initialize with default vendors
    this.initializeDefaultVendors();
  }

  private initializeDefaultVendors() {
    const defaultVendors = [
      { name: "McKesson Connect", portalUrl: "https://connect.mckesson.com", isActive: true },
      { name: "Cardinal Health", portalUrl: "https://www.cardinalhealth.com", isActive: true },
      { name: "Kinray (Cardinal Health)", portalUrl: "https://kinrayweblink.cardinalhealth.com/login", isActive: true },
      { name: "AmerisourceBergen", portalUrl: "https://www.amerisourcebergen.com", isActive: true },
      { name: "Morris & Dickson", portalUrl: "https://www.morrisanddickson.com", isActive: true },
    ];

    defaultVendors.forEach(vendor => {
      const newVendor: Vendor = { 
        ...vendor, 
        id: this.vendorId++,
        isActive: vendor.isActive ?? true
      };
      this.vendors.set(newVendor.id, newVendor);
    });
  }

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(v => v.isActive);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const newVendor: Vendor = { 
      ...vendor, 
      id: this.vendorId++,
      isActive: vendor.isActive ?? true
    };
    this.vendors.set(newVendor.id, newVendor);
    return newVendor;
  }

  // Credentials
  async getCredentials(): Promise<Credential[]> {
    return Array.from(this.credentials.values()).filter(c => c.isActive);
  }

  async getCredentialByVendorId(vendorId: number): Promise<Credential | undefined> {
    return Array.from(this.credentials.values()).find(c => c.vendorId === vendorId && c.isActive);
  }

  async createCredential(credential: InsertCredential): Promise<Credential> {
    const newCredential: Credential = {
      ...credential,
      id: this.credentialId++,
      lastValidated: null,
      isActive: credential.isActive ?? true,
      vendorId: credential.vendorId ?? null,
    };
    this.credentials.set(newCredential.id, newCredential);
    return newCredential;
  }

  async updateCredential(id: number, credential: Partial<InsertCredential>): Promise<Credential | undefined> {
    const existing = this.credentials.get(id);
    if (!existing) return undefined;
    
    const updated: Credential = { ...existing, ...credential };
    this.credentials.set(id, updated);
    return updated;
  }

  async deleteCredential(id: number): Promise<boolean> {
    return this.credentials.delete(id);
  }

  // Medications
  async getMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }

  async getMedicationByNdc(ndc: string): Promise<Medication | undefined> {
    return Array.from(this.medications.values()).find(m => m.ndc === ndc);
  }

  async createMedication(medication: InsertMedication): Promise<Medication> {
    const newMedication: Medication = { 
      ...medication, 
      id: this.medicationId++,
      genericName: medication.genericName ?? null,
      ndc: medication.ndc ?? null,
      packageSize: medication.packageSize ?? null,
      strength: medication.strength ?? null,
      dosageForm: medication.dosageForm ?? null,
    };
    this.medications.set(newMedication.id, newMedication);
    return newMedication;
  }

  async updateMedication(id: number, medication: Partial<InsertMedication>): Promise<Medication | undefined> {
    const existing = this.medications.get(id);
    if (!existing) return undefined;
    
    const updated: Medication = { ...existing, ...medication };
    this.medications.set(id, updated);
    return updated;
  }

  // Searches
  async getSearches(limit = 50): Promise<Search[]> {
    return Array.from(this.searches.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getSearch(id: number): Promise<Search | undefined> {
    return this.searches.get(id);
  }

  async getSearchWithResults(id: number): Promise<SearchWithResults | undefined> {
    const search = this.searches.get(id);
    if (!search) return undefined;

    const results = Array.from(this.searchResults.values())
      .filter(sr => sr.searchId === id)
      .map(sr => ({
        ...sr,
        medication: this.medications.get(sr.medicationId!)!,
      }));

    return { ...search, results };
  }

  async createSearch(search: InsertSearch): Promise<Search> {
    const newSearch: Search = {
      ...search,
      id: this.searchId++,
      createdAt: new Date(),
      completedAt: null,
      vendorId: search.vendorId ?? null,
      resultCount: search.resultCount ?? null,
    };
    this.searches.set(newSearch.id, newSearch);
    return newSearch;
  }

  async updateSearch(id: number, search: Partial<Search>): Promise<Search | undefined> {
    const existing = this.searches.get(id);
    if (!existing) return undefined;
    
    const updated: Search = { ...existing, ...search };
    this.searches.set(id, updated);
    return updated;
  }

  // Search Results
  async getSearchResults(searchId: number): Promise<SearchResult[]> {
    return Array.from(this.searchResults.values()).filter(sr => sr.searchId === searchId);
  }

  async createSearchResult(result: InsertSearchResult): Promise<SearchResult> {
    const newResult: SearchResult = {
      ...result,
      id: this.searchResultId++,
      lastUpdated: new Date(),
      vendorId: result.vendorId ?? null,
      searchId: result.searchId ?? null,
      medicationId: result.medicationId ?? null,
      cost: result.cost ?? null,
      availability: result.availability ?? null,
    };
    this.searchResults.set(newResult.id, newResult);
    return newResult;
  }

  // Activity Logs
  async getActivityLogs(limit = 20): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const newLog: ActivityLog = {
      ...log,
      id: this.activityLogId++,
      createdAt: new Date(),
      vendorId: log.vendorId ?? null,
      searchId: log.searchId ?? null,
    };
    this.activityLogs.set(newLog.id, newLog);
    return newLog;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalSearchesToday: number;
    totalCostAnalysis: string;
    csvExportsGenerated: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const searchesToday = Array.from(this.searches.values())
      .filter(s => s.createdAt && s.createdAt >= today).length;

    const totalCost = Array.from(this.searchResults.values())
      .reduce((sum, sr) => sum + parseFloat(sr.cost || "0"), 0);

    const csvExports = Array.from(this.activityLogs.values())
      .filter(log => log.action === 'export' && log.status === 'success').length;

    return {
      totalSearchesToday: searchesToday,
      totalCostAnalysis: totalCost.toFixed(2),
      csvExportsGenerated: csvExports,
    };
  }
}

export const storage = new MemStorage();
