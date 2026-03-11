import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useAuth";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  feature?: string;
  currentLimit?: number;
  limitType?: string;
}

const PLANS = [
  {
    id: "author",
    name: "Author",
    price: "$19/mo",
    credits: 200,
    features: ["200 credits/mo", "20 characters", "Unlimited books", "PDF + EPUB", "Priority AI"],
  },
  {
    id: "studio",
    name: "Studio",
    price: "$49/mo",
    credits: 500,
    features: ["500 credits/mo", "Unlimited everything", "Team features", "Custom styles", "API access"],
    popular: true,
  },
];

export function UpgradeModal({
  open,
  onOpenChange,
  title = "Upgrade Required",
  description,
  feature,
  currentLimit,
  limitType,
}: UpgradeModalProps) {
  const navigate = useNavigate();
  const user = useUser();
  const currentPlan = user?.plan || "free";

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/app/billing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">{title}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Current plan: <span className="font-medium capitalize">{currentPlan}</span>
              </p>
            </div>
          </div>
          <DialogDescription className="text-base pt-2">
            {description || "You've reached the limit for this feature on your current plan."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {currentLimit !== undefined && limitType && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{limitType}</span>
                <Badge variant="secondary">{currentLimit} / {currentLimit} used</Badge>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  plan.popular ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{plan.name}</p>
                      {plan.popular && <Badge className="bg-primary text-primary-foreground text-xs">Recommended</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.price}</p>
                  </div>
                  <p className="text-xl font-bold text-primary">{plan.credits} cr</p>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  onClick={handleUpgrade}
                >
                  Upgrade to {plan.name} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>

          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
