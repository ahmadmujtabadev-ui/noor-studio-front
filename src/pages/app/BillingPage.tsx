import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Users, BookOpen, TrendingUp, Zap, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { useCreditPackages, useTransactions, useCreateCheckout } from "@/hooks/usePayments";
import { useUser, useAuthStore } from "@/hooks/useAuth";
import type { CreditTransaction } from "@/lib/api/types";
import { useToast } from "@/components/ui/use-toast";

const PLANS = [
  {
    id: "creator",
    name: "Creator",
    price: "$0/mo",
    credits: 50,
    description: "For individual creators getting started",
    features: ["50 credits/mo", "5 characters", "3 books", "PDF export"],
  },
  {
    id: "author",
    name: "Author",
    price: "$19/mo",
    credits: 200,
    description: "For serious authors",
    features: ["200 credits/mo", "20 characters", "Unlimited books", "PDF + EPUB", "Priority AI"],
    popular: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: "$49/mo",
    credits: 500,
    description: "For teams and studios",
    features: ["500 credits/mo", "Unlimited everything", "Team collaboration", "Custom styles", "API access"],
  },
];

export default function BillingPage() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const user = useUser();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const { data: packages = [], isLoading: packagesLoading } = useCreditPackages();
  const { data: transactions = [], isLoading: txLoading } = useTransactions({ limit: 50 });
  const checkoutMutation = useCreateCheckout();

  const credits = user?.credits ?? 0;
  const plan = user?.plan ?? "free";

  const formatDate = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleUpgrade = async (packageId: string) => {
    try {
      await checkoutMutation.mutateAsync({ packageId });
    } catch (err) {
      toast({
        title: "Checkout Error",
        description: err instanceof Error ? err.message : "Failed to start checkout",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout title="Billing & Credits" subtitle="Manage your subscription and credit usage">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Balance */}
          <div className="card-glow p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Credit Balance</h2>
                  <p className="text-muted-foreground capitalize">{plan} plan</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => refreshUser()}>
                <RefreshCw className="w-4 h-4 mr-2" />Refresh
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">Credits Available</span>
                </div>
                <p className="text-4xl font-bold text-primary">{credits}</p>
                <p className="text-sm text-muted-foreground mt-1">Use for any AI generation</p>
              </div>
              <div className="p-5 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                <p className="text-2xl font-bold capitalize">{plan}</p>
                <Badge className="mt-2 bg-primary/10 text-primary">Active</Badge>
              </div>
            </div>
          </div>

          {/* Credit Packages */}
          <div className="card-glow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Buy Credits</h2>
                <p className="text-muted-foreground">Top up your balance</p>
              </div>
            </div>

            {packagesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : packages.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={cn(
                      "p-5 rounded-xl border-2 flex flex-col",
                      pkg.popular ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    {pkg.popular && (
                      <Badge className="self-start mb-3 bg-primary text-primary-foreground">Popular</Badge>
                    )}
                    <p className="font-semibold text-lg mb-1">{pkg.name}</p>
                    <p className="text-3xl font-bold mb-1">{pkg.credits}</p>
                    <p className="text-sm text-muted-foreground mb-4">credits</p>
                    <p className="text-xl font-bold mb-4">
                      ${pkg.price} {pkg.currency.toUpperCase()}
                    </p>
                    <Button
                      variant={pkg.popular ? "hero" : "outline"}
                      className="mt-auto"
                      onClick={() => handleUpgrade(pkg.id)}
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Buy Now
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback when no packages configured: show plan upgrade */
              <div className="grid sm:grid-cols-3 gap-4">
                {PLANS.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "p-5 rounded-xl border-2 flex flex-col",
                      p.popular ? "border-primary bg-primary/5" : "border-border",
                      p.id === plan && "opacity-60"
                    )}
                  >
                    {p.popular && <Badge className="self-start mb-3 bg-primary text-primary-foreground">Popular</Badge>}
                    <p className="font-semibold text-lg">{p.name}</p>
                    <p className="text-2xl font-bold my-2">{p.price}</p>
                    <p className="text-sm text-muted-foreground mb-4">{p.description}</p>
                    <ul className="text-sm space-y-1 mb-4 flex-1">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2">
                          <span className="text-primary">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={p.popular ? "hero" : "outline"}
                      disabled={p.id === plan}
                      onClick={() => handleUpgrade(p.id)}
                    >
                      {p.id === plan ? "Current Plan" : "Upgrade"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="card-glow p-6">
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
            {txLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx: CreditTransaction) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(tx.createdAt)}</TableCell>
                      <TableCell className="text-sm">{tx.description}</TableCell>
                      <TableCell className={cn("text-right font-medium text-sm", tx.type === "credit" ? "text-green-600" : "text-red-500")}>
                        {tx.type === "credit" ? "+" : "-"}{Math.abs(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card-glow p-6">
            <h3 className="font-semibold mb-4">Credit Usage Guide</h3>
            <div className="space-y-3">
              {[
                { label: "Outline generation", cost: 3 },
                { label: "Chapter writing", cost: 2 },
                { label: "Humanize pass", cost: 1 },
                { label: "Illustrations (all)", cost: 10 },
                { label: "Cover image", cost: 3 },
                { label: "Layout pass", cost: 2 },
                { label: "Export PDF", cost: 2 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <Badge variant="outline">{item.cost} cr</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="card-glow p-6">
            <h3 className="font-semibold mb-3">Account</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium truncate max-w-[140px]">{user?.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <Badge className="capitalize">{plan}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-bold text-primary">{credits}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
