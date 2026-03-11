import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Zap, Loader2 } from "lucide-react";
import { useCredits } from "@/hooks/useAuth";

interface CreditConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  creditCost: number;
  isLoading?: boolean;
}

export function CreditConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  creditCost,
  isLoading = false,
}: CreditConfirmModalProps) {
  const credits = useCredits();
  const hasEnough = credits >= creditCost;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>{description}</p>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-medium">Credits</span>
                </div>
                <div className="text-right">
                  <span className={hasEnough ? "text-foreground font-semibold" : "text-destructive font-semibold"}>
                    {creditCost} required
                  </span>
                  <p className="text-sm text-muted-foreground">{credits} available</p>
                </div>
              </div>
              {!hasEnough && (
                <p className="text-destructive text-sm">
                  You don't have enough credits. Please visit Billing to purchase more.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          {hasEnough ? (
            <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
              ) : (
                `Confirm (${creditCost} credits)`
              )}
            </AlertDialogAction>
          ) : (
            <AlertDialogAction asChild>
              <a href="/app/billing">Buy Credits</a>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
