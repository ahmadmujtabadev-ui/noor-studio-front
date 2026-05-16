import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api/client';
import { Flag, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  projectId?: string;
  outputRef?: string;
  className?: string;
}

export function ReportButton({ projectId, outputRef, className }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('inappropriate');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleClose = () => { setOpen(false); setType('inappropriate'); setDescription(''); setDone(false); };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/api/reports', { projectId, outputRef, type, description });
      setDone(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className={className}
        title="Report this content"
      >
        <Flag className="h-4 w-4 text-muted-foreground" />
        <span className="sr-only">Report content</span>
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Report content</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Our team will review this report within 24 hours.
            </p>
          </DialogHeader>

          {done ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="font-semibold">Report submitted</p>
              <p className="text-sm text-muted-foreground">Thank you. Our team will review this shortly.</p>
              <Button onClick={handleClose} variant="outline" size="sm">Close</Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Type of issue</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                      <SelectItem value="copyright">Copyright concern</SelectItem>
                      <SelectItem value="other">Other issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    rows={3}
                    placeholder="Describe the issue…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 resize-none text-sm"
                    maxLength={500}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Report
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
