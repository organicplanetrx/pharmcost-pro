import { useQuery } from "@tanstack/react-query";
import { Shield, Settings, PillBottle } from "lucide-react";
import CredentialForm from "@/components/credential-form";
import SearchInterface from "@/components/search-interface";
import ActivityLog from "@/components/activity-log";
import LoadingModal from "@/components/loading-modal";
import { DashboardStats } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <PillBottle className="h-8 w-8 text-primary mr-3" />
                <span className="text-2xl font-bold text-slate-800">PharmaCost Pro</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secure Connection</span>
              </div>
              <Button variant="outline" className="text-slate-700">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Credentials */}
          <div className="lg:col-span-1">
            <CredentialForm />
            
            {/* Quick Actions */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-slate-700"
                  >
                    <i className="fas fa-history mr-3" />
                    View Search History
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-slate-700"
                  >
                    <i className="fas fa-download mr-3" />
                    Export All Data
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-slate-700"
                  >
                    <i className="fas fa-upload mr-3" />
                    Import Medication List
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Search Interface */}
          <div className="lg:col-span-2">
            <SearchInterface />

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-search text-primary text-2xl" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {statsLoading ? "..." : stats?.totalSearchesToday || 0}
                      </h3>
                      <p className="text-sm text-slate-600">Total Searches Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-dollar-sign text-emerald-600 text-2xl" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-slate-800">
                        ${statsLoading ? "..." : stats?.totalCostAnalysis || "0.00"}
                      </h3>
                      <p className="text-sm text-slate-600">Total Cost Analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-download text-slate-600 text-2xl" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {statsLoading ? "..." : stats?.csvExportsGenerated || 0}
                      </h3>
                      <p className="text-sm text-slate-600">CSV Exports Generated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <ActivityLog />
      </main>

      <LoadingModal />
    </div>
  );
}
