import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard, TrendingUp, Zap, Loader2, RefreshCw, CheckCircle2,
  ExternalLink, BookOpen, Users, Database, Layers, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTransactions, useCreateCheckout, useCreateSubscription,
  useCancelSubscription, useCreatePortalSession, useSubscription,
  useCreditPackages, usePlanLimitsQuery,
} from "@/hooks/usePayments";
import { useUser, useAuthStore } from "@/hooks/useAuth";
import type { CreditTransaction } from "@/lib/api/types";
import { useToast } from "@/components/ui/use-toast";
import { PLAN_DEFINITIONS, PLAN_LIMITS, planRank, formatLimit } from "@/constants/planFeatures";
import type { PlanId } from "@/constants/planFeatures";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  if (!status || status === "inactive") return null;
  const map: Record<string, { label: string; className: string }> = {
    active:   { label: "Active",   className: "bg-green-500/10 text-green-600 border-green-200" },
    trialing: { label: "Trial",    className: "bg-blue-500/10 text-blue-600 border-blue-200" },
    past_due: { label: "Past Due", className: "bg-red-500/10 text-red-600 border-red-200" },
    canceled: { label: "Canceled", className: "bg-orange-500/10 text-orange-600 border-orange-200" },
  };
  const cfg = map[status];
  if (!cfg) return null;
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNearLimit = !isUnlimited && pct >= 80;
  const isAtLimit = !isUnlimited && used >= limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium", isAtLimit ? "text-red-500" : isNearLimit ? "text-orange-500" : "")}>
          {isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", isAtLimit ? "bg-red-500" : isNearLimit ? "bg-orange-400" : "bg-primary")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BillingPage() {
  const { toast } = useToast();
  const user = useUser();
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const { data: packages = [], isLoading: packagesLoading } = useCreditPackages();
  const { data: transactions = [], isLoading: txLoading } = useTransactions({ limit: 50 });
  const { data: subscriptionData } = useSubscription();
  const { data: planLimitsData, isLoading: limitsLoading } = usePlanLimitsQuery();

  const checkoutMutation = useCreateCheckout();
  const subscriptionMutation = useCreateSubscription();
  const cancelMutation = useCancelSubscription();
  const portalMutation = useCreatePortalSession();

  const credits = user?.credits ?? 0;
  const plan = (user?.plan ?? "free") as PlanId;
  const subscriptionStatus = user?.subscriptionStatus;
  const periodEnd = user?.subscriptionCurrentPeriodEnd
    ? new Date(user.subscriptionCurrentPeriodEnd).toLocaleDateString()
    : null;

  const sub = subscriptionData?.subscription;
  const limits = PLAN_LIMITS[plan];
  const usage = planLimitsData?.usage ?? { characters: 0, knowledgeBases: 0, booksThisMonth: 0 };

  const currentPlanDef = PLAN_DEFINITIONS.find((p) => p.id === plan);

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
      <div className="space-y-6">

        {/* ── Header Stats Bar ─────────────────────────────────────────────── */}
        <div className="card-glow p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Billing</h2>
                <p className="text-sm text-muted-foreground">Manage your plans, add-ons, purchases, and invoices.</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="ghost" size="sm" onClick={() => refreshUser()}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
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

          {/* Summary tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
              <p className="text-xl font-bold capitalize">{plan === "free" ? "Free" : plan}</p>
              <div className="mt-1"><StatusBadge status={subscriptionStatus} /></div>
            </div>
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">AI Credits</p>
              <p className="text-xl font-bold">{credits}</p>
              <p className="text-xs text-muted-foreground">available</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Characters</p>
              <p className="text-xl font-bold">{usage.characters}</p>
              <p className="text-xs text-muted-foreground">of {formatLimit(limits.characters)}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Books This Month</p>
              <p className="text-xl font-bold">{usage.booksThisMonth}</p>
              <p className="text-xs text-muted-foreground">of {formatLimit(limits.booksPerMonth)}</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="plans" className="rounded-lg">Plans & Add-ons</TabsTrigger>
            <TabsTrigger value="current" className="rounded-lg">Current Plan</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg">Subscription History</TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Plans & Add-ons ─────────────────────────────────────── */}
          <TabsContent value="plans" className="space-y-6">
            <div className="card-glow p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Subscription Plans</h2>
                  <p className="text-sm text-muted-foreground">Start free. Upgrade when you're ready to publish.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                {PLAN_DEFINITIONS.map((p) => {
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
                          <li key={f.label} className="flex items-start gap-2">
                            {f.included
                              ? <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              : <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
                            <span className={f.included ? "" : "text-muted-foreground"}>{f.label}</span>
                          </li>
                        ))}
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
                          disabled={subscriptionMutation.isPending || isDowngrade}>
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

            {/* Credit Top-up */}
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
                      <p className="text-xl font-bold mb-4">${pkg.price} {(pkg.currency ?? "USD").toUpperCase()}</p>
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
          </TabsContent>

          {/* ── Tab 2: Current Plan ────────────────────────────────────────── */}
          <TabsContent value="current">
            <div className="card-glow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Current Plan & Entitlements</h2>
                <p className="text-sm text-muted-foreground">All your active plans, services, and add-ons in one place.</p>
              </div>

              {plan === "free" ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <CreditCard className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">You're on the Free Plan</h3>
                    <p className="text-sm text-muted-foreground mt-1">Upgrade to unlock more features and higher limits.</p>
                  </div>
                  <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-value="plans"]')?.click()}>
                    View Plans
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Active plan card */}
                  <div className="border-2 border-primary/30 bg-primary/5 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold capitalize">{plan}</h3>
                          <Badge className="bg-primary/10 text-primary text-xs">Plan</Badge>
                          <StatusBadge status={subscriptionStatus} />
                          {sub?.cancelAtPeriodEnd && (
                            <Badge variant="outline" className="text-orange-500 border-orange-300 text-xs">
                              Cancels {periodEnd}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Item ID: {plan}_plan</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {currentPlanDef?.price}<span className="text-sm font-normal text-muted-foreground">{currentPlanDef?.period}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      <div className="bg-background/60 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">AI Credits</p>
                        <p className="text-lg font-bold">{credits}</p>
                        <p className="text-xs text-muted-foreground">available now</p>
                      </div>
                      <div className="bg-background/60 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Monthly Credits</p>
                        <p className="text-lg font-bold">{limits.credits}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                      {periodEnd && (
                        <div className="bg-background/60 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">
                            {sub?.cancelAtPeriodEnd ? "Access Until" : "Renews"}
                          </p>
                          <p className="text-sm font-semibold">{periodEnd}</p>
                        </div>
                      )}
                    </div>

                    {/* Feature list */}
                    {currentPlanDef && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-3 text-muted-foreground">Plan Features</p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {currentPlanDef.features.filter(f => f.included).map((f) => (
                            <div key={f.label} className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                              <span>{f.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Usage section */}
                  <div className="border rounded-xl p-5">
                    <h3 className="text-base font-semibold mb-4">Usage This Month</h3>
                    {limitsLoading ? (
                      <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <UsageBar
                              used={usage.booksThisMonth}
                              limit={limits.booksPerMonth}
                              label="Books created this month"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <UsageBar
                              used={usage.characters}
                              limit={limits.characters}
                              label="Characters created"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Database className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <UsageBar
                              used={usage.knowledgeBases}
                              limit={limits.knowledgeBases}
                              label="Knowledge bases"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Zap className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <UsageBar
                              used={credits}
                              limit={limits.credits}
                              label="AI credits remaining"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feature flags */}
                  <div className="border rounded-xl p-5">
                    <h3 className="text-base font-semibold mb-4">Add-ons & Features</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { label: "KDP-ready Export", icon: <Layers className="w-4 h-4" />, enabled: limits.kdpExport },
                        { label: "Commercial License", icon: <CheckCircle2 className="w-4 h-4" />, enabled: limits.commercial },
                        { label: "Team Collaboration", icon: <Users className="w-4 h-4" />, enabled: limits.teamCollab },
                        { label: "Bulk Export Tools", icon: <BookOpen className="w-4 h-4" />, enabled: limits.bulkExport },
                        { label: "API Access", icon: <Zap className="w-4 h-4" />, enabled: limits.apiAccess },
                      ].map((item) => (
                        <div key={item.label} className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border",
                          item.enabled ? "border-green-200 bg-green-50/50" : "border-muted bg-muted/30 opacity-60"
                        )}>
                          <div className={cn("w-7 h-7 rounded-md flex items-center justify-center",
                            item.enabled ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                          )}>
                            {item.enabled ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </div>
                          <span className="text-sm font-medium">{item.label}</span>
                          <Badge variant="outline" className={cn("ml-auto text-xs",
                            item.enabled ? "text-green-600 border-green-300" : "text-muted-foreground"
                          )}>
                            {item.enabled ? "Active" : "Locked"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab 3: Subscription History ────────────────────────────────── */}
          <TabsContent value="history">
            <div className="card-glow p-6">
              <h2 className="text-xl font-semibold mb-4">Subscription History</h2>
              {txLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No transactions yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Credits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx: CreditTransaction) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(tx.createdAt)}</TableCell>
                        <TableCell className="text-sm">{tx.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">{tx.refType ?? tx.type}</Badge>
                        </TableCell>
                        <TableCell className={cn("text-right font-medium text-sm", tx.type === "credit" ? "text-green-600" : "text-red-500")}>
                          {tx.type === "credit" ? "+" : "-"}{Math.abs(tx.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  );
}
