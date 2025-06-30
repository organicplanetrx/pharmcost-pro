import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityLog } from "@shared/schema";

export default function ActivityLogComponent() {
  const { data: activities } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity"],
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'search':
        return <i className="fas fa-search text-primary" />;
      case 'export':
        return <i className="fas fa-download text-emerald-600" />;
      case 'login':
        return <i className="fas fa-sign-in-alt text-blue-600" />;
      case 'batch_upload':
        return <i className="fas fa-upload text-slate-600" />;
      default:
        return <i className="fas fa-info-circle text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failure':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-slate-600';
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  return (
    <div className="mt-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Recent Activity</h2>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {!activities || activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No recent activity to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatTimeAgo(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className={getStatusColor(activity.status)}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
