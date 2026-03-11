import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle, Clock, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRunStage } from "@/hooks/useAI";
import type { Project, PipelineStage } from "@/lib/api/types";

interface OutlineVersionHistoryProps {
  project: Project;
}

export function OutlineVersionHistory({ project }: OutlineVersionHistoryProps) {
  const { toast } = useToast();
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const outline = project.artifacts?.outline;
  const pipeline = project.pipeline || [];

  const completedStages = pipeline.filter((s: PipelineStage) => s.status === "completed");
  const runningStage = pipeline.find((s: PipelineStage) => s.status === "running");

  if (!outline && completedStages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
        No outline history yet. Run the Outline stage to begin.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold">Pipeline History</h3>
        <Badge variant="outline">{completedStages.length} completed</Badge>
      </div>

      {/* Running Stage */}
      {runningStage && (
        <div className="p-4 rounded-xl border-2 border-primary/30 bg-primary/5 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm capitalize">{runningStage.name}</p>
            <p className="text-xs text-muted-foreground">{runningStage.message || "Running..."}</p>
          </div>
          <Badge className="bg-primary/10 text-primary text-xs">Running</Badge>
        </div>
      )}

      {/* Pipeline Stages */}
      {pipeline.map((stage: PipelineStage) => {
        if (stage.status === "running") return null;
        const isExpanded = expandedStage === stage.name;
        const isCompleted = stage.status === "completed";

        return (
          <div
            key={stage.name}
            className={cn(
              "rounded-xl border transition-all",
              isCompleted ? "border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800" :
              stage.status === "error" ? "border-destructive/30 bg-destructive/5" :
              "border-border bg-muted/20"
            )}
          >
            <button
              className="w-full flex items-center gap-3 p-4 text-left"
              onClick={() => setExpandedStage(isExpanded ? null : stage.name)}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm capitalize">{stage.name}</p>
                {stage.completedAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(stage.completedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <Badge
                className={cn(
                  "text-xs mr-2",
                  isCompleted ? "bg-green-100 text-green-600" :
                  stage.status === "error" ? "bg-red-100 text-red-600" :
                  "bg-muted text-muted-foreground"
                )}
              >
                {stage.status}
              </Badge>
              {isCompleted && (
                isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />
              )}
            </button>

            {/* Expanded: show artifact preview */}
            {isExpanded && isCompleted && (
              <div className="px-4 pb-4 border-t border-green-200/50">
                {stage.name === "outline" && outline && (
                  <div className="mt-3 space-y-2">
                    {outline.synopsis && (
                      <p className="text-xs text-muted-foreground italic line-clamp-2">{outline.synopsis}</p>
                    )}
                    <p className="text-xs font-medium">
                      {Array.isArray(outline.chapters) ? `${outline.chapters.length} chapters planned` : "Outline ready"}
                    </p>
                  </div>
                )}
                {stage.name === "chapters" && project.artifacts?.chapters && (
                  <div className="mt-3">
                    <p className="text-xs font-medium">{project.artifacts.chapters.length} chapters written</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ~{project.artifacts.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0).toLocaleString()} words total
                    </p>
                  </div>
                )}
                {stage.name === "illustrations" && project.artifacts?.illustrations && (
                  <div className="mt-3">
                    <p className="text-xs font-medium">{project.artifacts.illustrations.length} illustrations generated</p>
                  </div>
                )}
                {stage.name === "cover" && project.artifacts?.cover && (
                  <div className="mt-3">
                    {project.artifacts.cover.frontCoverUrl && (
                      <img src={project.artifacts.cover.frontCoverUrl} alt="Cover" className="w-20 rounded-lg" />
                    )}
                  </div>
                )}
                {stage.message && (
                  <p className="text-xs text-muted-foreground mt-2">{stage.message}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
