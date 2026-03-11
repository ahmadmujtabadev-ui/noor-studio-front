import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Eye, Check, Loader2, Globe, Lock } from "lucide-react";
import { usePublishProject } from "@/hooks/useProjects";
import { Link } from "react-router-dom";

interface ShareProjectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  shareToken?: string;
}

export function ShareProjectModal({
  isOpen,
  onOpenChange,
  projectId,
  projectTitle,
  shareToken: existingToken,
}: ShareProjectModalProps) {
  const { toast } = useToast();
  const publishMutation = usePublishProject(projectId);
  const [shareToken, setShareToken] = useState(existingToken || "");
  const [copied, setCopied] = useState(false);

  const shareUrl = shareToken ? `${window.location.origin}/demo/${shareToken}` : "";

  const handlePublish = async () => {
    try {
      const updated = await publishMutation.mutateAsync();
      if (updated.shareToken) {
        setShareToken(updated.shareToken);
        toast({ title: "Published!", description: "Your book is now publicly viewable." });
      }
    } catch (err) {
      toast({
        title: "Failed to publish",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Share Project</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">{projectTitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!shareToken ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">Not yet published</p>
                <p className="text-sm text-muted-foreground">
                  Publish your project to get a shareable preview link.
                </p>
              </div>
              <Button
                variant="hero"
                onClick={handlePublish}
                disabled={publishMutation.isPending}
              >
                {publishMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing...</>
                ) : (
                  <><Globe className="w-4 h-4 mr-2" />Publish Book</>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" />
                <span>Published — shareable link is active</span>
                <Badge className="bg-green-100 text-green-600 text-xs ml-auto">Live</Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Share Link</p>
                <div className="flex gap-2">
                  <Input readOnly value={shareUrl} className="text-xs" />
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/demo/${shareToken}`} target="_blank">
                    <Eye className="w-4 h-4 mr-2" />Preview
                  </Link>
                </Button>
                <Button variant="hero" className="flex-1" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />Copy Link
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Anyone with this link can view your book in read-only mode.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
