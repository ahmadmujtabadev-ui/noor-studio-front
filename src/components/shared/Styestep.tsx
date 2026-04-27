// steps/StyleStep.tsx
import React from "react";
import { Sparkles, ArrowLeft, ArrowRight, Users, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookBuilderHook } from "@/hooks/useBookBuilder";

const ART_STYLES = [
  { id: "pixar-3d",      name: "3D Rendered"       },
  { id: "watercolor",    name: "Watercolor"         },
  { id: "flat-cartoon",  name: "Flat Cartoon"       },
  { id: "storybook",     name: "Storybook"          },
  { id: "ghibli",        name: "Hand-Painted Anime" },
];

interface StyleStepProps {
  bb: BookBuilderHook;
  selectedCharacters: Array<{ id?: string; _id?: string; name: string; role?: string; masterReferenceUrl?: string }>;
  charsLoading?: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function StyleStep({ bb, selectedCharacters, charsLoading, onBack, onContinue }: StyleStepProps) {
  const allReady = selectedCharacters.length === 0 || selectedCharacters.every((c) => {
    const id = c.id || c._id || "";
    return bb.portraits[id] || c.masterReferenceUrl;
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold">Character Style</h2>
        <p className="text-sm text-muted-foreground">
          Generate reference portraits for each character. Edit prompt → generate → approve.
        </p>
      </div>

      {/* Art style selector */}
      <div className="space-y-2">
        <Label>Art style</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {ART_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => bb.setArtStyle(s.id)}
              className={cn(
                "rounded-xl border-2 p-3 text-xs font-semibold transition-all",
                bb.artStyle === s.id
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border hover:border-primary/30"
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Characters */}
      {charsLoading ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Loader2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading characters…</p>
        </div>
      ) : selectedCharacters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No characters selected — you can continue without portraits.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedCharacters.map((c) => {
            const id       = c.id || c._id || "";
            const imageUrl = bb.portraits[id] || c.masterReferenceUrl;
            const isLoading = bb.loadingKey === `portrait-${id}`;

            return (
              <div key={id} className={cn(
                "rounded-xl border p-4 flex items-center gap-4 transition-all",
                imageUrl ? "border-emerald-200 dark:border-emerald-800" : "border-border"
              )}>
                {/* Avatar */}
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                  {imageUrl ? (
                    <img src={imageUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{c.name}</div>
                  {c.role && <div className="text-xs text-muted-foreground">{c.role}</div>}
                  {imageUrl && (
                    <Badge className="mt-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />Portrait ready
                    </Badge>
                  )}
                </div>

                <Button
                  size="sm"
                  variant={imageUrl ? "outline" : "default"}
                  disabled={isLoading}
                  onClick={() => bb.generatePortrait(id)}
                >
                  {isLoading ? (
                    <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Generating</>
                  ) : imageUrl ? (
                    <><Sparkles className="w-3 h-3 mr-1.5" />Regenerate</>
                  ) : (
                    <><Sparkles className="w-3 h-3 mr-1.5" />Generate</>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <Button disabled={!allReady} onClick={onContinue}>
          Continue {bb.isChapterBook ? "to Prose" : "to Illustrations"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}