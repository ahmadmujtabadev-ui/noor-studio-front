import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Users, BookOpen, TrendingUp, Zap, Loader2, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTransactions, useCreateCheckout, useCreateSubscription, useCancelSubscription, useCreatePortalSession, useSubscription, useCreditPackages } from "@/hooks/usePayments";
import { useUser, useAuthStore } from "@/hooks/useAuth";
import type { CreditTransaction } from "@/lib/api/types";
import { useToast } from "@/components/ui/use-toast";

// ─── Plan definitions (must match backend PLAN_LIMITS) ───────────────────────

const PLANS = [
  {
    id: "creator",
    name: "Creator",
    price: "$29",
    period: "/mo",
    description: "For families getting started",
    monthlyCredits: 100,
    features: [
      "5 books per month",
      "10 character designs",
      "Standard export (PDF)",
      "Email support",
    ],
  },
  {
    id: "author",
    name: "Author",
    price: "$79",
    period: "/mo",
    description: "For serious creators",
    monthlyCredits: 300,
    popular: true,
    features: [
      "Unlimited books",
      "Unlimited characters",
      "KDP-ready export",
      "Priority support",
      "Commercial license",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    price: "$199",
    period: "/mo",
    description: "For publishers & schools",
    monthlyCredits: 1000,
    features: [
      "Everything in Author",
      "Team collaboration",
      "Bulk export tools",
      "API access",
      "Dedicated support",
    ],
  },
];

const PLAN_ORDER = ["free", "creator", "author", "studio"];

function planRank(plan: string) {
  return PLAN_ORDER.indexOf(plan);
}

export default function BillingPage() {
  const { toast } = useToast();
  const user = useUser();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const { data: packages = [], isLoading: packagesLoading } = useCreditPackages();
  const { data: transactions = [], isLoading: txLoading } = useTransactions({ limit: 50 });
  const { data: subscriptionData } = useSubscription();

  const checkoutMutation = useCreateCheckout();
  const subscriptionMutation = useCreateSubscription();
  const cancelMutation = useCancelSubscription();
  const portalMutation = useCreatePortalSession();

  const credits = user?.credits ?? 0;
  const plan = user?.plan ?? "free";
  const subscriptionStatus = user?.subscriptionStatus;
  const periodEnd = user?.subscriptionCurrentPeriodEnd
    ? new Date(user.subscriptionCurrentPeriodEnd).toLocaleDateString()
    : null;

  const sub = subscriptionData?.subscription;

  const formatDate = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleBuyCredits = async (packageId: string) => {
    try {
      await checkoutMutation.mutateAsync({ packageId });
    } catch (err) {
      toast({ title: "Checkout Error", description: err instanceof Error ? err.message : "Failed to start checkout", variant: "destructive" });
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      await subscriptionMutation.mutateAsync({ planId });
    } catch (err) {
      toast({ title: "Subscription Error", description: err instanceof Error ? err.message : "Failed to start subscription", variant: "destructive" });
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Cancel your subscription? You'll keep access until the end of your billing period.")) return;
    try {
      await cancelMutation.mutateAsync();
      await refreshUser();
      toast({ title: "Subscription cancelled", description: "You'll keep access until " + (periodEnd ?? "period end") });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to cancel", variant: "destructive" });
    }
  };

  const handleManageBilling = async () => {
    try {
      await portalMutation.mutateAsync();
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to open portal", variant: "destructive" });
    }
  };

  return (
    <AppLayout title="Billing & Plan" subtitle="Manage your plans, add-ons, purchases, and invoices.">
      <div className="space-y-8">

        {/* ── Current Plan Banner ──────────────────────────────────────────── */}
        <div className="card-glow p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-semibold capitalize">{plan === "free" ? "Free" : plan} Plan</h2>
                  {subscriptionStatus === "active" && <Badge className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>}
                  {subscriptionStatus === "trialing" && <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">Trial</Badge>}
                  {subscriptionStatus === "past_due" && <Badge className="bg-red-500/10 text-red-600 border-red-200">Past Due</Badge>}
                  {sub?.cancelAtPeriodEnd && <Badge variant="outline" className="text-orange-500 border-orange-300">Cancels {periodEnd}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {credits} credits available
                  {periodEnd && !sub?.cancelAtPeriodEnd && ` · renews ${periodEnd}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="ghost" size="sm" onClick={() => refreshUser()}>
                <RefreshCw className="w-4 h-4 mr-2" />Refresh
              </Button>
              {user?.stripeCustomerId && (
                <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={portalMutation.isPending}>
                  {portalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                  Manage Billing
                </Button>
              )}
              {plan !== "free" && subscriptionStatus === "active" && !sub?.cancelAtPeriodEnd && (
                <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={handleCancelSubscription} disabled={cancelMutation.isPending}>
                  {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Cancel Plan
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Subscription Plans ───────────────────────────────────────────── */}
        <div className="card-glow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Plans & Add-ons</h2>
              <p className="text-sm text-muted-foreground">Start free. Upgrade when you're ready to publish.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {PLANS.map((p) => {
              const isCurrent = p.id === plan;
              const isDowngrade = planRank(p.id) < planRank(plan);
              const isUpgrade = planRank(p.id) > planRank(plan);
              const isCanceling = isCurrent && sub?.cancelAtPeriodEnd;

              return (
                <div
                  key={p.id}
                  className={cn(
                    "relative rounded-2xl border-2 p-6 flex flex-col",
                    p.popular ? "border-primary bg-primary/5" : "border-border bg-card",
                    isCurrent && !isCanceling ? "ring-2 ring-primary ring-offset-2" : ""
                  )}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold">MOST POPULAR</Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                  )}

                  <p className="font-bold text-lg mb-1">{p.name}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-bold">{p.price}</span>
                    <span className="text-muted-foreground mb-1">{p.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{p.description}</p>

                  <ul className="text-sm space-y-2 mb-6 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{p.monthlyCredits} AI credits/month</span>
                    </li>
                  </ul>

                  {isCurrent && !isCanceling ? (
                    <Button variant="outline" disabled className="w-full">Current Plan</Button>
                  ) : isCanceling ? (
                    <Button variant="outline" onClick={() => handleSubscribe(p.id)}
                      disabled={subscriptionMutation.isPending} className="w-full">
                      Renew Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button variant={p.popular ? "hero" : "default"} className="w-full"
                      onClick={() => handleSubscribe(p.id)}
                      disabled={subscriptionMutation.isPending}>
                      {subscriptionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {plan === "free" ? "Start Free Trial" : "Upgrade"}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full"
                      onClick={() => handleSubscribe(p.id)}
                      disabled={subscriptionMutation.isPending}>
                      Downgrade
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            All plans include a 7-day free trial. No credit card required to start.
          </p>
        </div>

        {/* ── Credit Top-up ────────────────────────────────────────────────── */}
        <div className="card-glow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Buy Extra Credits</h2>
              <p className="text-sm text-muted-foreground">One-time top-ups — never expire</p>
            </div>
          </div>

          {packagesLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : packages.length > 0 ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className={cn(
                  "p-5 rounded-xl border-2 flex flex-col",
                  pkg.popular ? "border-primary bg-primary/5" : "border-border"
                )}>
                  {pkg.popular && <Badge className="self-start mb-3 bg-primary text-primary-foreground">Popular</Badge>}
                  <p className="font-semibold text-lg mb-1">{pkg.name}</p>
                  <p className="text-3xl font-bold mb-1">{pkg.credits}</p>
                  <p className="text-sm text-muted-foreground mb-4">credits</p>
                  <p className="text-xl font-bold mb-4">${pkg.price} {(pkg.currency ?? 'USD').toUpperCase()}</p>
                  <Button variant={pkg.popular ? "hero" : "outline"} className="mt-auto"
                    onClick={() => handleBuyCredits(pkg.id)}
                    disabled={checkoutMutation.isPending}>
                    {checkoutMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Buy Now
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">Credit packages not configured yet.</p>
          )}
        </div>

        {/* ── Transaction History ──────────────────────────────────────────── */}
        <div className="card-glow p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription History</h2>
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
                  <TableHead className="text-right">Credits</TableHead>
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
    </AppLayout>
  );
}
