import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Users, BookOpen, FolderKanban, Clock, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import { useCharacters } from "@/hooks/useCharacters";
import { useUser } from "@/hooks/useAuth";
import type { Project, PipelineStage } from "@/lib/api/types";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function getProjectStatus(project: Project): string {
  const pipeline = project.pipeline ?? [];
  const completed = pipeline.filter((s: PipelineStage) => s.status === "completed").length;
  const total = pipeline.length;
  if (!total || completed === 0) return "Draft";
  if (completed === total) return "Completed";
  return "In Progress";
}

function getProgress(project: Project): number {
  const pipeline = project.pipeline ?? [];
  const total = pipeline.length;
  if (!total) return 0;
  const completed = pipeline.filter((s: PipelineStage) => s.status === "completed").length;
  return Math.round((completed / total) * 100);
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useUser();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: characters = [], isLoading: charsLoading } = useCharacters();

  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const stats = [
    { label: "Characters", value: characters.length.toString(), icon: Users, color: "bg-teal-100 text-primary" },
    { label: "Books", value: projects.length.toString(), icon: BookOpen, color: "bg-gold-100 text-gold-600" },
    { label: "Projects", value: projects.length.toString(), icon: FolderKanban, color: "bg-coral-100 text-coral-500" },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.name || "Author"}
            </h1>
            <p className="text-muted-foreground">
              {user?.credits ?? 0} credits available
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/app/characters/new">
              <Button variant="soft">
                <Plus className="w-4 h-4 mr-2" />
                New Character
              </Button>
            </Link>
            <Link to="/app/books/new">
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-2" />
                New Book
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card-premium p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                {projectsLoading || charsLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                )}
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
            {sortedProjects.length > 5 && (
              <Link to="/app/projects" className="text-sm text-primary hover:underline">
                View all
              </Link>
            )}
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sortedProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first book project to start generating Islamic children's stories.
              </p>
              <Link to="/app/books/new">
                <Button variant="hero">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Book
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedProjects.slice(0, 5).map((project) => {
                const status = getProjectStatus(project);
                const progress = getProgress(project);

                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => navigate(`/app/projects/${project.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-teal flex items-center justify-center text-white">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{project.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(project.updatedAt)}
                          <span className="text-muted-foreground/50">•</span>
                          <span>{project.ageRange}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              progress === 100 ? "bg-primary" : "bg-gold-500"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{progress}%</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          status === "Completed" && "bg-primary/10 text-primary border-primary/30",
                          status === "In Progress" && "bg-gold-100 text-gold-600 border-gold-200",
                          status === "Draft" && "bg-muted text-muted-foreground"
                        )}
                      >
                        {status}
                      </Badge>
                      <Button variant="ghost" size="sm">Open</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
