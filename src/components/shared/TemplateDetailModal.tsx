import { X, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CharacterTemplate } from "@/lib/api/characterTemplates.api";

// ─── Colour maps ──────────────────────────────────────────────────────────────

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

function resolveColor(value = "") {
  const c = value.toLowerCase();
  if (c.includes("white")) return "#F9F9F9";
  if (c.includes("black")) return "#1A1A1A";
  if (c.includes("navy") || c.includes("dark blue")) return "#1A237E";
  if (c.includes("blue")) return "#1976D2";
  if (c.includes("teal")) return "#00897B";
  if (c.includes("sage")) return "#8FAF88";
  if (c.includes("green")) return "#4CAF50";
  if (c.includes("red") || c.includes("crimson")) return "#D32F2F";
  if (c.includes("orange")) return "#F57C00";
  if (c.includes("yellow") || c.includes("golden-yellow")) return "#FDD835";
  if (c.includes("pink")) return "#E91E8C";
  if (c.includes("purple")) return "#9C27B0";
  if (c.includes("khaki") || c.includes("caramel")) return "#C8A97B";
  if (c.includes("tan")) return "#B07840";
  if (c.includes("brown")) return "#7B4020";
  if (c.includes("beige") || c.includes("cream")) return "#D4C5A9";
  if (c.includes("gray") || c.includes("grey")) return "#9E9E9E";
  if (c.includes("gold")) return "#C8A86C";
  return "#9E9E9E";
}

function resolveHairColor(vd: CharacterTemplate["visualDNA"]) {
  const raw = (vd?.hijabColor || vd?.hairColor || "").toLowerCase();
  if (raw.includes("golden")) return "#FFD700";
  if (raw.includes("white")) return "#F5F5F5";
  if (raw.includes("black")) return "#111111";
  if (raw.includes("dark-brown") || raw.includes("dark brown")) return "#3E1C00";
  if (raw.includes("brown")) return "#7B4020";
  if (raw.includes("blonde")) return "#FFE066";
  return resolveColor(raw);
}

// ─── Art style config ─────────────────────────────────────────────────────────

const ART_STYLES: Record<string, { label: string; emoji: string; bg: string; border: string; desc: string }> = {
  "pixar-3d":          { label: "3D Rendered",        emoji: "🎬", bg: "#EFF6FF", border: "#3B82F6", desc: "Round soft shapes, plush textures, cinematic lighting" },
  "watercolor":        { label: "Watercolor",         emoji: "🎨", bg: "#FDF4FF", border: "#A855F7", desc: "Soft washes, gentle edges, dreamy brush strokes" },
  "flat-illustration": { label: "Flat Illustration",  emoji: "🟦", bg: "#F0FDF4", border: "#22C55E", desc: "Bold shapes, clean lines, minimal shadows" },
  "storybook":         { label: "Storybook",          emoji: "📖", bg: "#FFF7ED", border: "#F97316", desc: "Hand-painted textures, warm tones, classic feel" },
  "ghibli":            { label: "Hand-Painted Anime", emoji: "🌿", bg: "#FEFCE8", border: "#EAB308", desc: "Lush backgrounds, expressive characters, painterly detail" },
};

// ─── Constraint chip ──────────────────────────────────────────────────────────

function Chip({ label, value, color, icon, wide = false }: {
  label: string; value: string; color?: string; icon?: string; wide?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={`flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm ${wide ? "w-full" : ""}`}>
      {color && (
        <span style={{
          display: "inline-block", width: 20, height: 20, borderRadius: "50%",
          background: color, border: "2px solid rgba(0,0,0,0.10)", flexShrink: 0,
        }} />
      )}
      {icon && <span className="text-base leading-none">{icon}</span>}
      <div className="min-w-0">
        <div className="text-[9px] text-gray-400 uppercase tracking-wider leading-none">{label}</div>
        <div className="text-xs font-semibold text-gray-800 leading-tight mt-0.5 capitalize truncate max-w-[140px]">
          {value}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{title}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

// ─── Art style block ──────────────────────────────────────────────────────────

function ArtStyleBlock({ style }: { style: string }) {
  if (!style) return null;
  const s = ART_STYLES[style] || { label: style, emoji: "🎨", bg: "#F9FAFB", border: "#9CA3AF", desc: "" };
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 border-2"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <span className="text-3xl leading-none">{s.emoji}</span>
      <div>
        <div className="text-[9px] text-gray-400 uppercase tracking-wider leading-none">Art Style</div>
        <div className="text-sm font-bold text-gray-800 leading-tight mt-0.5">{s.label}</div>
        {s.desc && <div className="text-[10px] text-gray-500 mt-0.5">{s.desc}</div>}
      </div>
    </div>
  );
}

// ─── Height visual ────────────────────────────────────────────────────────────

function HeightVisual({ heightCm, heightFeel }: { heightCm: number; heightFeel: string }) {
  if (!heightCm && !heightFeel) return null;
  const pct = heightCm ? Math.min(Math.max((heightCm / 180) * 100, 10), 100) : 50;
  const label = heightCm < 90 ? "Tiny" : heightCm < 120 ? "Child" : heightCm < 145 ? "Pre-teen" : heightCm < 165 ? "Average" : "Tall";
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm flex items-end gap-2">
      <div style={{ width: 12, height: 40, borderRadius: 6, background: "#FED7AA", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${pct}%`, background: "#F97316", borderRadius: 6 }} />
      </div>
      <div>
        <div className="text-[9px] text-gray-400 uppercase tracking-wider leading-none">Height</div>
        {heightCm > 0 && <div className="text-xs font-semibold text-gray-800 leading-tight mt-0.5">{heightCm} cm</div>}
        <div className="text-[9px] text-orange-400">{heightFeel || label}</div>
      </div>
    </div>
  );
}

// ─── Body build ───────────────────────────────────────────────────────────────

function BodyBuildVisual({ build }: { build: string }) {
  if (!build) return null;
  const b = build.toLowerCase();
  let icon = "🧍"; let color = "#9E9E9E";
  if (b.includes("chubby") || b.includes("soft"))   { icon = "🐾"; color = "#FFB74D"; }
  else if (b.includes("slim") || b.includes("lean"))   { icon = "🌿"; color = "#66BB6A"; }
  else if (b.includes("athletic") || b.includes("fit")){ icon = "💪"; color = "#42A5F5"; }
  else if (b.includes("stocky") || b.includes("strong")){ icon = "🏋️"; color = "#EF5350"; }
  else if (b.includes("average"))                      { icon = "🧍"; color = "#78909C"; }
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="text-[9px] text-gray-400 uppercase tracking-wider leading-none">Body Build</div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-xl leading-none">{icon}</span>
        <div className="text-xs font-semibold text-gray-800 capitalize leading-tight">{build}</div>
      </div>
    </div>
  );
}

// ─── Outfit section ───────────────────────────────────────────────────────────

function OutfitSection({ vd }: { vd: CharacterTemplate["visualDNA"] }) {
  const rows = [
    { label: "Top Garment", value: [vd?.topGarmentColor, vd?.topGarmentType].filter(Boolean).join(" — "), color: vd?.topGarmentColor },
    { label: "Top Details", value: vd?.topGarmentDetails || "", color: "" },
    { label: "Bottom Garment", value: [vd?.bottomGarmentColor, vd?.bottomGarmentType].filter(Boolean).join(" — "), color: vd?.bottomGarmentColor },
    { label: "Shoes", value: [vd?.shoeColor, vd?.shoeType].filter(Boolean).join(" — "), color: vd?.shoeColor },
  ].filter((r) => r.value.trim());

  if (!rows.length) return null;
  return (
    <Section title="👗 Outfit">
      {rows.map((r) => (
        <Chip key={r.label} label={r.label} value={r.value} color={r.color ? resolveColor(r.color) : undefined} />
      ))}
    </Section>
  );
}

// ─── Modesty badge ────────────────────────────────────────────────────────────

function ModestyBadge({ rules }: { rules: CharacterTemplate["modestyRules"] }) {
  if (!rules) return null;
  const items = [
    rules.hijabAlways && "Hijab always",
    rules.longSleeves && "Long sleeves",
    rules.looseClothing && "Loose clothing",
  ].filter(Boolean) as string[];
  if (!items.length) return null;
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
      <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1.5">🌿 Modesty Rules</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
            <Check className="w-2.5 h-2.5" /> {item}
          </span>
        ))}
      </div>
      {rules.notes && <p className="text-[10px] text-emerald-600 mt-1.5 italic">{rules.notes}</p>}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  template: CharacterTemplate;
  onClose: () => void;
  onUse: (tpl: CharacterTemplate) => void;
}

const CAT_EMOJI: Record<string, string> = {
  girl: "👧", boy: "👦", toddler: "🍼", "teen-girl": "🌸",
  "teen-boy": "🌟", "elder-female": "👵", "elder-male": "👴", animal: "🐦",
};

export function TemplateDetailModal({ template: tpl, onClose, onUse }: Props) {
  const vd = tpl.visualDNA || {};
  const skin = SKIN_HEX[(vd.skinTone || "").toLowerCase()] || "#D4A96A";
  const eye = EYE_HEX[(vd.eyeColor || "").toLowerCase()] || "#3E1C00";
  const hairColor = resolveHairColor(vd);
  const hasHijab = !!(vd.hijabStyle || vd.hijabColor);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-amber-400 px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl shadow-inner overflow-hidden">
              {tpl.thumbnailUrl
                ? <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover" />
                : <span>{CAT_EMOJI[tpl.category] || "✨"}</span>
              }
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{tpl.name}</h2>
              {tpl.description && <p className="text-orange-100 text-xs mt-0.5 max-w-xs">{tpl.description}</p>}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {tpl.ageRange && tpl.ageRange !== "n/a" && (
                  <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">Age {tpl.ageRange}</span>
                )}
                <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full capitalize">{tpl.role}</span>
                {hasHijab && <span className="bg-emerald-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">Hijab</span>}
                {tpl.isDefault && <span className="bg-amber-300 text-amber-900 text-[10px] font-medium px-2 py-0.5 rounded-full">★ Default</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Art Style */}
          {vd.style && <ArtStyleBlock style={vd.style} />}

          {/* Identity */}
          <Section title="🪪 Identity">
            {vd.gender && <Chip label="Gender" value={vd.gender} icon="👤" />}
            {vd.ageLook && <Chip label="Age Look" value={vd.ageLook} icon="📅" />}
          </Section>

          {/* Face */}
          <Section title="😊 Face">
            <Chip label="Skin Tone"   value={vd.skinTone || ""}    color={skin} />
            <Chip label="Eye Color"   value={vd.eyeColor || ""}    color={eye} />
            <Chip label="Face Shape"  value={vd.faceShape || ""}   icon="🔵" />
            <Chip label="Eyebrows"    value={vd.eyebrowStyle || ""} icon="〰️" />
            <Chip label="Nose"        value={vd.noseStyle || ""}   icon="👃" />
            <Chip label="Cheeks"      value={vd.cheekStyle || ""}  icon="🌸" />
          </Section>

          {/* Hair / Hijab */}
          <Section title={hasHijab ? "🧕 Hijab" : "💇 Hair"}>
            {hasHijab ? (
              <>
                <Chip label="Hijab Style" value={vd.hijabStyle || ""} color={hairColor} />
                <Chip label="Hijab Color" value={vd.hijabColor || ""} color={hairColor} />
              </>
            ) : (
              <>
                <Chip label="Hair Style"      value={vd.hairStyle || ""}      color={hairColor} />
                <Chip label="Hair Color"      value={vd.hairColor || ""}      color={hairColor} />
                <Chip label="Hair Visibility" value={vd.hairVisibility || ""} icon="👁️" />
              </>
            )}
            <Chip label="Glasses"     value={vd.glasses || ""}     icon="👓" />
            <Chip label="Facial Hair" value={vd.facialHair || ""}  icon="🧔" />
          </Section>

          {/* Body */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">🧍 Body</div>
            <div className="flex flex-wrap gap-2">
              <HeightVisual heightCm={vd.heightCm || 0} heightFeel={vd.heightFeel || ""} />
              <BodyBuildVisual build={vd.bodyBuild || ""} />
              {(vd.weightKg || 0) > 0 && (
                <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
                  <div className="text-[9px] text-gray-400 uppercase tracking-wider leading-none">Weight</div>
                  <div className="text-xs font-semibold text-gray-800 mt-0.5">{vd.weightKg} kg</div>
                </div>
              )}
            </div>
          </div>

          {/* Outfit */}
          <OutfitSection vd={vd} />

          {/* Modesty */}
          <ModestyBadge rules={tpl.modestyRules} />

          {/* Accessories */}
          {(vd.accessories?.length || 0) > 0 && (
            <Section title="💎 Accessories">
              {vd.accessories!.map((acc) => (
                <span key={acc} className="bg-white border border-gray-200 text-gray-700 text-[10px] px-2 py-1 rounded-full shadow-sm">
                  ✦ {acc}
                </span>
              ))}
            </Section>
          )}

          {/* Traits */}
          {tpl.traits?.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">⭐ Personality Traits</div>
              <div className="flex flex-wrap gap-1.5">
                {tpl.traits.map((t) => (
                  <span key={t} className="bg-orange-50 border border-orange-200 text-orange-600 text-[11px] font-medium px-2.5 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Palette */}
          {vd.paletteNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="text-[9px] text-amber-600 font-bold uppercase tracking-wider mb-1">🎨 Colour Palette Notes</div>
              <p className="text-xs text-amber-700">{vd.paletteNotes}</p>
              {tpl.palettePreview && (
                <div className="flex gap-2 mt-2">
                  {Object.values(tpl.palettePreview).filter(Boolean).map((hex, i) => (
                    <span key={i} style={{ display: "inline-block", width: 20, height: 20, borderRadius: "50%", background: hex as string, border: "2px solid rgba(0,0,0,0.08)" }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-white flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400">All fields will pre-fill the character form. Edit any before generating.</p>
          <Button
            onClick={() => onUse(tpl)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 rounded-full gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            Use This Template
          </Button>
        </div>
      </div>
    </div>
  );
}
