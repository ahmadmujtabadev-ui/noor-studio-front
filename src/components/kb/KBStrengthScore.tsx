import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, ChevronRight, CircleAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface KBStrengthProps {
  kb: any;
  onNavigate?: (tab: string, section?: string) => void;
  compact?: boolean;
}

interface Domain {
  id: string;
  label: string;
  tab: string;
  section?: string;
  weight: number;
  score: (kb: any) => number;
  cost: string;
  tip: string;
}

const DOMAINS: Domain[] = [
  {
    id: "values",
    label: "Islamic Values",
    tab: "faith",
    section: "islamicValues",
    weight: 10,
    score: (kb) => Math.min(100, ((kb.islamicValues?.length || 0) / 5) * 100),
    cost: "Stories may lack Islamic moral grounding - characters feel generic",
    tip: "Add at least 5 values",
  },
  {
    id: "duas",
    label: "Du'as",
    tab: "faith",
    section: "duas",
    weight: 15,
    score: (kb) => Math.min(100, ((kb.duas?.length || 0) / 5) * 100),
    cost: "Characters won't make du'a naturally - faith moments feel staged",
    tip: "Add at least 5 du'as",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    tab: "faith",
    section: "vocabulary",
    weight: 10,
    score: (kb) => Math.min(100, ((kb.vocabulary?.length || 0) / 4) * 100),
    cost: "Islamic terms may be misused or replaced with generic English",
    tip: "Add at least 4 vocabulary words",
  },
  {
    id: "avoidTopics",
    label: "Content Guardrails",
    tab: "faith",
    section: "avoidTopics",
    weight: 10,
    score: (kb) => Math.min(100, ((kb.avoidTopics?.length || 0) / 3) * 100),
    cost: "Stories may drift into culturally inappropriate or haram themes",
    tip: "Block at least 3 topics",
  },
  {
    id: "characterVoices",
    label: "Character Voices",
    tab: "story",
    section: "characterGuides",
    weight: 20,
    score: (kb) => {
      const guides = kb.characterGuides || [];
      if (guides.length === 0) return 0;
      const rich = guides.filter((g: any) => g.speakingStyle && (g.faithTone || g.faithGuide?.faithTone)).length;
      return Math.min(100, (rich / Math.max(guides.length, 1)) * 100);
    },
    cost: "AI generates flat, generic characters - voices sound the same",
    tip: "Build voice guides for your main characters",
  },
  {
    id: "backgrounds",
    label: "Scene Settings",
    tab: "visual",
    section: "backgroundSettings",
    weight: 15,
    score: (kb) => {
      const bs = kb.backgroundSettings || {};
      let pts = 0;
      if (bs.junior?.tone) pts += 30;
      if (bs.middleGrade?.tone) pts += 30;
      if ((bs.junior?.locations?.length || 0) > 0) pts += 20;
      if ((bs.middleGrade?.locations?.length || 0) > 0) pts += 20;
      return Math.min(100, pts);
    },
    cost: "Illustrations may use culturally neutral or incorrect settings",
    tip: "Set tone and locations for at least one age group",
  },
  {
    id: "bookFormat",
    label: "Book Format",
    tab: "bookFormat",
    section: "bookFormatting",
    weight: 10,
    score: (kb) => {
      let pts = 0;
      if (kb.bookFormatting?.middleGrade?.chapterRange) pts += 35;
      if (kb.bookFormatting?.middleGrade?.sceneLength) pts += 35;
      if (kb.underSixDesign?.pageCount) pts += 30;
      return Math.min(100, pts);
    },
    cost: "Story structure defaults to AI's generic template - may not fit your vision",
    tip: "Define chapter range or page count",
  },
  {
    id: "cover",
    label: "Cover Design",
    tab: "cover",
    section: "coverDesign",
    weight: 10,
    score: (kb) => {
      let pts = 0;
      if (kb.coverDesign?.selectedCoverTemplate) pts += 50;
      if ((kb.coverDesign?.brandingRules?.length || 0) > 0 || (kb.coverDesign?.islamicMotifs?.length || 0) > 0) pts += 50;
      return Math.min(100, pts);
    },
    cost: "Cover uses generic styling - may not match your brand",
    tip: "Choose a cover template or add branding rules",
  },
];

function computeScore(kb: any): { total: number; domains: { domain: Domain; score: number }[] } {
  const results = DOMAINS.map((d) => ({ domain: d, score: d.score(kb) }));
  const totalWeight = DOMAINS.reduce((s, d) => s + d.weight, 0);
  const weighted = results.reduce((s, r) => s + (r.score / 100) * r.domain.weight, 0);
  return {
    total: Math.round((weighted / totalWeight) * 100),
    domains: results,
  };
}

function ScoreRing({ score }: { score: number }) {
  const r = 31;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 75 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <svg width="84" height="84" viewBox="0 0 84 84" className="shrink-0">
      <circle cx="42" cy="42" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
      <circle
        cx="42" cy="42" r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="42" y="45" textAnchor="middle" fontSize="16" fontWeight="800" fill={color} fontFamily="sans-serif">
        {score}
      </text>
    </svg>
  );
}

function DomainBar({ result, onNavigate }: { result: { domain: Domain; score: number }; onNavigate?: (tab: string, section?: string) => void }) {
  const { domain, score } = result;
  const isWeak = score < 50;
  const barColor = score >= 75 ? "bg-emerald-500" : score >= 40 ? "bg-amber-400" : "bg-red-400";
  const Icon = score >= 75 ? CheckCircle2 : score >= 40 ? Sparkles : CircleAlert;

  return (
    <div className="rounded-xl border border-border/70 bg-background/85 p-3 shadow-sm">
      <div className="grid grid-cols-[1fr_auto] items-start gap-2">
        <button
          type="button"
          className="flex min-w-0 items-center gap-2 text-left text-xs font-semibold text-foreground transition-colors hover:text-primary"
          onClick={() => onNavigate?.(domain.tab, domain.section)}
        >
          <span className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            score >= 75 ? "bg-emerald-50 text-emerald-600" : score >= 40 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
          )}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <span className="leading-snug">{domain.label}</span>
          {onNavigate && <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />}
        </button>
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-bold leading-none",
          score >= 75 ? "bg-emerald-50 text-emerald-700" : score >= 40 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
        )}>
          {Math.round(score)}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${score}%` }}
        />
      </div>
      {isWeak && (
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          {domain.cost}
        </p>
      )}
    </div>
  );
}

export function KBStrengthScore({ kb, onNavigate, compact = false }: KBStrengthProps) {
  const { total, domains } = useMemo(() => computeScore(kb), [kb]);

  const label = total >= 75 ? "Strong" : total >= 40 ? "Moderate" : "Weak";
  const labelColor = total >= 75 ? "text-emerald-600" : total >= 40 ? "text-amber-600" : "text-red-600";
  const borderColor = total >= 75 ? "border-emerald-200" : total >= 40 ? "border-amber-200" : "border-red-200";
  const bgColor = "bg-background";
  const weakCount = domains.filter((r) => r.score < 50).length;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 rounded-xl border p-3", borderColor, bgColor)}>
        <ScoreRing score={total} />
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-bold", labelColor)}>KB Strength: {label} ({total}/100)</p>
          {total < 40 && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-red-600">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              Low KB strength limits story quality. Build it up before generating.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border p-5 shadow-sm", borderColor, bgColor)}>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <div className="flex min-w-[300px] items-center gap-4">
          <ScoreRing score={total} />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Foundation health</p>
            <p className={cn("mt-1 text-xl font-bold", labelColor)}>{label} Knowledge Base</p>
            <p className="text-xs text-muted-foreground">
              {total}/100 across {DOMAINS.length} content domains
            </p>
            {total < 40 && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-red-200 bg-white/70 px-2.5 py-1.5 text-[11px] text-red-700">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                KB below 40 - Book Foundation will warn before generation
              </div>
            )}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-2 2xl:grid-cols-4">
          {domains.map((r) => (
            <DomainBar key={r.domain.id} result={r} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-3 py-1 font-medium">{weakCount} areas need attention</span>
        <span className="rounded-full bg-secondary/15 px-3 py-1 font-medium text-secondary-foreground">Best target: 75+ before generation</span>
      </div>
    </div>
  );
}
