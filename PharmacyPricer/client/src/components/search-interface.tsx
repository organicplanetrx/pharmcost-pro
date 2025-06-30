import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Clock, Upload, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SearchFormData, SearchResponse } from "@/lib/types";
import { Vendor } from "@shared/schema";
import ResultsTable from "./results-table";

const searchSchema = z.object({
  vendorId: z.number().min(1, "Please select a vendor"),
  searchTerm: z.string().min(1, "Search term is required"),
  searchType: z.enum(['name', 'ndc', 'generic'], {
    required_error: "Please select a search type",
  }),
});

export default function SearchInterface() {
  const [currentSearchId, setCurrentSearchId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      vendorId: 1, // Default to first vendor (McKesson Connect)
      searchTerm: "",
      searchType: "name",
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (data: SearchFormData) => {
      const response = await apiRequest("POST", "/api/search", data);
      return response.json() as Promise<SearchResponse>;
    },
    onSuccess: (data) => {
      setCurrentSearchId(data.searchId);
      toast({
        title: "Search Started",
        description: "Your medication search is in progress...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: () => {
      toast({
        title: "Search Failed",
        description: "Failed to start medication search",
        variant: "destructive",
      });
    },
  });

  const onSearch = async (data: SearchFormData) => {
    searchMutation.mutate(data);
  };

  const onClear = () => {
    form.reset();
    setCurrentSearchId(null);
  };

  const onBatchUpload = () => {
    toast({
      title: "Coming Soon",
      description: "Batch upload functionality will be available soon",
    });
  };

  const onDemoSearch = () => {
    form.setValue("searchTerm", "Lisinopril 10mg");
    form.setValue("searchType", "name");
    toast({
      title: "Demo Search",
      description: "Filled in sample medication search. Click Search to test!",
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Search className="h-5 w-5 text-primary mr-3" />
            <h2 className="text-xl font-semibold text-slate-800">Medication Search</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>Last updated: <span>2 minutes ago</span></span>
          </div>
        </div>

        {/* Search Form */}
        <Form {...form}>
          <form className="mb-6">
            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="searchType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select search type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="name">Medication Name</SelectItem>
                          <SelectItem value="ndc">NDC Number</SelectItem>
                          <SelectItem value="generic">Generic Name</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="searchTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Term</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter medication name or NDC"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="hidden mb-4">
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors?.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id.toString()}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSearch)}
                  disabled={searchMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {searchMutation.isPending ? "Searching..." : "Search"}
                </Button>
                <Button
                  type="button"
                  onClick={onClear}
                  variant="outline"
                  className="text-slate-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  type="button"
                  onClick={onDemoSearch}
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Demo Search
                </Button>
              </div>
              <Button
                type="button"
                onClick={onBatchUpload}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Batch Upload
              </Button>
            </div>
          </form>
        </Form>

        {/* Results Table */}
        {currentSearchId && <ResultsTable searchId={currentSearchId} />}
      </CardContent>
    </Card>
  );
}
