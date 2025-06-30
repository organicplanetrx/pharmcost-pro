import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// This component will show when there's a pending search
export default function LoadingModal() {
  // You can customize this to show based on global state or specific conditions
  // For now, it's just a component that can be controlled by parent components
  
  return (
    <Dialog open={false}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Searching Medications...</h3>
          <p className="text-sm text-slate-600">Please wait while we fetch the latest pricing data.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
