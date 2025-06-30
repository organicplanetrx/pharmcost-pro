import { SearchResult, Medication, Vendor } from '@shared/schema';

export interface CSVExportService {
  exportSearchResults(results: (SearchResult & { medication: Medication; vendor?: Vendor })[]): string;
  generateFileName(searchTerm?: string): string;
}

export class CSVExportServiceImpl implements CSVExportService {
  exportSearchResults(results: (SearchResult & { medication: Medication; vendor?: Vendor })[]): string {
    if (results.length === 0) {
      return 'No results to export';
    }

    // CSV Headers
    const headers = [
      'Medication Name',
      'Generic Name',
      'NDC',
      'Package Size',
      'Strength',
      'Dosage Form',
      'Cost',
      'Availability',
      'Vendor',
      'Last Updated'
    ];

    // Convert results to CSV rows
    const rows = results.map(result => [
      this.escapeCsvField(result.medication.name),
      this.escapeCsvField(result.medication.genericName || ''),
      this.escapeCsvField(result.medication.ndc || ''),
      this.escapeCsvField(result.medication.packageSize || ''),
      this.escapeCsvField(result.medication.strength || ''),
      this.escapeCsvField(result.medication.dosageForm || ''),
      result.cost || '0.00',
      this.escapeCsvField(result.availability || ''),
      this.escapeCsvField(result.vendor?.name || ''),
      result.lastUpdated ? new Date(result.lastUpdated).toLocaleString() : ''
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csvContent;
  }

  generateFileName(searchTerm?: string): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
    
    const baseName = searchTerm 
      ? `medication-search-${searchTerm.replace(/[^a-zA-Z0-9]/g, '-')}`
      : 'medication-search';
    
    return `${baseName}-${dateStr}-${timeStr}.csv`;
  }

  private escapeCsvField(field: string): string {
    if (!field) return '';
    
    // Escape fields that contain commas, quotes, or newlines
    if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
      // Escape quotes by doubling them and wrap the field in quotes
      return `"${field.replace(/"/g, '""')}"`;
    }
    
    return field;
  }

  exportMedicationList(medications: Medication[]): string {
    if (medications.length === 0) {
      return 'No medications to export';
    }

    const headers = [
      'ID',
      'Name',
      'Generic Name',
      'NDC',
      'Package Size',
      'Strength',
      'Dosage Form'
    ];

    const rows = medications.map(med => [
      med.id.toString(),
      this.escapeCsvField(med.name),
      this.escapeCsvField(med.genericName || ''),
      this.escapeCsvField(med.ndc || ''),
      this.escapeCsvField(med.packageSize || ''),
      this.escapeCsvField(med.strength || ''),
      this.escapeCsvField(med.dosageForm || '')
    ]);

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }

  exportActivityLog(activities: { action: string; status: string; description: string; createdAt: Date | null }[]): string {
    if (activities.length === 0) {
      return 'No activity to export';
    }

    const headers = [
      'Action',
      'Status',
      'Description',
      'Date/Time'
    ];

    const rows = activities.map(activity => [
      this.escapeCsvField(activity.action),
      this.escapeCsvField(activity.status),
      this.escapeCsvField(activity.description),
      activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ''
    ]);

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }
}

export const csvExportService = new CSVExportServiceImpl();
