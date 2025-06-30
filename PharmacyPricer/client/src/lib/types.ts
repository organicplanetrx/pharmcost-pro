export interface DashboardStats {
  totalSearchesToday: number;
  totalCostAnalysis: string;
  csvExportsGenerated: number;
}

export interface SearchFormData {
  vendorId: number;
  searchTerm: string;
  searchType: 'name' | 'ndc' | 'generic';
}

export interface CredentialFormData {
  vendorId: number;
  username: string;
  password: string;
  rememberCredentials: boolean;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}

export interface SearchResponse {
  searchId: number;
  status: string;
}
