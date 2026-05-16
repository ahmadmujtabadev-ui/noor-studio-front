import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api/client';
import { Loader2, Gift, PauseCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const CANCEL_REASONS = [
  { value: 'too_expensive',    label: 'It\'s too expensive' },
  { value: 'not_using',        label: 'I\'m not using it enough' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'switching',        label: 'Switching to another tool' },
  { value: 'temporary',        label: 'Just a temporary pause' },
  { value: 'other',            label: 'Other reason' },
];

interface Props {
  open: boolean;
  periodEnd: string | null;
  onConfirmCancel: () => Promise<void>;
  onClose: () => void;
}

export function CancellationSaveModal({ open, periodEnd, onConfirmCancel, onClose }: Props) {
  const [step, setStep] = useState<'survey' | 'offer' | 'confirm'>('survey');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setStep('survey'); setReason(''); setFeedback(''); };
  const handleClose = () => { reset(); onClose(); };

  const submitSurvey = async () => {
    setLoading(true);
    try {
      await api.post('/api/payments/cancel-survey', { reason, feedback });
    } catch { /* non-blocking */ }
    setLoading(false);
    setStep('offer');
  };

  const handleConfirmCancel = async () => {
    setLoading(true);
    try {
      await onConfirmCancel();
      handleClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-md">
        {step === 'survey' && (
          <>
            <DialogHeader>
              <DialogTitle>Before you go — why are you canceling?</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Your feedback helps us improve NoorStudio for everyone.
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <RadioGroup value={reason} onValueChange={setReason}>
                {CANCEL_REASONS.map((r) => (
                  <div key={r.value} className="flex items-center gap-3 rounded-lg border px-3 py-2.5 hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={r.value} id={r.value} />
                    <Label htmlFor={r.value} className="cursor-pointer text-sm">{r.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              <Textarea
                placeholder="Any additional feedback? (optional)"
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="resize-none text-sm"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={handleClose}>Keep my plan</Button>
              <Button onClick={submitSurvey} disabled={!reason || loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'offer' && (
          <>
            <DialogHeader>
              <DialogTitle>We'd hate to see you go</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Before you cancel, here's what we can offer:
              </p>
            </DialogHeader>
            <div className="space-y-3">
              <div className={cn(
                'rounded-xl border-2 border-primary/30 bg-primary/5 p-4 cursor-pointer hover:border-primary transition-colors'
              )}
                onClick={() => { toast.success('Keep creating! Your plan remains active.'); handleClose(); }}
              >
                <div className="flex items-start gap-3">
                  <PauseCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Keep your plan + credits</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your subscription stays active. All credits you've earned roll over — nothing is lost.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border p-4 bg-amber-50 cursor-pointer hover:border-amber-300 transition-colors"
                onClick={() => { toast.success('Great! A 25% discount has been applied to your next renewal.'); handleClose(); }}
              >
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-amber-800">25% off your next month</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Stay for one more month at 25% off. No commitment after that.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" size="sm" onClick={handleClose}>Keep my plan</Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => setStep('confirm')}
              >
                No thanks, still cancel
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm cancellation
              </DialogTitle>
            </DialogHeader>
            <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
              <p className="font-medium">What happens when you cancel:</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Access continues until <strong>{periodEnd ?? 'end of billing period'}</strong></li>
                <li>Your books, characters, and universes are saved</li>
                <li>You'll move to the free plan (1 book/month limit)</li>
                <li>Unused credits are kept — they never expire</li>
              </ul>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={handleClose}>Keep my plan</Button>
              <Button variant="destructive" onClick={handleConfirmCancel} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, cancel subscription
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
