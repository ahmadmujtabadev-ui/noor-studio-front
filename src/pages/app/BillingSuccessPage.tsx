import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, CreditCard, Zap } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useUser } from "@/hooks/useAuth";

export default function BillingSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const user = useUser();

  // Refresh user data so credits are current
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AppLayout title="Payment Successful" subtitle="Thank you for your subscription">
      <div className="max-w-2xl mx-auto">
        <div className="card-glow p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-8">
            Your credits have been added to your account.
          </p>

          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="font-semibold text-lg capitalize">{user?.plan || "Active"} Plan</span>
              <Badge className="bg-green-500/10 text-green-500">Active</Badge>
            </div>
            <div className="flex items-center justify-center gap-3 text-3xl font-bold text-primary">
              <Zap className="w-8 h-8" />
              {user?.credits ?? "—"} credits
            </div>
            <p className="text-sm text-muted-foreground mt-2">Available for AI generation</p>
          </div>

          {sessionId && (
            <p className="text-xs text-muted-foreground mb-6">Session: {sessionId}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/app/billing"><ArrowLeft className="w-4 h-4 mr-2" />Back to Billing</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Need help? Contact support@noorstudio.ai</p>
        </div>
      </div>
    </AppLayout>
  );
}
