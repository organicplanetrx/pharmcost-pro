import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Key, User, Lock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CredentialFormData, TestConnectionResponse } from "@/lib/types";
import { Vendor } from "@shared/schema";

const credentialSchema = z.object({
  vendorId: z.number().min(1, "Please select a vendor"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberCredentials: z.boolean().default(false),
});

export default function CredentialForm() {
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const form = useForm<CredentialFormData>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      vendorId: 0,
      username: "",
      password: "",
      rememberCredentials: false,
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (data: CredentialFormData) => {
      const response = await apiRequest("POST", "/api/credentials/test-connection", data);
      return response.json() as Promise<TestConnectionResponse>;
    },
    onSuccess: (data) => {
      setConnectionStatus(data);
      if (data.success) {
        toast({
          title: "Connection Successful",
          description: data.message,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Connection Error",
        description: "Failed to test connection",
        variant: "destructive",
      });
    },
  });

  const saveCredentialsMutation = useMutation({
    mutationFn: async (data: CredentialFormData) => {
      const response = await apiRequest("POST", "/api/credentials", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Credentials Saved",
        description: "Your credentials have been saved securely",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/credentials"] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save credentials",
        variant: "destructive",
      });
    },
  });

  const onTestConnection = async (data: CredentialFormData) => {
    testConnectionMutation.mutate(data);
  };

  const onSaveCredentials = async (data: CredentialFormData) => {
    if (data.rememberCredentials) {
      saveCredentialsMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <Key className="h-5 w-5 text-primary mr-3" />
          <h2 className="text-xl font-semibold text-slate-800">Vendor Credentials</h2>
        </div>

        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Portal</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vendor portal" />
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

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter your vendor username"
                        {...field}
                        className="pr-10"
                      />
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="Enter your vendor password"
                        {...field}
                        className="pr-10"
                      />
                      <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberCredentials"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-slate-700">
                      Remember credentials (stored securely)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="button"
              onClick={form.handleSubmit(onTestConnection)}
              disabled={testConnectionMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <i className="fas fa-plug mr-2" />
              {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
            </Button>

            {form.watch("rememberCredentials") && (
              <Button
                type="button"
                onClick={form.handleSubmit(onSaveCredentials)}
                disabled={saveCredentialsMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {saveCredentialsMutation.isPending ? "Saving..." : "Save Credentials"}
              </Button>
            )}

            {/* Connection Status */}
            {connectionStatus && (
              <div className={`flex items-center p-3 rounded-lg border ${
                connectionStatus.success 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <CheckCircle className={`h-4 w-4 mr-2 ${connectionStatus.success ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm">{connectionStatus.message}</span>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
