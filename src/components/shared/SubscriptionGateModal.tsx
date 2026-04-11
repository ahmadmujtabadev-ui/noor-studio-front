import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, BookOpen, Users, Database, Pencil } from "lucide-react";
import { useUser } from "@/hooks/useAuth";
import { PLAN_DEFINITIONS, planRank } from "@/constants/planFeatures";
import type { PlanId } from "@/constants/planFeatures";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GateWorkflow = "character" | "knowledge-base" | "editor" | "book";

interface SubscriptionGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: GateWorkflow;
  /** "expired" = subscription ended; "limit" = usage limit hit */
  reason?: "expired" | "limit";
  usageInfo?: {
    used: number;
    limit: number;
    label: string;
  };
}

// ─── Workflow Config ──────────────────────────────────────────────────────────

const WORKFLOW_CONFIG: Record<GateWorkflow, {
  icon: React.ReactNode;
  title: string;
  expiredDesc: string;
  limitDesc: (used: number, limit: number, label: string) => string;
}> = {
  character: {
    icon: <Users className="w-6 h-6 text-primary" />,
    title: "Character Limit Reached",
    expiredDesc: "Your subscription has ended. Renew to create more characters.",
    limitDesc: (used, limit, label) =>
      `You've used ${used} of ${limit} ${label} on your current plan. Upgrade to add unlimited characters.`,
  },
  "knowledge-base": {
    icon: <Database className="w-6 h-6 text-primary" />,
    title: "Knowledge Base Limit Reached",
    expiredDesc: "Your subscription has ended. Renew to create more knowledge bases.",
    limitDesc: (used, limit, label) =>
      `You've used ${used} of ${limit} ${label} on your current plan. Upgrade to add unlimited knowledge bases.`,
  },
  editor: {
    icon: <Pencil className="w-6 h-6 text-primary" />,
    title: "Editor Access Restricted",
    expiredDesc: "Your subscription has ended. Renew to continue editing your books.",
    limitDesc: () =>
      "The book editor requires an active subscription. Upgrade to continue creating.",
  },
  book: {
    icon: <BookOpen className="w-6 h-6 text-primary" />,
    title: "Book Limit Reached",
    expiredDesc: "Your subscription has ended. Renew to create more books.",
    limitDesc: (used, limit, label) =>
      `You've created ${used} of ${limit} ${label} this month. Upgrade for unlimited books.`,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SubscriptionGateModal({
  open,
  onOpenChange,
  workflow,
  reason = "limit",
  usageInfo,
}: SubscriptionGateModalProps) {
  const navigate = useNavigate();
  const user = useUser();
  const currentPlan = (user?.plan ?? "free") as PlanId;

  const cfg = WORKFLOW_CONFIG[workflow];

  const description = reason === "expired"
    ? cfg.expiredDesc
    : usageInfo
      ? cfg.limitDesc(usageInfo.used, usageInfo.limit, usageInfo.label)
      : "You've reached the limit for this feature on your current plan.";

  // Show plans that are upgrades from current
  const upgradePlans = PLAN_DEFINITIONS.filter((p) => planRank(p.id) > planRank(currentPlan));

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/app/billing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              {cfg.icon}
            </div>
            <div>
              <DialogTitle className="text-lg">
                {reason === "expired" ? "Subscription Ended" : cfg.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Current plan: <span className="font-medium capitalize">{currentPlan}</span>
              </p>
            </div>
          </div>
          <DialogDescription className="text-sm pt-1 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Usage bar if limit hit */}
          {reason === "limit" && usageInfo && (
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">{usageInfo.label}</span>
                <Badge variant="secondary" className="text-red-600 bg-red-50 border-red-200">
                  {usageInfo.used} / {usageInfo.limit} used
                </Badge>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-red-500" style={{ width: "100%" }} />
              </div>
            </div>
          )}

          {/* Upgrade plan options */}
          {upgradePlans.slice(0, 2).map((plan) => (
            <div
              key={plan.id}
              className={`p-4 rounded-xl border-2 ${plan.popular ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{plan.name}</p>
                    {plan.popular && (
                      <Badge className="bg-primary text-primary-foreground text-xs">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.price}{plan.period}</p>
                </div>
                <p className="text-sm font-semibold text-primary">{plan.monthlyCredits} cr/mo</p>
              </div>
              <ul className="space-y-1 mb-3">
                {plan.features.filter(f => f.included).slice(0, 4).map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {f.label}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? "hero" : "outline"}
                className="w-full"
                size="sm"
                onClick={handleUpgrade}
              >
                Upgrade to {plan.name} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}

          {/* If already on highest paid plan — just show renew */}
          {upgradePlans.length === 0 && (
            <Button className="w-full" onClick={handleUpgrade}>
              Manage Subscription <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          <Button variant="ghost" className="w-full text-muted-foreground" size="sm" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
