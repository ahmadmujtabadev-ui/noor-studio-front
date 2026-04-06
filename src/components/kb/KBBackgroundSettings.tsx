import { useMemo, useState } from "react";
import {
  Plus,
  X,
  Check,
  Sparkles,
  BookOpen,
  Clock3,
  Camera,
  Palette,
  SunMedium,
  MapPin,
  NotebookPen,
  ShieldAlert,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AgeGroupKey = "junior" | "middleGrade";

interface GroupSettings {
  timeOfDay?: string;
  cameraHint?: string;
  tone?: string;
  colorStyle?: string;
  lightingStyle?: string;
  locations?: string[];
  additionalNotes?: string;
}

interface BackgroundSettings {
  junior?: GroupSettings;
  middleGrade?: GroupSettings;
  avoidBackgrounds?: string[];
  universalRules?: string;
}

interface Props {
  bs: BackgroundSettings;
  onSave: (update: object) => Promise<void>;
  isSaving: boolean;
}

function Img({ src, alt = "" }: { src: string; alt?: string }) {
  return <img src={src} alt={alt} className="h-full w-full object-cover" />;
}

const AGE_GROUPS: {
  key: AgeGroupKey;
  label: string;
  sub: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  activeClass: string;
  inactiveClass: string;
  panelClass: string;
}[] = [
  {
    key: "junior",
    label: "Early Readers",
    sub: "Ages 3–8",
    description:
      "Brighter, softer, simpler visual storytelling for younger children.",
    icon: <Sparkles className="h-5 w-5" />,
    image: "/background/age-3-8-header.png",
    activeClass: "border-violet-500 ring-4 ring-violet-100 shadow-lg",
    inactiveClass: "border-slate-200 hover:border-violet-300 hover:shadow-md",
    panelClass: "border-violet-100 bg-violet-50/40",
  },
  {
    key: "middleGrade",
    label: "Middle Grade",
    sub: "Ages 8–14",
    description:
      "More cinematic, layered, adventurous environments and framing.",
    icon: <BookOpen className="h-5 w-5" />,
    image: "/background/age-8-14-header.png",
    activeClass: "border-blue-500 ring-4 ring-blue-100 shadow-lg",
    inactiveClass: "border-slate-200 hover:border-blue-300 hover:shadow-md",
    panelClass: "border-blue-100 bg-blue-50/40",
  },
];

const TIME_OPTIONS = [
  { value: "morning", label: "Morning", icon: <Img src="/background/time-morning.png" /> },
  { value: "afternoon", label: "Afternoon", icon: <Img src="/background/time-afternoon.png" /> },
  { value: "evening", label: "Evening", icon: <Img src="/background/time-evening.png" /> },
  { value: "golden-hour", label: "Golden Hour", icon: <Img src="/background/time-golden-hour.png" /> },
  { value: "night", label: "Night", icon: <Img src="/background/time-night.png" /> },
];

const CAMERA_OPTIONS = [
  { value: "wide", label: "Wide Shot", icon: <Img src="/background/camera-wide.png" /> },
  { value: "medium", label: "Medium", icon: <Img src="/background/camera-medium.png" /> },
  { value: "close", label: "Close-Up", icon: <Img src="/background/camera-close.png" /> },
  { value: "full-body", label: "Full Body", icon: <Img src="/background/camera-fullbody.png" /> },
  { value: "over-shoulder", label: "Over Shoulder", icon: <Img src="/background/camera-overshoulder.png" /> },
];

const TONE_OPTIONS_LIST = [
  { value: "bright, safe, familiar, cheerful", label: "Bright & Joyful", icon: <Img src="/background/mood-bright.png" /> },
  { value: "warm, cozy, intimate, inviting", label: "Warm & Cozy", icon: <Img src="/background/mood-warm.png" /> },
  { value: "calm, peaceful, gentle, reflective", label: "Calm & Peaceful", icon: <Img src="/background/mood-calm.png" /> },
  { value: "mysterious, wonder-filled, curious, atmospheric", label: "Mysterious", icon: <Img src="/background/mood-mystery.png" /> },
  { value: "cinematic, dramatic, adventurous with emotional warmth", label: "Dramatic", icon: <Img src="/background/mood-dramatic.png" /> },
];

const COLOR_STYLE_LIST = [
  { value: "vibrant, saturated, primary colors with warm accents", label: "Vibrant", icon: <Img src="/background/color-vibrant.png" /> },
  { value: "soft pastel watercolor washes, translucent light effects", label: "Soft Pastels", icon: <Img src="/background/color-pastels.png" /> },
  { value: "rich warm tones, oranges, reds, ambers and burnt sienna", label: "Warm Tones", icon: <Img src="/background/color-warm.png" /> },
  { value: "cool blues, teals, and aquas, crisp and refreshing palette", label: "Cool Blues", icon: <Img src="/background/color-cool.png" /> },
  { value: "earth tones, ochres, siennas, forest greens and warm browns", label: "Earth Tones", icon: <Img src="/background/color-earth-tones.png" /> },
];

const LIGHTING_OPTIONS = [
  { value: "golden hour warm light, long shadows, amber and copper tones", label: "Golden Hour", icon: <Img src="/background/lighting-golden-hour.png" /> },
  { value: "soft diffused daylight, even illumination, crisp and clear", label: "Soft Daylight", icon: <Img src="/background/lighting-soft-daylight.png" /> },
  { value: "dappled light through leaves, forest green with light patches", label: "Dappled", icon: <Img src="/background/lighting-dappled.png" /> },
  { value: "warm candlelight, intimate glow, flickering amber radiance", label: "Candlelight", icon: <Img src="/background/lighting-candle.png" /> },
  { value: "cool moonlight, pale silver-blue light, magical and serene", label: "Moonlight", icon: <Img src="/background/lighting-moonlight.png" /> },
  { value: "joyful rainbow light, bright multi-colour wash, celebratory", label: "Rainbow", icon: <Img src="/background/lighting-rainbow.png" /> },
];

const LOCATION_PRESETS = [
  { value: "bedroom", label: "Bedroom", img: "/background/loc-bedroom.png" },
  { value: "masjid", label: "Masjid", img: "/background/loc-masjid.png" },
  { value: "garden", label: "Garden", img: "/background/loc-garden.png" },
  { value: "school classroom", label: "Classroom", img: "/background/loc-classroom.png" },
  { value: "kitchen", label: "Kitchen", img: "/background/loc-kitchen.png" },
  { value: "forest", label: "Forest", img: "/background/loc-forest.png" },
  { value: "seaside beach", label: "Beach", img: "/background/loc-beach.png" },
  { value: "market souk", label: "Souk", img: "/background/loc-souk.png" },
  { value: "rooftop", label: "Rooftop", img: "/background/loc-rooftop.png" },
  { value: "library", label: "Library", img: "/background/loc-library.png" },
  { value: "desert dunes", label: "Desert", img: "/background/loc-desert.png" },
  { value: "snowy mountain", label: "Mountain", img: "/background/loc-mountain.png" },
];

function TagPills({
  items,
  onRemove,
  onAdd,
  placeholder,
}: {
  items: string[];
  onRemove: (i: number) => void;
  onAdd: (v: string) => void;
  placeholder: string;
}) {
  const [val, setVal] = useState("");

  const submit = () => {
    const next = val.trim();
    if (!next) return;
    onAdd(next);
    setVal("");
  };

  return (
    <div className="space-y-2">
      <div className="flex min-h-[34px] flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="ml-0.5 text-slate-400 transition hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs italic text-muted-foreground">None added yet</span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          className="h-10 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" className="h-10 px-3" onClick={submit}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function VisualPicker({
  options,
  value,
  onChange,
  accent = "blue",
}: {
  options: { value: string; label: string; icon: React.ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  accent?: "blue" | "amber" | "emerald" | "violet" | "teal";
}) {
  const colorMap = {
    blue: { selected: "border-blue-500 bg-blue-50", badge: "bg-blue-500" },
    amber: { selected: "border-amber-500 bg-amber-50", badge: "bg-amber-500" },
    emerald: { selected: "border-emerald-500 bg-emerald-50", badge: "bg-emerald-500" },
    violet: { selected: "border-violet-500 bg-violet-50", badge: "bg-violet-500" },
    teal: { selected: "border-teal-500 bg-teal-50", badge: "bg-teal-500" },
  } as const;

  const style = colorMap[accent];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {options.map((opt) => {
        const isSelected = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(isSelected ? "" : opt.value)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
              isSelected ? style.selected : "border-slate-200 hover:border-slate-300"
            )}
          >
            <div className="aspect-square w-full overflow-hidden">{opt.icon}</div>
            <div className="border-t border-slate-100 px-3 py-3">
              <p className={cn("text-sm font-semibold", isSelected ? "text-slate-900" : "text-slate-700")}>
                {opt.label}
              </p>
            </div>

            {isSelected && (
              <span className={cn("absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full shadow", style.badge)}>
                <Check className="h-3.5 w-3.5 text-white" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function KBBackgroundSettings({ bs, onSave, isSaving }: Props) {
  const [activeGroup, setActiveGroup] = useState<AgeGroupKey>("junior");

  const activeMeta = useMemo(
    () => AGE_GROUPS.find((a) => a.key === activeGroup)!,
    [activeGroup]
  );

  const groupData = bs?.[activeGroup] || {};
  const selectedLocations = groupData.locations || [];

  const patchBg = (groupKey: AgeGroupKey, partial: object) =>
    onSave({
      backgroundSettings: {
        ...bs,
        [groupKey]: {
          ...(bs?.[groupKey] || {}),
          ...partial,
        },
      },
    });

  const patchBgRoot = (partial: object) =>
    onSave({
      backgroundSettings: {
        ...bs,
        ...partial,
      },
    });

  const customLocations = selectedLocations.filter(
    (l: string) => !LOCATION_PRESETS.some((p) => p.value === l)
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Set the visual environment rules by age group. These settings are injected into every image generation prompt.
        </p>
        <p className="text-xs text-muted-foreground">
          One age group stays active at a time to keep editing cleaner and easier.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {AGE_GROUPS.map((group) => {
          const isActive = activeGroup === group.key;
          const hasData =
            Boolean(bs?.[group.key]?.timeOfDay) ||
            Boolean(bs?.[group.key]?.tone) ||
            (bs?.[group.key]?.locations?.length || 0) > 0;

          return (
            <button
              key={group.key}
              type="button"
              onClick={() => setActiveGroup(group.key)}
              className={cn(
                "group relative overflow-hidden rounded-3xl border bg-white text-left transition-all duration-200",
                isActive ? group.activeClass : group.inactiveClass
              )}
            >
              <div className="relative h-[220px] w-full overflow-hidden">
                <img
                  src={group.image}
                  alt={`${group.label} header`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                    {group.icon}
                    <span>{group.sub}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{group.label}</h3>
                  <p className="mt-1 max-w-xl text-sm text-white/85">{group.description}</p>
                </div>

                <div className="absolute right-4 top-4 flex items-center gap-2">
                  {hasData && !isActive && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 shadow">
                      <Check className="h-4 w-4 text-white" />
                    </span>
                  )}
                  {isActive && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-md">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className={cn("rounded-3xl border p-6 shadow-sm", activeMeta.panelClass)}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
              {activeMeta.icon}
              <span>{activeMeta.label}</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">
              {activeMeta.label} Scene Settings
            </h3>
            <p className="mt-1 text-sm text-slate-600">{activeMeta.sub}</p>
          </div>

          {isSaving && (
            <div className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              Saving...
            </div>
          )}
        </div>

        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-amber-600" />
              <Label className="text-sm font-semibold">Time of Day</Label>
            </div>
            <VisualPicker
              options={TIME_OPTIONS}
              value={groupData.timeOfDay || ""}
              onChange={(v) => patchBg(activeGroup, { timeOfDay: v })}
              accent="amber"
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-semibold">Camera View</Label>
            </div>
            <VisualPicker
              options={CAMERA_OPTIONS}
              value={groupData.cameraHint || ""}
              onChange={(v) => patchBg(activeGroup, { cameraHint: v })}
              accent="blue"
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <Label className="text-sm font-semibold">Mood & Tone</Label>
            </div>
            <VisualPicker
              options={TONE_OPTIONS_LIST}
              value={groupData.tone || ""}
              onChange={(v) => patchBg(activeGroup, { tone: v })}
              accent="violet"
            />
            <Input
              className="h-10 text-sm"
              placeholder="Or type a custom mood..."
              value={TONE_OPTIONS_LIST.some((o) => o.value === groupData.tone) ? "" : groupData.tone || ""}
              onChange={(e) => patchBg(activeGroup, { tone: e.target.value })}
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-emerald-600" />
              <Label className="text-sm font-semibold">Color Style</Label>
            </div>
            <VisualPicker
              options={COLOR_STYLE_LIST}
              value={groupData.colorStyle || ""}
              onChange={(v) => patchBg(activeGroup, { colorStyle: v })}
              accent="emerald"
            />
            <Input
              className="h-10 text-sm"
              placeholder="Or type a custom color style..."
              value={COLOR_STYLE_LIST.some((o) => o.value === groupData.colorStyle) ? "" : groupData.colorStyle || ""}
              onChange={(e) => patchBg(activeGroup, { colorStyle: e.target.value })}
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <SunMedium className="h-4 w-4 text-amber-600" />
              <Label className="text-sm font-semibold">Lighting Style</Label>
            </div>
            <VisualPicker
              options={LIGHTING_OPTIONS}
              value={groupData.lightingStyle || ""}
              onChange={(v) => patchBg(activeGroup, { lightingStyle: v })}
              accent="amber"
            />
            <Input
              className="h-10 text-sm"
              placeholder="Or describe a custom lighting style..."
              value={LIGHTING_OPTIONS.some((o) => o.value === groupData.lightingStyle) ? "" : groupData.lightingStyle || ""}
              onChange={(e) => patchBg(activeGroup, { lightingStyle: e.target.value })}
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-600" />
              <Label className="text-sm font-semibold">Locations</Label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {LOCATION_PRESETS.map((loc) => {
                const isAdded = selectedLocations.includes(loc.value);

                return (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => {
                      const next = isAdded
                        ? selectedLocations.filter((l: string) => l !== loc.value)
                        : [...selectedLocations, loc.value];
                      patchBg(activeGroup, { locations: next });
                    }}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                      isAdded ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <div className="aspect-square w-full overflow-hidden">
                      <img src={loc.img} alt={loc.label} className="h-full w-full object-cover" />
                    </div>

                    <div className="border-t border-slate-100 px-3 py-3">
                      <p className={cn("text-sm font-semibold", isAdded ? "text-teal-700" : "text-slate-700")}>
                        {loc.label}
                      </p>
                    </div>

                    {isAdded && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 shadow">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <TagPills
              items={customLocations}
              onAdd={(v) => patchBg(activeGroup, { locations: [...selectedLocations, v] })}
              onRemove={(i) => {
                const removed = customLocations[i];
                patchBg(activeGroup, {
                  locations: selectedLocations.filter((l: string) => l !== removed),
                });
              }}
              placeholder="Add custom location e.g. moonlit rooftop..."
            />
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4 text-slate-600" />
              <Label className="text-sm font-semibold">Additional Notes</Label>
            </div>
            <Input
              placeholder="Any extra scene rules for AI..."
              defaultValue={groupData.additionalNotes || ""}
              onBlur={(e) => patchBg(activeGroup, { additionalNotes: e.target.value })}
            />
          </section>
        </div>
      </div>

      <div className="rounded-3xl border border-red-100 bg-red-50/50 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
            Global Background Restrictions
          </p>
        </div>

        <div className="space-y-4">
          <TagPills
            items={bs?.avoidBackgrounds || []}
            onAdd={(v) =>
              patchBgRoot({
                avoidBackgrounds: [...(bs?.avoidBackgrounds || []), v],
              })
            }
            onRemove={(i) =>
              patchBgRoot({
                avoidBackgrounds: (bs?.avoidBackgrounds || []).filter((_: string, j: number) => j !== i),
              })
            }
            placeholder="e.g. Abstract gradients, busy wallpaper..."
          />

          <div>
            <Label className="text-xs font-semibold text-slate-700">
              Universal Rules (applies to both age groups)
            </Label>
            <Input
              className="mt-2"
              placeholder="e.g. Every scene must feel handcrafted, not digital"
              defaultValue={bs?.universalRules || ""}
              onBlur={(e) => patchBgRoot({ universalRules: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}