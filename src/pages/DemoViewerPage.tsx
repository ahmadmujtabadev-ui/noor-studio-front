import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen, FileText, Image, Loader2, Sparkles, ArrowRight, AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api/client";
import type { Project } from "@/lib/api/types";

function DemoHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">NoorStudio</span>
        </Link>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-xs">Demo Preview</Badge>
          <Link to="/app/dashboard">
            <Button variant="hero" size="sm">
              Create Your Own <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function DemoViewerPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareToken) return;
    setLoading(true);
    api.get<Project>(`/projects/shared/${shareToken}`)
      .then((p) => { setProject(p); setLoading(false); })
      .catch((err) => { setError(err.message || "Project not found"); setLoading(false); });
  }, [shareToken]);

  if (loading) {
    return (
      <>
        <DemoHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <DemoHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "This demo link may have expired or been removed."}</p>
          <Link to="/">
            <Button variant="hero">Go to NoorStudio</Button>
          </Link>
        </div>
      </>
    );
  }

  const artifacts = project.artifacts || {};
  const completedStages = project.pipeline.filter((s) => s.status === "completed").map((s) => s.name);

  return (
    <>
      <DemoHeader />

      {/* Hero */}
      <div className="bg-gradient-subtle border-b border-border py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            {artifacts.cover?.frontCoverUrl ? (
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <img
                  src={artifacts.cover.frontCoverUrl}
                  alt="Book Cover"
                  className="w-48 rounded-2xl shadow-lg border border-border shrink-0"
                />
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-3">{project.title}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">Ages {project.ageRange}</Badge>
                    <Badge variant="outline" className="capitalize">{project.templateType?.replace(/-/g, " ")}</Badge>
                    {completedStages.length > 0 && (
                      <Badge className="bg-green-100 text-green-700">{completedStages.length} stages complete</Badge>
                    )}
                  </div>
                  {project.synopsis && (
                    <p className="text-muted-foreground leading-relaxed">{project.synopsis}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-4xl font-bold mb-3">{project.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">Ages {project.ageRange}</Badge>
                  <Badge variant="outline" className="capitalize">{project.templateType?.replace(/-/g, " ")}</Badge>
                </div>
                {project.synopsis && (
                  <p className="text-muted-foreground leading-relaxed">{project.synopsis}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-10">
        {completedStages.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">This book is still being created.</p>
          </div>
        ) : (
          <Tabs defaultValue={completedStages[0]} className="space-y-6">
            <TabsList>
              {completedStages.map((stage) => (
                <TabsTrigger key={stage} value={stage} className="capitalize">{stage}</TabsTrigger>
              ))}
            </TabsList>

            {/* Outline */}
            {artifacts.outline && (
              <TabsContent value="outline" className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />Story Outline
                </h2>
                {artifacts.outline.synopsis && (
                  <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="font-medium text-primary mb-1">Synopsis</p>
                    <p className="text-foreground/80 leading-relaxed">{artifacts.outline.synopsis}</p>
                  </div>
                )}
                <div className="space-y-2">
                  {(artifacts.outline.chapters || []).map((ch, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-muted/50 border border-border">
                      <p className="font-medium">
                        {typeof ch === "string" ? ch : `Chapter ${idx + 1}: ${(ch as {title?: string}).title || "Untitled"}`}
                      </p>
                      {typeof ch !== "string" && (ch as {goal?: string}).goal && (
                        <p className="text-sm text-muted-foreground mt-1">{(ch as {goal: string}).goal}</p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}

            {/* Chapters */}
            {artifacts.chapters && (
              <TabsContent value="chapters" className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />Chapters
                </h2>
                {(artifacts.chapters || []).map((ch, idx) => (
                  <div key={idx} className="p-6 rounded-xl border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Chapter {ch.chapterNumber}: {ch.title}</h3>
                      <Badge variant="outline">{ch.wordCount} words</Badge>
                    </div>
                    <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed">
                      {ch.content?.split("\n\n").map((para, pIdx) => (
                        <p key={pIdx} className="mb-3">{para}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
            )}

            {/* Illustrations */}
            {artifacts.illustrations && (
              <TabsContent value="illustrations" className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary" />Illustrations
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(artifacts.illustrations || []).filter((ill) => ill.imageUrl).map((ill, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-border">
                      <img src={ill.imageUrl} alt={`Illustration ${idx + 1}`} className="w-full" />
                      <div className="p-2">
                        <p className="text-xs text-muted-foreground">Chapter {ill.chapterNumber}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}

            {/* Cover */}
            {artifacts.cover && (
              <TabsContent value="cover" className="space-y-4">
                <h2 className="text-xl font-bold">Book Cover</h2>
                <div className="grid sm:grid-cols-2 gap-6 max-w-lg">
                  {artifacts.cover.frontCoverUrl && (
                    <div>
                      <img src={artifacts.cover.frontCoverUrl} alt="Front Cover" className="rounded-2xl w-full shadow-lg" />
                      <p className="text-center text-sm text-muted-foreground mt-2">Front Cover</p>
                    </div>
                  )}
                  {artifacts.cover.backCoverUrl && (
                    <div>
                      <img src={artifacts.cover.backCoverUrl} alt="Back Cover" className="rounded-2xl w-full shadow-lg" />
                      <p className="text-center text-sm text-muted-foreground mt-2">Back Cover</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>

      {/* CTA Footer */}
      <div className="border-t border-border bg-muted/30 py-12 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Create Your Own Islamic Children's Book</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            NoorStudio uses AI to help you create beautiful, culturally-authentic children's books.
          </p>
          <Link to="/app/dashboard">
            <Button variant="hero" size="lg">
              Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
