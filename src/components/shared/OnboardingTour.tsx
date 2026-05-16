import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useAuth';
import { Globe, Users, Library, BookOpen, ChevronRight, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TOUR_KEY = 'noor_onboarding_seen';

const STEPS = [
  {
    icon: Globe,
    color: 'bg-teal-100 text-teal-700',
    title: 'Create your Universe',
    description:
      'A Universe is the world your stories live in. Set the tone, art style, age range, and Islamic values that all your books in this series will share.',
    action: { label: 'Create Universe', href: '/app/universes/new' },
  },
  {
    icon: Users,
    color: 'bg-violet-100 text-violet-700',
    title: 'Design your Characters',
    description:
      'Use Visual DNA to design characters with consistent look — skin tone, outfit, hijab, and more. The AI will keep them consistent across all illustrations.',
    action: { label: 'Create Character', href: '/app/characters/new' },
  },
  {
    icon: Library,
    color: 'bg-amber-100 text-amber-700',
    title: 'Build a Knowledge Base',
    description:
      'Your Knowledge Base holds the Islamic values, duas, story voice, and formatting rules the AI uses when writing your book. Think of it as your editorial guide.',
    action: { label: 'Open Knowledge Base', href: '/app/knowledge-base' },
  },
  {
    icon: BookOpen,
    color: 'bg-emerald-100 text-emerald-700',
    title: 'Generate your Book',
    description:
      'With your universe, characters, and knowledge base set, the AI can generate a full illustrated book — story, spreads, cover, and all — in minutes.',
    action: { label: 'Create my first book', href: '/app/books/new' },
    isLast: true,
  },
];

export function OnboardingTour() {
  const user = useUser();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    const seen = localStorage.getItem(TOUR_KEY);
    if (seen) return;

    // Show for accounts created within the last 7 days
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    if (accountAge < 7 * 86400000) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else dismiss();
  };

  const currentStep = STEPS[step];
  const Icon = currentStep.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) dismiss(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                Getting started · {step + 1} of {STEPS.length}
              </span>
            </div>
            <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', currentStep.color)}>
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{currentStep.title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{currentStep.description}</p>

          {/* Step dots */}
          <div className="mt-6 flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted'
                )}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={dismiss}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {currentStep.isLast ? (
              <Button asChild size="sm" onClick={dismiss}>
                <Link to={currentStep.action.href}>
                  {currentStep.action.label}
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to={currentStep.action.href} onClick={dismiss}>
                    {currentStep.action.label}
                  </Link>
                </Button>
                <Button size="sm" onClick={next}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
