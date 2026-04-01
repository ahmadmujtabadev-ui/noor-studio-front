import { cn } from "@/lib/utils";
import type { CharacterTemplate } from "@/lib/api/characterTemplates.api";

// ─── Colour helpers ──────────────────────────────────────────────────────────

const SKIN_HEX: Record<string, string> = {
  porcelain: "#FFF0E8", fair: "#FDDBB4", "light-beige": "#F5C8A0",
  beige: "#EDB88B", olive: "#C8A97B", "warm-olive": "#C19A68",
  golden: "#C88B3A", tan: "#B07840", caramel: "#9B6035",
  "medium-brown": "#8B4513", brown: "#7B3A10", "dark-brown": "#5C2A0E",
  ebony: "#3B1A08",
};

const EYE_HEX: Record<string, string> = {
  "dark-brown": "#3E1C00", brown: "#6B3A2A", hazel: "#7B6020",
  green: "#3A7B3A", blue: "#2A5FA5", gray: "#6B7280", black: "#111111",
};

const HAIR_HEX: Record<string, string> = {
  black: "#111111", "dark-brown": "#3E1C00", brown: "#7B4020",
  "golden-yellow": "#FFD700", white: "#F5F5F5", blonde: "#FFE066",
  red: "#C0392B", auburn: "#922B21",
};

function resolveHairColor(vd: CharacterTemplate["visualDNA"]) {
  const raw = (vd?.hijabColor || vd?.hairColor || "").toLowerCase();
  for (const [key, hex] of Object.entries(HAIR_HEX)) {
    if (raw.includes(key)) return hex;
  }
  // colour word fallback
  if (raw.includes("pink")) return "#E91E8C";
  if (raw.includes("purple")) return "#9C27B0";
  if (raw.includes("blue")) return "#1976D2";
  if (raw.includes("beige")) return "#D4C5A9";
  if (raw.includes("teal")) return "#00897B";
  if (raw.includes("white")) return "#F5F5F5";
  if (raw.includes("green")) return "#388E3C";
  if (raw.includes("sage")) return "#8FAF88";
  return "#8B4513";
}

function hexForGarment(color = "") {
  const c = color.toLowerCase();
  if (c.includes("white")) return "#F9F9F9";
  if (c.includes("black")) return "#1A1A1A";
  if (c.includes("navy") || c.includes("dark blue")) return "#1A237E";
  if (c.includes("blue")) return "#1976D2";
  if (c.includes("teal")) return "#00897B";
  if (c.includes("green") || c.includes("sage")) return "#4CAF50";
  if (c.includes("red") || c.includes("crimson")) return "#D32F2F";
  if (c.includes("orange")) return "#F57C00";
  if (c.includes("yellow")) return "#FDD835";
  if (c.includes("pink")) return "#E91E8C";
  if (c.includes("purple")) return "#9C27B0";
  if (c.includes("khaki") || c.includes("tan") || c.includes("caramel")) return "#C8A97B";
  if (c.includes("brown")) return "#7B4020";
  if (c.includes("beige") || c.includes("cream")) return "#D4C5A9";
  if (c.includes("gray") || c.includes("grey")) return "#9E9E9E";
  if (c.includes("gold")) return "#C8A86C";
  return "#9E9E9E";
}

// ─── Mini visual components ──────────────────────────────────────────────────

function ColorDot({ color, size = 14, title }: { color: string; size?: number; title?: string }) {
  return (
    <span
      title={title}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        border: "1.5px solid rgba(0,0,0,0.12)",
        flexShrink: 0,
      }}
    />
  );
}

function HeightBar({ heightCm }: { heightCm: number }) {
  if (!heightCm) return null;
  const pct = Math.min(Math.max((heightCm / 180) * 100, 10), 100);
  return (
    <div title={`${heightCm} cm`} className="flex items-end gap-0.5 h-4">
      <div
        style={{ height: `${pct}%`, width: 6, borderRadius: 3, background: "#FB923C", minHeight: 4 }}
      />
      <span className="text-[9px] text-orange-400 leading-none">{heightCm}cm</span>
    </div>
  );
}

function BodyIcon({ build }: { build: string }) {
  const b = (build || "").toLowerCase();
  if (b.includes("chubby") || b.includes("soft"))
    return <span title={build} className="text-base leading-none">🐾</span>;
  if (b.includes("slim") || b.includes("lean"))
    return <span title={build} className="text-base leading-none">🌿</span>;
  if (b.includes("athletic") || b.includes("fit"))
    return <span title={build} className="text-base leading-none">💪</span>;
  if (b.includes("stocky") || b.includes("strong"))
    return <span title={build} className="text-base leading-none">🏋️</span>;
  return <span title={build} className="text-base leading-none">🧍</span>;
}

function HijabOrHairIcon({ vd }: { vd: CharacterTemplate["visualDNA"] }) {
  const hasHijab = !!(vd?.hijabStyle || vd?.hijabColor);
  const hairColor = resolveHairColor(vd);
  return (
    <span title={hasHijab ? `Hijab: ${vd?.hijabColor || vd?.hijabStyle}` : `Hair: ${vd?.hairStyle}`}>
      <ColorDot color={hairColor} size={13} />
    </span>
  );
}

function GlassesIcon({ glasses }: { glasses: string }) {
  if (!glasses) return null;
  return <span title={`Glasses: ${glasses}`} className="text-sm leading-none">👓</span>;
}

// ─── Palette strip ────────────────────────────────────────────────────────────
function PaletteStrip({ tpl }: { tpl: CharacterTemplate }) {
  const vd = tpl.visualDNA || {};
  const skin = SKIN_HEX[(vd.skinTone || "").toLowerCase()] || "#D4A96A";
  const hair = resolveHairColor(vd);
  const top = hexForGarment(vd.topGarmentColor);
  const bot = hexForGarment(vd.bottomGarmentColor || "gray");
  const preview = tpl.palettePreview;

  const colors = preview
    ? [preview.primary, preview.secondary, preview.accent]
    : [skin, hair, top, bot];

  return (
    <div className="flex rounded-full overflow-hidden h-2 w-full mt-1">
      {colors.map((c, i) => (
        <div key={i} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );
}

// ─── Constraint badge row ─────────────────────────────────────────────────────
function ConstraintRow({ tpl }: { tpl: CharacterTemplate }) {
  const vd = tpl.visualDNA || {};
  const skin = SKIN_HEX[(vd.skinTone || "").toLowerCase()] || "#D4A96A";
  const eye = EYE_HEX[(vd.eyeColor || "").toLowerCase()] || "#3E1C00";

  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-2">
      {/* Skin */}
      {vd.skinTone && <ColorDot color={skin} title={`Skin: ${vd.skinTone}`} />}
      {/* Eye */}
      {vd.eyeColor && (
        <span title={`Eyes: ${vd.eyeColor}`} className="flex items-center gap-0.5">
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
            <ellipse cx="7" cy="5" rx="6" ry="4" fill="white" stroke="#D1D5DB" strokeWidth="1"/>
            <circle cx="7" cy="5" r="2.5" fill={eye} />
            <circle cx="7.8" cy="4.2" r="0.7" fill="white" />
          </svg>
        </span>
      )}
      {/* Hair / Hijab */}
      <HijabOrHairIcon vd={vd} />
      {/* Top garment */}
      {vd.topGarmentColor && (
        <span
          title={`Top: ${vd.topGarmentColor}`}
          style={{
            display: "inline-block", width: 13, height: 13,
            borderRadius: 3, background: hexForGarment(vd.topGarmentColor),
            border: "1.5px solid rgba(0,0,0,0.12)",
          }}
        />
      )}
      {/* Bottom garment */}
      {vd.bottomGarmentColor && (
        <span
          title={`Bottom: ${vd.bottomGarmentColor}`}
          style={{
            display: "inline-block", width: 13, height: 13,
            borderRadius: 2, background: hexForGarment(vd.bottomGarmentColor),
            border: "1.5px solid rgba(0,0,0,0.12)",
          }}
        />
      )}
      {/* Glasses */}
      <GlassesIcon glasses={vd.glasses || ""} />
      {/* Body build */}
      {vd.bodyBuild && <BodyIcon build={vd.bodyBuild} />}
      {/* Height */}
      {!!vd.heightCm && <HeightBar heightCm={vd.heightCm} />}
    </div>
  );
}

// ─── Art style pill ───────────────────────────────────────────────────────────
const ART_STYLE_META: Record<string, { emoji: string; label: string; color: string }> = {
  "pixar-3d":          { emoji: "🎬", label: "Pixar 3D",         color: "#3B82F6" },
  "watercolor":        { emoji: "🎨", label: "Watercolor",        color: "#A855F7" },
  "flat-illustration": { emoji: "🟦", label: "Flat",              color: "#22C55E" },
  "storybook":         { emoji: "📖", label: "Storybook",         color: "#F97316" },
  "ghibli":            { emoji: "🌿", label: "Ghibli",            color: "#EAB308" },
};

function ArtStylePill({ style }: { style: string }) {
  if (!style) return null;
  const meta = ART_STYLE_META[style] || { emoji: "🎨", label: style, color: "#9CA3AF" };
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
      style={{ color: meta.color, borderColor: meta.color + "40", background: meta.color + "12" }}
    >
      {meta.emoji} {meta.label}
    </span>
  );
}

// ─── Category emoji ───────────────────────────────────────────────────────────
const CAT_EMOJI: Record<string, string> = {
  girl: "👧", boy: "👦", toddler: "🍼",
  "teen-girl": "🌸", "teen-boy": "🌟",
  "elder-female": "👵", "elder-male": "👴",
  animal: "🐦",
};

// ─── Main card ────────────────────────────────────────────────────────────────
interface Props {
  template: CharacterTemplate;
  onClick: () => void;
}

export function TemplateCard({ template: tpl, onClick }: Props) {
  const vd = tpl.visualDNA || {};
  const hasHijab = !!(vd.hijabStyle || vd.hijabColor);
  const hasPaletteNotes = !!vd.paletteNotes;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative bg-white rounded-2xl shadow-sm border border-orange-100 p-4",
        "hover:shadow-md hover:border-orange-300 hover:-translate-y-0.5",
        "transition-all duration-200 text-left w-full"
      )}
    >
      {/* Thumbnail / placeholder */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100 aspect-square mb-3 flex items-center justify-center">
        {tpl.thumbnailUrl ? (
          <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl">{CAT_EMOJI[tpl.category] || "✨"}</span>
            <span className="text-[10px] text-orange-300 font-medium">No preview yet</span>
          </div>
        )}

        {/* Modesty badge */}
        {hasHijab && (
          <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            Hijab
          </span>
        )}

        {/* Default badge */}
        {tpl.isDefault && (
          <span className="absolute top-2 right-2 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            ★ Default
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors rounded-xl flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            View & Use →
          </span>
        </div>
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-gray-900 leading-tight truncate">{tpl.name}</h3>

      {/* Age + role + art style */}
      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
        {tpl.ageRange && tpl.ageRange !== "n/a" && (
          <span className="text-[10px] text-gray-400">Age {tpl.ageRange}</span>
        )}
        {tpl.role && (
          <span className="text-[10px] text-orange-400 capitalize">{tpl.role}</span>
        )}
        {vd.style && <ArtStylePill style={vd.style} />}
      </div>

      {/* Constraint swatches */}
      <ConstraintRow tpl={tpl} />

      {/* Palette strip */}
      <PaletteStrip tpl={tpl} />

      {/* Palette notes */}
      {hasPaletteNotes && (
        <p className="text-[9px] text-gray-400 mt-1 truncate">{vd.paletteNotes}</p>
      )}

      {/* Trait pills */}
      {tpl.traits?.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-2">
          {tpl.traits.slice(0, 3).map((t) => (
            <span key={t} className="bg-orange-50 text-orange-500 text-[9px] font-medium px-1.5 py-0.5 rounded-full border border-orange-100">
              {t}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
