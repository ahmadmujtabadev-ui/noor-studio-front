// ─── Character Visual DNA — SVG Icon Components ───────────────────────────────
// All icons use viewBox="0 0 48 48" for consistency.
// They are purely presentational — no interactivity.

// ─── Art Styles ──────────────────────────────────────────────────────────────

export function Pixar3DSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pg1" cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#A5F3FC" />
          <stop offset="50%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="26" r="18" fill="#0C4A6E" opacity="0.15" />
      <circle cx="24" cy="24" r="18" fill="url(#pg1)" />
      <ellipse cx="17" cy="17" rx="5" ry="3" fill="white" opacity="0.6" transform="rotate(-30 17 17)" />
      <circle cx="35" cy="14" r="2" fill="#FDE68A" />
      <circle cx="10" cy="10" r="1.5" fill="#FDE68A" />
      <circle cx="38" cy="34" r="1" fill="#FDE68A" />
      <text x="24" y="46" textAnchor="middle" fontSize="6" fill="#0369A1" fontWeight="bold">3D</text>
    </svg>
  );
}

export function WatercolorSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="18" cy="20" rx="13" ry="11" fill="#FB7185" opacity="0.5" />
      <ellipse cx="30" cy="18" rx="11" ry="10" fill="#60A5FA" opacity="0.5" />
      <ellipse cx="24" cy="30" rx="13" ry="9" fill="#34D399" opacity="0.5" />
      <ellipse cx="14" cy="30" rx="8" ry="7" fill="#FBBF24" opacity="0.45" />
      <ellipse cx="34" cy="30" rx="9" ry="7" fill="#C084FC" opacity="0.45" />
      <ellipse cx="24" cy="22" rx="7" ry="6" fill="white" opacity="0.35" />
    </svg>
  );
}

export function FlatIllustrationSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FEF3C7" rx="8" />
      {/* flat face */}
      <circle cx="24" cy="22" r="14" fill="#FCD34D" />
      {/* eyes */}
      <circle cx="19" cy="19" r="2.5" fill="#1C1917" />
      <circle cx="29" cy="19" r="2.5" fill="#1C1917" />
      <circle cx="20" cy="18.2" r="0.8" fill="white" />
      <circle cx="30" cy="18.2" r="0.8" fill="white" />
      {/* mouth */}
      <path d="M18 26 Q24 31 30 26" stroke="#1C1917" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* cheeks */}
      <circle cx="14" cy="24" r="4" fill="#FCA5A5" opacity="0.6" />
      <circle cx="34" cy="24" r="4" fill="#FCA5A5" opacity="0.6" />
      {/* bold outline */}
      <circle cx="24" cy="22" r="14" fill="none" stroke="#1C1917" strokeWidth="2" />
    </svg>
  );
}

export function StorybookSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FFF7ED" rx="6" />
      {/* book pages */}
      <rect x="6" y="8" width="36" height="32" rx="3" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
      <line x1="24" y1="8" x2="24" y2="40" stroke="#D97706" strokeWidth="1" strokeDasharray="2,1" />
      {/* watercolor-ish sky */}
      <ellipse cx="16" cy="18" rx="7" ry="5" fill="#BAE6FD" opacity="0.7" />
      <ellipse cx="32" cy="15" rx="6" ry="4" fill="#BAE6FD" opacity="0.5" />
      {/* ground */}
      <ellipse cx="24" cy="38" rx="15" ry="5" fill="#86EFAC" opacity="0.7" />
      {/* tree */}
      <rect x="22" y="26" width="3" height="8" fill="#92400E" />
      <circle cx="23.5" cy="23" r="7" fill="#4ADE80" opacity="0.85" />
      {/* star */}
      <text x="34" y="24" fontSize="7">⭐</text>
    </svg>
  );
}

export function GhibliSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#A7F3D0" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" fill="url(#gg1)" rx="8" />
      {/* rolling hills */}
      <ellipse cx="12" cy="42" rx="16" ry="10" fill="#6EE7B7" />
      <ellipse cx="36" cy="44" rx="18" ry="10" fill="#34D399" />
      {/* clouds */}
      <ellipse cx="14" cy="14" rx="7" ry="4" fill="white" opacity="0.9" />
      <ellipse cx="20" cy="12" rx="6" ry="4" fill="white" opacity="0.9" />
      <ellipse cx="34" cy="16" rx="8" ry="4.5" fill="white" opacity="0.85" />
      {/* floating spirit orbs */}
      <circle cx="10" cy="26" r="3" fill="white" opacity="0.7" />
      <circle cx="38" cy="22" r="2.5" fill="white" opacity="0.7" />
      <circle cx="24" cy="20" r="2" fill="white" opacity="0.6" />
      {/* Totoro silhouette hint */}
      <ellipse cx="24" cy="36" rx="5" ry="6" fill="#6B7280" opacity="0.35" />
      <circle cx="22.5" cy="33" r="1" fill="#6B7280" opacity="0.5" />
      <circle cx="25.5" cy="33" r="1" fill="#6B7280" opacity="0.5" />
    </svg>
  );
}

// ─── Gender Silhouettes ───────────────────────────────────────────────────────

export function GirlSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* head */}
      <circle cx="24" cy="13" r="8" fill="#FDDCB5" stroke="#E8B889" strokeWidth="1" />
      {/* hair */}
      <ellipse cx="24" cy="8" rx="8" ry="5" fill="#3D1C02" />
      <ellipse cx="16" cy="13" rx="3" ry="6" fill="#3D1C02" />
      <ellipse cx="32" cy="13" rx="3" ry="6" fill="#3D1C02" />
      {/* eyes */}
      <circle cx="21" cy="13" r="1.2" fill="#1A1A1A" />
      <circle cx="27" cy="13" r="1.2" fill="#1A1A1A" />
      {/* smile */}
      <path d="M21 17 Q24 19.5 27 17" stroke="#C86B5A" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* dress body */}
      <path d="M17 22 L14 44 L34 44 L31 22 Q27 25 24 24 Q21 25 17 22Z" fill="#F472B6" />
      <path d="M17 22 Q24 27 31 22 L28 19 Q24 22 20 19Z" fill="#FB7185" />
      {/* arms */}
      <path d="M17 24 L11 34" stroke="#FDDCB5" strokeWidth="3" strokeLinecap="round" />
      <path d="M31 24 L37 34" stroke="#FDDCB5" strokeWidth="3" strokeLinecap="round" />
      {/* cheeks */}
      <circle cx="19" cy="15" r="2" fill="#FCA5A5" opacity="0.6" />
      <circle cx="29" cy="15" r="2" fill="#FCA5A5" opacity="0.6" />
    </svg>
  );
}

export function BoySvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* head */}
      <circle cx="24" cy="13" r="8" fill="#FDDCB5" stroke="#E8B889" strokeWidth="1" />
      {/* hair */}
      <path d="M16 10 Q20 5 28 5 Q34 5 32 10 Q28 7 20 8Z" fill="#3D1C02" />
      {/* eyes */}
      <circle cx="21" cy="13" r="1.2" fill="#1A1A1A" />
      <circle cx="27" cy="13" r="1.2" fill="#1A1A1A" />
      {/* smile */}
      <path d="M21 17 Q24 19.5 27 17" stroke="#C86B5A" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* shirt body */}
      <rect x="16" y="21" width="16" height="16" rx="2" fill="#3B82F6" />
      {/* collar */}
      <path d="M21 21 L24 25 L27 21" fill="white" />
      {/* pants */}
      <rect x="16" y="36" width="6.5" height="10" rx="2" fill="#1E3A5F" />
      <rect x="25.5" y="36" width="6.5" height="10" rx="2" fill="#1E3A5F" />
      {/* arms */}
      <path d="M16 24 L10 33" stroke="#FDDCB5" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 24 L38 33" stroke="#FDDCB5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function AnimalSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <ellipse cx="24" cy="34" rx="12" ry="9" fill="#F97316" />
      {/* head */}
      <circle cx="24" cy="19" r="10" fill="#F97316" />
      {/* ears */}
      <ellipse cx="15" cy="11" rx="3.5" ry="5" fill="#F97316" transform="rotate(-15 15 11)" />
      <ellipse cx="33" cy="11" rx="3.5" ry="5" fill="#F97316" transform="rotate(15 33 11)" />
      <ellipse cx="15" cy="11" rx="1.5" ry="3" fill="#FBBF24" transform="rotate(-15 15 11)" />
      <ellipse cx="33" cy="11" rx="1.5" ry="3" fill="#FBBF24" transform="rotate(15 33 11)" />
      {/* eyes */}
      <circle cx="20" cy="19" r="2.5" fill="#1A1A1A" />
      <circle cx="28" cy="19" r="2.5" fill="#1A1A1A" />
      <circle cx="20.8" cy="18.2" r="0.8" fill="white" />
      <circle cx="28.8" cy="18.2" r="0.8" fill="white" />
      {/* nose */}
      <ellipse cx="24" cy="23" rx="2" ry="1.5" fill="#1A1A1A" />
      {/* whiskers */}
      <line x1="11" y1="22" x2="21" y2="23" stroke="#78350F" strokeWidth="0.8" opacity="0.6" />
      <line x1="11" y1="24" x2="21" y2="24" stroke="#78350F" strokeWidth="0.8" opacity="0.6" />
      <line x1="27" y1="23" x2="37" y2="22" stroke="#78350F" strokeWidth="0.8" opacity="0.6" />
      <line x1="27" y1="24" x2="37" y2="24" stroke="#78350F" strokeWidth="0.8" opacity="0.6" />
      {/* tail */}
      <path d="M36 32 Q44 28 42 20 Q40 14 36 16" stroke="#F97316" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* paws */}
      <ellipse cx="14" cy="42" rx="4" ry="3" fill="#FBBF24" />
      <ellipse cx="34" cy="42" rx="4" ry="3" fill="#FBBF24" />
    </svg>
  );
}

export function CreatureSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <ellipse cx="24" cy="32" rx="11" ry="9" fill="#FCD34D" />
      {/* wings */}
      <ellipse cx="11" cy="30" rx="7" ry="4" fill="#FDE68A" transform="rotate(-20 11 30)" />
      <ellipse cx="37" cy="30" rx="7" ry="4" fill="#FDE68A" transform="rotate(20 37 30)" />
      {/* head */}
      <circle cx="24" cy="19" r="9" fill="#FCD34D" />
      {/* crest */}
      <ellipse cx="24" cy="11" rx="4" ry="5" fill="#F97316" />
      <ellipse cx="20" cy="12" rx="2.5" ry="4" fill="#FB923C" />
      <ellipse cx="28" cy="12" rx="2.5" ry="4" fill="#FB923C" />
      {/* eyes */}
      <circle cx="20" cy="19" r="2.5" fill="#1A1A1A" />
      <circle cx="28" cy="19" r="2.5" fill="#1A1A1A" />
      <circle cx="20.8" cy="18.2" r="0.8" fill="white" />
      <circle cx="28.8" cy="18.2" r="0.8" fill="white" />
      {/* beak */}
      <path d="M22 23 L24 27 L26 23Z" fill="#F97316" />
      {/* feet */}
      <path d="M18 40 L14 46 M18 40 L18 46 M18 40 L22 46" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M30 40 L26 46 M30 40 L30 46 M30 40 L34 46" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Skin Tone Swatches ───────────────────────────────────────────────────────

export const SKIN_TONE_COLORS: Record<string, { hex: string; label: string }> = {
  "fair":         { hex: "#F8C9A0", label: "Fair" },
  "light-beige":  { hex: "#F0B889", label: "Light Beige" },
  "beige":        { hex: "#E8A87B", label: "Beige" },
  "olive":        { hex: "#C8906A", label: "Olive" },
  "warm-olive":   { hex: "#C17A52", label: "Warm Olive" },
  "golden":       { hex: "#C06830", label: "Golden" },
  "tan":          { hex: "#A0714F", label: "Tan" },
  "caramel":      { hex: "#8A5C3A", label: "Caramel" },
  "medium-brown": { hex: "#7A4A28", label: "Med Brown" },
  "brown":        { hex: "#5E3620", label: "Brown" },
  "dark-brown":   { hex: "#3D2010", label: "Dark Brown" },
  "deep-brown":   { hex: "#1C0A00", label: "Deep Brown" },
};

export function SkinToneSwatch({ color, size = 40 }: { color: string; size?: number }) {
  const info = SKIN_TONE_COLORS[color] || { hex: "#FDDCB5", label: color };
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* face shape with skin color */}
      <ellipse cx="24" cy="26" rx="15" ry="17" fill={info.hex} stroke="#00000015" strokeWidth="1" />
      {/* subtle highlight */}
      <ellipse cx="18" cy="18" rx="5" ry="4" fill="white" opacity="0.2" />
    </svg>
  );
}

// ─── Eye Color Swatches ───────────────────────────────────────────────────────

export const EYE_COLOR_MAP: Record<string, string> = {
  "dark-brown": "#3D1C02",
  "brown":      "#6B3A2A",
  "hazel":      "#8B6914",
  "amber":      "#C47A1E",
  "green":      "#2D7A3D",
  "blue":       "#1B5E9E",
  "gray":       "#6B7280",
  "black":      "#1A1A1A",
};

export function EyeSwatch({ color }: { color: string }) {
  const irisColor = EYE_COLOR_MAP[color] || "#1A1A1A";
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* eye white */}
      <ellipse cx="24" cy="24" rx="18" ry="12" fill="white" stroke="#D1D5DB" strokeWidth="1" />
      {/* iris */}
      <circle cx="24" cy="24" r="9" fill={irisColor} />
      {/* pupil */}
      <circle cx="24" cy="24" r="4.5" fill="#0A0A0A" />
      {/* highlight */}
      <circle cx="27" cy="21" r="2.5" fill="white" opacity="0.7" />
      <circle cx="21" cy="26" r="1.2" fill="white" opacity="0.4" />
      {/* eyelid top */}
      <path d="M6 24 Q24 10 42 24" stroke="#4A3728" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* lashes */}
      <path d="M10 22 L8 19" stroke="#1A1A1A" strokeWidth="1" strokeLinecap="round" />
      <path d="M15 19 L14 16" stroke="#1A1A1A" strokeWidth="1" strokeLinecap="round" />
      <path d="M24 18 L24 14" stroke="#1A1A1A" strokeWidth="1" strokeLinecap="round" />
      <path d="M33 19 L34 16" stroke="#1A1A1A" strokeWidth="1" strokeLinecap="round" />
      <path d="M38 22 L40 19" stroke="#1A1A1A" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// ─── Face Shapes ─────────────────────────────────────────────────────────────

const FACE_FILL = "#FDDCB5";
const FACE_STROKE = "#E8A878";
const EYE_DOT = "#3D1C02";

export function RoundFaceSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="26" r="17" fill={FACE_FILL} stroke={FACE_STROKE} strokeWidth="1.5" />
      <circle cx="18" cy="24" r="1.8" fill={EYE_DOT} />
      <circle cx="30" cy="24" r="1.8" fill={EYE_DOT} />
      <path d="M19 30 Q24 34 29 30" stroke="#C86B5A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="15" cy="27" r="3" fill="#FCA5A5" opacity="0.5" />
      <circle cx="33" cy="27" r="3" fill="#FCA5A5" opacity="0.5" />
    </svg>
  );
}

export function OvalFaceSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="26" rx="13" ry="18" fill={FACE_FILL} stroke={FACE_STROKE} strokeWidth="1.5" />
      <circle cx="19.5" cy="24" r="1.8" fill={EYE_DOT} />
      <circle cx="28.5" cy="24" r="1.8" fill={EYE_DOT} />
      <path d="M19 30 Q24 34 29 30" stroke="#C86B5A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="27" r="2.5" fill="#FCA5A5" opacity="0.5" />
      <circle cx="32" cy="27" r="2.5" fill="#FCA5A5" opacity="0.5" />
    </svg>
  );
}

export function HeartFaceSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* wide forehead, pointed chin */}
      <path d="M24 42 C24 42 8 32 8 18 Q8 8 17 8 Q21 8 24 12 Q27 8 31 8 Q40 8 40 18 C40 32 24 42 24 42Z"
        fill={FACE_FILL} stroke={FACE_STROKE} strokeWidth="1.5" />
      <circle cx="19" cy="22" r="1.8" fill={EYE_DOT} />
      <circle cx="29" cy="22" r="1.8" fill={EYE_DOT} />
      <path d="M19 28 Q24 32 29 28" stroke="#C86B5A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="15" cy="24" r="3" fill="#FCA5A5" opacity="0.5" />
      <circle cx="33" cy="24" r="3" fill="#FCA5A5" opacity="0.5" />
    </svg>
  );
}

export function SquareFaceSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="32" height="34" rx="6" fill={FACE_FILL} stroke={FACE_STROKE} strokeWidth="1.5" />
      <circle cx="18" cy="24" r="1.8" fill={EYE_DOT} />
      <circle cx="30" cy="24" r="1.8" fill={EYE_DOT} />
      <path d="M18 30 Q24 34 30 30" stroke="#C86B5A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="13" cy="27" r="3" fill="#FCA5A5" opacity="0.5" />
      <circle cx="35" cy="27" r="3" fill="#FCA5A5" opacity="0.5" />
    </svg>
  );
}

export function OvalBalancedFaceSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="26" rx="15" ry="17" fill={FACE_FILL} stroke={FACE_STROKE} strokeWidth="1.5" />
      <circle cx="19" cy="24" r="1.8" fill={EYE_DOT} />
      <circle cx="29" cy="24" r="1.8" fill={EYE_DOT} />
      <path d="M19 30 Q24 34 29 30" stroke="#C86B5A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="27" r="2.5" fill="#FCA5A5" opacity="0.5" />
      <circle cx="34" cy="27" r="2.5" fill="#FCA5A5" opacity="0.5" />
    </svg>
  );
}

export function RoundYouthfulFaceSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="27" r="15" fill={FACE_FILL} stroke={FACE_STROKE} strokeWidth="1.5" />
      {/* chubby cheeks */}
      <ellipse cx="13" cy="28" rx="5" ry="4" fill="#FCA5A5" opacity="0.4" />
      <ellipse cx="35" cy="28" rx="5" ry="4" fill="#FCA5A5" opacity="0.4" />
      <circle cx="19" cy="25" r="2" fill={EYE_DOT} />
      <circle cx="29" cy="25" r="2" fill={EYE_DOT} />
      <circle cx="20" cy="24.2" r="0.7" fill="white" />
      <circle cx="30" cy="24.2" r="0.7" fill="white" />
      <path d="M19 31 Q24 35 29 31" stroke="#C86B5A" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Eyebrow Styles ───────────────────────────────────────────────────────────

function BrowBase({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* skin background */}
      <rect width="48" height="48" fill="#FDF0E0" rx="8" />
      {/* eye hint */}
      <ellipse cx="24" cy="32" rx="9" ry="6" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="24" cy="32" r="4" fill="#3D1C02" />
      <circle cx="24" cy="32" r="2" fill="#0A0A0A" />
      <circle cx="25.5" cy="30.5" r="1.2" fill="white" opacity="0.7" />
      {children}
    </svg>
  );
}

export function ThickArchedBrowSvg() {
  return (
    <BrowBase>
      <path d="M9 22 Q24 12 39 22" stroke="#3D1C02" strokeWidth="5" fill="none" strokeLinecap="round" />
    </BrowBase>
  );
}

export function ThinStraightBrowSvg() {
  return (
    <BrowBase>
      <line x1="10" y1="20" x2="38" y2="20" stroke="#3D1C02" strokeWidth="2" strokeLinecap="round" />
    </BrowBase>
  );
}

export function BushyStraightBrowSvg() {
  return (
    <BrowBase>
      <path d="M9 22 Q24 18 39 22" stroke="#3D1C02" strokeWidth="6.5" fill="none" strokeLinecap="round" />
    </BrowBase>
  );
}

export function SoftRoundedBrowSvg() {
  return (
    <BrowBase>
      <path d="M10 22 Q24 15 38 22" stroke="#3D1C02" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.75" />
    </BrowBase>
  );
}

export function NaturalFullBrowSvg() {
  return (
    <BrowBase>
      <path d="M9 22 Q24 14 39 22" stroke="#3D1C02" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.85" />
    </BrowBase>
  );
}

// ─── Nose Styles ─────────────────────────────────────────────────────────────

function NoseBase({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FDF0E0" rx="8" />
      {children}
    </svg>
  );
}

export function ButtonNoseSvg() {
  return (
    <NoseBase>
      {/* small round button nose */}
      <ellipse cx="24" cy="26" rx="5" ry="4" fill="#E8A878" opacity="0.6" />
      <circle cx="21" cy="27" r="2" fill="#C88B6A" opacity="0.7" />
      <circle cx="27" cy="27" r="2" fill="#C88B6A" opacity="0.7" />
      <circle cx="24" cy="24" r="3" fill="#FDDCB5" stroke="#D4916A" strokeWidth="1" />
    </NoseBase>
  );
}

export function BroadFlatNoseSvg() {
  return (
    <NoseBase>
      <path d="M16 18 L16 30 Q20 34 24 34 Q28 34 32 30 L32 18 Q28 22 24 22 Q20 22 16 18Z"
        fill="#E8A878" opacity="0.7" />
      <ellipse cx="19" cy="30" rx="4" ry="2.5" fill="#C88B6A" opacity="0.8" />
      <ellipse cx="29" cy="30" rx="4" ry="2.5" fill="#C88B6A" opacity="0.8" />
    </NoseBase>
  );
}

export function StraightNarrowNoseSvg() {
  return (
    <NoseBase>
      <path d="M24 14 L24 32" stroke="#D4916A" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 30 Q24 34 28 30" stroke="#D4916A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="21" cy="31" rx="2.5" ry="1.5" fill="#C88B6A" opacity="0.6" />
      <ellipse cx="27" cy="31" rx="2.5" ry="1.5" fill="#C88B6A" opacity="0.6" />
    </NoseBase>
  );
}

export function RoundedSoftNoseSvg() {
  return (
    <NoseBase>
      <path d="M20 16 Q18 24 18 28 Q18 34 24 34 Q30 34 30 28 Q30 24 28 16 Q26 20 24 20 Q22 20 20 16Z"
        fill="#E8A878" opacity="0.65" />
      <ellipse cx="21" cy="31" rx="3" ry="2" fill="#C88B6A" opacity="0.7" />
      <ellipse cx="27" cy="31" rx="3" ry="2" fill="#C88B6A" opacity="0.7" />
    </NoseBase>
  );
}

export function WideNostrilsNoseSvg() {
  return (
    <NoseBase>
      <path d="M22 16 L22 28" stroke="#D4916A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 16 L26 28" stroke="#D4916A" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="18" cy="30" rx="5.5" ry="3" fill="#C88B6A" opacity="0.8" />
      <ellipse cx="30" cy="30" rx="5.5" ry="3" fill="#C88B6A" opacity="0.8" />
      <path d="M18 28 Q24 32 30 28" stroke="#D4916A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </NoseBase>
  );
}

// ─── Cheek Styles ────────────────────────────────────────────────────────────

function CheekBase({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#FDF0E0" rx="8" />
      {/* face outline */}
      <ellipse cx="24" cy="26" rx="17" ry="18" fill={FACE_FILL} stroke={FACE_STROKE} strokeWidth="1" />
      {/* eye hints */}
      <circle cx="17" cy="20" r="2" fill="#3D1C02" />
      <circle cx="31" cy="20" r="2" fill="#3D1C02" />
      {children}
    </svg>
  );
}

export function ChubbyRosyCheekSvg() {
  return (
    <CheekBase>
      <ellipse cx="10" cy="28" rx="7" ry="5" fill="#FCA5A5" opacity="0.7" />
      <ellipse cx="38" cy="28" rx="7" ry="5" fill="#FCA5A5" opacity="0.7" />
      <path d="M17 32 Q24 38 31 32" stroke="#C86B5A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </CheekBase>
  );
}

export function FlatSmoothCheekSvg() {
  return (
    <CheekBase>
      {/* no special cheek, subtle */}
      <path d="M17 32 Q24 36 31 32" stroke="#C86B5A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </CheekBase>
  );
}

export function HighDefinedCheekSvg() {
  return (
    <CheekBase>
      {/* high cheekbone lines */}
      <path d="M8 24 Q14 22 18 26" stroke="#D4916A" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M40 24 Q34 22 30 26" stroke="#D4916A" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M17 32 Q24 36 31 32" stroke="#C86B5A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </CheekBase>
  );
}

export function DimpledCheekSvg() {
  return (
    <CheekBase>
      <ellipse cx="10" cy="28" rx="5" ry="4" fill="#FCA5A5" opacity="0.5" />
      <ellipse cx="38" cy="28" rx="5" ry="4" fill="#FCA5A5" opacity="0.5" />
      {/* dimples */}
      <circle cx="16" cy="34" r="1.5" fill="#E8A878" opacity="0.8" />
      <circle cx="32" cy="34" r="1.5" fill="#E8A878" opacity="0.8" />
      <path d="M17 30 Q24 35 31 30" stroke="#C86B5A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </CheekBase>
  );
}

export function SoftRoundCheekSvg() {
  return (
    <CheekBase>
      <circle cx="11" cy="27" r="6" fill="#FCA5A5" opacity="0.5" />
      <circle cx="37" cy="27" r="6" fill="#FCA5A5" opacity="0.5" />
      <path d="M17 32 Q24 37 31 32" stroke="#C86B5A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </CheekBase>
  );
}

// ─── Hair Style Silhouettes ───────────────────────────────────────────────────

const HAIR_COLOR = "#3D1C02";
const HEAD_FILL = "#FDDCB5";

function HeadBase({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {children}
      {/* face */}
      <ellipse cx="24" cy="30" rx="12" ry="14" fill={HEAD_FILL} />
      {/* eyes */}
      <circle cx="20" cy="28" r="1.5" fill="#3D1C02" />
      <circle cx="28" cy="28" r="1.5" fill="#3D1C02" />
      {/* smile */}
      <path d="M20 34 Q24 37 28 34" stroke="#C86B5A" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// BOY HAIR
export function ShortHairBoySvg() {
  return (
    <HeadBase>
      <ellipse cx="24" cy="18" rx="12" ry="7" fill={HAIR_COLOR} />
      <rect x="12" y="18" width="24" height="8" fill={HAIR_COLOR} />
    </HeadBase>
  );
}

export function CurlyHairBoySvg() {
  return (
    <HeadBase>
      {[14, 19, 24, 29, 34].map((x, i) => (
        <circle key={i} cx={x} cy={16} r={4} fill={HAIR_COLOR} />
      ))}
      <ellipse cx="24" cy="19" rx="12" ry="5" fill={HAIR_COLOR} />
    </HeadBase>
  );
}

export function WavyHairBoySvg() {
  return (
    <HeadBase>
      <path d="M12 22 Q16 14 20 18 Q24 12 28 18 Q32 14 36 22 L36 18 Q32 10 28 14 Q24 8 20 14 Q16 10 12 18Z"
        fill={HAIR_COLOR} />
    </HeadBase>
  );
}

export function SpikyHairBoySvg() {
  return (
    <HeadBase>
      {/* spikes */}
      <polygon points="16,20 18,8 20,20" fill={HAIR_COLOR} />
      <polygon points="20,20 22,6 24,20" fill={HAIR_COLOR} />
      <polygon points="24,20 26,6 28,20" fill={HAIR_COLOR} />
      <polygon points="28,20 30,8 32,20" fill={HAIR_COLOR} />
      <ellipse cx="24" cy="20" rx="12" ry="4" fill={HAIR_COLOR} />
    </HeadBase>
  );
}

export function AfroHairSvg() {
  return (
    <HeadBase>
      <circle cx="24" cy="18" r="14" fill={HAIR_COLOR} />
    </HeadBase>
  );
}

export function BuzzCutSvg() {
  return (
    <HeadBase>
      <ellipse cx="24" cy="19" rx="12" ry="4" fill={HAIR_COLOR} opacity="0.7" />
    </HeadBase>
  );
}

// GIRL HAIR
export function LongHairGirlSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* long hair sides */}
      <rect x="11" y="16" width="5" height="30" rx="3" fill={HAIR_COLOR} />
      <rect x="32" y="16" width="5" height="30" rx="3" fill={HAIR_COLOR} />
      {/* top hair */}
      <ellipse cx="24" cy="18" rx="13" ry="7" fill={HAIR_COLOR} />
      {/* face */}
      <ellipse cx="24" cy="30" rx="11" ry="13" fill={HEAD_FILL} />
      <circle cx="20" cy="28" r="1.5" fill="#3D1C02" />
      <circle cx="28" cy="28" r="1.5" fill="#3D1C02" />
      <path d="M20 34 Q24 37 28 34" stroke="#C86B5A" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function CurlyLongHairSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* curly long sides */}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={11} cy={18 + i * 7} r={5} fill={HAIR_COLOR} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={37} cy={18 + i * 7} r={5} fill={HAIR_COLOR} />
      ))}
      {/* top curls */}
      {[14, 20, 26, 32].map((x, i) => (
        <circle key={i} cx={x} cy={15} r={5} fill={HAIR_COLOR} />
      ))}
      <ellipse cx="24" cy="18" rx="13" ry="6" fill={HAIR_COLOR} />
      {/* face */}
      <ellipse cx="24" cy="30" rx="11" ry="13" fill={HEAD_FILL} />
      <circle cx="20" cy="28" r="1.5" fill="#3D1C02" />
      <circle cx="28" cy="28" r="1.5" fill="#3D1C02" />
      <path d="M20 34 Q24 37 28 34" stroke="#C86B5A" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function BraidedHairSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* braid down one side */}
      <rect x="11" y="16" width="5" height="28" rx="2" fill={HAIR_COLOR} />
      {/* braid pattern */}
      {[20, 26, 32, 38].map((y) => (
        <ellipse key={y} cx={13.5} cy={y} rx={4} ry={2} fill={HAIR_COLOR} opacity={0.6} />
      ))}
      {/* top */}
      <ellipse cx="24" cy="18" rx="13" ry="7" fill={HAIR_COLOR} />
      {/* face */}
      <ellipse cx="24" cy="30" rx="11" ry="13" fill={HEAD_FILL} />
      <circle cx="20" cy="28" r="1.5" fill="#3D1C02" />
      <circle cx="28" cy="28" r="1.5" fill="#3D1C02" />
      <path d="M20 34 Q24 37 28 34" stroke="#C86B5A" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function PonytailHairSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* ponytail */}
      <path d="M36 16 Q44 10 42 24 Q40 34 36 38" stroke={HAIR_COLOR} strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* hair tie */}
      <circle cx="36" cy="16" r="3" fill="#F472B6" />
      {/* top */}
      <ellipse cx="24" cy="18" rx="13" ry="7" fill={HAIR_COLOR} />
      {/* face */}
      <ellipse cx="24" cy="30" rx="11" ry="13" fill={HEAD_FILL} />
      <circle cx="20" cy="28" r="1.5" fill="#3D1C02" />
      <circle cx="28" cy="28" r="1.5" fill="#3D1C02" />
      <path d="M20 34 Q24 37 28 34" stroke="#C86B5A" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function BunHairSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* bun on top */}
      <circle cx="24" cy="11" r="8" fill={HAIR_COLOR} />
      {/* top hair wrap */}
      <ellipse cx="24" cy="18" rx="13" ry="6" fill={HAIR_COLOR} />
      {/* face */}
      <ellipse cx="24" cy="30" rx="11" ry="13" fill={HEAD_FILL} />
      <circle cx="20" cy="28" r="1.5" fill="#3D1C02" />
      <circle cx="28" cy="28" r="1.5" fill="#3D1C02" />
      <path d="M20 34 Q24 37 28 34" stroke="#C86B5A" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// HIJAB STYLES
export function HijabSvg({ color }: { color: string }) {
  const colorMap: Record<string, string> = {
    white: "#F5F5F0", black: "#1A1A2E", beige: "#D4C5A9",
    blue: "#3B82F6", pink: "#F472B6", purple: "#9C27B0",
    teal: "#0D9488", maroon: "#7F1D1D", navy: "#1E3A5F", gray: "#6B7280",
  };
  const fill = colorMap[color] ?? "#A0A0A0";
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* hijab drape */}
      <ellipse cx="24" cy="20" rx="18" ry="18" fill={fill} />
      <ellipse cx="24" cy="32" rx="18" ry="14" fill={fill} />
      {/* face opening */}
      <ellipse cx="24" cy="22" rx="10" ry="12" fill={HEAD_FILL} />
      {/* eyes */}
      <circle cx="20" cy="21" r="1.5" fill="#3D1C02" />
      <circle cx="28" cy="21" r="1.5" fill="#3D1C02" />
      {/* smile */}
      <path d="M20 26 Q24 29 28 26" stroke="#C86B5A" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ELDER MALE HAIR
export function BaldSvg() {
  return (
    <HeadBase>
      {/* shine on bald head */}
      <ellipse cx="24" cy="19" rx="12" ry="7" fill="#E8C99A" opacity="0.6" />
      <ellipse cx="20" cy="16" rx="4" ry="2" fill="white" opacity="0.3" />
    </HeadBase>
  );
}

export function WhiteShortHairSvg() {
  return (
    <HeadBase>
      <ellipse cx="24" cy="18" rx="12" ry="7" fill="#E5E7EB" />
      <rect x="12" y="18" width="24" height="6" fill="#E5E7EB" />
    </HeadBase>
  );
}

export function GrayShortHairSvg() {
  return (
    <HeadBase>
      <ellipse cx="24" cy="18" rx="12" ry="7" fill="#9CA3AF" />
      <rect x="12" y="18" width="24" height="6" fill="#9CA3AF" />
    </HeadBase>
  );
}

// OTHER / CREATURE
export function FeatheredCrestSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* feather crest */}
      <path d="M20 12 Q22 2 24 12" stroke="#F97316" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M23 12 Q25 1 27 12" stroke="#FCD34D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M26 13 Q29 4 30 14" stroke="#F97316" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* round creature head */}
      <circle cx="24" cy="26" r="14" fill="#FCD34D" />
      <circle cx="19" cy="24" r="2" fill="#1A1A1A" />
      <circle cx="29" cy="24" r="2" fill="#1A1A1A" />
      <path d="M22 28 L24 31 L26 28Z" fill="#F97316" />
    </svg>
  );
}

export function FurBodySvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* furry body */}
      {[10, 16, 22, 28, 34, 40].map((x, i) => (
        <ellipse key={i} cx={x} cy={24} rx={4} ry={6} fill="#A16207" opacity={0.7} />
      ))}
      <circle cx="24" cy="24" r="14" fill="#CA8A04" opacity={0.85} />
      <circle cx="19" cy="22" r="2.5" fill="#1A1A1A" />
      <circle cx="29" cy="22" r="2.5" fill="#1A1A1A" />
      <path d="M20 28 Q24 32 28 28" stroke="#92400E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Body Build Silhouettes ───────────────────────────────────────────────────

function BodyBase({ children, bg = "#EFF6FF" }: { children: React.ReactNode; bg?: string }) {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill={bg} rx="8" />
      {children}
    </svg>
  );
}

const BODY_SKIN = "#FDDCB5";
const SHIRT_BLUE = "#60A5FA";
const PANTS_BLUE = "#1E40AF";

export function SlimBodySvg() {
  return (
    <BodyBase>
      <circle cx="24" cy="8" r="5" fill={BODY_SKIN} />
      <rect x="20" y="13" width="8" height="14" rx="3" fill={SHIRT_BLUE} />
      <rect x="20" y="27" width="3.5" height="14" rx="2" fill={PANTS_BLUE} />
      <rect x="24.5" y="27" width="3.5" height="14" rx="2" fill={PANTS_BLUE} />
      <line x1="20" y1="18" x2="13" y2="26" stroke={BODY_SKIN} strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="18" x2="35" y2="26" stroke={BODY_SKIN} strokeWidth="3" strokeLinecap="round" />
    </BodyBase>
  );
}

export function AverageBodySvg() {
  return (
    <BodyBase>
      <circle cx="24" cy="8" r="5" fill={BODY_SKIN} />
      <rect x="18" y="13" width="12" height="14" rx="3" fill={SHIRT_BLUE} />
      <rect x="18" y="27" width="5" height="14" rx="2" fill={PANTS_BLUE} />
      <rect x="25" y="27" width="5" height="14" rx="2" fill={PANTS_BLUE} />
      <line x1="18" y1="18" x2="11" y2="26" stroke={BODY_SKIN} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="30" y1="18" x2="37" y2="26" stroke={BODY_SKIN} strokeWidth="3.5" strokeLinecap="round" />
    </BodyBase>
  );
}

export function ChubbyBodySvg() {
  return (
    <BodyBase>
      <circle cx="24" cy="8" r="6" fill={BODY_SKIN} />
      <ellipse cx="24" cy="20" rx="10" ry="9" fill={SHIRT_BLUE} />
      <ellipse cx="24" cy="33" rx="9" ry="8" fill={PANTS_BLUE} />
      <line x1="14" y1="17" x2="8" y2="26" stroke={BODY_SKIN} strokeWidth="4.5" strokeLinecap="round" />
      <line x1="34" y1="17" x2="40" y2="26" stroke={BODY_SKIN} strokeWidth="4.5" strokeLinecap="round" />
    </BodyBase>
  );
}

export function AthleticBodySvg() {
  return (
    <BodyBase>
      <circle cx="24" cy="7" r="5" fill={BODY_SKIN} />
      {/* V-shape torso */}
      <path d="M14 13 L34 13 L28 27 L20 27Z" fill={SHIRT_BLUE} />
      <rect x="19" y="27" width="4" height="14" rx="2" fill={PANTS_BLUE} />
      <rect x="25" y="27" width="4" height="14" rx="2" fill={PANTS_BLUE} />
      <line x1="14" y1="15" x2="8" y2="24" stroke={BODY_SKIN} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="34" y1="15" x2="40" y2="24" stroke={BODY_SKIN} strokeWidth="3.5" strokeLinecap="round" />
    </BodyBase>
  );
}

export function StockyBodySvg() {
  return (
    <BodyBase>
      <circle cx="24" cy="8" r="6" fill={BODY_SKIN} />
      <rect x="15" y="14" width="18" height="13" rx="3" fill={SHIRT_BLUE} />
      <rect x="15" y="27" width="7" height="12" rx="2" fill={PANTS_BLUE} />
      <rect x="26" y="27" width="7" height="12" rx="2" fill={PANTS_BLUE} />
      <line x1="15" y1="18" x2="8" y2="26" stroke={BODY_SKIN} strokeWidth="4" strokeLinecap="round" />
      <line x1="33" y1="18" x2="40" y2="26" stroke={BODY_SKIN} strokeWidth="4" strokeLinecap="round" />
    </BodyBase>
  );
}

export function TallSlenderBodySvg() {
  return (
    <BodyBase>
      <circle cx="24" cy="5" r="4" fill={BODY_SKIN} />
      <rect x="21" y="9" width="6" height="18" rx="2" fill={SHIRT_BLUE} />
      <rect x="21" y="27" width="2.5" height="18" rx="1.5" fill={PANTS_BLUE} />
      <rect x="24.5" y="27" width="2.5" height="18" rx="1.5" fill={PANTS_BLUE} />
      <line x1="21" y1="14" x2="15" y2="22" stroke={BODY_SKIN} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="27" y1="14" x2="33" y2="22" stroke={BODY_SKIN} strokeWidth="2.5" strokeLinecap="round" />
    </BodyBase>
  );
}

export function PetiteBodySvg() {
  return (
    <BodyBase>
      <circle cx="24" cy="9" r="5" fill={BODY_SKIN} />
      <rect x="20" y="14" width="8" height="12" rx="3" fill={SHIRT_BLUE} />
      <rect x="20" y="26" width="3.5" height="13" rx="2" fill={PANTS_BLUE} />
      <rect x="24.5" y="26" width="3.5" height="13" rx="2" fill={PANTS_BLUE} />
      <line x1="20" y1="18" x2="14" y2="25" stroke={BODY_SKIN} strokeWidth="3" strokeLinecap="round" />
      <line x1="28" y1="18" x2="34" y2="25" stroke={BODY_SKIN} strokeWidth="3" strokeLinecap="round" />
    </BodyBase>
  );
}

export function BroadShoulderBodySvg() {
  return (
    <BodyBase>
      <circle cx="24" cy="7" r="5" fill={BODY_SKIN} />
      {/* extra wide shoulders */}
      <path d="M10 13 L38 13 L32 27 L16 27Z" fill={SHIRT_BLUE} />
      <rect x="18" y="27" width="5" height="14" rx="2" fill={PANTS_BLUE} />
      <rect x="25" y="27" width="5" height="14" rx="2" fill={PANTS_BLUE} />
      <line x1="10" y1="15" x2="4" y2="24" stroke={BODY_SKIN} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="38" y1="15" x2="44" y2="24" stroke={BODY_SKIN} strokeWidth="3.5" strokeLinecap="round" />
    </BodyBase>
  );
}

export function ToddlerBodySvg() {
  return (
    <BodyBase>
      <circle cx="24" cy="9" r="6" fill={BODY_SKIN} />
      {/* round tummy */}
      <circle cx="24" cy="24" r="9" fill={SHIRT_BLUE} />
      <ellipse cx="22" cy="35" rx="4" ry="6" fill={PANTS_BLUE} />
      <ellipse cx="28" cy="36" rx="4" ry="5" fill={PANTS_BLUE} />
      <line x1="15" y1="20" x2="10" y2="28" stroke={BODY_SKIN} strokeWidth="4" strokeLinecap="round" />
      <line x1="33" y1="20" x2="38" y2="28" stroke={BODY_SKIN} strokeWidth="4" strokeLinecap="round" />
    </BodyBase>
  );
}

export function RoundFullBodySvg() {
  return (
    <BodyBase>
      <circle cx="24" cy="8" r="6" fill={BODY_SKIN} />
      <ellipse cx="24" cy="23" rx="13" ry="11" fill={SHIRT_BLUE} />
      <ellipse cx="22" cy="37" rx="6" ry="7" fill={PANTS_BLUE} />
      <ellipse cx="30" cy="37" rx="6" ry="7" fill={PANTS_BLUE} />
      <line x1="11" y1="18" x2="5" y2="28" stroke={BODY_SKIN} strokeWidth="5" strokeLinecap="round" />
      <line x1="37" y1="18" x2="43" y2="28" stroke={BODY_SKIN} strokeWidth="5" strokeLinecap="round" />
    </BodyBase>
  );
}

// ─── Height Feel Visual ───────────────────────────────────────────────────────

export function HeightFeelSvg({ level }: { level: number }) {
  // level 0-7: very small, small, slightly short, average, slightly tall, tall, very tall, towers
  const heights = [16, 20, 24, 28, 32, 36, 40, 44];
  const h = heights[Math.min(level, 7)];
  const y = 48 - h;
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#F0F9FF" rx="8" />
      {/* ruler lines */}
      {[8, 16, 24, 32, 40].map((yy) => (
        <line key={yy} x1="6" y1={yy} x2="10" y2={yy} stroke="#CBD5E1" strokeWidth="1" />
      ))}
      <line x1="8" y1="4" x2="8" y2="48" stroke="#CBD5E1" strokeWidth="1" />
      {/* character */}
      <rect x="18" y={y} width="12" height={h} rx="4" fill="#60A5FA" />
      <circle cx="24" cy={y - 5} r="5" fill={BODY_SKIN} />
    </svg>
  );
}

// ─── Outfit Color Palette ─────────────────────────────────────────────────────

export const OUTFIT_COLORS: { name: string; hex: string }[] = [
  { name: "white",       hex: "#FFFFFF" },
  { name: "cream",       hex: "#FFFBEB" },
  { name: "beige",       hex: "#E8D5B0" },
  { name: "khaki",       hex: "#BFB87A" },
  { name: "gray",        hex: "#9CA3AF" },
  { name: "charcoal",    hex: "#374151" },
  { name: "black",       hex: "#1A1A1A" },
  { name: "brown",       hex: "#92400E" },
  { name: "tan",         hex: "#B45309" },
  { name: "navy",        hex: "#1E3A5F" },
  { name: "dark blue",   hex: "#1D4ED8" },
  { name: "sky blue",    hex: "#0EA5E9" },
  { name: "teal",        hex: "#0D9488" },
  { name: "mint green",  hex: "#6EE7B7" },
  { name: "sage green",  hex: "#84CC16" },
  { name: "dark green",  hex: "#15803D" },
  { name: "red",         hex: "#DC2626" },
  { name: "rose",        hex: "#F43F5E" },
  { name: "pink",        hex: "#EC4899" },
  { name: "light pink",  hex: "#FBCFE8" },
  { name: "purple",      hex: "#7C3AED" },
  { name: "lilac",       hex: "#C4B5FD" },
  { name: "orange",      hex: "#EA580C" },
  { name: "yellow",      hex: "#CA8A04" },
  { name: "gold",        hex: "#D97706" },
  { name: "maroon",      hex: "#7F1D1D" },
  { name: "dark navy",   hex: "#0F172A" },
  { name: "olive",       hex: "#65661F" },
];

// ─── Top Garment SVGs ─────────────────────────────────────────────────────────

const G_FILL    = "#7DD3FC"; // default top fill
const G_STROKE  = "#0369A1"; // outline
const B_FILL    = "#60A5FA"; // slightly different shade for boy tops
const SK_FILL   = "#C084FC"; // skirt/bottom fill
const SK_STROKE = "#7E22CE";
const SH_FILL   = "#A3A3A3"; // shoe fill
const SH_STROKE = "#525252";

// GIRL TOPS
export function LongSleeveTunicSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <path d="M16 14 L14 40 L34 40 L32 14 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* collar */}
      <path d="M19 14 Q24 18 29 14" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinecap="round" />
      {/* left sleeve */}
      <path d="M16 14 L7 22 L10 24 L18 17 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* right sleeve */}
      <path d="M32 14 L41 22 L38 24 L30 17 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* hem detail */}
      <line x1="14" y1="40" x2="34" y2="40" stroke={G_STROKE} strokeWidth="1.5" />
    </svg>
  );
}

export function AbayaSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* full length robe - slightly flared */}
      <path d="M20 8 L10 46 L38 46 L28 8 Q24 10 20 8Z" fill="#1A1A2E" stroke="#374151" strokeWidth="1.5" strokeLinejoin="round" />
      {/* sleeves */}
      <path d="M20 8 L6 28 L10 30 L22 14 Z" fill="#1A1A2E" stroke="#374151" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M28 8 L42 28 L38 30 L26 14 Z" fill="#1A1A2E" stroke="#374151" strokeWidth="1.5" strokeLinejoin="round" />
      {/* collar detail */}
      <path d="M20 8 Q24 12 28 8" fill="none" stroke="#6B7280" strokeWidth="1" />
      {/* subtle vertical lines */}
      <line x1="24" y1="10" x2="22" y2="44" stroke="#374151" strokeWidth="0.5" strokeDasharray="2,3" />
    </svg>
  );
}

export function ModestBlouseSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 12 L15 34 L33 34 L31 12 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* collar */}
      <path d="M20 12 L24 16 L28 12" fill="white" stroke={G_STROKE} strokeWidth="1.2" />
      {/* buttons */}
      {[18, 22, 26, 30].map((y, i) => <circle key={i} cx="24" cy={y} r="1" fill={G_STROKE} />)}
      {/* sleeves long */}
      <path d="M17 12 L8 20 L11 22 L19 15 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M31 12 L40 20 L37 22 L29 15 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function SalwarKameezTopSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* kurta body — longer, rounded hem */}
      <path d="M15 10 L13 42 L35 42 L33 10 Q24 13 15 10Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* side slits at hem */}
      <line x1="13" y1="36" x2="16" y2="42" stroke={G_STROKE} strokeWidth="1" />
      <line x1="35" y1="36" x2="32" y2="42" stroke={G_STROKE} strokeWidth="1" />
      {/* mandarin collar */}
      <path d="M19 10 L21 14 L27 14 L29 10" fill="none" stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* sleeves */}
      <path d="M15 10 L5 22 L9 24 L17 14 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M33 10 L43 22 L39 24 L31 14 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function LongSleeveDressSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* top bodice */}
      <path d="M18 8 L16 22 L32 22 L30 8 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* skirt — flared */}
      <path d="M16 22 L10 46 L38 46 L32 22 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* waist seam */}
      <line x1="16" y1="22" x2="32" y2="22" stroke={G_STROKE} strokeWidth="1.5" />
      {/* sleeves */}
      <path d="M18 8 L8 18 L11 20 L19 12 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M30 8 L40 18 L37 20 L29 12 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* collar */}
      <path d="M20 8 Q24 11 28 8" fill="none" stroke={G_STROKE} strokeWidth="1.5" />
    </svg>
  );
}

export function SchoolUniformBlouseSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 12 L15 36 L33 36 L31 12 Z" fill="white" stroke="#6B7280" strokeWidth="1.5" strokeLinejoin="round" />
      {/* collar lapels */}
      <path d="M20 12 L22 18 L24 14 L26 18 L28 12" fill="white" stroke="#6B7280" strokeWidth="1.3" strokeLinejoin="round" />
      {/* buttons */}
      {[20, 24, 28, 32].map((y, i) => <circle key={i} cx="24" cy={y} r="0.9" fill="#9CA3AF" />)}
      {/* breast pocket */}
      <rect x="27" y="17" width="5" height="5" rx="1" fill="none" stroke="#9CA3AF" strokeWidth="0.8" />
      {/* sleeves */}
      <path d="M17 12 L7 22 L11 24 L19 15 Z" fill="white" stroke="#6B7280" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M31 12 L41 22 L37 24 L29 15 Z" fill="white" stroke="#6B7280" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function LongCardiganSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* left panel */}
      <path d="M14 10 L12 44 L22 44 L22 10 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* right panel */}
      <path d="M26 10 L26 44 L36 44 L34 10 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* opening centre */}
      <line x1="22" y1="10" x2="20" y2="44" stroke={G_STROKE} strokeWidth="1" strokeDasharray="2,2" />
      <line x1="26" y1="10" x2="28" y2="44" stroke={G_STROKE} strokeWidth="1" strokeDasharray="2,2" />
      {/* sleeves */}
      <path d="M14 10 L5 22 L9 24 L16 15 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M34 10 L43 22 L39 24 L32 15 Z" fill={G_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* collar roll */}
      <path d="M16 10 Q24 6 32 10" fill="none" stroke={G_STROKE} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// BOY TOPS
export function TShirtSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 14 L15 36 L33 36 L31 14 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* collar */}
      <path d="M19 14 Q24 18 29 14" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinecap="round" />
      {/* short sleeves */}
      <path d="M17 14 L10 22 L14 24 L19 17 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M31 14 L38 22 L34 24 L29 17 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function LongSleeveShirtSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 14 L15 36 L33 36 L31 14 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M19 14 Q24 18 29 14" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinecap="round" />
      {/* long sleeves */}
      <path d="M17 14 L6 26 L9 28 L18 18 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M31 14 L42 26 L39 28 L30 18 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function CollarShirtSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 12 L15 36 L33 36 L31 12 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* polo collar */}
      <path d="M20 12 L22 17 L24 13 L26 17 L28 12" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.3" strokeLinejoin="round" />
      {/* placket + 2 buttons */}
      <line x1="24" y1="17" x2="24" y2="24" stroke={G_STROKE} strokeWidth="1" />
      <circle cx="24" cy="19" r="0.9" fill={G_STROKE} />
      <circle cx="24" cy="22.5" r="0.9" fill={G_STROKE} />
      {/* long sleeves */}
      <path d="M17 12 L6 24 L9 26 L18 16 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M31 12 L42 24 L39 26 L30 16 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function HoodieSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 14 L15 38 L33 38 L31 14 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* hood */}
      <path d="M17 14 Q24 4 31 14 Q28 10 24 10 Q20 10 17 14Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" />
      {/* kangaroo pocket */}
      <path d="M18 30 Q24 34 30 30 L30 38 L18 38Z" fill={G_STROKE} opacity="0.2" stroke={G_STROKE} strokeWidth="0.8" />
      {/* drawstring */}
      <line x1="22" y1="14" x2="21" y2="22" stroke={G_STROKE} strokeWidth="0.8" strokeDasharray="1.5,1.5" />
      <line x1="26" y1="14" x2="27" y2="22" stroke={G_STROKE} strokeWidth="0.8" strokeDasharray="1.5,1.5" />
      {/* long sleeves */}
      <path d="M17 14 L6 26 L9 28 L18 18 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M31 14 L42 26 L39 28 L30 18 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function ThobeSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* full-length white robe */}
      <path d="M18 6 L14 46 L34 46 L30 6 Z" fill="white" stroke="#D1D5DB" strokeWidth="1.5" strokeLinejoin="round" />
      {/* collar band */}
      <path d="M20 6 L21 10 L27 10 L28 6" fill="white" stroke="#D1D5DB" strokeWidth="1.3" strokeLinejoin="round" />
      {/* centre button line */}
      <line x1="24" y1="10" x2="24" y2="20" stroke="#D1D5DB" strokeWidth="0.8" />
      {[12, 15, 18].map((y, i) => <circle key={i} cx="24" cy={y} r="0.8" fill="#D1D5DB" />)}
      {/* long sleeves */}
      <path d="M18 6 L6 24 L10 26 L20 12 Z" fill="white" stroke="#D1D5DB" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M30 6 L42 24 L38 26 L28 12 Z" fill="white" stroke="#D1D5DB" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function JalabiyaSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* full-length robe with embroidery */}
      <path d="M18 6 L14 46 L34 46 L30 6 Z" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="1.5" strokeLinejoin="round" />
      {/* round neck */}
      <ellipse cx="24" cy="8" rx="4" ry="3" fill="none" stroke="#7C3AED" strokeWidth="1.3" />
      {/* embroidery neckline */}
      <path d="M20 8 Q24 5 28 8" stroke="#7C3AED" strokeWidth="1.2" fill="none" />
      {[14, 17, 20].map((y, i) => (
        <circle key={i} cx="24" cy={y} r="0.8" fill="#7C3AED" opacity="0.5" />
      ))}
      {/* side embroidery */}
      <path d="M18 16 Q16 20 15 26" stroke="#7C3AED" strokeWidth="0.8" fill="none" strokeDasharray="1.5,1.5" opacity="0.5" />
      <path d="M30 16 Q32 20 33 26" stroke="#7C3AED" strokeWidth="0.8" fill="none" strokeDasharray="1.5,1.5" opacity="0.5" />
      {/* long sleeves */}
      <path d="M18 6 L6 24 L10 26 L20 12 Z" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M30 6 L42 24 L38 26 L28 12 Z" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function KurtaSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8 L13 44 L35 44 L32 8 Q24 11 16 8Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* side slits */}
      <line x1="13" y1="36" x2="16" y2="44" stroke={G_STROKE} strokeWidth="1" />
      <line x1="35" y1="36" x2="32" y2="44" stroke={G_STROKE} strokeWidth="1" />
      {/* mandarin collar */}
      <path d="M19 8 L20 13 L28 13 L29 8" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.3" strokeLinejoin="round" />
      {/* placket */}
      <line x1="24" y1="13" x2="24" y2="22" stroke={G_STROKE} strokeWidth="0.9" />
      {[15, 18, 21].map((y, i) => <circle key={i} cx="24" cy={y} r="0.9" fill={G_STROKE} />)}
      {/* long sleeves */}
      <path d="M16 8 L5 22 L9 24 L18 13 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M32 8 L43 22 L39 24 L30 13 Z" fill={B_FILL} stroke={G_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function JacketSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* left panel */}
      <path d="M16 10 L14 38 L24 38 L24 10 Z" fill="#374151" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round" />
      {/* right panel */}
      <path d="M24 10 L24 38 L34 38 L32 10 Z" fill="#374151" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round" />
      {/* lapels */}
      <path d="M18 10 L22 20 L24 16" fill="#4B5563" stroke="#1F2937" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M30 10 L26 20 L24 16" fill="#4B5563" stroke="#1F2937" strokeWidth="1.2" strokeLinejoin="round" />
      {/* collar */}
      <path d="M16 10 Q24 6 32 10" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
      {/* pockets */}
      <rect x="16" y="28" width="6" height="4" rx="1" fill="none" stroke="#6B7280" strokeWidth="0.8" />
      <rect x="26" y="28" width="6" height="4" rx="1" fill="none" stroke="#6B7280" strokeWidth="0.8" />
      {/* long sleeves */}
      <path d="M16 10 L5 24 L9 26 L17 14 Z" fill="#374151" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M32 10 L43 24 L39 26 L31 14 Z" fill="#374151" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Bottom Garment SVGs ──────────────────────────────────────────────────────

// GIRL BOTTOMS
export function WideLegTrousersSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* waistband */}
      <rect x="14" y="8" width="20" height="5" rx="2" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1" />
      {/* left wide leg */}
      <path d="M14 13 L8 46 L23 46 L24 13 Z" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* right wide leg */}
      <path d="M24 13 L25 46 L40 46 L34 13 Z" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function LongSkirtSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* waistband */}
      <rect x="16" y="8" width="16" height="5" rx="2" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1" />
      {/* straight long skirt */}
      <path d="M16 13 L14 46 L34 46 L32 13 Z" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* fold lines */}
      <line x1="20" y1="13" x2="18" y2="46" stroke={SK_STROKE} strokeWidth="0.5" opacity="0.4" />
      <line x1="28" y1="13" x2="30" y2="46" stroke={SK_STROKE} strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

export function MaxiSkirtSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* waistband */}
      <rect x="17" y="8" width="14" height="5" rx="2" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1" />
      {/* flared maxi skirt */}
      <path d="M17 13 L7 46 L41 46 L31 13 Z" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* flow lines */}
      <line x1="22" y1="13" x2="16" y2="46" stroke={SK_STROKE} strokeWidth="0.5" opacity="0.4" />
      <line x1="26" y1="13" x2="32" y2="46" stroke={SK_STROKE} strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

export function SchoolSkirtSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* waistband */}
      <rect x="16" y="10" width="16" height="5" rx="2" fill="#1E3A5F" stroke="#0F172A" strokeWidth="1" />
      {/* knee-length pleated skirt */}
      <path d="M16 15 L13 38 L35 38 L32 15 Z" fill="#1E3A5F" stroke="#0F172A" strokeWidth="1.5" strokeLinejoin="round" />
      {/* pleat lines */}
      {[20, 24, 28].map((x, i) => (
        <line key={i} x1={x} y1="15" x2={x - 1 + i} y2="38" stroke="#374151" strokeWidth="0.7" />
      ))}
    </svg>
  );
}

export function ShalwarSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* waistband with drawstring */}
      <rect x="14" y="8" width="20" height="6" rx="3" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1" />
      <path d="M20 11 Q24 14 28 11" fill="none" stroke={SK_STROKE} strokeWidth="0.8" strokeLinecap="round" />
      {/* baggy tapered legs */}
      <path d="M14 14 L10 38 L22 38 L24 14 Z" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 14 L26 38 L38 38 L34 14 Z" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      {/* ankle cuffs */}
      <rect x="10" y="36" width="12" height="3" rx="1" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1" />
      <rect x="26" y="36" width="12" height="3" rx="1" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1" />
    </svg>
  );
}

export function PalazzoPantsSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="8" width="18" height="5" rx="2" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1" />
      {/* ultra-wide flared legs */}
      <path d="M15 13 L4 46 L23 46 L24 13 Z" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 13 L25 46 L44 46 L33 13 Z" fill={SK_FILL} stroke={SK_STROKE} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// BOY BOTTOMS
export function TrousersSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="8" width="18" height="5" rx="2" fill="#374151" stroke="#1F2937" strokeWidth="1" />
      {/* straight legs */}
      <path d="M15 13 L13 46 L23 46 L24 13 Z" fill="#374151" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 13 L25 46 L35 46 L33 13 Z" fill="#374151" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round" />
      {/* crease line */}
      <line x1="18" y1="13" x2="17" y2="46" stroke="#4B5563" strokeWidth="0.7" />
      <line x1="30" y1="13" x2="31" y2="46" stroke="#4B5563" strokeWidth="0.7" />
    </svg>
  );
}

export function JeansSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="8" width="18" height="5" rx="2" fill="#1E3A5F" stroke="#0F172A" strokeWidth="1" />
      {/* belt loop hints */}
      {[17, 23, 29].map((x, i) => <rect key={i} x={x} y={7} width="2" height="3" rx="0.5" fill="#0F172A" />)}
      <path d="M15 13 L13 46 L23 46 L24 13 Z" fill="#1E3A5F" stroke="#0F172A" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 13 L25 46 L35 46 L33 13 Z" fill="#1E3A5F" stroke="#0F172A" strokeWidth="1.5" strokeLinejoin="round" />
      {/* stitch lines */}
      <line x1="18" y1="14" x2="17" y2="46" stroke="#3B82F6" strokeWidth="0.6" strokeDasharray="2,2" />
      <line x1="30" y1="14" x2="31" y2="46" stroke="#3B82F6" strokeWidth="0.6" strokeDasharray="2,2" />
    </svg>
  );
}

export function ShortsSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="8" width="18" height="5" rx="2" fill="#374151" stroke="#1F2937" strokeWidth="1" />
      {/* short legs */}
      <path d="M15 13 L13 30 L23 30 L24 13 Z" fill="#374151" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M24 13 L25 30 L35 30 L33 13 Z" fill="#374151" stroke="#1F2937" strokeWidth="1.5" strokeLinejoin="round" />
      {/* hem */}
      <line x1="13" y1="28" x2="23" y2="28" stroke="#4B5563" strokeWidth="1" />
      <line x1="25" y1="28" x2="35" y2="28" stroke="#4B5563" strokeWidth="1" />
    </svg>
  );
}

// ─── Shoe Type SVGs ───────────────────────────────────────────────────────────
// Profile view of each shoe type

export function SneakersSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* thick sole */}
      <path d="M4 36 L44 36 L44 42 Q40 46 8 42 L4 36Z" fill="#1A1A1A" stroke="#0A0A0A" strokeWidth="1" />
      {/* upper */}
      <path d="M4 36 L6 24 Q12 18 22 18 L38 22 L44 36 Z" fill="white" stroke="#D1D5DB" strokeWidth="1.2" />
      {/* toe cap */}
      <path d="M6 24 Q8 19 14 20 L16 26" fill="#F0F0F0" stroke="#D1D5DB" strokeWidth="0.8" />
      {/* laces */}
      {[20, 26, 32].map((x, i) => <line key={i} x1={x} y1="20" x2={x + 1} y2="32" stroke="#9CA3AF" strokeWidth="1" />)}
      {[22, 28].map((x, i) => <line key={i} x1={x - 1} y1={22 + i * 5} x2={x + 7} y2={22 + i * 5} stroke="#9CA3AF" strokeWidth="0.8" />)}
      {/* tongue */}
      <path d="M22 18 L22 30" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SchoolShoesSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* sole */}
      <path d="M4 37 L44 37 L43 43 Q38 46 8 43 L4 37Z" fill="#0A0A0A" />
      {/* upper — classic closed-toe */}
      <path d="M4 37 L7 26 Q16 20 28 22 L40 28 L44 37Z" fill="#1A1A1A" stroke="#374151" strokeWidth="1" />
      {/* heel counter */}
      <path d="M40 28 L44 37 L40 37 L38 28Z" fill="#0A0A0A" stroke="#374151" strokeWidth="0.5" />
      {/* toe cap */}
      <path d="M7 26 Q10 21 18 22 L20 30" fill="#2D2D2D" stroke="#374151" strokeWidth="0.8" />
    </svg>
  );
}

export function MaryJaneFlats() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* thin sole */}
      <path d="M5 38 L43 38 L42 43 Q34 46 10 43 L5 38Z" fill="#1A1A1A" />
      {/* flat upper */}
      <path d="M5 38 L7 30 Q18 24 30 26 L40 32 L43 38Z" fill="#E88CC8" stroke="#C06090" strokeWidth="1" />
      {/* strap across instep */}
      <path d="M18 26 L18 34" stroke="#C06090" strokeWidth="3" strokeLinecap="round" />
      {/* strap buckle */}
      <circle cx="18" cy="28" r="2" fill="#C06090" />
    </svg>
  );
}

export function SandalsSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* sole */}
      <path d="M5 36 L43 36 L42 43 Q34 46 10 43 L5 36Z" fill="#92400E" stroke="#78350F" strokeWidth="1" />
      {/* toe straps */}
      <path d="M10 36 L10 28 L20 28 L20 36" fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
      {/* middle strap */}
      <path d="M18 30 Q28 26 36 30 L36 36 L18 36Z" fill="none" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* ankle strap */}
      <path d="M10 30 Q24 24 38 30" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LeatherSandalsSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* contoured sole */}
      <path d="M5 36 L43 36 L42 44 Q34 47 10 44 L5 36Z" fill="#5C3317" stroke="#3D1C02" strokeWidth="1.2" />
      <path d="M6 36 L42 36 L41 39 Q34 41 10 39 L6 36Z" fill="#7C4A28" />
      {/* crossed leather straps */}
      <line x1="12" y1="36" x2="36" y2="28" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
      <line x1="12" y1="28" x2="36" y2="36" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
      <line x1="10" y1="30" x2="38" y2="30" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BootsSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* sole + heel */}
      <path d="M6 40 L44 40 L44 45 Q38 48 10 45 L6 40Z" fill="#1A1A1A" />
      <rect x="36" y="36" width="8" height="6" rx="1" fill="#0A0A0A" />
      {/* boot shaft */}
      <path d="M8 40 L8 14 Q14 10 20 12 L22 40Z" fill="#374151" stroke="#1F2937" strokeWidth="1.2" />
      {/* foot upper */}
      <path d="M8 40 L44 40 L40 34 L22 30 L8 36Z" fill="#374151" stroke="#1F2937" strokeWidth="1.2" />
      {/* lace holes */}
      {[16, 20, 24, 28, 32].map((y, i) => <circle key={i} cx="12" cy={y} r="1" fill="#6B7280" />)}
      {/* laces */}
      {[16, 22, 28].map((y, i) => <line key={i} x1="13" y1={y} x2="20" y2={y + 2} stroke="#9CA3AF" strokeWidth="0.8" />)}
    </svg>
  );
}

export function SlippersSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* thin flat sole */}
      <path d="M5 38 L43 38 L42 44 Q34 47 10 44 L5 38Z" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
      {/* simple open-toe upper */}
      <path d="M20 38 L20 30 Q28 26 40 32 L43 38Z" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
      {/* pom-pom / soft detail */}
      <circle cx="22" cy="31" r="4" fill="#FCA5A5" stroke="#F87171" strokeWidth="0.8" />
    </svg>
  );
}

export function OxfordShoesSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* stacked heel + sole */}
      <path d="M5 38 L43 38 L43 44 Q36 47 10 44 L5 38Z" fill="#1A1A1A" />
      <rect x="36" y="34" width="7" height="6" rx="1" fill="#0A0A0A" />
      {/* upper */}
      <path d="M5 38 L8 26 Q18 20 30 22 L38 28 L43 38Z" fill="#1C1917" stroke="#292524" strokeWidth="1" />
      {/* brogue punch detailing */}
      {[12, 16, 20].map((x, i) => <circle key={i} cx={x} cy="30" r="0.8" fill="#292524" />)}
      {/* toe cap seam */}
      <path d="M8 26 Q12 22 18 23 L18 32" fill="none" stroke="#292524" strokeWidth="0.8" />
      {/* lacing */}
      <path d="M22 24 L22 34" stroke="#6B7280" strokeWidth="1.5" />
      {[26, 30].map((y, i) => <line key={i} x1="21" y1={y} x2="32" y2={y - 2} stroke="#6B7280" strokeWidth="0.8" />)}
    </svg>
  );
}

export function KhussaSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* sole */}
      <path d="M4 38 Q24 44 44 36 L44 42 Q24 48 4 42Z" fill="#92400E" />
      {/* upper — curved pointed toe */}
      <path d="M4 38 Q12 28 20 26 Q30 24 38 28 Q44 32 44 36 Q30 42 4 38Z" fill="#C2713A" />
      {/* decorative embroidery lines */}
      <path d="M10 34 Q20 30 30 32" stroke="#D97706" strokeWidth="1.2" fill="none" />
      <path d="M14 37 Q22 33 32 35" stroke="#D97706" strokeWidth="0.8" fill="none" />
      {/* pointed tip embellishment */}
      <circle cx="43" cy="34" r="2" fill="#D97706" />
      <circle cx="43" cy="34" r="0.8" fill="#FCD34D" />
    </svg>
  );
}

export function BalghaSlipperSvg() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* sole */}
      <path d="M5 38 Q24 45 43 38 L43 43 Q24 50 5 43Z" fill="#78350F" />
      {/* upper — open-back flat slipper */}
      <path d="M5 38 Q8 28 20 24 Q32 22 40 30 L43 38 Q32 42 5 38Z" fill="#B45309" />
      {/* side cutout / open toe */}
      <path d="M5 38 Q6 33 10 31" fill="none" stroke="#92400E" strokeWidth="1" />
      {/* decorative stitch */}
      <path d="M12 32 Q22 27 34 30" stroke="#FCD34D" strokeWidth="1" fill="none" strokeDasharray="2,2" />
      <path d="M10 35 Q22 31 36 33" stroke="#FCD34D" strokeWidth="0.8" fill="none" strokeDasharray="2,2" />
    </svg>
  );
}
