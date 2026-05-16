import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useAuth';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, MessageSquare, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const NPS_KEY      = 'noor_nps_last_shown';
const NPS_INTERVAL = 30 * 86400000; // 30 days

export function NpsWidget() {
  const user = useUser();
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [step, setStep] = useState<'score' | 'comment' | 'done'>('score');
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const lastShown = localStorage.getItem(NPS_KEY);
    if (lastShown && Date.now() - parseInt(lastShown, 10) < NPS_INTERVAL) return;

    // Only show to users who have been around ≥ 7 days
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    if (accountAge < 7 * 86400000) return;

    const timer = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(timer);
  }, [user]);

  const dismiss = () => {
    localStorage.setItem(NPS_KEY, Date.now().toString());
    setVisible(false);
  };

  const handleScoreSelect = (s: number) => {
    setScore(s);
    setStep('comment');
  };

  const handleSubmit = async () => {
    if (score === null) return;
    setSubmitting(true);
    try {
      await api.post('/api/feedback', {
        type: 'nps',
        score,
        comment: comment.trim() || undefined,
        page:    window.location.pathname,
      });
      setStep('done');
      localStorage.setItem(NPS_KEY, Date.now().toString());
    } catch {
      toast.error('Could not submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const npsLabel = (s: number) =>
    s <= 3 ? 'Very unlikely' : s <= 6 ? 'Neutral' : s <= 8 ? 'Likely' : 'Very likely';

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-primary/90 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          Share feedback
        </button>
      ) : (
        <div className="rounded-xl border bg-white shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary/5 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Quick feedback</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(true)}
                className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={dismiss}
                className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="p-4">
            {step === 'score' && (
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  How likely are you to recommend NoorStudio?
                </p>
                <p className="text-xs text-muted-foreground mb-3">0 = Not at all · 10 = Extremely likely</p>
                <div className="flex gap-1">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handleScoreSelect(i)}
                      className={cn(
                        'flex h-7 flex-1 items-center justify-center rounded text-xs font-semibold transition-colors',
                        'border hover:border-primary hover:bg-primary/10 hover:text-primary',
                        i <= 3 ? 'border-red-200 text-red-600 bg-red-50'
                          : i <= 6 ? 'border-amber-200 text-amber-700 bg-amber-50'
                          : 'border-emerald-200 text-emerald-700 bg-emerald-50'
                      )}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 'comment' && score !== null && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">You selected <strong>{score}/10</strong> — {npsLabel(score)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {score >= 9 ? "We're glad you love it! What do you love most?"
                      : score >= 7 ? 'What could we do to make it a 10?'
                      : 'What\'s the main thing we should improve?'}
                  </p>
                </div>
                <Textarea
                  rows={3}
                  placeholder="Optional comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="text-sm resize-none"
                />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={dismiss}>Skip</Button>
                  <Button size="sm" className="flex-1" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Sending…' : 'Submit'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'done' && (
              <div className="flex flex-col items-center gap-2 py-2 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-semibold">Thank you!</p>
                <p className="text-xs text-muted-foreground">Your feedback helps us improve NoorStudio.</p>
                <Button size="sm" variant="outline" className="mt-1" onClick={dismiss}>Close</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
