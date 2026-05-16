import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi, type AdminUser, type AdminReport, type AIUsageRecord } from '@/lib/api/admin.api';
import { useAuthStore } from '@/lib/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  LayoutDashboard, Loader2, MoreHorizontal, Ban, BookCopy,
  Coins, RefreshCw, CheckCircle2, XCircle, Clock, ChevronLeft,
  ChevronRight, Search, Cpu, ArrowLeft, ShieldCheck,
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

function StatCard({ label, value, icon: Icon, color = 'text-primary' }: {
  label: string; value: string | number; icon: React.ElementType; color?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-muted', color)}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Books Dialog ─────────────────────────────────────────────────────────────

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
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.books.map((b) => (
                <TableRow key={b._id}>
                  <TableCell className="font-medium">{b.title || 'Untitled'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{b.status || 'draft'}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fmt(b.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Credits Dialog ───────────────────────────────────────────────────────────

function CreditsDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => adminApi.adjustCredits(user._id, parseInt(amount, 10), description),
    onSuccess: () => {
      toast.success('Credits adjusted');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust Credits — {user.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">Current balance: {user.credits} credits</p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Amount (positive = add, negative = deduct)</Label>
            <Input
              type="number"
              placeholder="e.g. 50 or -20"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Reason / Description</Label>
            <Input
              placeholder="e.g. Promotional credit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!amount || !description || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Ban Dialog ───────────────────────────────────────────────────────────────

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
          <p className="text-sm text-muted-foreground">
            This will immediately block their access. They'll see a suspension message on next login.
          </p>
        </DialogHeader>
        <div>
          <Label>Reason (optional)</Label>
          <Input
            placeholder="Policy violation, spam, etc."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={() => banMutation.mutate()} disabled={banMutation.isPending}>
            {banMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ban User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Refund Dialog ────────────────────────────────────────────────────────────

function RefundDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [chargeId, setChargeId] = useState('');
  const [amount, setAmount] = useState('');

  const mutation = useMutation({
    mutationFn: () => adminApi.refundUser(user._id, {
      chargeId,
      amount: amount ? parseFloat(amount) : undefined,
    }),
    onSuccess: () => { toast.success('Refund issued successfully'); onClose(); },
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
          <div>
            <Label>Stripe Charge ID</Label>
            <Input placeholder="ch_xxxxxxxxxxxxxxxx" value={chargeId} onChange={(e) => setChargeId(e.target.value)} className="mt-1 font-mono text-sm" />
          </div>
          <div>
            <Label>Partial amount in USD (leave blank for full refund)</Label>
            <Input type="number" placeholder="e.g. 9.99" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={!chargeId || mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Issue Refund
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
    ? users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-4">
      {/* Search + pagination controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {data ? `${data.total} users · page ${data.page} of ${data.totalPages}` : ''}
          </span>
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setPage((p) => p + 1)} disabled={!data || page >= data.totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
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
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u._id} className={cn(u.isBanned && 'bg-red-50/50')}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell><PlanBadge plan={u.plan} /></TableCell>
                  <TableCell className="font-mono text-sm">{u.credits}</TableCell>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(u, 'books')}>
                          <BookCopy className="mr-2 h-4 w-4" /> View Books
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDialog(u, 'credits')}>
                          <Coins className="mr-2 h-4 w-4" /> Adjust Credits
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDialog(u, 'refund')}>
                          <RefreshCw className="mr-2 h-4 w-4" /> Issue Refund
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => roleMutation.mutate({ id: u._id, role: u.role === 'admin' ? 'user' : 'admin' })}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {u.isBanned ? (
                          <DropdownMenuItem onClick={() => unbanMutation.mutate(u._id)}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => openDialog(u, 'ban')}
                          >
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

      {/* Dialogs */}
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
    queryFn: () => adminApi.getReports({ status: statusFilter || undefined, page, limit: 20 }),
    placeholderData: (prev) => prev,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status?: string; adminNote?: string }) =>
      adminApi.updateReport(id, { status, adminNote }),
    onSuccess: () => {
      toast.success('Report updated');
      qc.invalidateQueries({ queryKey: ['admin', 'reports'] });
      setNoteDialog(null);
    },
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
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
            <SelectItem value="">All</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          {data && <span>{data.total} reports</span>}
          <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setPage((p) => p + 1)} disabled={!data || page >= data.totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : !data?.reports?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              data.reports.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{r.userId?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{r.userId?.email ?? '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{r.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-sm truncate text-muted-foreground">{r.description || '—'}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.projectId?.title || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{timeAgo(r.createdAt)}</TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs border', STATUS_COLORS[r.status] ?? '')}>{r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => updateMutation.mutate({ id: r._id, status: 'reviewed' })}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1 text-blue-600" /> Review
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => updateMutation.mutate({ id: r._id, status: 'dismissed' })}
                          >
                            <XCircle className="h-3 w-3 mr-1 text-slate-500" /> Dismiss
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => { setNoteDialog(r); setNoteText(r.adminNote ?? ''); }}
                      >
                        Note
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Note dialog */}
      {noteDialog && (
        <Dialog open onOpenChange={() => setNoteDialog(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Admin Note</DialogTitle>
            </DialogHeader>
            <Textarea
              rows={4}
              placeholder="Internal note about this report…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoteDialog(null)}>Cancel</Button>
              <Button
                onClick={() => updateMutation.mutate({ id: noteDialog._id, adminNote: noteText })}
                disabled={updateMutation.isPending}
              >
                Save Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Margin Tab ───────────────────────────────────────────────────────────────

function MarginTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'margin'],
    queryFn: adminApi.getMargin,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!data) return null;

  const { mrr, aiCost, grossMarginPct, daily } = data;
  const maxRevenue = Math.max(...daily.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Est. MRR</p>
          <p className="text-3xl font-bold">${mrr.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">AI Cost (30d)</p>
          <p className="text-3xl font-bold text-destructive">${aiCost.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Gross Margin</p>
          <p className={cn(
            'text-3xl font-bold',
            grossMarginPct >= 60 ? 'text-emerald-600' : grossMarginPct >= 30 ? 'text-amber-600' : 'text-destructive'
          )}>
            {grossMarginPct.toFixed(1)}%
          </p>
        </div>
      </div>

      {daily.length > 0 && (
        <div className="rounded-xl border p-5">
          <h3 className="text-sm font-semibold mb-4">Daily Revenue vs. AI Cost — last {daily.length} days</h3>
          <div className="space-y-2">
            {daily.slice(-14).map((d) => (
              <div key={d.date} className="flex items-center gap-3">
                <span className="w-20 text-xs text-muted-foreground shrink-0">
                  {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex-1 flex flex-col gap-0.5">
                  <div
                    className="h-2.5 rounded-sm bg-primary/70"
                    style={{ width: `${Math.max((d.revenue / maxRevenue) * 100, 1)}%` }}
                  />
                  <div
                    className="h-2.5 rounded-sm bg-rose-400/70"
                    style={{ width: `${Math.max((d.cost / maxRevenue) * 100, 0.5)}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground w-28 text-right shrink-0">
                  ${d.revenue.toFixed(0)} / ${d.cost.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-3 rounded-sm bg-primary/70 inline-block" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-3 rounded-sm bg-rose-400/70 inline-block" /> AI Cost
            </span>
          </div>
        </div>
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
    claude:    'bg-violet-100 text-violet-700',
    bfl:       'bg-blue-100 text-blue-700',
    replicate: 'bg-orange-100 text-orange-700',
    gemini:    'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
        </Button>
        <div className="ml-auto flex gap-6 text-sm">
          <span className="text-muted-foreground">
            <strong className="text-foreground">{totalCalls.toLocaleString()}</strong> calls
          </span>
          <span className="text-muted-foreground">
            <strong className="text-foreground">{successRate}%</strong> success
          </span>
          <span className="text-muted-foreground">
            <strong className="text-foreground">{(totalTokensIn / 1000).toFixed(1)}k</strong> tokens in
          </span>
          <span className="text-muted-foreground">
            <strong className="text-foreground">{(totalTokensOut / 1000).toFixed(1)}k</strong> tokens out
          </span>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Tokens In</TableHead>
              <TableHead className="text-right">Tokens Out</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : usage.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center text-muted-foreground">
                  No AI usage in the last {days} days
                </TableCell>
              </TableRow>
            ) : (
              usage.slice(0, 200).map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="text-xs text-muted-foreground font-mono">{timeAgo(u.createdAt)}</TableCell>
                  <TableCell>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold capitalize', PROVIDER_COLOR[u.provider] ?? 'bg-slate-100 text-slate-600')}>
                      {u.provider}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">{u.stage || '—'}</TableCell>
                  <TableCell>
                    {u.success
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      : <XCircle className="h-4 w-4 text-destructive" />}
                  </TableCell>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getStats,
    refetchInterval: 60_000,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">NoorStudio</span>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Admin</Badge>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => refetchStats()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/dashboard">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> App
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
              <LogOut className="mr-1.5 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {statsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
            ))
          ) : (
            <>
              <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} />
              <StatCard label="Signups Today" value={stats?.signupsToday ?? 0} icon={TrendingUp} color="text-emerald-600" />
              <StatCard label="Active Subs" value={stats?.activeSubscriptions ?? 0} icon={CheckCircle2} color="text-blue-600" />
              <StatCard label="Banned" value={stats?.bannedUsers ?? 0} icon={Ban} color="text-destructive" />
              <StatCard label="Projects" value={stats?.totalProjects ?? 0} icon={BookOpen} color="text-violet-600" />
              <StatCard label="AI Cost Today" value={stats?.aiCostToday ?? '$0.00'} icon={Cpu} color="text-amber-600" />
            </>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="border bg-white shadow-sm">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <ShieldAlert className="h-4 w-4" /> Reports
              {(stats?.aiUsage?.totalRequests ?? 0) > 0 && (
                <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">!</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Cpu className="h-4 w-4" /> AI Usage
            </TabsTrigger>
            <TabsTrigger value="margin" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Margin
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 rounded-xl border bg-white p-6 shadow-sm">
            <TabsContent value="users" className="mt-0">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Users</h2>
                  <p className="text-sm text-muted-foreground">Manage accounts, credits, plans, and access</p>
                </div>
              </div>
              <UsersTab />
            </TabsContent>

            <TabsContent value="reports" className="mt-0">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Content Reports</h2>
                <p className="text-sm text-muted-foreground">Review user-submitted content reports and moderation flags</p>
              </div>
              <ReportsTab />
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">AI Usage</h2>
                <p className="text-sm text-muted-foreground">Monitor API calls, token usage, and provider performance</p>
              </div>
              <AIUsageTab />
            </TabsContent>

            <TabsContent value="margin" className="mt-0">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Margin Dashboard</h2>
                <p className="text-sm text-muted-foreground">Revenue vs. AI cost vs. gross margin estimate</p>
              </div>
              <MarginTab />
            </TabsContent>
          </div>
        </Tabs>

        {/* Overview footer */}
        {stats?.aiUsage && (
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">All-time AI Summary</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Total AI Calls', value: (stats.aiUsage.totalRequests ?? 0).toLocaleString() },
                { label: 'Tokens In', value: ((stats.aiUsage.totalInputTokens ?? 0) / 1000).toFixed(1) + 'k' },
                { label: 'Tokens Out', value: ((stats.aiUsage.totalOutputTokens ?? 0) / 1000).toFixed(1) + 'k' },
                { label: 'Success Rate', value: `${Math.round((stats.aiUsage.successRate ?? 0) * 100)}%` },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
