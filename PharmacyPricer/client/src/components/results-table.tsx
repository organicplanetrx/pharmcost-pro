import { useQuery } from "@tanstack/react-query";
import { Download, Eye, ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchWithResults } from "@shared/schema";

interface ResultsTableProps {
  searchId: number;
}

export default function ResultsTable({ searchId }: ResultsTableProps) {
  const { data: searchResults, isLoading } = useQuery<SearchWithResults>({
    queryKey: [`/api/search/${searchId}`],
    refetchInterval: (data) => data?.status === 'pending' || data?.status === 'in_progress' ? 2000 : false,
  });

  const handleExport = () => {
    window.open(`/api/search/${searchId}/export`, '_blank');
  };

  const getStatusBadge = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'limited':
        return <Badge className="bg-yellow-100 text-yellow-800">Limited</Badge>;
      case 'out_of_stock':
      case 'out of stock':
        return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Search Results</h3>
            <span className="text-sm text-slate-600">Loading...</span>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-slate-600">Searching for medications...</p>
        </div>
      </div>
    );
  }

  if (!searchResults) {
    return null;
  }

  if (searchResults.status === 'failed') {
    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Search Results</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-red-600">Search failed. Please try again or check your credentials.</p>
        </div>
      </div>
    );
  }

  if (searchResults.status === 'pending' || searchResults.status === 'in_progress') {
    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Search Results</h3>
            <span className="text-sm text-slate-600">Search in progress...</span>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-slate-600">Searching vendor portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Search Results</h3>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-600">
              {searchResults.results.length} results found
            </span>
            {searchResults.results.length > 0 && (
              <Button
                onClick={handleExport}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </div>

      {searchResults.results.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-slate-600">No medications found for your search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-slate-700">
                  <div className="flex items-center">
                    Medication Name
                    <ArrowUpDown className="h-4 w-4 ml-2 text-slate-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">
                  <div className="flex items-center">
                    NDC
                    <ArrowUpDown className="h-4 w-4 ml-2 text-slate-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">
                  <div className="flex items-center">
                    Package Size
                    <ArrowUpDown className="h-4 w-4 ml-2 text-slate-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">
                  <div className="flex items-center">
                    Cost
                    <ArrowUpDown className="h-4 w-4 ml-2 text-slate-400" />
                  </div>
                </th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {searchResults.results.map((result) => (
                <tr key={result.id} className="hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-slate-900">
                        {result.medication.name}
                      </div>
                      {result.medication.genericName && (
                        <div className="text-sm text-slate-500">
                          Generic for {result.medication.genericName}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-700">
                    {result.medication.ndc || 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-slate-700">
                    {result.medication.packageSize || 'N/A'}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-900">
                      ${result.cost}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(result.availability || 'unknown')}
                  </td>
                  <td className="py-4 px-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
