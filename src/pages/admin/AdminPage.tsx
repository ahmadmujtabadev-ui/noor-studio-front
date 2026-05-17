import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi, type AdminUser, type AdminReport, type AIUsageRecord } from '@/lib/api/admin.api';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Users, BookOpen, TrendingUp, ShieldAlert, LogOut,
  LayoutDashboard, Loader2, MoreHorizontal, Ban,
  BookCopy, Coins, RefreshCw, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, Search, Cpu, ShieldCheck,
  Sparkles, Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(date?: string) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(date?: string) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function PlanBadge({ plan }: { plan?: string }) {
  const map: Record<string, string> = {
    free:    'bg-slate-100 text-slate-600',
    creator: 'bg-blue-100 text-blue-700',
    author:  'bg-violet-100 text-violet-700',
    studio:  'bg-amber-100 text-amber-700',
  };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold capitalize', map[plan ?? 'free'] ?? map.free)}>
      {plan ?? 'free'}
    </span>
  );
}

function StatusDot({ active, label }: { active: boolean; label?: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm">
      <span className={cn('h-2 w-2 rounded-full', active ? 'bg-emerald-500' : 'bg-slate-300')} />
      {label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color = 'text-primary', sub }: {
  label: string; value: string | number; icon: React.ElementType; color?: string; sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-3xl font-bold text-foreground">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60', color)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────

function BooksDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'user-books', user._id],
    queryFn: () => adminApi.getUserBooks(user._id),
  });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Books by {user.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !data?.books?.length ? (
          <p className="py-6 text-center text-muted-foreground">No books yet</p>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.books.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">{b.title || 'Untitled'}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{b.status || 'draft'}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{fmt(b.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreditsDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => adminApi.adjustCredits(user._id, parseInt(amount, 10), description),
    onSuccess: () => { toast.success('Credits adjusted'); qc.invalidateQueries({ queryKey: ['admin', 'users'] }); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust Credits — {user.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">Current: {user.credits} credits</p>
        </DialogHeader>
        <div className="space-y-4">
          <div><Label>Amount (+ add / − deduct)</Label><Input type="number" placeholder="e.g. 50 or -20" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" /></div>
          <div><Label>Reason</Label><Input placeholder="Promotional credit" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={!amount || !description || mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BanDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const qc = useQueryClient();
  const banMutation = useMutation({
    mutationFn: () => adminApi.banUser(user._id, reason),
    onSuccess: () => { toast.success('User banned'); qc.invalidateQueries({ queryKey: ['admin', 'users'] }); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Ban {user.name}?</DialogTitle>
          <p className="text-sm text-muted-foreground">Blocks access immediately. They'll see a suspension message on next login.</p>
        </DialogHeader>
        <div><Label>Reason (optional)</Label><Input placeholder="Policy violation, spam…" value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1" /></div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => banMutation.mutate()} disabled={banMutation.isPending}>
            {banMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Ban User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RefundDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [chargeId, setChargeId] = useState('');
  const [amount, setAmount] = useState('');
  const mutation = useMutation({
    mutationFn: () => adminApi.refundUser(user._id, { chargeId, amount: amount ? parseFloat(amount) : undefined }),
    onSuccess: () => { toast.success('Refund issued'); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Issue Refund — {user.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">Find the Stripe charge ID in the Stripe dashboard.</p>
        </DialogHeader>
        <div className="space-y-4">
          <div><Label>Stripe Charge ID</Label><Input placeholder="ch_xxxxxxxxxxxxxxxx" value={chargeId} onChange={(e) => setChargeId(e.target.value)} className="mt-1 font-mono text-sm" /></div>
          <div><Label>Amount USD (blank = full refund)</Label><Input type="number" placeholder="9.99" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={!chargeId || mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Issue Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

type UserDialog = 'ban' | 'books' | 'credits' | 'refund' | null;

function UsersTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [dialog, setDialog] = useState<UserDialog>(null);
  const qc = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: () => adminApi.getUsers({ page, limit: 20 }),
    placeholderData: (prev) => prev,
  });

  const unbanMutation = useMutation({
    mutationFn: (id: string) => adminApi.unbanUser(id),
    onSuccess: () => { toast.success('User unbanned'); qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUser(id, { role }),
    onSuccess: () => { toast.success('Role updated'); qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openDialog = (user: AdminUser, d: UserDialog) => { setSelected(user); setDialog(d); };
  const closeDialog = () => { setSelected(null); setDialog(null); };

  const users = data?.users ?? [];
  const filtered = search
    ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <span>{data ? `${data.total} users · page ${data.page} of ${data.totalPages}` : ''}</span>
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => setPage((p) => p + 1)} disabled={!data || page >= data.totalPages}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-16 text-center text-muted-foreground">No users found</TableCell></TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u._id} className={cn(u.isBanned && 'bg-red-50/50')}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><PlanBadge plan={u.plan} /></TableCell>
                  <TableCell className="font-mono text-sm font-semibold">{u.credits}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {u.isBanned ? (
                        <Badge variant="destructive" className="w-fit text-xs">Banned</Badge>
                      ) : (
                        <StatusDot active={!!u.isEmailVerified} label={u.isEmailVerified ? 'Verified' : 'Unverified'} />
                      )}
                      {u.role === 'admin' && (
                        <Badge className="w-fit bg-amber-100 text-amber-700 text-xs border-amber-200">Admin</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmt(u.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(u, 'books')}><BookCopy className="mr-2 h-4 w-4" /> View Books</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDialog(u, 'credits')}><Coins className="mr-2 h-4 w-4" /> Adjust Credits</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDialog(u, 'refund')}><RefreshCw className="mr-2 h-4 w-4" /> Issue Refund</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => roleMutation.mutate({ id: u._id, role: u.role === 'admin' ? 'user' : 'admin' })}>
                          <ShieldCheck className="mr-2 h-4 w-4" />{u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {u.isBanned ? (
                          <DropdownMenuItem onClick={() => unbanMutation.mutate(u._id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => openDialog(u, 'ban')}>
                            <Ban className="mr-2 h-4 w-4" /> Ban User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selected && dialog === 'ban'     && <BanDialog user={selected} onClose={closeDialog} />}
      {selected && dialog === 'books'   && <BooksDialog user={selected} onClose={closeDialog} />}
      {selected && dialog === 'credits' && <CreditsDialog user={selected} onClose={closeDialog} />}
      {selected && dialog === 'refund'  && <RefundDialog user={selected} onClose={closeDialog} />}
    </div>
  );
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────

function ReportsTab() {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [page, setPage] = useState(1);
  const [noteDialog, setNoteDialog] = useState<AdminReport | null>(null);
  const [noteText, setNoteText] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports', statusFilter, page],
    queryFn: () => adminApi.getReports({ status: statusFilter === 'all' ? undefined : statusFilter, page, limit: 20 }),
    placeholderData: (prev) => prev,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status?: string; adminNote?: string }) =>
      adminApi.updateReport(id, { status, adminNote }),
    onSuccess: () => { toast.success('Report updated'); qc.invalidateQueries({ queryKey: ['admin', 'reports'] }); setNoteDialog(null); },
    onError: (e: Error) => toast.error(e.message),
  });

  const STATUS_COLORS: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-700 border-amber-200',
    reviewed:  'bg-blue-100 text-blue-700 border-blue-200',
    dismissed: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          {data && <span>{data.total} reports</span>}
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => setPage((p) => p + 1)} disabled={!data || page >= data.totalPages}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>User</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead>
              <TableHead>Project</TableHead><TableHead>Reported</TableHead><TableHead>Status</TableHead><TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
            ) : !data?.reports?.length ? (
              <TableRow><TableCell colSpan={7} className="py-16 text-center text-muted-foreground">No reports found</TableCell></TableRow>
            ) : (
              data.reports.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>
                    <p className="text-sm font-medium">{r.userId?.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{r.userId?.email ?? '—'}</p>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{r.type}</Badge></TableCell>
                  <TableCell className="max-w-[200px]"><p className="text-sm truncate text-muted-foreground">{r.description || '—'}</p></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.projectId?.title || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{timeAgo(r.createdAt)}</TableCell>
                  <TableCell><Badge className={cn('text-xs border', STATUS_COLORS[r.status] ?? '')}>{r.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => updateMutation.mutate({ id: r._id, status: 'reviewed' })}>
                            <CheckCircle2 className="h-3 w-3 mr-1 text-blue-600" /> Review
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => updateMutation.mutate({ id: r._id, status: 'dismissed' })}>
                            <XCircle className="h-3 w-3 mr-1 text-slate-500" /> Dismiss
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setNoteDialog(r); setNoteText(r.adminNote ?? ''); }}>Note</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {noteDialog && (
        <Dialog open onOpenChange={() => setNoteDialog(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Admin Note</DialogTitle></DialogHeader>
            <Textarea rows={4} placeholder="Internal note…" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoteDialog(null)}>Cancel</Button>
              <Button onClick={() => updateMutation.mutate({ id: noteDialog._id, adminNote: noteText })} disabled={updateMutation.isPending}>Save Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── AI Usage Tab ─────────────────────────────────────────────────────────────

function AIUsageTab() {
  const [days, setDays] = useState(7);
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'ai-usage', days],
    queryFn: () => adminApi.getAiUsage(days),
  });

  const usage = data?.usage ?? [];
  const totalCalls = usage.length;
  const successCount = usage.filter((u) => u.success).length;
  const successRate = totalCalls ? Math.round((successCount / totalCalls) * 100) : 0;
  const totalTokensIn = usage.reduce((s, u) => s + (u.tokensIn ?? 0), 0);
  const totalTokensOut = usage.reduce((s, u) => s + (u.tokensOut ?? 0), 0);

  const PROVIDER_COLOR: Record<string, string> = {
    claude: 'bg-violet-100 text-violet-700', bfl: 'bg-blue-100 text-blue-700',
    replicate: 'bg-orange-100 text-orange-700', gemini: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <Button key={d} variant={days === d ? 'default' : 'outline'} size="sm" onClick={() => setDays(d)}>{d}d</Button>
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
        </Button>
        <div className="ml-auto flex gap-6 text-sm">
          <span className="text-muted-foreground"><strong className="text-foreground">{totalCalls.toLocaleString()}</strong> calls</span>
          <span className="text-muted-foreground"><strong className="text-foreground">{successRate}%</strong> success</span>
          <span className="text-muted-foreground"><strong className="text-foreground">{(totalTokensIn / 1000).toFixed(1)}k</strong> in</span>
          <span className="text-muted-foreground"><strong className="text-foreground">{(totalTokensOut / 1000).toFixed(1)}k</strong> out</span>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Time</TableHead><TableHead>Provider</TableHead><TableHead>Stage</TableHead>
              <TableHead>Status</TableHead><TableHead className="text-right">Tokens In</TableHead><TableHead className="text-right">Tokens Out</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></TableCell></TableRow>
            ) : usage.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-16 text-center text-muted-foreground">No AI usage in the last {days} days</TableCell></TableRow>
            ) : (
              usage.slice(0, 200).map((u: AIUsageRecord) => (
                <TableRow key={u._id}>
                  <TableCell className="text-xs text-muted-foreground font-mono">{timeAgo(u.createdAt)}</TableCell>
                  <TableCell>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold capitalize', PROVIDER_COLOR[u.provider] ?? 'bg-slate-100 text-slate-600')}>
                      {u.provider}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">{u.stage || '—'}</TableCell>
                  <TableCell>{u.success ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-destructive" />}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{(u.tokensIn ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{(u.tokensOut ?? 0).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Margin Tab ───────────────────────────────────────────────────────────────

function MarginTab() {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'margin'], queryFn: adminApi.getMargin });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!data) return null;

  const {
    estimatedMrr = 0,
    aiCost30d = 0,
    grossProfit30d = 0,
    grossMarginPct = null,
    dailyCostSeries = [],
  } = data;

  const marginNum = grossMarginPct != null ? parseFloat(grossMarginPct) : null;
  const maxCost = dailyCostSeries.length ? Math.max(...dailyCostSeries.map((d) => d.aiCost), 0.01) : 0.01;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Est. MRR',        value: `$${estimatedMrr.toLocaleString()}`,    cls: 'text-foreground' },
          { label: 'AI Cost (30d)',   value: `$${aiCost30d.toFixed(2)}`,              cls: 'text-destructive' },
          { label: 'Gross Profit',    value: `$${grossProfit30d.toFixed(2)}`,         cls: grossProfit30d >= 0 ? 'text-emerald-600' : 'text-destructive' },
          {
            label: 'Gross Margin',
            value: marginNum != null ? `${marginNum.toFixed(1)}%` : 'N/A',
            cls: marginNum == null ? 'text-muted-foreground'
              : marginNum >= 60 ? 'text-emerald-600'
              : marginNum >= 30 ? 'text-amber-600'
              : 'text-destructive',
          },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{c.label}</p>
            <p className={cn('text-3xl font-bold', c.cls)}>{c.value}</p>
          </div>
        ))}
      </div>

      {dailyCostSeries.length > 0 && (
        <div className="rounded-xl border bg-white p-5">
          <h3 className="text-sm font-semibold mb-4">Daily AI Cost (last 30 days)</h3>
          <div className="space-y-2">
            {dailyCostSeries.slice(-14).map((d) => (
              <div key={d.date} className="flex items-center gap-3">
                <span className="w-20 text-xs text-muted-foreground shrink-0">
                  {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex-1">
                  <div className="h-2.5 rounded-sm bg-rose-400/70" style={{ width: `${Math.max((d.aiCost / maxCost) * 100, 1)}%` }} />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground w-32 text-right shrink-0">
                  {d.calls} calls · ${d.aiCost.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-3 rounded-sm bg-rose-400/70 inline-block" /> AI Cost</span>
          </div>
        </div>
      )}

      {dailyCostSeries.length === 0 && (
        <div className="rounded-xl border bg-white p-10 text-center text-muted-foreground text-sm">
          No AI usage data in the last 30 days
        </div>
      )}
    </div>
  );
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────

type AdminTab = 'dashboard' | 'users' | 'reports' | 'ai' | 'margin';

const NAV = [
  { id: 'dashboard' as AdminTab, label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'users'     as AdminTab, label: 'Users',       icon: Users },
  { id: 'reports'   as AdminTab, label: 'Reports',     icon: Flag },
  { id: 'ai'        as AdminTab, label: 'AI Usage',    icon: Cpu },
  { id: 'margin'    as AdminTab, label: 'Margin',      icon: TrendingUp },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
    refetchInterval: 60_000,
  });

  const handleLogout = () => { logout(); navigate('/auth'); };

  const TAB_TITLES: Record<AdminTab, { title: string; sub: string }> = {
    dashboard: { title: 'Dashboard',       sub: 'Platform overview and key metrics' },
    users:     { title: 'Users',           sub: 'Manage accounts, credits, plans, and access' },
    reports:   { title: 'Reports',         sub: 'Review user-submitted content reports' },
    ai:        { title: 'AI Usage',        sub: 'Monitor API calls, token usage, and provider performance' },
    margin:    { title: 'Margin',          sub: 'Revenue vs. AI cost vs. gross margin estimate' },
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0d1b2a] flex flex-col z-40 border-r border-white/5">

        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white">NoorStudio</span>
            <span className="ml-2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5">ADMIN</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left',
                activeTab === id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
              {id === 'reports' && (stats?.aiUsage?.totalRequests ?? 0) > 0 && (
                <span className="ml-auto h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* Stats summary in sidebar */}
        <div className="px-3 py-4 border-t border-white/8 space-y-2">
          {[
            { label: 'Total Users',    value: stats?.totalUsers ?? '—' },
            { label: 'Active Subs',    value: stats?.activeSubscriptions ?? '—' },
            { label: 'AI Cost Today',  value: stats?.aiCostToday ?? '$0.00' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between px-2">
              <span className="text-xs text-white/40">{s.label}</span>
              <span className="text-xs font-semibold text-white/80">{s.value}</span>
            </div>
          ))}
        </div>

        {/* User block */}
        <div className="p-3 border-t border-white/8">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-white/40">Administrator</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Log out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="ml-64 flex-1 flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-border flex items-center justify-between px-8 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-foreground">{TAB_TITLES[activeTab].title}</h1>
            <p className="text-xs text-muted-foreground">{TAB_TITLES[activeTab].sub}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetchStats()} title="Refresh stats">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/dashboard"><ChevronLeft className="mr-1 h-4 w-4" /> Back to App</Link>
            </Button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-8 space-y-6">

          {/* Dashboard stats (always visible at top) */}
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {statsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
                  ))
                ) : (
                  <>
                    <StatCard label="Total Users"    value={stats?.totalUsers ?? 0}          icon={Users}         />
                    <StatCard label="Signups Today"  value={stats?.signupsToday ?? 0}         icon={TrendingUp}    color="text-emerald-600" />
                    <StatCard label="Active Subs"    value={stats?.activeSubscriptions ?? 0}  icon={CheckCircle2}  color="text-blue-600" />
                    <StatCard label="Banned"         value={stats?.bannedUsers ?? 0}           icon={Ban}           color="text-destructive" />
                    <StatCard label="Projects"       value={stats?.totalProjects ?? 0}         icon={BookOpen}      color="text-violet-600" />
                    <StatCard label="AI Cost Today"  value={stats?.aiCostToday ?? '$0.00'}    icon={Cpu}           color="text-amber-600" />
                  </>
                )}
              </div>

              {/* All-time AI summary */}
              {stats?.aiUsage && (
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">All-time AI Summary</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      { label: 'Total AI Calls',  value: (stats.aiUsage.totalRequests ?? 0).toLocaleString() },
                      { label: 'Tokens In',        value: ((stats.aiUsage.totalInputTokens ?? 0) / 1000).toFixed(1) + 'k' },
                      { label: 'Tokens Out',       value: ((stats.aiUsage.totalOutputTokens ?? 0) / 1000).toFixed(1) + 'k' },
                      { label: 'Success Rate',     value: `${Math.round((stats.aiUsage.successRate ?? 0) * 100)}%` },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-muted/40 p-4">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-2xl font-bold mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab content panels */}
          {activeTab === 'users'   && <UsersTab />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'ai'      && <AIUsageTab />}
          {activeTab === 'margin'  && <MarginTab />}

        </main>
      </div>
    </div>
  );
}
