import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api/client';
import { Loader2, Monitor, Mail, Shield, LogOut, Clock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── API helpers ──────────────────────────────────────────────────────────────

interface EmailPreferences {
  marketingEmails: boolean;
  productUpdates:  boolean;
  weeklyDigest:    boolean;
  islamicContent:  boolean;
}

interface SessionRecord {
  _id: string;
  ip?: string;
  userAgent?: string;
  lastActive: string;
  createdAt: string;
}

function usePreferences() {
  return useQuery<{ emailPreferences: EmailPreferences }>({
    queryKey: ['user', 'preferences'],
    queryFn:  () => api.get('/api/user/preferences'),
  });
}

function useSessions() {
  return useQuery<{ sessions: SessionRecord[] }>({
    queryKey: ['user', 'sessions'],
    queryFn:  () => api.get('/api/user/sessions'),
  });
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, description, icon: Icon, children }: {
  title: string; description?: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({ id, label, description, checked, onChange }: {
  id: string; label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg px-1 py-2.5">
      <div className="flex-1 pr-4">
        <Label htmlFor={id} className="cursor-pointer font-medium text-sm">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PreferencesPage() {
  const qc = useQueryClient();
  const { data: prefData, isLoading: prefLoading } = usePreferences();
  const { data: sessData, isLoading: sessLoading, refetch: refetchSessions } = useSessions();

  const [prefs, setPrefs] = useState<EmailPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Sync server data into local state on first load
  const emailPrefs: EmailPreferences = prefs ?? prefData?.emailPreferences ?? {
    marketingEmails: true,
    productUpdates: true,
    weeklyDigest: true,
    islamicContent: true,
  };

  const updatePref = (key: keyof EmailPreferences, val: boolean) => {
    setPrefs({ ...emailPrefs, [key]: val });
  };

  const saveMutation = useMutation({
    mutationFn: () => api.patch('/api/user/preferences', prefs ?? {}),
    onSuccess: () => {
      toast.success('Preferences saved');
      qc.invalidateQueries({ queryKey: ['user', 'preferences'] });
      setPrefs(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const logoutAllMutation = useMutation({
    mutationFn: () => api.delete('/api/user/sessions'),
    onSuccess: () => {
      toast.success('All other devices have been signed out');
      refetchSessions();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isDirty = prefs !== null;

  function parseUA(ua?: string) {
    if (!ua) return 'Unknown device';
    if (/iPhone|iPad/i.test(ua)) return 'iPhone / iPad';
    if (/Android/i.test(ua)) return 'Android';
    if (/Mac/i.test(ua)) return 'Mac';
    if (/Windows/i.test(ua)) return 'Windows';
    return 'Unknown device';
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  }

  return (
    <AppLayout title="Preferences" subtitle="Manage notifications, privacy, and active sessions">
      <div className="max-w-2xl space-y-6">

        {/* Email preferences */}
        <Section
          title="Email notifications"
          description="Choose which emails you receive from NoorStudio"
          icon={Mail}
        >
          {prefLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="divide-y">
              <ToggleRow
                id="marketingEmails"
                label="Marketing & promotions"
                description="New features, special offers, and product news"
                checked={emailPrefs.marketingEmails}
                onChange={(v) => updatePref('marketingEmails', v)}
              />
              <ToggleRow
                id="productUpdates"
                label="Product updates"
                description="Release notes and platform improvements"
                checked={emailPrefs.productUpdates}
                onChange={(v) => updatePref('productUpdates', v)}
              />
              <ToggleRow
                id="weeklyDigest"
                label="Weekly digest"
                description="A weekly summary of your activity and new content"
                checked={emailPrefs.weeklyDigest}
                onChange={(v) => updatePref('weeklyDigest', v)}
              />
              <ToggleRow
                id="islamicContent"
                label="Islamic content updates"
                description="New Islamic themes, duas, and story templates"
                checked={emailPrefs.islamicContent}
                onChange={(v) => updatePref('islamicContent', v)}
              />
            </div>
          )}
          {isDirty && (
            <div className="mt-4 flex justify-end">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </div>
          )}
        </Section>

        {/* Active sessions */}
        <Section
          title="Active sessions"
          description="Devices that are currently signed in to your account"
          icon={Monitor}
        >
          {sessLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : !sessData?.sessions?.length ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No active sessions found</p>
          ) : (
            <div className="space-y-2">
              {sessData.sessions.map((s, idx) => (
                <div
                  key={s._id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-3',
                    idx === 0 && 'border-primary/20 bg-primary/5'
                  )}
                >
                  <Monitor className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {parseUA(s.userAgent)}
                      {idx === 0 && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-semibold">
                          Current
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {s.ip && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" /> {s.ip}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {timeAgo(s.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => logoutAllMutation.mutate()}
              disabled={logoutAllMutation.isPending}
            >
              {logoutAllMutation.isPending
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <LogOut className="mr-2 h-4 w-4" />}
              Sign out all other devices
            </Button>
          </div>
        </Section>

        {/* Privacy note */}
        <Section title="Privacy & data" description="Your rights under GDPR and PDPL" icon={Shield}>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              You can download all your data or permanently delete your account from the{' '}
              <strong className="text-foreground">Billing</strong> page at any time.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = '/api/user/export';
                }}
              >
                Download my data
              </Button>
            </div>
          </div>
        </Section>

      </div>
    </AppLayout>
  );
}
